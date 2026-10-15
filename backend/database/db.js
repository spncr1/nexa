/* Handles database connection and queries */

const { Pool } = require('pg'); // postgresql client library for node, essentially it enables the postgre to connect to my node app by giving it the tools to do so

const isProduction = process.env.NODE_ENV === 'production';
const hasConnectionString = Boolean(process.env.DATABASE_URL);

const pool = new Pool(
    hasConnectionString
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: isProduction ? { rejectUnauthorized: false } : false,
            connectionTimeoutMillis: Number(process.env.PGCONNECT_TIMEOUT_MS || 5000)
        }
        : {
            host: process.env.PGHOST || 'localhost',
            port: Number(process.env.PGPORT || 5432), // default port assigned to PostgreSQL
            user: process.env.PGUSER || process.env.USER,
            password: process.env.PGPASSWORD || '',
            database: process.env.PGDATABASE || 'nexa',
            connectionTimeoutMillis: Number(process.env.PGCONNECT_TIMEOUT_MS || 5000)
        }
);

const usersTableSql = `
    CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
`;

const authTokensTableSql = `
    CREATE TABLE IF NOT EXISTS auth_tokens (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        purpose VARCHAR(64) NOT NULL,
        token_hash CHAR(64) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
`;

const authTokensUserPurposeIndexSql = `
    CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_purpose
    ON auth_tokens (user_id, purpose, created_at DESC);
`;

const authTokensActiveHashIndexSql = `
    CREATE INDEX IF NOT EXISTS idx_auth_tokens_active_hash
    ON auth_tokens (purpose, token_hash)
    WHERE used_at IS NULL;
`;

const pendingRegistrationsTableSql = `
    CREATE TABLE IF NOT EXISTS pending_registrations (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password_hash TEXT NOT NULL,
        token_hash CHAR(64) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
`;

const pendingRegistrationsActiveEmailIndexSql = `
    CREATE UNIQUE INDEX IF NOT EXISTS idx_pending_registrations_active_email
    ON pending_registrations (email)
    WHERE used_at IS NULL;
`;

const pendingRegistrationsActiveHashIndexSql = `
    CREATE INDEX IF NOT EXISTS idx_pending_registrations_active_hash
    ON pending_registrations (token_hash)
    WHERE used_at IS NULL;
`;

const sessionTableSql = `
    CREATE TABLE IF NOT EXISTS "session" (
        sid VARCHAR PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
    );
`;

const sessionExpireIndexSql = `
    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" (expire);
`;

function formatDbError(error) {
    return error.detail || error.message || error.code || 'Unknown database error';
}

async function testDatabaseConnection() {
    await pool.query('SELECT 1');
}

async function ensureDatabaseSchema() {
    await pool.query(usersTableSql);
    await pool.query(authTokensTableSql);
    await pool.query(authTokensUserPurposeIndexSql);
    await pool.query(authTokensActiveHashIndexSql);
    await pool.query(pendingRegistrationsTableSql);
    await pool.query(pendingRegistrationsActiveEmailIndexSql);
    await pool.query(pendingRegistrationsActiveHashIndexSql);
    await pool.query(sessionTableSql);
    await pool.query(sessionExpireIndexSql);
}

async function findUserByEmail(email) {
    const normalizedEmail = email.trim().toLowerCase();
    const result = await pool.query(
        `SELECT id, name, email, password_hash AS password
         FROM users
         WHERE email = $1
         LIMIT 1`,
        [normalizedEmail]
    );

    return result.rows[0] || null;
}

async function findUserById(id) {
    const result = await pool.query(
        `SELECT id, name, email, password_hash AS password
         FROM users
         WHERE id = $1
         LIMIT 1`,
        [id]
    );

    return result.rows[0] || null;
}

