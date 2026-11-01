(function () {
    const SYSTEM_PREFS_KEY = "studenthub_system_preferences";
    const NAV_COLLAPSED_KEY = "studenthub_nav_collapsed";
    const NAV_GROUPS_KEY = "studenthub_nav_group_state";
    const HOME_TASK_SORT_KEY = "taskSortMode";
    const UPDATE_EVENT = "nexa:system-preferences-updated";

    const DEFAULTS = Object.freeze({
        studyTimerAlerts: false,
        deadlineReminderLevel: "important",
        appTone: "encouraging",
        personalisation: true,
        emailReminders: "off"
    });

    const ALLOWED_VALUES = Object.freeze({
        deadlineReminderLevel: new Set(["important", "all", "off"]),
        appTone: new Set(["encouraging", "neutral", "direct"]),
        emailReminders: new Set(["off", "important", "weekly"])
    });

    const BOOLEAN_KEYS = new Set(["studyTimerAlerts", "personalisation"]);

    function storage() {
        return window.NexaAppStorage || window.localStorage;
    }

    function parsePrefs(raw) {
        try {
            const parsed = raw ? JSON.parse(raw) : {};
            return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
        } catch (error) {
            console.warn("Failed to parse system preferences:", error);
            return {};
        }
    }

    function sanitizePrefs(input) {
        const prefs = { ...DEFAULTS };
        const source = input && typeof input === "object" ? input : {};

        Object.keys(DEFAULTS).forEach((key) => {
            if (!Object.prototype.hasOwnProperty.call(source, key)) return;

            if (BOOLEAN_KEYS.has(key)) {
                prefs[key] = Boolean(source[key]);
                return;
            }

            const allowed = ALLOWED_VALUES[key];
            if (allowed?.has(source[key])) {
                prefs[key] = source[key];
            }
        });

        return prefs;
    }

    function load() {
        return sanitizePrefs(parsePrefs(storage().getItem(SYSTEM_PREFS_KEY)));
    }

    function save(prefs, changedKey = "") {
        const nextPrefs = sanitizePrefs(prefs);
        storage().setItem(SYSTEM_PREFS_KEY, JSON.stringify(nextPrefs));
        window.dispatchEvent(new CustomEvent(UPDATE_EVENT, {
            detail: {
                prefs: nextPrefs,
                changedKey
            }
        }));
        return nextPrefs;
    }

    function savePatch(patch) {
        const currentPrefs = load();
        const nextPrefs = { ...currentPrefs, ...(patch || {}) };
        const changedKey = patch && Object.keys(patch)[0] ? Object.keys(patch)[0] : "";
        const saved = save(nextPrefs, changedKey);

        if (patch && Object.prototype.hasOwnProperty.call(patch, "personalisation") && !saved.personalisation) {
            clearPersonalisedUiState();
        }

        return saved;
    }

    function get(key) {
        return load()[key];
    }

    function getTone() {
        return get("appTone");
    }

    function onChange(handler) {
        if (typeof handler !== "function") return () => {};
        const listener = (event) => handler(event.detail?.prefs || load(), event.detail?.changedKey || "");
        window.addEventListener(UPDATE_EVENT, listener);
        return () => window.removeEventListener(UPDATE_EVENT, listener);
    }

    function allowsPersonalisation() {
        return get("personalisation") !== false;
    }

    function clearPersonalisedUiState() {
        storage().removeItem(NAV_COLLAPSED_KEY);
        storage().removeItem(NAV_GROUPS_KEY);
        storage().removeItem(HOME_TASK_SORT_KEY);
    }

    function requestStudyTimerNotificationPermission() {
        if (!("Notification" in window)) {
            return Promise.resolve("unsupported");
        }

        if (Notification.permission === "granted" || Notification.permission === "denied") {
            return Promise.resolve(Notification.permission);
        }

        return Notification.requestPermission();
    }

    function notifyStudyTimerComplete(title, body) {
        if (!get("studyTimerAlerts")) return false;
        if (!("Notification" in window) || Notification.permission !== "granted") return false;

        try {
            new Notification(title || "Study session complete", {
                body: body || "Your study timer has finished.",
                silent: false
            });
            return true;
        } catch (error) {
            console.warn("Could not show study timer notification:", error);
            return false;
        }
    }

    window.NexaPreferences = {
        DEFAULTS,
        UPDATE_EVENT,
        load,
        save,
        savePatch,
        get,
        getTone,
        onChange,
        allowsPersonalisation,
        clearPersonalisedUiState,
        requestStudyTimerNotificationPermission,
        notifyStudyTimerComplete
    };
})();
