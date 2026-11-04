document.addEventListener("DOMContentLoaded", async () => {
    await window.NexaAppStorage.ready;

    const storage = window.NexaAppStorage;
    let currentUser = storage.getCurrentUser();

    const menuToggle = document.querySelector(".menu-toggle");
    const profileSettingsBtn = document.getElementById("profile-settings-btn");
    const systemSettingsBtn = document.getElementById("system-settings-btn");
    const profileSettingsModal = document.getElementById("profile-settings-modal");
    const systemSettingsModal = document.getElementById("system-settings-modal");
    const settingsBackdrop = document.getElementById("settings-backdrop");
    const settingsCloseBtns = document.querySelectorAll(".settings-close-btn");
    const navButtons = document.querySelectorAll(".settings-nav");
    const panels = document.querySelectorAll(".settings-panel");
    const profileSubtitle = document.getElementById("profile-settings-subtitle");
    const systemSubtitle = document.getElementById("system-settings-subtitle");
    const themeModeSelect = document.getElementById("theme-mode-select");
    const themeSwitch = document.getElementById("theme-switch");
    const resetAppDataBtn = document.getElementById("reset-app-data-btn");
    const sendEmailReminderBtn = document.getElementById("send-email-reminder-btn");
    const emailReminderStatus = document.getElementById("email-reminder-status");
    const accountNameInput = document.getElementById("account-name-input");
    const accountEmailInput = document.getElementById("account-email-input");
    const accountAgeInput = document.getElementById("account-age-input");
    const accountLocationInput = document.getElementById("account-location-input");
    const accountUniversityInput = document.getElementById("account-university-input");
    const accountDegreeInput = document.getElementById("account-degree-input");
    const accountSemesterInput = document.getElementById("account-semester-input");
    const yearLevelButtons = document.querySelectorAll(".year-level-option");
    const saveProfileBtn = document.getElementById("save-profile-btn");
    const profileSettingsStatus = document.getElementById("profile-settings-status");
    const avatarInput = document.getElementById("profile-avatar-input");
    const uploadAvatarBtn = document.getElementById("upload-avatar-btn");
    const removeAvatarBtn = document.getElementById("remove-avatar-btn");
    const profileAvatarStatus = document.getElementById("profile-avatar-status");
    const avatarCropModal = document.getElementById("avatar-crop-modal");
    const avatarCropFrame = document.getElementById("avatar-crop-frame");
    const avatarCropImage = document.getElementById("avatar-crop-image");
    const avatarCropZoom = document.getElementById("avatar-crop-zoom");
    const avatarCropStatus = document.getElementById("avatar-crop-status");
    const saveAvatarCropBtn = document.getElementById("save-avatar-crop-btn");
    const cancelAvatarCropBtn = document.getElementById("cancel-avatar-crop-btn");
    const closeAvatarCropBtn = document.getElementById("close-avatar-crop-btn");
    const settingsNavbarProfileAvatar = document.getElementById("settings-navbar-profile-avatar");
    const profileAvatarPreview = document.getElementById("profile-avatar-preview");
    const currentPasswordInput = document.getElementById("current-password-input");
    const newPasswordInput = document.getElementById("new-password-input");
    const confirmPasswordInput = document.getElementById("confirm-password-input");
    const changePasswordBtn = document.getElementById("change-password-btn");
    const passwordSettingsStatus = document.getElementById("password-settings-status");
    const logoutBtn = document.getElementById("logout-btn");
    const deleteAccountBtn = document.getElementById("delete-account-btn");

    const NAV_COLLAPSED_KEY = "studenthub_nav_collapsed";
    const NAV_GROUPS_KEY = "studenthub_nav_group_state";
    const USER_NAME_KEY = "studenthub_user_name";
    const SEMESTER_KEY = "studenthub_semester_label";
    const PROFILE_AGE_KEY = "studenthub_profile_age";
    const PROFILE_LOCATION_KEY = "studenthub_profile_location";
    const PROFILE_UNIVERSITY_KEY = "studenthub_profile_university";
    const PROFILE_DEGREE_KEY = "studenthub_profile_degree";
    const PROFILE_YEAR_LEVEL_KEY = "studenthub_profile_year_level";
    const PROFILE_AVATAR_KEY = "studenthub_profile_avatar";
    const SYSTEM_PREFS_KEY = "studenthub_system_preferences";
    const THEME_MODE_KEY = "studenthub_theme_mode";
    const TASKS_KEY = "tasksByDate";
    const SUBJECTS_KEY = "studenthub_subjects";
    const ASSIGNMENTS_KEY = "studenthub_assignments";
    const STUDY_QUEUE_KEY = "studenthub_study_queue";
    const STUDY_COMPLETED_KEY = "studenthub_study_completed_sessions";
    const STUDY_FAVOURITES_KEY = "studenthub_study_favourites";
    const STUDY_ACTIVE_KEY = "studenthub_study_active_session";
    const STUDY_WEEKLY_GOAL_KEY = "studenthub_study_weekly_goal";
    const STUDY_MONTHLY_GOAL_KEY = "studenthub_study_monthly_goal";
    const STUDY_SUGGESTION_OVERRIDES_KEY = "studenthub_study_suggestion_overrides";
    const APP_DATA_KEYS = [
        TASKS_KEY,
        SUBJECTS_KEY,
        ASSIGNMENTS_KEY,
        STUDY_QUEUE_KEY,
        STUDY_COMPLETED_KEY,
        STUDY_FAVOURITES_KEY,
        STUDY_ACTIVE_KEY,
        STUDY_WEEKLY_GOAL_KEY,
        STUDY_MONTHLY_GOAL_KEY,
        STUDY_SUGGESTION_OVERRIDES_KEY,
        USER_NAME_KEY,
        SEMESTER_KEY,
        PROFILE_AGE_KEY,
        PROFILE_LOCATION_KEY,
        PROFILE_UNIVERSITY_KEY,
        PROFILE_DEGREE_KEY,
        PROFILE_YEAR_LEVEL_KEY,
        PROFILE_AVATAR_KEY,
        SYSTEM_PREFS_KEY,
        THEME_MODE_KEY,
        NAV_GROUPS_KEY,
        "darkMode"
    ];
    const DEFAULT_USER_NAME = currentUser?.name || "Student";
    const DEFAULT_SEMESTER_LABEL = "Untitled Semester";
    const DEFAULT_YEAR_LEVEL = "N/A";
    const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
    const MAX_AVATAR_SOURCE_BYTES = 4 * 1024 * 1024;
    const MAX_AVATAR_DATA_URL_LENGTH = 80 * 1024;
    const AVATAR_CANVAS_SIZE = 256;
    const AVATAR_OUTPUT_TYPE = "image/jpeg";
    const AVATAR_OUTPUT_QUALITY = 0.82;
    const AVATAR_MIN_OUTPUT_QUALITY = 0.58;
    const mobileNavQuery = window.matchMedia("(max-width: 600px)");
    const darkThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    let avatarSaveRequestId = 0;
    let avatarCropState = null;

    /*
      ==========================
      NAVIGATION + SETTINGS BUTTONS
      ==========================
    */

    let navTransitionTimer = null;
    let syncingNavGroups = false;

    function getNavGroupKey(navGroup) {
        return navGroup?.querySelector("summary")?.getAttribute("aria-label") || "";
    }

    function loadNavGroupState() {
        if (window.NexaPreferences && !window.NexaPreferences.allowsPersonalisation()) return {};

        try {
            const parsed = JSON.parse(storage.getItem(NAV_GROUPS_KEY) || "{}");
            return parsed && typeof parsed === "object" ? parsed : {};
        } catch (error) {
            return {};
        }
    }

    function saveNavGroupState(navGroup) {
        const key = getNavGroupKey(navGroup);
        if (!key) return;
        if (window.NexaPreferences && !window.NexaPreferences.allowsPersonalisation()) return;

        const state = loadNavGroupState();
        state[key] = navGroup.open;
        storage.setItem(NAV_GROUPS_KEY, JSON.stringify(state));
    }

    function initialiseNavGroups() {
        const navGroups = document.querySelectorAll(".navbar .nav-group");
        if (!navGroups.length) return;

        const state = loadNavGroupState();
        syncingNavGroups = true;
        navGroups.forEach((navGroup) => {
            const key = getNavGroupKey(navGroup);
            if (Object.prototype.hasOwnProperty.call(state, key)) {
                navGroup.open = Boolean(state[key]);
            }
        });
        syncingNavGroups = false;

        navGroups.forEach((navGroup) => {
            navGroup.addEventListener("toggle", () => {
                if (syncingNavGroups) return;
                saveNavGroupState(navGroup);
            });
        });
    }

    function setNavCollapsed(isCollapsed) {
        if (mobileNavQuery.matches) {
            setMobileNavOpen(false);
            document.body.classList.remove("nav-collapsed", "nav-collapsing", "nav-expanding");
            menuToggle?.setAttribute("aria-expanded", "false");
            return;
        }

        const wasCollapsed = document.body.classList.contains("nav-collapsed");

        if (navTransitionTimer) window.clearTimeout(navTransitionTimer);
        document.body.classList.remove("nav-collapsing", "nav-expanding");

        if (wasCollapsed !== isCollapsed) {
            document.body.classList.add(isCollapsed ? "nav-collapsing" : "nav-expanding");
            navTransitionTimer = window.setTimeout(() => {
                document.body.classList.remove("nav-collapsing", "nav-expanding");
            }, 560);
        }

        document.body.classList.toggle("nav-collapsed", isCollapsed);
        if (window.NexaPreferences && !window.NexaPreferences.allowsPersonalisation()) {
            storage.removeItem(NAV_COLLAPSED_KEY);
        } else {
            storage.setItem(NAV_COLLAPSED_KEY, isCollapsed ? "1" : "0");
        }
        menuToggle?.setAttribute("aria-expanded", (!isCollapsed).toString());
    }

    function setMobileNavOpen(isOpen) {
        document.body.classList.toggle("mobile-nav-open", isOpen);
        menuToggle?.setAttribute("aria-expanded", isOpen.toString());
    }

    function syncNavigationMode() {
        if (mobileNavQuery.matches) {
            document.body.classList.remove("nav-collapsed", "nav-collapsing", "nav-expanding");
            setMobileNavOpen(false);
            return;
        }

        setMobileNavOpen(false);
        const shouldLoadSavedState = !window.NexaPreferences || window.NexaPreferences.allowsPersonalisation();
        setNavCollapsed(shouldLoadSavedState && storage.getItem(NAV_COLLAPSED_KEY) === "1");
    }

    function handleCollapsedNavActivation(event) {
        if (mobileNavQuery.matches) return;
        if (!document.body.classList.contains("nav-collapsed")) return;

        const summary = event.target.closest(".navbar .nav-group summary");
        if (summary) {
            event.preventDefault();

            const navGroup = summary.closest(".nav-group");
            const firstLink = navGroup?.querySelector(".nav-submenu a[href]");
            if (!firstLink) return;

            setNavCollapsed(false);
            window.location.href = firstLink.href;
            return;
        }

        const directLink = event.target.closest(".navbar a.nav-item[href]");
        if (directLink) {
            setNavCollapsed(false);
        }
    }

    function handleMobileNavActivation(event) {
        if (!mobileNavQuery.matches) return;

        const navLink = event.target.closest(".navbar a[href]");
        if (navLink) {
            setMobileNavOpen(false);
        }
    }

    /*
      ==========================
      PROFILE + SETTINGS MODALS
      ==========================
    */

    function loadUserName() {
        const saved = storage.getItem(USER_NAME_KEY);
        return saved && saved.trim() ? saved : DEFAULT_USER_NAME;
    }

    function loadSemesterLabel() {
        const saved = storage.getItem(SEMESTER_KEY);
        return saved && saved.trim() ? saved : DEFAULT_SEMESTER_LABEL;
    }

    function loadProfileAge() {
        const saved = storage.getItem(PROFILE_AGE_KEY);
        return saved && saved.trim() ? saved : "";
    }

    function loadProfileLocation() {
        const saved = storage.getItem(PROFILE_LOCATION_KEY);
        return saved && saved.trim() ? saved : "";
    }

    function loadProfileUniversity() {
        const saved = storage.getItem(PROFILE_UNIVERSITY_KEY);
        return saved && saved.trim() ? saved : "";
    }

    function loadProfileDegree() {
        const saved = storage.getItem(PROFILE_DEGREE_KEY);
        return saved && saved.trim() ? saved : "";
    }

    function loadProfileYearLevel() {
        const saved = storage.getItem(PROFILE_YEAR_LEVEL_KEY);
        return saved && saved.trim() ? saved : DEFAULT_YEAR_LEVEL;
    }

    function loadAvatar() {
        const saved = storage.getItem(PROFILE_AVATAR_KEY);
        return saved && Array.from(ALLOWED_AVATAR_TYPES).some((type) => saved.startsWith(`data:${type};`)) ? saved : "";
    }

    function setAvatarPreview(dataUrl) {
        [settingsNavbarProfileAvatar, profileAvatarPreview].forEach((el) => {
            if (!el) return;
            el.classList.toggle("has-image", Boolean(dataUrl));
            el.style.backgroundImage = dataUrl ? `url("${dataUrl}")` : "";
        });
    }

    function setYearLevel(value) {
        const nextValue = value || DEFAULT_YEAR_LEVEL;
        yearLevelButtons.forEach((btn) => {
            const isActive = btn.dataset.yearLevel === nextValue;
            btn.classList.toggle("active", isActive);
            btn.setAttribute("aria-pressed", isActive.toString());
        });
    }

    function getSelectedYearLevel() {
        return document.querySelector(".year-level-option.active")?.dataset.yearLevel || DEFAULT_YEAR_LEVEL;
    }

    function populateProfileInputs() {
        if (accountNameInput) accountNameInput.value = loadUserName();
        if (accountEmailInput) accountEmailInput.value = currentUser?.email || "";
        if (accountAgeInput) accountAgeInput.value = loadProfileAge();
        if (accountLocationInput) accountLocationInput.value = loadProfileLocation();
        if (accountUniversityInput) accountUniversityInput.value = loadProfileUniversity();
        if (accountDegreeInput) accountDegreeInput.value = loadProfileDegree();
        if (accountSemesterInput) accountSemesterInput.value = loadSemesterLabel();
        setYearLevel(loadProfileYearLevel());
        setAvatarPreview(loadAvatar());
    }

    function loadSystemPrefs() {
        if (window.NexaPreferences) return window.NexaPreferences.load();

        try {
            const raw = storage.getItem(SYSTEM_PREFS_KEY);
            const parsed = raw ? JSON.parse(raw) : {};
            return parsed && typeof parsed === "object" ? parsed : {};
        } catch (error) {
            console.warn("Failed to parse system preferences:", error);
            return {};
        }
    }

    function saveSystemPrefs(prefs, changedKey = "") {
        if (window.NexaPreferences) {
            const saved = window.NexaPreferences.save(prefs, changedKey);
            if (changedKey === "personalisation" && !saved.personalisation) {
                window.NexaPreferences.clearPersonalisedUiState();
            }
            return saved;
        }

        storage.setItem(SYSTEM_PREFS_KEY, JSON.stringify(prefs && typeof prefs === "object" ? prefs : {}));
        return prefs && typeof prefs === "object" ? prefs : {};
    }

    async function confirmSettingsSaved(failureMessage) {
        try {
            await storage.flush?.();
            return true;
        } catch (error) {
            console.error(failureMessage, error);
            showToast(failureMessage, "negative");
            return false;
        }
    }

    function setSegmentedPreferenceValue(group, value) {
        group.querySelectorAll("[data-pref-value]").forEach((button) => {
            const isActive = button.dataset.prefValue === value;
            button.classList.toggle("active", isActive);
            button.setAttribute("aria-pressed", isActive.toString());
        });
    }

    function populateSystemPreferences() {
        const prefs = loadSystemPrefs();

        document.querySelectorAll("[data-system-pref]").forEach((control) => {
            const key = control.dataset.systemPref;
            if (!key) return;

            if (control.type === "checkbox") {
                control.checked = Boolean(prefs[key]);
            } else {
                control.value = prefs[key] || control.querySelector("option")?.value || "";
            }
        });

        document.querySelectorAll("[data-system-segmented-pref]").forEach((group) => {
            const key = group.dataset.systemSegmentedPref;
            setSegmentedPreferenceValue(group, prefs[key]);
        });
        syncEmailReminderAction(prefs);
    }

    function syncEmailReminderAction(prefs = loadSystemPrefs()) {
        if (!sendEmailReminderBtn) return;
        const isEnabled = prefs.emailReminders && prefs.emailReminders !== "off";
        sendEmailReminderBtn.disabled = !isEnabled;
        sendEmailReminderBtn.classList.toggle("disabled", !isEnabled);
    }

    function showEmailReminderStatus(message, tone = "neutral") {
        if (!emailReminderStatus) return;
        emailReminderStatus.textContent = message || "";
        emailReminderStatus.classList.remove("hidden", "is-positive", "is-negative", "is-neutral");
        emailReminderStatus.classList.add(`is-${tone}`);
        emailReminderStatus.classList.toggle("hidden", !message);
    }

    function describeReminderPayload(payload) {
        const recipient = payload.recipientEmail ? ` to ${payload.recipientEmail}` : "";
        const type = payload.reminderType === "weekly" ? "weekly summary" : "important reminder";
        const items = Array.isArray(payload.items) ? payload.items : [];
        const preview = items.slice(0, 3).map((item) => item.task).filter(Boolean).join(", ");
        const suffix = preview ? ` Matched: ${preview}${items.length > 3 ? ", ..." : ""}.` : "";
        return `Sent ${type}${recipient} with ${payload.itemCount} ${payload.itemCount === 1 ? "assignment" : "assignments"}.${suffix}`;
    }

    async function saveSingleSystemPreference(control) {
        const key = control.dataset.systemPref;
        if (!key) return;

        let value = control.type === "checkbox" ? control.checked : control.value;

        if (key === "studyTimerAlerts" && value) {
            const permission = await window.NexaPreferences?.requestStudyTimerNotificationPermission?.();
            if (permission !== "granted") {
                const message = permission === "unsupported"
                    ? "Browser notifications are unavailable here. The timer sound can still play while Nexa is active."
                    : "Browser notifications are blocked. The timer sound can still play while Nexa is active.";
                showToast(message, "neutral");
            }
        }

        const prefs = loadSystemPrefs();
        prefs[key] = value;
        saveSystemPrefs(prefs, key);
        if (!(await confirmSettingsSaved("Could not save system preference right now."))) return;

        if (key === "emailReminders") syncEmailReminderAction(prefs);
        if (key === "emailReminders") {
            showEmailReminderStatus(
                value === "off"
                    ? "Email reminders are off. Turn them on to send a backend reminder digest."
                    : "Email reminders saved. Use Send to trigger the backend digest now.",
                "neutral"
            );
        }
        showToast("System preference saved.", "neutral");
    }

    async function saveSegmentedSystemPreference(group, value) {
        const key = group.dataset.systemSegmentedPref;
        if (!key || !value) return;

        const prefs = loadSystemPrefs();
        prefs[key] = value;
        saveSystemPrefs(prefs, key);
        if (!(await confirmSettingsSaved("Could not save system preference right now."))) return;

        setSegmentedPreferenceValue(group, value);
        showToast("System preference saved.", "neutral");
    }

    async function sendEmailReminderDigest() {
        if (!sendEmailReminderBtn) return;

        sendEmailReminderBtn.disabled = true;
        const label = sendEmailReminderBtn.querySelector(".ui-btn-label");
        const originalLabel = label?.textContent || "Send";
        if (label) label.textContent = "Sending";
        showEmailReminderStatus("Sending reminder email through the backend...", "neutral");

        try {
            await storage.flush?.();
            const response = await fetch("/api/reminders/email-digest", {
                method: "POST",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ force: true })
            });
            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload.error || "Could not send reminder email right now.");
            }

            if (payload.sent) {
                const message = describeReminderPayload(payload);
                showEmailReminderStatus(message, "positive");
                showToast(`Reminder email sent with ${payload.itemCount} ${payload.itemCount === 1 ? "item" : "items"}.`, "positive");
                return;
            }

            if (payload.skipped === "no_items") {
                showEmailReminderStatus(`Backend ran, but no assignments matched ${payload.reminderType === "weekly" ? "Weekly summary" : "Important only"} for ${payload.recipientEmail || "this account"}.`, "neutral");
                showToast("No reminder email sent because there are no matching assignments.", "neutral");
                return;
            }

            showEmailReminderStatus("Backend skipped this digest because it was already sent for this period.", "neutral");
            showToast("Reminder email already sent for this period.", "neutral");
        } catch (error) {
            showEmailReminderStatus(error.message || "Could not send reminder email right now.", "negative");
            showToast(error.message || "Could not send reminder email right now.", "negative");
        } finally {
            if (label) label.textContent = originalLabel;
            syncEmailReminderAction();
        }
    }

    function showToast(message, tone = "neutral") {
        if (window.NexaFeedback) {
            window.NexaFeedback.toast(message, { tone });
            return;
        }

        window.alert(message);
    }

    function showInlineNotice(targetEl, message, tone = "neutral") {
        if (window.NexaFeedback) {
            window.NexaFeedback.notice(targetEl, message, { tone });
            return;
        }

        if (targetEl) targetEl.textContent = message || "";
    }

    function setButtonLabel(button, label) {
        const labelEl = button?.querySelector(".ui-btn-label");
        if (labelEl) {
            labelEl.textContent = label;
            return;
        }
        if (button) button.textContent = label;
    }

    function showAvatarStatus(message, tone = "neutral") {
        showInlineNotice(profileAvatarStatus || profileSettingsStatus, message, tone);
    }

    function resetAvatarControls() {
        if (uploadAvatarBtn) {
            uploadAvatarBtn.disabled = false;
            uploadAvatarBtn.removeAttribute("aria-busy");
            setButtonLabel(uploadAvatarBtn, "Upload");
        }

        if (removeAvatarBtn) {
            removeAvatarBtn.disabled = false;
            removeAvatarBtn.removeAttribute("aria-busy");
            setButtonLabel(removeAvatarBtn, "Remove");
        }
    }

    function confirmAction(options) {
        if (window.NexaFeedback) {
            return window.NexaFeedback.confirm(options);
        }

        return Promise.resolve(window.confirm(options.message || options.title || "Are you sure?"));
    }

    function closeSettingsModals() {
        if (avatarCropModal && !avatarCropModal.classList.contains("hidden")) {
            closeAvatarCropper();
        }
        profileSettingsModal?.classList.add("hidden");
        systemSettingsModal?.classList.add("hidden");
        settingsBackdrop?.classList.add("hidden");
        document.body.classList.remove("settings-modal-open");
        showInlineNotice(profileSettingsStatus, "");
        showAvatarStatus("");
        showInlineNotice(passwordSettingsStatus, "");
    }

    function openProfileSettings() {
        populateProfileInputs();
        resetAvatarControls();
        showAvatarStatus("");
        settingsBackdrop?.classList.remove("hidden");
        profileSettingsModal?.classList.remove("hidden");
        systemSettingsModal?.classList.add("hidden");
        document.body.classList.add("settings-modal-open");
        profileSettingsBtn?.blur();
        systemSettingsBtn?.blur();
        setActiveTab("profile", "profile");
    }

    function openSystemSettings() {
        populateSystemPreferences();
        settingsBackdrop?.classList.remove("hidden");
        systemSettingsModal?.classList.remove("hidden");
        profileSettingsModal?.classList.add("hidden");
        document.body.classList.add("settings-modal-open");
        profileSettingsBtn?.blur();
        systemSettingsBtn?.blur();
        setActiveTab("system", "appearance");
    }

    function setActiveTab(targetKey, tabKey) {
        navButtons.forEach((btn) => {
            const matchesTarget = btn.dataset.settingsTarget === targetKey;
            btn.classList.toggle("active", matchesTarget && btn.dataset.tab === tabKey);
        });

        panels.forEach((panel) => {
            const matchesTarget = panel.dataset.settingsPanel === targetKey;
            panel.classList.toggle("hidden", !matchesTarget || panel.dataset.panel !== tabKey);
        });

        const subtitle = targetKey === "profile" ? profileSubtitle : systemSubtitle;
        if (subtitle) {
            subtitle.textContent = tabKey
                .split("-")
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(" ");
        }
    }

    async function saveProfileSettings() {
        const nameValue = (accountNameInput?.value || "").trim() || DEFAULT_USER_NAME;
        const emailValue = (accountEmailInput?.value || "").trim().toLowerCase();
        const ageValue = (accountAgeInput?.value || "").trim();
        const locationValue = (accountLocationInput?.value || "").trim();
        const universityValue = (accountUniversityInput?.value || "").trim();
        const degreeValue = (accountDegreeInput?.value || "").trim();
        const yearLevelValue = getSelectedYearLevel();
        const semesterValue = (accountSemesterInput?.value || "").trim() || DEFAULT_SEMESTER_LABEL;

        showInlineNotice(profileSettingsStatus, "");

        if (!emailValue) {
            const message = "Email cannot be blank.";
            showInlineNotice(profileSettingsStatus, message, "negative");
            showToast(message, "negative");
            populateProfileInputs();
            return;
        }

        if (ageValue) {
            const ageNumber = Number(ageValue);
            if (!Number.isInteger(ageNumber) || ageNumber < 13 || ageNumber > 120) {
                const message = "Age must be a whole number between 13 and 120.";
                showInlineNotice(profileSettingsStatus, message, "negative");
                showToast(message, "negative");
                return;
            }
        }

        let accountSaved = false;
        saveProfileBtn.disabled = true;

        try {
            const response = await fetch("/api/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ name: nameValue, email: emailValue })
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                const message = payload.error || "Could not save name or email right now.";
                showInlineNotice(profileSettingsStatus, message, "negative");
                showToast(message, "negative");
                populateProfileInputs();
                return;
            }

            if (typeof storage.saveProfileNow !== "function") {
                throw new Error("Profile storage is unavailable.");
            }

            currentUser = await response.json();
            storage.setCurrentUser(currentUser);
            accountSaved = true;
            const savedProfile = await storage.saveProfileNow({
                age: ageValue,
                location: locationValue,
                university: universityValue,
                degree: degreeValue,
                yearLevel: yearLevelValue || DEFAULT_YEAR_LEVEL,
                semesterLabel: semesterValue
            });
            await storage.flush?.();

            populateProfileInputs();
            window.dispatchEvent(new CustomEvent("nexa:account-updated", {
                detail: {
                    user: currentUser,
                    name: currentUser.name,
                    semester: savedProfile.semesterLabel,
                    age: savedProfile.age,
                    location: savedProfile.location,
                    university: savedProfile.university,
                    degree: savedProfile.degree,
                    yearLevel: savedProfile.yearLevel
                }
            }));
            showToast("Profile details saved.", "positive");
        } catch (error) {
            console.error("Failed to save profile settings:", error);
            const message = accountSaved
                ? `Name and email saved, but profile details were not saved. ${error.message || ""}`.trim()
                : error.message || "Could not save profile details to the database right now.";
            showInlineNotice(profileSettingsStatus, message, "negative");
            showToast(message, "negative");
            populateProfileInputs();
        } finally {
            saveProfileBtn.disabled = false;
            setButtonLabel(saveProfileBtn, "Save");
        }
    }

    function clearPasswordInputs() {
        if (currentPasswordInput) currentPasswordInput.value = "";
        if (newPasswordInput) newPasswordInput.value = "";
        if (confirmPasswordInput) confirmPasswordInput.value = "";
    }

    async function changePassword() {
        const currentPassword = currentPasswordInput?.value || "";
        const newPassword = newPasswordInput?.value || "";
        const confirmPassword = confirmPasswordInput?.value || "";

        showInlineNotice(passwordSettingsStatus, "");

        const response = await fetch("/api/me/password", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            showInlineNotice(passwordSettingsStatus, payload.error || "Could not change password right now.", "negative");
            return;
        }

        clearPasswordInputs();
        showInlineNotice(passwordSettingsStatus, "Password updated.", "positive");
        showToast("Password updated.", "positive");
    }

    async function logoutCurrentUser() {
        const confirmed = await confirmAction({
            title: "Log out?",
            message: "Are you sure you want to log out?",
            tone: "neutral",
            variant: "logout",
            confirmLabel: "Log out",
            cancelLabel: "Cancel"
        });
        if (!confirmed) return;

        const response = await fetch("/logout", {
            method: "DELETE",
            credentials: "same-origin"
        });

        if (!response.ok) {
            showToast("Could not log out right now.", "negative");
            return;
        }

        window.location.href = "/login";
    }

    async function deleteCurrentUserAccount() {
        const confirmed = await confirmAction({
            title: "Delete account?",
            message: "This cannot be undone.",
            tone: "negative",
            confirmLabel: "Delete",
            cancelLabel: "Cancel"
        });
        if (!confirmed) return;

        const response = await fetch("/api/me", {
            method: "DELETE",
            credentials: "same-origin"
        });

        if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            showToast(payload.error || "Could not delete account right now.", "negative");
            return;
        }

        showToast("Account deleted.", "negative");
        window.setTimeout(() => {
            window.location.href = "/login";
        }, 900);
    }

    async function resetAllAppData() {
        const confirmed = await confirmAction({
            title: "Reset app data?",
            message: "This will permanently delete saved tasks, subjects, assignments, profile fields, and system preferences.",
            tone: "negative",
            confirmLabel: "Reset",
            cancelLabel: "Cancel"
        });
        if (!confirmed) return;

        APP_DATA_KEYS.forEach((key) => storage.removeItem(key));
        setDarkMode(false);
        if (!(await confirmSettingsSaved("Could not reset app data right now."))) return;

        if (themeModeSelect) themeModeSelect.value = "light";
        populateProfileInputs();
        populateSystemPreferences();
        window.dispatchEvent(new CustomEvent("nexa:app-data-reset"));
    }

    function readFileAsDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.addEventListener("load", () => resolve(typeof reader.result === "string" ? reader.result : ""));
            reader.addEventListener("error", () => reject(new Error("Could not read that image.")));
            reader.readAsDataURL(file);
        });
    }

    function loadImageDataUrl(dataUrl) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener("load", () => resolve(image), { once: true });
            image.addEventListener("error", () => reject(new Error("Could not load that image.")), { once: true });
            image.src = dataUrl;
        });
    }

    function showCropStatus(message) {
        if (avatarCropStatus) avatarCropStatus.textContent = message || "";
    }

    function getAvatarCropFrameSize() {
        return avatarCropFrame?.getBoundingClientRect().width || 240;
    }

    function constrainAvatarCrop() {
        if (!avatarCropState) return;
        const frameSize = getAvatarCropFrameSize();
        const scale = avatarCropState.baseScale * avatarCropState.zoom;
        const displayedWidth = avatarCropState.image.naturalWidth * scale;
        const displayedHeight = avatarCropState.image.naturalHeight * scale;
        const maxX = Math.max(0, (displayedWidth - frameSize) / 2);
        const maxY = Math.max(0, (displayedHeight - frameSize) / 2);

        avatarCropState.offsetX = Math.max(-maxX, Math.min(maxX, avatarCropState.offsetX));
        avatarCropState.offsetY = Math.max(-maxY, Math.min(maxY, avatarCropState.offsetY));
    }

    function renderAvatarCrop() {
        if (!avatarCropState || !avatarCropImage) return;
        const frameSize = getAvatarCropFrameSize();
        const { image } = avatarCropState;
        avatarCropState.baseScale = Math.max(
            frameSize / Math.max(1, image.naturalWidth),
            frameSize / Math.max(1, image.naturalHeight)
        );
        constrainAvatarCrop();
        const displayScale = avatarCropState.baseScale * avatarCropState.zoom;

        avatarCropImage.style.width = `${image.naturalWidth * displayScale}px`;
        avatarCropImage.style.height = `${image.naturalHeight * displayScale}px`;
        avatarCropImage.style.transform = `translate(-50%, -50%) translate(${avatarCropState.offsetX}px, ${avatarCropState.offsetY}px)`;
    }

    function closeAvatarCropper() {
        avatarCropModal?.classList.add("hidden");
        avatarCropFrame?.classList.remove("is-dragging");
        showCropStatus("");
        avatarCropState = null;
        if (avatarCropImage) {
            avatarCropImage.removeAttribute("src");
            avatarCropImage.removeAttribute("style");
        }
        if (avatarCropZoom) avatarCropZoom.value = "1";
        if (avatarInput) avatarInput.value = "";
        resetAvatarControls();
    }

    function openAvatarCropper(dataUrl, image) {
        if (!avatarCropModal || !avatarCropImage || !avatarCropFrame || !avatarCropZoom) {
            return saveAvatarDataUrlFromImage(image);
        }

        avatarCropState = {
            image,
            dataUrl,
            baseScale: 1,
            zoom: 1,
            offsetX: 0,
            offsetY: 0,
            dragging: false,
            startX: 0,
            startY: 0,
            startOffsetX: 0,
            startOffsetY: 0
        };

        avatarCropImage.src = dataUrl;
        avatarCropZoom.value = "1";
        showCropStatus("");
        avatarCropModal.classList.remove("hidden");
        requestAnimationFrame(renderAvatarCrop);
        saveAvatarCropBtn?.focus();
        return Promise.resolve();
    }

    function createAvatarDataUrlFromImage(image, crop = null) {
        const canvas = document.createElement("canvas");
        canvas.width = AVATAR_CANVAS_SIZE;
        canvas.height = AVATAR_CANVAS_SIZE;

        const context = canvas.getContext("2d");
        if (!context) throw new Error("Could not prepare that image.");

        let sourceSize = Math.min(image.naturalWidth || image.width, image.naturalHeight || image.height);
        let sourceX = ((image.naturalWidth || image.width) - sourceSize) / 2;
        let sourceY = ((image.naturalHeight || image.height) - sourceSize) / 2;

        if (crop) {
            sourceSize = crop.sourceSize;
            sourceX = crop.sourceX;
            sourceY = crop.sourceY;
        }

        context.drawImage(
            image,
            sourceX,
            sourceY,
            sourceSize,
            sourceSize,
            0,
            0,
            AVATAR_CANVAS_SIZE,
            AVATAR_CANVAS_SIZE
        );

        let quality = AVATAR_OUTPUT_QUALITY;
        let output = canvas.toDataURL(AVATAR_OUTPUT_TYPE, quality);

        while (output.length > MAX_AVATAR_DATA_URL_LENGTH && quality > AVATAR_MIN_OUTPUT_QUALITY) {
            quality = Math.max(AVATAR_MIN_OUTPUT_QUALITY, quality - 0.08);
            output = canvas.toDataURL(AVATAR_OUTPUT_TYPE, quality);
        }

        if (output.length > MAX_AVATAR_DATA_URL_LENGTH) {
            throw new Error("Choose a smaller profile picture.");
        }

        return output;
    }

    function createAvatarDataUrlFromCrop() {
        if (!avatarCropState) throw new Error("Choose a profile picture first.");
        const frameSize = getAvatarCropFrameSize();
        const scale = avatarCropState.baseScale * avatarCropState.zoom;
        const sourceSize = frameSize / scale;
        const maxSourceX = Math.max(0, avatarCropState.image.naturalWidth - sourceSize);
        const maxSourceY = Math.max(0, avatarCropState.image.naturalHeight - sourceSize);
        const sourceX = Math.max(0, Math.min(
            maxSourceX,
            avatarCropState.image.naturalWidth / 2 - sourceSize / 2 - avatarCropState.offsetX / scale
        ));
        const sourceY = Math.max(0, Math.min(
            maxSourceY,
            avatarCropState.image.naturalHeight / 2 - sourceSize / 2 - avatarCropState.offsetY / scale
        ));

        return createAvatarDataUrlFromImage(avatarCropState.image, {
            sourceX,
            sourceY,
            sourceSize
        });
    }

    async function saveAvatarDataUrl(result) {
        const requestId = ++avatarSaveRequestId;
        resetAvatarControls();
        if (uploadAvatarBtn) uploadAvatarBtn.setAttribute("aria-busy", "true");
        setButtonLabel(uploadAvatarBtn, "Saving");
        showAvatarStatus("Saving profile picture...", "neutral");

        try {
            if (typeof storage.saveProfileNow !== "function") {
                throw new Error("Profile storage is unavailable.");
            }

            const savedProfile = await storage.saveProfileNow({ avatarUrlOrData: result });
            await storage.flush?.();
            if (requestId !== avatarSaveRequestId) return;

            setAvatarPreview(savedProfile.avatarUrlOrData || result);
            showAvatarStatus("");
            showToast("Profile picture updated.", "positive");
            closeAvatarCropper();
        } catch (error) {
            if (requestId !== avatarSaveRequestId) return;
            console.error("Failed to save profile picture:", error);
            const message = error.message || "Could not save that profile picture.";
            showAvatarStatus(message, "negative");
            showCropStatus(message);
            showToast(message, "negative");
            populateProfileInputs();
        } finally {
            if (requestId === avatarSaveRequestId) {
                resetAvatarControls();
            }
        }
    }

    async function saveAvatarDataUrlFromImage(image) {
        return saveAvatarDataUrl(createAvatarDataUrlFromImage(image));
    }

    async function saveAvatarCrop() {
        if (!avatarCropState) return;
        setButtonLabel(saveAvatarCropBtn, "Saving");
        showCropStatus("");

        try {
            const result = createAvatarDataUrlFromCrop();
            await saveAvatarDataUrl(result);
        } catch (error) {
            console.error("Failed to crop profile picture:", error);
            const message = error.message || "Could not save that profile picture.";
            showCropStatus(message);
            showToast(message, "negative");
        } finally {
            setButtonLabel(saveAvatarCropBtn, "Save");
        }
    }

    async function updateAvatarFromFile(file) {
        if (!file) return;
        avatarSaveRequestId += 1;
        resetAvatarControls();
        showAvatarStatus("");

        if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
            const message = "Use a JPG, PNG, or WebP image for your profile picture.";
            showAvatarStatus(message, "negative");
            showToast(message, "negative");
            if (avatarInput) avatarInput.value = "";
            return;
        }

        if (file.size > MAX_AVATAR_SOURCE_BYTES) {
            const message = "Choose an image under 4 MB for your profile picture.";
            showAvatarStatus(message, "negative");
            showToast(message, "negative");
            if (avatarInput) avatarInput.value = "";
            return;
        }

        try {
            const dataUrl = await readFileAsDataUrl(file);
            if (!Array.from(ALLOWED_AVATAR_TYPES).some((type) => dataUrl.startsWith(`data:${type};`))) {
                throw new Error("Could not read that image.");
            }

            const image = await loadImageDataUrl(dataUrl);
            await openAvatarCropper(dataUrl, image);
        } catch (error) {
            console.error("Failed to prepare profile picture:", error);
            const message = error.message || "Could not read that image.";
            showAvatarStatus(message, "negative");
            showToast(message, "negative");
            if (avatarInput) avatarInput.value = "";
        }
    }

    async function removeAvatar() {
        const requestId = ++avatarSaveRequestId;
        resetAvatarControls();
        if (removeAvatarBtn) removeAvatarBtn.setAttribute("aria-busy", "true");
        setButtonLabel(removeAvatarBtn, "Removing");
        showAvatarStatus("Removing profile picture...", "neutral");

        try {
            if (typeof storage.saveProfileNow !== "function") {
                throw new Error("Profile storage is unavailable.");
            }

            await storage.saveProfileNow({ avatarUrlOrData: "" });
            await storage.flush?.();
            if (requestId !== avatarSaveRequestId) return;

            if (avatarInput) avatarInput.value = "";
            setAvatarPreview("");
            showAvatarStatus("");
            showToast("Profile picture removed.", "neutral");
        } catch (error) {
            if (requestId !== avatarSaveRequestId) return;
            console.error("Failed to remove profile picture:", error);
            const message = "Could not remove profile picture right now.";
            showAvatarStatus(message, "negative");
            showToast(message, "negative");
            populateProfileInputs();
        } finally {
            if (requestId === avatarSaveRequestId) {
                resetAvatarControls();
            }
        }
    }

    /*
      ==========================
      THEME SETTINGS
      ==========================
    */

    function setDarkMode(isOn, { persistLegacy = true } = {}) {
        document.body.classList.toggle("dark-mode", isOn);
        if (persistLegacy) {
            storage.setItem("darkMode", isOn ? "1" : "0");
        }
        document.cookie = `nexa_dark_mode=${isOn ? "1" : "0"}; path=/; max-age=31536000; SameSite=Lax`;
        themeSwitch?.setAttribute("aria-pressed", isOn.toString());
        themeSwitch?.setAttribute("aria-label", isOn ? "Switch to light mode" : "Switch to dark mode");
    }

    function resolveThemeMode(mode) {
        if (mode === "dark") return true;
        if (mode === "light") return false;
        return darkThemeQuery.matches;
    }

    function setThemeMode(mode) {
        const nextMode = ["system", "light", "dark"].includes(mode) ? mode : "system";
        storage.setItem(THEME_MODE_KEY, nextMode);
        if (themeModeSelect) themeModeSelect.value = nextMode;
        setDarkMode(resolveThemeMode(nextMode), { persistLegacy: nextMode !== "system" });
    }

    function initialiseThemeSetting() {
        const savedMode = storage.getItem(THEME_MODE_KEY);
        const legacyMode = storage.getItem("darkMode") === "1" ? "dark" : "light";
        setThemeMode(savedMode || legacyMode);

        themeSwitch?.addEventListener("click", () => {
            setThemeMode(document.body.classList.contains("dark-mode") ? "light" : "dark");
        });

        themeModeSelect?.addEventListener("change", () => {
            setThemeMode(themeModeSelect.value);
        });

        darkThemeQuery.addEventListener("change", () => {
            if (storage.getItem(THEME_MODE_KEY) === "system") {
                setDarkMode(darkThemeQuery.matches, { persistLegacy: false });
            }
        });
    }

    if (menuToggle) {
        initialiseNavGroups();
        syncNavigationMode();
        menuToggle.addEventListener("click", () => {
            if (mobileNavQuery.matches) {
                setMobileNavOpen(!document.body.classList.contains("mobile-nav-open"));
                return;
            }

            setNavCollapsed(!document.body.classList.contains("nav-collapsed"));
        });
    }

    document.querySelector(".navbar")?.addEventListener("click", handleCollapsedNavActivation);
    document.querySelector(".navbar")?.addEventListener("click", handleMobileNavActivation);

    if (typeof mobileNavQuery.addEventListener === "function") {
        mobileNavQuery.addEventListener("change", syncNavigationMode);
    } else if (typeof mobileNavQuery.addListener === "function") {
        mobileNavQuery.addListener(syncNavigationMode);
    }

    profileSettingsBtn?.addEventListener("click", (event) => {
        event.stopPropagation();
        openProfileSettings();
    });
    systemSettingsBtn?.addEventListener("click", (event) => {
        event.stopPropagation();
        openSystemSettings();
    });
    settingsBackdrop?.addEventListener("click", closeSettingsModals);
    settingsCloseBtns.forEach((btn) => {
        btn.addEventListener("click", (event) => {
            if (btn.closest("#avatar-crop-modal")) {
                event.stopImmediatePropagation();
                closeAvatarCropper();
                return;
            }

            closeSettingsModals();
        });
    });
    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        if (avatarCropModal && !avatarCropModal.classList.contains("hidden")) {
            closeAvatarCropper();
            return;
        }
        closeSettingsModals();
    });
    navButtons.forEach((btn) => {
        btn.addEventListener("click", () => setActiveTab(btn.dataset.settingsTarget, btn.dataset.tab));
    });

    resetAppDataBtn?.addEventListener("click", () => {
        resetAllAppData().catch((error) => {
            console.error("Failed to reset app data:", error);
            showToast("Could not reset app data right now.", "negative");
        });
    });
    sendEmailReminderBtn?.addEventListener("click", () => {
        sendEmailReminderDigest().catch((error) => {
            console.error("Failed to send email reminder digest:", error);
            showToast("Could not send reminder email right now.", "negative");
            syncEmailReminderAction();
        });
    });
    saveProfileBtn?.addEventListener("click", () => {
        saveProfileSettings().catch((error) => {
            console.error("Failed to save profile settings:", error);
            showToast("Could not update profile details right now.", "negative");
        });
    });
    avatarInput?.addEventListener("change", () => updateAvatarFromFile(avatarInput.files?.[0]));
    uploadAvatarBtn?.addEventListener("click", () => avatarInput?.click());
    profileAvatarPreview?.addEventListener("click", () => avatarInput?.click());
    removeAvatarBtn?.addEventListener("click", removeAvatar);
    avatarCropFrame?.addEventListener("pointerdown", (event) => {
        if (!avatarCropState) return;
        event.preventDefault();
        avatarCropState.dragging = true;
        avatarCropState.startX = event.clientX;
        avatarCropState.startY = event.clientY;
        avatarCropState.startOffsetX = avatarCropState.offsetX;
        avatarCropState.startOffsetY = avatarCropState.offsetY;
        avatarCropFrame.classList.add("is-dragging");
        avatarCropFrame.setPointerCapture?.(event.pointerId);
    });
    avatarCropFrame?.addEventListener("pointermove", (event) => {
        if (!avatarCropState?.dragging) return;
        avatarCropState.offsetX = avatarCropState.startOffsetX + event.clientX - avatarCropState.startX;
        avatarCropState.offsetY = avatarCropState.startOffsetY + event.clientY - avatarCropState.startY;
        renderAvatarCrop();
    });
    function endAvatarCropDrag(event) {
        if (!avatarCropState) return;
        avatarCropState.dragging = false;
        avatarCropFrame?.classList.remove("is-dragging");
        avatarCropFrame?.releasePointerCapture?.(event.pointerId);
    }
    avatarCropFrame?.addEventListener("pointerup", endAvatarCropDrag);
    avatarCropFrame?.addEventListener("pointercancel", endAvatarCropDrag);
    avatarCropZoom?.addEventListener("input", () => {
        if (!avatarCropState) return;
        avatarCropState.zoom = Number(avatarCropZoom.value) || 1;
        renderAvatarCrop();
    });
    saveAvatarCropBtn?.addEventListener("click", () => {
        saveAvatarCrop().catch((error) => {
            console.error("Failed to save cropped profile picture:", error);
            showToast("Could not save that profile picture.", "negative");
        });
    });
    cancelAvatarCropBtn?.addEventListener("click", closeAvatarCropper);
    yearLevelButtons.forEach((btn) => {
        btn.addEventListener("click", () => setYearLevel(btn.dataset.yearLevel));
    });
    changePasswordBtn?.addEventListener("click", () => {
        changePassword().catch((error) => {
            console.error("Failed to change password:", error);
            showInlineNotice(passwordSettingsStatus, "Could not change password right now.", "negative");
        });
    });
    logoutBtn?.addEventListener("click", () => {
        logoutCurrentUser().catch((error) => {
            console.error("Failed to log out:", error);
            showToast("Could not log out right now.", "negative");
        });
    });
    deleteAccountBtn?.addEventListener("click", () => {
        deleteCurrentUserAccount().catch((error) => {
            console.error("Failed to delete account:", error);
            showToast("Could not delete account right now.", "negative");
        });
    });
    document.querySelectorAll("[data-system-pref]").forEach((control) => {
        control.addEventListener("change", () => {
            saveSingleSystemPreference(control).catch((error) => {
                console.error("Failed to save system preference:", error);
                showToast("Could not save system preference right now.", "negative");
            });
        });
    });
    document.querySelectorAll("[data-system-segmented-pref]").forEach((group) => {
        group.addEventListener("click", (event) => {
            const button = event.target.closest("[data-pref-value]");
            if (!button || !group.contains(button)) return;
            saveSegmentedSystemPreference(group, button.dataset.prefValue).catch((error) => {
                console.error("Failed to save system preference:", error);
                showToast("Could not save system preference right now.", "negative");
            });
        });
    });

    setActiveTab("profile", "profile");
    setActiveTab("system", "appearance");
    initialiseThemeSetting();
    populateProfileInputs();
    populateSystemPreferences();
});