async function createUser({ name, email, passwordHash }) {
    const normalizedEmail = email.trim().toLowerCase();
    const result = await pool.query(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, name, email, password_hash AS password`,
        [name.trim(), normalizedEmail, passwordHash]
    );

    return result.rows[0];
}

async function updateUserById(id, { name, email }) {
    const normalizedEmail = email.trim().toLowerCase();
    const result = await pool.query(
        `UPDATE users
         SET name = $2,
             email = $3
         WHERE id = $1
         RETURNING id, name, email, password_hash AS password`,
        [id, name.trim(), normalizedEmail]
    );

    return result.rows[0] || null;
}

async function deleteUserById(id) {
    const result = await pool.query(
        `DELETE FROM users
         WHERE id = $1
         RETURNING id`,
        [id]
    );

    return result.rows[0] || null;
}

async function updateUserPasswordById(id, passwordHash) {
    const result = await pool.query(
        `UPDATE users
         SET password_hash = $2
         WHERE id = $1
         RETURNING id, name, email, password_hash AS password`,
        [id, passwordHash]
    );

    return result.rows[0] || null;
}

async function invalidateAuthTokens(userId, purpose) {
    await pool.query(
        `UPDATE auth_tokens
         SET used_at = NOW()
         WHERE user_id = $1
           AND purpose = $2
           AND used_at IS NULL`,
        [userId, purpose]
    );
}

async function createAuthToken({ userId, purpose, tokenHash, expiresAt }) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        await client.query(
            `UPDATE auth_tokens
             SET used_at = NOW()
             WHERE user_id = $1
               AND purpose = $2
               AND used_at IS NULL`,
            [userId, purpose]
        );

        const result = await client.query(
            `INSERT INTO auth_tokens (user_id, purpose, token_hash, expires_at)
             VALUES ($1, $2, $3, $4)
             RETURNING id, user_id, purpose, expires_at, used_at, created_at`,
            [userId, purpose, tokenHash, expiresAt]
        );

        await client.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function findValidAuthToken(purpose, tokenHash) {
    const result = await pool.query(
        `SELECT auth_tokens.id,
                auth_tokens.user_id,
                auth_tokens.purpose,
                auth_tokens.expires_at,
                auth_tokens.created_at,
                users.name,
                users.email
         FROM auth_tokens
         JOIN users ON users.id = auth_tokens.user_id
         WHERE auth_tokens.purpose = $1
           AND auth_tokens.token_hash = $2
           AND auth_tokens.used_at IS NULL
           AND auth_tokens.expires_at > NOW()
         LIMIT 1`,
        [purpose, tokenHash]
    );

    return result.rows[0] || null;
}

async function resetPasswordWithAuthToken({ purpose, tokenHash, passwordHash }) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const tokenResult = await client.query(
            `SELECT id, user_id
             FROM auth_tokens
             WHERE purpose = $1
               AND token_hash = $2
               AND used_at IS NULL
               AND expires_at > NOW()
             LIMIT 1
             FOR UPDATE`,
            [purpose, tokenHash]
        );

        const token = tokenResult.rows[0];
        if (!token) {
            await client.query('ROLLBACK');
            return null;
        }

        const userResult = await client.query(
            `UPDATE users
             SET password_hash = $2
             WHERE id = $1
             RETURNING id, name, email, password_hash AS password`,
            [token.user_id, passwordHash]
        );

        await client.query(
            `UPDATE auth_tokens
             SET used_at = NOW()
             WHERE id = $1`,
            [token.id]
        );

        await client.query(
            `UPDATE auth_tokens
             SET used_at = NOW()
             WHERE user_id = $1
               AND purpose = $2
               AND used_at IS NULL
               AND id <> $3`,
            [token.user_id, purpose, token.id]
        );

        await client.query('COMMIT');
        return userResult.rows[0] || null;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function invalidatePendingRegistration(id) {
    await pool.query(
        `UPDATE pending_registrations
         SET used_at = NOW()
         WHERE id = $1
           AND used_at IS NULL`,
        [id]
    );
}

async function createPendingRegistration({ name, email, passwordHash, tokenHash, expiresAt }) {
    const normalizedEmail = email.trim().toLowerCase();
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        await client.query(
            `UPDATE pending_registrations
             SET used_at = NOW()
             WHERE email = $1
               AND used_at IS NULL`,
            [normalizedEmail]
        );

        const result = await client.query(
            `INSERT INTO pending_registrations (name, email, password_hash, token_hash, expires_at)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, email, expires_at, used_at, created_at`,
            [name.trim(), normalizedEmail, passwordHash, tokenHash, expiresAt]
        );

        await client.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function findPendingRegistrationByTokenHash(tokenHash) {
    const result = await pool.query(
        `SELECT pending_registrations.id,
                pending_registrations.name,
                pending_registrations.email,
                pending_registrations.expires_at,
                pending_registrations.used_at,
                pending_registrations.created_at,
                pending_registrations.used_at IS NULL
                    AND pending_registrations.expires_at > NOW() AS can_verify,
                users.id AS verified_user_id
         FROM pending_registrations
         LEFT JOIN users ON users.email = pending_registrations.email
         WHERE pending_registrations.token_hash = $1
         LIMIT 1`,
        [tokenHash]
    );

    return result.rows[0] || null;
}

async function createUserFromPendingRegistrationToken(tokenHash) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const pendingResult = await client.query(
            `SELECT id, name, email, password_hash
             FROM pending_registrations
             WHERE token_hash = $1
               AND used_at IS NULL
               AND expires_at > NOW()
             LIMIT 1
             FOR UPDATE`,
            [tokenHash]
        );

        const pendingRegistration = pendingResult.rows[0];
        if (!pendingRegistration) {
            await client.query('ROLLBACK');
            return null;
        }

        const existingUserResult = await client.query(
            `SELECT id, name, email, password_hash AS password
             FROM users
             WHERE email = $1
             LIMIT 1`,
            [pendingRegistration.email]
        );

        if (existingUserResult.rows[0]) {
            await client.query(
                `UPDATE pending_registrations
                 SET used_at = NOW()
                 WHERE email = $1
                   AND used_at IS NULL`,
                [pendingRegistration.email]
            );
            await client.query('COMMIT');
            return existingUserResult.rows[0];
        }

        const userResult = await client.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, name, email, password_hash AS password`,
            [
                pendingRegistration.name,
                pendingRegistration.email,
                pendingRegistration.password_hash
            ]
        );

        await client.query(
            `UPDATE pending_registrations
             SET used_at = NOW()
             WHERE email = $1
               AND used_at IS NULL`,
            [pendingRegistration.email]
        );

        await client.query('COMMIT');
        return userResult.rows[0] || null;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    pool,
    ensureDatabaseSchema,
    formatDbError,
    testDatabaseConnection,
    findUserByEmail,
    findUserById,
    createUser,
    updateUserById,
    deleteUserById,
    updateUserPasswordById,
    invalidateAuthTokens,
    createAuthToken,
    findValidAuthToken,
    resetPasswordWithAuthToken,
    createPendingRegistration,
    findPendingRegistrationByTokenHash,
    createUserFromPendingRegistrationToken,
    invalidatePendingRegistration
};
