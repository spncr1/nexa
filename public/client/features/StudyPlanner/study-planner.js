document.addEventListener("DOMContentLoaded", async () => {
    await window.NexaAppStorage.ready;
    const storage = window.NexaAppStorage;

    function copy(key, fallback = "") {
        return window.NexaCopy?.get?.(key, fallback) ?? fallback;
    }

    const queueList = document.getElementById("queue-list");
    const addSessionBtn = document.getElementById("add-session-btn");
    const playNextBtn = document.getElementById("play-next-session-btn");
    const clearQueueBtn = document.getElementById("clear-queue-btn");
    const previousBtn = document.getElementById("previous-session-btn");
    const pauseBtn = document.getElementById("pause-session-btn");
    const pauseIcon = document.getElementById("pause-session-icon");
    const nextBtn = document.getElementById("next-session-btn");
    const repeatBtn = document.getElementById("repeat-session-btn");
    const stopBtn = document.getElementById("stop-session-btn");
    const resetTimerBtn = document.getElementById("reset-timer-btn");
    const currentSubject = document.getElementById("current-subject");
    const currentDetail = document.getElementById("current-detail");
    const currentType = document.getElementById("current-type");
    const sessionStatus = document.querySelector(".session-status");
    const sessionState = document.getElementById("session-state");
    const countdownTimer = document.getElementById("countdown-timer");
    const timerRemainingLabel = document.getElementById("timer-remaining-label");
    const timerRing = document.querySelector(".timer-ring");
    const sessionStatusDot = document.querySelector(".session-status i");
    const queueEmptyState = document.getElementById("queue-empty-state");
    const queueCountPill = document.querySelector(".session-queue .count-pill");

    const addModalBackdrop = document.getElementById("study-modal-backdrop");
    const addModal = document.getElementById("add-study-session-modal");
    const closeAddModalBtn = document.getElementById("close-study-session-modal-btn");
    const cancelAddModalBtn = document.getElementById("cancel-study-session-btn");
    const confirmAddModalBtn = document.getElementById("confirm-study-session-btn");
    const addTitleInput = document.getElementById("study-session-title");
    const addTypeSelect = document.getElementById("study-session-type");
    const addDurationInput = document.getElementById("study-session-duration");
    const addDurationPresets = document.getElementById("study-session-duration-presets");
    const addNotesInput = document.getElementById("study-session-notes");
    const addStatusText = document.getElementById("study-session-status-text");

    const detailModal = document.getElementById("study-session-detail-modal");
    const detailModalTitle = document.getElementById("study-session-detail-title");
    const closeDetailModalBtn = document.getElementById("close-study-session-detail-btn");
    const cancelDetailModalBtn = document.getElementById("cancel-study-session-detail-btn");
    const saveDetailBtn = document.getElementById("save-study-session-detail-btn");
    const deleteDetailBtn = document.getElementById("delete-study-session-btn");
    const favouriteDetailBtn = document.getElementById("favourite-study-session-btn");
    const detailTitleInput = document.getElementById("detail-session-title");
    const detailTypeSelect = document.getElementById("detail-session-type");
    const detailDurationInput = document.getElementById("detail-session-duration");
    const detailDurationPresets = document.getElementById("detail-session-duration-presets");
    const detailNotesInput = document.getElementById("detail-session-notes");
    const detailStatusText = document.getElementById("study-session-detail-status-text");

    const sessionsCompletedStat = document.getElementById("sessions-completed-stat");
    const sessionsCompletedProgress = document.getElementById("sessions-completed-progress");
    const sessionsCompletedPercent = document.getElementById("sessions-completed-percent");
    const goalProgressStat = document.getElementById("goal-progress-stat");
    const goalProgressNote = document.getElementById("goal-progress-note");
    const goalProgressBar = document.getElementById("goal-progress-bar");
    const totalFocusTimeStat = document.getElementById("total-focus-time-stat");
    const totalFocusTimeNote = document.getElementById("total-focus-time-note");
    const activeDaysStat = document.getElementById("active-days-stat");
    const activeDaysList = document.getElementById("active-days-list");
    const focusBalanceRing = document.getElementById("focus-balance-ring");
    const deepFocusPercent = document.getElementById("deep-focus-percent");
    const lightStudyPercent = document.getElementById("light-study-percent");
    const standardFocusPercent = document.getElementById("standard-focus-percent");
    const suggestionList = document.querySelector(".suggestion-list");
    const currentDateLabel = document.getElementById("study-current-date");
    const weekPlanTitle = document.getElementById("week-plan-title");
    const previousWeekBtn = document.getElementById("previous-week-btn");
    const nextWeekBtn = document.getElementById("next-week-btn");
    const currentPlanPeriodBtn = document.getElementById("current-plan-period-btn");
    const monthPlanList = document.getElementById("month-plan-list");
    const weekSummaryBtn = document.getElementById("study-week-summary-btn");
    const monthSummaryBtn = document.getElementById("study-month-summary-btn");
    const setStudyGoalBtn = document.getElementById("set-study-goal-btn");
    const studyGoalModal = document.getElementById("study-goal-modal");
    const studyGoalTitle = document.getElementById("study-goal-title");
    const closeStudyGoalBtn = document.getElementById("close-study-goal-btn");
    const cancelStudyGoalBtn = document.getElementById("cancel-study-goal-btn");
    const saveStudyGoalBtn = document.getElementById("save-study-goal-btn");
    const goalTargetSessionsInput = document.getElementById("goal-target-sessions");
    const goalTargetTimeInput = document.getElementById("goal-target-time");
    const goalActiveDaysInput = document.getElementById("goal-active-days");
    const goalDeepWorkInput = document.getElementById("goal-deep-work");
    const goalStandardFocusInput = document.getElementById("goal-standard-focus");
    const goalLightStudyInput = document.getElementById("goal-light-study");
    const studyGoalStatusText = document.getElementById("study-goal-status-text");

    const QUEUE_KEY = "studenthub_study_queue";
    const COMPLETED_KEY = "studenthub_study_completed_sessions";
    const FAVOURITES_KEY = "studenthub_study_favourites";
    const ACTIVE_KEY = "studenthub_study_active_session";
    const ASSIGNMENTS_KEY = "studenthub_assignments";
    const SUBJECTS_KEY = "studenthub_subjects";
    const WEEKLY_GOAL_KEY = "studenthub_study_weekly_goal";
    const MONTHLY_GOAL_KEY = "studenthub_study_monthly_goal";
    const SUGGESTION_OVERRIDES_KEY = "studenthub_study_suggestion_overrides";
    const RECENT_LIMIT = 5;
    const STANDALONE_MAX_SECONDS = 4 * 60 * 60;
    const DEFAULT_PAGE_TITLE = document.title;
    const PRESET_SECONDS = {
        light: [30 * 60, 45 * 60],
        standard: [60 * 60],
        deep: [90 * 60, 120 * 60],
        custom: []
    };

    let queue = [];
    let completedSessions = [];
    let favouriteSessions = [];
    let suggestionOverrides = {};
    let currentSuggestions = [];
    let activeSession = null;
    let lastPlayedTemplate = null;
    let timerId = null;
    let alertAudioContext = null;
    let detailContext = null;
    let draggedQueueId = null;
    let selectedWeekStart = startOfWeekMonday(new Date());
    let selectedMonthStart = startOfMonth(new Date());
    let summaryPeriod = "week";

    const typeLabels = {
        deep: "Deep Work",
        light: "Light Study",
        standard: "Standard Focus",
        custom: "Custom"
    };

    const typeClasses = {
        deep: "tag-deep",
        light: "tag-light",
        standard: "tag-passive",
        custom: "tag-custom"
    };

    function loadList(key) {
        try {
            const parsed = JSON.parse(storage.getItem(key) || "[]");
            return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
        } catch (error) {
            console.warn(`Failed to parse ${key}:`, error);
            return [];
        }
    }

    function loadObject(key) {
        try {
            const parsed = JSON.parse(storage.getItem(key) || "null");
            return parsed && typeof parsed === "object" ? parsed : null;
        } catch (error) {
            console.warn(`Failed to parse ${key}:`, error);
            return null;
        }
    }

    function normaliseStudyGoal(value) {
        if (!value || typeof value !== "object") {
            const legacySessions = Number.parseInt(value, 10);
            return Number.isFinite(legacySessions) && legacySessions > 0
                ? {
                    targetSessions: legacySessions,
                    targetFocusSeconds: 0,
                    activeDays: 0,
                    focusBalance: { deep: 0, standard: 0, light: 0 }
                }
                : null;
        }

        const targetSessions = Math.max(0, Number.parseInt(value.targetSessions, 10) || 0);
        const targetFocusSeconds = Math.max(0, Math.round(Number(value.targetFocusSeconds) || 0));
        const activeDays = Math.max(0, Number.parseInt(value.activeDays, 10) || 0);
        const focusBalance = value.focusBalance && typeof value.focusBalance === "object" ? value.focusBalance : {};

        if (!targetSessions && !targetFocusSeconds && !activeDays) return null;

        return {
            targetSessions,
            targetFocusSeconds,
            activeDays,
            focusBalance: {
                deep: Math.max(0, Number.parseInt(focusBalance.deep, 10) || 0),
                standard: Math.max(0, Number.parseInt(focusBalance.standard, 10) || 0),
                light: Math.max(0, Number.parseInt(focusBalance.light, 10) || 0)
            }
        };
    }

    function loadStudyGoal(period = summaryPeriod) {
        const key = period === "month" ? MONTHLY_GOAL_KEY : WEEKLY_GOAL_KEY;
        const storedObject = loadObject(key);
        if (storedObject) return normaliseStudyGoal(storedObject);
        return normaliseStudyGoal(storage.getItem(key));
    }

    function saveStudyGoal(period, goal) {
        const key = period === "month" ? MONTHLY_GOAL_KEY : WEEKLY_GOAL_KEY;
        saveObject(key, goal);
    }

    function saveList(key, value) {
        storage.setItem(key, JSON.stringify(Array.isArray(value) ? value : []));
    }

    function saveObject(key, value) {
        storage.setItem(key, JSON.stringify(value && typeof value === "object" ? value : {}));
    }

    function saveActiveSession() {
        if (activeSession) {
            if (activeSession.status === "running" && activeSession.deadlineAt) {
                activeSession.remainingSeconds = Math.max(0, Math.ceil((activeSession.deadlineAt - Date.now()) / 1000));
                activeSession.lastTickAt = activeSession.deadlineAt - (activeSession.remainingSeconds * 1000);
            }
            storage.setItem(ACTIVE_KEY, JSON.stringify(activeSession));
        } else {
            storage.removeItem(ACTIVE_KEY);
        }
    }

    function showToast(message, tone = "neutral") {
        if (window.NexaFeedback) {
            window.NexaFeedback.toast(message, { tone });
            return;
        }

        window.alert(message);
    }

    async function confirmStudySaved(failureMessage, noticeTarget = null) {
        try {
            await storage.flush?.();
            return true;
        } catch (error) {
            console.error(failureMessage, error);
            if (noticeTarget) {
                showNotice(noticeTarget, failureMessage, "negative");
            } else {
                showToast(failureMessage, "negative");
            }
            return false;
        }
    }

    function showNotice(targetEl, message, tone = "neutral") {
        if (window.NexaFeedback) {
            window.NexaFeedback.notice(targetEl, message, { tone });
            return;
        }

        if (targetEl) textNotice(targetEl, message, tone);
    }

    function textNotice(targetEl, message, tone) {
        targetEl.textContent = message || "";
        targetEl.dataset.tone = tone || "neutral";
    }

    function confirmAction(options) {
        if (window.NexaFeedback) return window.NexaFeedback.confirm(options);
        return Promise.resolve(window.confirm(options.message || options.title || "Are you sure?"));
    }

    function createId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    }

    const durationControlKeys = new Set([
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        "Tab",
        "Enter",
        "Escape"
    ]);

    function cleanDurationInputValue(value) {
        return String(value || "").replace(/[^\d:]/g, "");
    }

    function parseDurationInput(value, options = {}) {
        const rawText = String(value || "").trim();
        const maxSeconds = Number(options.maxSeconds) || null;
        const requiredMessage = options.requiredMessage || "Duration is required.";
        const invalidMessage = options.invalidMessage || "Duration must use numbers only in HH:MM:SS format.";

        if (!rawText) return { error: requiredMessage };
        if (/[^0-9:]/.test(rawText) || rawText.includes("::")) return { error: invalidMessage };

        const text = rawText;

        let hours = 0;
        let minutes = 0;
        let seconds = 0;

        if (text.includes(":")) {
            const parts = text.split(":");
            if (parts.length > 3 || parts.some((part) => part === "" || !/^\d+$/.test(part))) {
                return { error: invalidMessage };
            }

            const padded = parts.length === 1 ? ["0", "0", parts[0]] : parts.length === 2 ? ["0", ...parts] : parts;
            hours = Number(padded[0]);
            minutes = Number(padded[1]);
            seconds = Number(padded[2]);
        } else {
            if (!/^\d+$/.test(text)) return { error: invalidMessage };
            const padded = text.padStart(6, "0");
            hours = Number(padded.slice(0, -4));
            minutes = Number(padded.slice(-4, -2));
            seconds = Number(padded.slice(-2));
        }

        if (![hours, minutes, seconds].every(Number.isFinite)) return { error: invalidMessage };

        const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
        if (!Number.isSafeInteger(totalSeconds) || totalSeconds <= 0) {
            return { error: "Duration must be a positive time block." };
        }
        if (maxSeconds && totalSeconds > maxSeconds) {
            return { error: `Duration cannot exceed ${formatClock(maxSeconds)}.` };
        }

        return {
            seconds: totalSeconds,
            minutes: totalSeconds / 60,
            display: formatTimerInput(totalSeconds)
        };
    }

    function parseGoalFocusTime(value) {
        const rawText = String(value || "").trim().toLowerCase();
        if (!rawText) return { error: "Target focus time is required." };

        const normalisedText = rawText.replace(/\s+/g, " ");
        const invalidMessage = "Target focus time must use whole hours and minutes, like 30m, 2h, 2h 30m, 2:30, or 02:30:00.";

        function fromHoursMinutes(hours, minutes = 0) {
            if (![hours, minutes].every(Number.isFinite) || hours < 0 || minutes < 0) {
                return { error: invalidMessage };
            }
            const totalSeconds = (hours * 3600) + (minutes * 60);
            return totalSeconds > 0
                ? { seconds: totalSeconds }
                : { error: "Target focus time must be positive." };
        }

        const hourMinuteMatch = normalisedText.match(/^(\d+)\s*h(?:ours?)?(?:\s*(\d+)\s*m(?:in(?:ute)?s?)?)?$/);
        if (hourMinuteMatch) {
            return fromHoursMinutes(
                Number.parseInt(hourMinuteMatch[1], 10),
                Number.parseInt(hourMinuteMatch[2] || "0", 10)
            );
        }

        const minuteMatch = normalisedText.match(/^(\d+)\s*m(?:in(?:ute)?s?)?$/);
        if (minuteMatch) {
            const minutes = Number.parseInt(minuteMatch[1], 10);
            return fromHoursMinutes(0, minutes);
        }

        if (normalisedText.includes(":")) {
            const parts = normalisedText.split(":");
            if (parts.length !== 2 && parts.length !== 3) return { error: invalidMessage };
            if (parts.some((part) => !/^\d+$/.test(part))) return { error: invalidMessage };

            const hours = Number.parseInt(parts[0], 10);
            const minutes = Number.parseInt(parts[1], 10);
            const seconds = parts.length === 3 ? Number.parseInt(parts[2], 10) : 0;
            if (seconds !== 0) {
                return { error: "Target focus time should use whole minutes." };
            }
            return fromHoursMinutes(hours, minutes);
        }

        return { error: invalidMessage };
    }

    function inferTypeFromSeconds(seconds) {
        const minutes = seconds / 60;
        if (minutes >= 90) return "deep";
        if (minutes <= 45) return "light";
        return "standard";
    }

    function normaliseType(type) {
        return Object.prototype.hasOwnProperty.call(typeLabels, type) ? type : "standard";
    }

    function getSessionSeconds(session) {
        const durationSeconds = Number(session?.durationSeconds);
        if (Number.isFinite(durationSeconds) && durationSeconds > 0) return Math.round(durationSeconds);
        const totalSeconds = Number(session?.totalSeconds);
        if (Number.isFinite(totalSeconds) && totalSeconds > 0) return Math.round(totalSeconds);
        const durationMinutes = Number(session?.durationMinutes);
        return Number.isFinite(durationMinutes) && durationMinutes > 0 ? Math.round(durationMinutes * 60) : 0;
    }

    function formatClock(totalSeconds, options = {}) {
        const secondsValue = Math.max(0, Math.round(Number(totalSeconds) || 0));
        const hours = Math.floor(secondsValue / 3600);
        const minutes = Math.floor((secondsValue % 3600) / 60);
        const seconds = secondsValue % 60;
        const hourText = options.padHours ? String(hours).padStart(2, "0") : hours > 0 ? String(hours) : "00";
        return `${hourText}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    function formatTimerInput(totalSeconds) {
        return formatClock(totalSeconds, { padHours: true });
    }

    function normaliseSessionRecord(session, prefix = "study_session") {
        if (!session || typeof session !== "object") return null;
        const seconds = getSessionSeconds(session);
        if (!seconds) return null;

        const title = String(session.title || session.name || "Timer").trim() || "Timer";
        const type = normaliseType(session.type);

        return {
            ...session,
            id: session.id || createId(prefix),
            title,
            type,
            durationSeconds: seconds,
            durationMinutes: seconds / 60,
            notes: String(session.notes || "").slice(0, 500)
        };
    }

    function normaliseSessionList(sessions, prefix) {
        return Array.isArray(sessions)
            ? sessions.map((session) => normaliseSessionRecord(session, prefix)).filter(Boolean)
            : [];
    }

    function normaliseActiveSession(session) {
        const normalised = normaliseSessionRecord(session, "study_run");
        if (!normalised) return null;

        const totalSeconds = Math.max(1, Number(session.totalSeconds) || normalised.durationSeconds);
        const savedRemaining = session.remainingSeconds == null ? NaN : Number(session.remainingSeconds);
        const remainingSeconds = Math.max(0, Math.min(totalSeconds, Number.isFinite(savedRemaining) ? savedRemaining : totalSeconds));
        const deadlineAt = Number(session.deadlineAt);

        return {
            ...normalised,
            totalSeconds,
            remainingSeconds,
            status: session.status === "paused" ? "paused" : "running",
            isRepeating: Boolean(session.isRepeating || session.isLooping),
            isStandalone: Boolean(session.isStandalone),
            startedAt: Number(session.startedAt) || Date.now(),
            lastTickAt: Number(session.lastTickAt) || Date.now(),
            deadlineAt: Number.isFinite(deadlineAt) && deadlineAt > 0 ? deadlineAt : null
        };
    }

    function hydrateState() {
        queue = normaliseSessionList(loadList(QUEUE_KEY), "study_session");
        completedSessions = normaliseSessionList(loadList(COMPLETED_KEY), "study_completed");
        favouriteSessions = normaliseSessionList(loadList(FAVOURITES_KEY), "study_favourite");
        suggestionOverrides = loadObject(SUGGESTION_OVERRIDES_KEY) || {};
        activeSession = normaliseActiveSession(loadObject(ACTIVE_KEY));
        lastPlayedTemplate = getTemplateFromSession(activeSession) || getTemplateFromSession(completedSessions[0]);
    }

    function formatDurationFromSeconds(seconds) {
        const totalSeconds = Math.max(0, Math.round(Number(seconds) || 0));
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.round((totalSeconds % 3600) / 60);
        if (hours && minutes) return `${hours}h ${minutes}m`;
        if (hours) return `${hours}h`;
        return `${minutes || 0}m`;
    }

    function formatDateTime(timestamp) {
        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) return "";
        return new Intl.DateTimeFormat("en-AU", {
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit"
        }).format(date);
    }

    function isSameWeek(timestamp, baseDate = new Date()) {
        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) return false;
        const start = new Date(baseDate);
        start.setHours(0, 0, 0, 0);
        const day = start.getDay() || 7;
        start.setDate(start.getDate() - day + 1);
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        return date >= start && date < end;
    }

    function isSameMonth(timestamp, baseDate = new Date()) {
        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) return false;
        return date.getFullYear() === baseDate.getFullYear() && date.getMonth() === baseDate.getMonth();
    }

    function getSessionsForSummaryPeriod() {
        const baseDate = new Date();
        return completedSessions.filter((session) => {
            return summaryPeriod === "month"
                ? isSameMonth(session.completedAt, baseDate)
                : isSameWeek(session.completedAt, baseDate);
        });
    }

    function getPeriodDayLimit() {
        if (summaryPeriod === "month") {
            const today = new Date();
            return new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        }
        return 7;
    }

    function atNoon(value) {
        const date = value instanceof Date ? new Date(value) : new Date(value);
        date.setHours(12, 0, 0, 0);
        return date;
    }

    function startOfWeekMonday(value) {
        const date = atNoon(value);
        const day = date.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        date.setDate(date.getDate() + diff);
        return date;
    }

    function startOfMonth(value) {
        const date = atNoon(value);
        date.setDate(1);
        return date;
    }

    function addDays(value, days) {
        const date = atNoon(value);
        date.setDate(date.getDate() + days);
        return date;
    }

    function addMonths(value, months) {
        const date = startOfMonth(value);
        date.setMonth(date.getMonth() + months);
        return date;
    }

    function sameCalendarDay(first, second) {
        return first.getFullYear() === second.getFullYear()
            && first.getMonth() === second.getMonth()
            && first.getDate() === second.getDate();
    }

    function sameCalendarMonth(first, second) {
        return first.getFullYear() === second.getFullYear()
            && first.getMonth() === second.getMonth();
    }

    function formatHeaderDate(value) {
        return new Intl.DateTimeFormat("en-AU", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(value);
    }

    function formatWeekRange(startDate) {
        const endDate = addDays(startDate, 6);
        const startText = new Intl.DateTimeFormat("en-AU", {
            day: "numeric",
            month: "long"
        }).format(startDate);
        const endText = new Intl.DateTimeFormat("en-AU", {
            day: "numeric",
            month: "long"
        }).format(endDate);
        return `${startText} - ${endText}`;
    }

    function formatMonthLabel(date) {
        return new Intl.DateTimeFormat("en-AU", {
            month: "long",
            year: "numeric"
        }).format(date);
    }

    function formatMonthWeekRange(startDate, endDate) {
        const formatter = new Intl.DateTimeFormat("en-AU", {
            day: "numeric",
            month: "short"
        });
        return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
    }

    function parseISODate(value) {
        if (!value) return null;
        const [year, month, day] = String(value).split("-").map(Number);
        if (!year || !month || !day) return null;
        const date = new Date(year, month - 1, day);
        date.setHours(12, 0, 0, 0);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    function getTodayAtNoon() {
        const today = new Date();
        today.setHours(12, 0, 0, 0);
        return today;
    }

    function getDaysUntil(date, today = getTodayAtNoon()) {
        return Math.ceil((date.getTime() - today.getTime()) / 86400000);
    }

    function priorityRank(priority) {
        const normalized = String(priority || "").toLowerCase();
        if (normalized === "high") return 3;
        if (normalized === "medium") return 2;
        if (normalized === "low") return 1;
        return 0;
    }

    function statusIsIncomplete(status) {
        return String(status || "not-started").toLowerCase() !== "completed";
    }

    function loadSubjects() {
        return loadList(SUBJECTS_KEY).filter((subject) => subject && typeof subject.id === "string");
    }

    function loadAssignments() {
        return loadList(ASSIGNMENTS_KEY).filter((assignment) => {
            return assignment && typeof assignment.task === "string" && statusIsIncomplete(assignment.status);
        });
    }

    function subjectNameById() {
        return new Map(loadSubjects().map((subject) => [subject.id, subject.name || "Subject"]));
    }

    function makeSuggestionTitle(assignment, subjects) {
        const task = (assignment.task || "Assignment").trim();
        const subject = subjects.get(assignment.courseId);
        const lowerTask = task.toLowerCase();
        if (lowerTask.includes("exam") || lowerTask.includes("test") || lowerTask.includes("quiz")) {
            return `${subject || task} revision session`;
        }
        if (lowerTask.includes("report") || lowerTask.includes("essay") || lowerTask.includes("assignment")) {
            return `${subject || task} assignment focus`;
        }
        return `${task} prep`;
    }

    function buildSuggestionFromAssignment(assignment, subjects) {
        const dueDate = parseISODate(assignment.dueDate);
        if (!dueDate) return null;

        const daysUntil = getDaysUntil(dueDate);
        if (daysUntil < 0) return null;

        const priority = String(assignment.priority || "").toLowerCase();
        const weighting = Number(assignment.weighting || assignment.weight || 0);
        let seconds = 45 * 60;
        let type = "light";
        if (daysUntil <= 1 || priority === "high" || weighting >= 30) {
            seconds = daysUntil <= 1 && weighting >= 30 ? 120 * 60 : 90 * 60;
            type = "deep";
        } else if (daysUntil <= 4 || priority === "medium" || weighting >= 15) {
            seconds = 60 * 60;
            type = "standard";
        }

        const dueText = daysUntil === 0
            ? "due today"
            : daysUntil === 1
                ? "due tomorrow"
                : `due in ${daysUntil} days`;
        const urgency = daysUntil <= 1
            ? "You probably should not skip this."
            : daysUntil <= 4
                ? "Good one to clear before it gets loud."
                : "Bank this now and future-you gets breathing room.";

        const suggestion = {
            id: assignment.id,
            title: makeSuggestionTitle(assignment, subjects),
            type,
            durationSeconds: seconds,
            durationMinutes: seconds / 60,
            notes: `${assignment.task} - ${dueText}`,
            dueDate: dueDate.getTime(),
            daysUntil,
            priorityRank: priorityRank(assignment.priority),
            urgency,
            dueText
        };

        return applySuggestionOverride(suggestion);
    }

    function applySuggestionOverride(suggestion) {
        const override = suggestionOverrides[suggestion.id];
        if (!override || typeof override !== "object") return suggestion;
        const normalised = normaliseSessionRecord({ ...suggestion, ...override }, "study_suggestion");
        if (!normalised) return suggestion;
        return {
            ...suggestion,
            ...normalised,
            id: suggestion.id,
            urgency: suggestion.urgency,
            dueText: suggestion.dueText,
            daysUntil: suggestion.daysUntil,
            priorityRank: suggestion.priorityRank
        };
    }

    function getTemplateFromSession(session) {
        if (!session) return null;
        const seconds = getSessionSeconds(session);
        if (!seconds) return null;
        return {
            title: session.title || "Timer",
            type: normaliseType(session.type),
            durationSeconds: seconds,
            durationMinutes: seconds / 60,
            notes: session.notes || "",
            isStandalone: Boolean(session.isStandalone)
        };
    }

    function getSessionTypeClass(type) {
        return typeClasses[normaliseType(type)];
    }

    function setTimerDisplay(value) {
        if (!countdownTimer) return;
        const nextValue = value || "00:00:00";
        if ("value" in countdownTimer) {
            countdownTimer.value = nextValue;
        } else {
            countdownTimer.textContent = nextValue;
        }
        countdownTimer.dataset.lastValidValue = nextValue;
    }

    function resetTimerDisplay() {
        if (!countdownTimer) return;
        countdownTimer.dataset.timerDigits = "";
        setTimerDisplay("00:00:00");
    }

    function getTimerInputValue() {
        if (!countdownTimer) return "";
        return "value" in countdownTimer ? countdownTimer.value : countdownTimer.textContent;
    }

    function renderTimerPreview() {
        if (!countdownTimer || activeSession) return;
        const value = getTimerInputValue();
        if (!value || value === "00:00:00") {
            setTimerDisplay("00:00:00");
            return;
        }
        const parsed = parseDurationInput(value, { maxSeconds: STANDALONE_MAX_SECONDS });
        if (!parsed.error) setTimerDisplay(parsed.display);
    }

    function renderTimer() {
        if (!countdownTimer) return;
        setTimerDisplay(formatTimerInput(activeSession?.remainingSeconds || 0));
    }

    function updateTimerTitle() {
        if (!activeSession) {
            document.title = DEFAULT_PAGE_TITLE;
            return;
        }
        const remaining = Math.max(0, Number(activeSession.remainingSeconds) || 0);
        const clock = formatTimerInput(remaining);
        const shortClock = remaining < 3600 ? clock.slice(3) : clock;
        document.title = `${DEFAULT_PAGE_TITLE} (${shortClock}${activeSession.status === "paused" ? " paused" : ""})`;
    }

    function prepareCompletionSound() {
        if (window.NexaPreferences?.get?.("studyTimerAlerts") !== true || alertAudioContext) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        try {
            alertAudioContext = new AudioContextClass();
            if (alertAudioContext.state === "suspended") alertAudioContext.resume().catch(() => {});
        } catch (error) {
            console.warn("Could not prepare study timer sound:", error);
        }
    }

    function playCompletionSound() {
        if (window.NexaPreferences?.get?.("studyTimerAlerts") !== true || alertAudioContext?.state !== "running") return;
        try {
            const now = alertAudioContext.currentTime;
            [0, 0.28, 0.56].forEach((delay) => {
                const oscillator = alertAudioContext.createOscillator();
                const gain = alertAudioContext.createGain();
                oscillator.type = "sine";
                oscillator.frequency.value = 880;
                gain.gain.setValueAtTime(0, now + delay);
                gain.gain.linearRampToValueAtTime(0.12, now + delay + 0.015);
                gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18);
                oscillator.connect(gain);
                gain.connect(alertAudioContext.destination);
                oscillator.start(now + delay);
                oscillator.stop(now + delay + 0.19);
            });
        } catch (error) {
            console.warn("Could not play study timer sound:", error);
        }
    }

    function updateTimerRing() {
        if (!timerRing) return;
        if (!activeSession) {
            timerRing.classList.add("is-empty");
            timerRing.style.removeProperty("--timer-progress");
            return;
        }

        const total = Math.max(1, Number(activeSession.totalSeconds) || getSessionSeconds(activeSession) || 1);
        const remaining = Math.max(0, Number(activeSession.remainingSeconds) || 0);
        const progress = Math.max(0, Math.min(1, remaining / total));
        timerRing.classList.remove("is-empty");
        timerRing.style.setProperty("--timer-progress", `${progress * 100}%`);
    }

    function setTimerRunning(shouldRun) {
        if (!shouldRun || !activeSession || activeSession.status !== "running") {
            window.clearInterval(timerId);
            timerId = null;
            return;
        }
        if (timerId !== null) return;
        timerId = window.setInterval(tickTimer, 1000);
    }

    function tickTimer() {
        if (!activeSession || activeSession.status !== "running") return;
        activeSession.remainingSeconds = Math.max(0, Math.ceil((activeSession.deadlineAt - Date.now()) / 1000));
        renderTimer();
        updateTimerRing();
        updateTimerTitle();
        if (activeSession.remainingSeconds <= 0) {
            completeActiveSession();
        }
    }

    function reconcileActiveSessionOnLoad() {
        if (!activeSession || activeSession.status !== "running") return;

        if (!activeSession.deadlineAt) {
            const lastTickAt = Number(activeSession.lastTickAt) || Date.now();
            activeSession.deadlineAt = lastTickAt + (activeSession.remainingSeconds * 1000);
        }
        activeSession.remainingSeconds = Math.max(0, Math.ceil((activeSession.deadlineAt - Date.now()) / 1000));

        if (activeSession.remainingSeconds <= 0) {
            completeActiveSession();
        } else {
            saveActiveSession();
        }
    }

    function setCurrentSessionEmpty() {
        window.clearInterval(timerId);
        timerId = null;
        if (currentSubject) currentSubject.textContent = "No active session";
        if (currentDetail) currentDetail.textContent = "Start or add a session to begin.";
        if (currentType) currentType.className = "session-tag tag-deep is-hidden";
        if (pauseBtn) {
            pauseBtn.classList.remove("is-resume");
            pauseBtn.setAttribute("aria-label", "Start timer");
            pauseBtn.setAttribute("title", "Start timer");
        }
        if (pauseIcon) pauseIcon.src = "/client/shared/assets/Icons/play.svg";
        if (repeatBtn) repeatBtn.classList.remove("is-active");
        if (sessionStatus) sessionStatus.classList.add("is-hidden");
        if (sessionState) sessionState.textContent = "";
        if (sessionStatusDot) sessionStatusDot.classList.add("is-idle");
        if (timerRemainingLabel) timerRemainingLabel.classList.add("is-hidden");
        updateTimerTitle();
        updateTimerRing();
        renderTimerPreview();
    }

    function renderCurrentSession() {
        if (!activeSession) {
            setCurrentSessionEmpty();
            return;
        }

        const sessionSeconds = getSessionSeconds(activeSession);
        if (currentSubject) currentSubject.textContent = activeSession.title;
        if (currentDetail) currentDetail.textContent = activeSession.notes || `${formatDurationFromSeconds(sessionSeconds)} session`;
        if (currentType) {
            currentType.textContent = typeLabels[normaliseType(activeSession.type)];
            currentType.className = `session-tag ${getSessionTypeClass(activeSession.type)}`;
            currentType.classList.toggle("is-hidden", Boolean(activeSession.isStandalone));
        }
        if (pauseBtn) {
            const isPaused = activeSession.status === "paused";
            pauseBtn.classList.toggle("is-resume", isPaused);
            pauseBtn.setAttribute("aria-label", isPaused ? "Resume session" : "Pause session");
            pauseBtn.setAttribute("title", isPaused ? "Resume session" : "Pause session");
        }
        if (pauseIcon) {
            pauseIcon.src = activeSession.status === "paused"
                ? "/client/shared/assets/Icons/play.svg"
                : "/client/shared/assets/Icons/pause.svg";
        }
        if (repeatBtn) repeatBtn.classList.toggle("is-active", Boolean(activeSession.isRepeating || activeSession.isLooping));
        if (sessionStatus) sessionStatus.classList.remove("is-hidden");
        if (sessionState) sessionState.textContent = activeSession.status === "paused" ? "Paused" : "In Progress";
        if (sessionStatusDot) sessionStatusDot.classList.remove("is-idle");
        if (timerRemainingLabel) timerRemainingLabel.classList.remove("is-hidden");
        renderTimer();
        updateTimerRing();
        updateTimerTitle();
        setTimerRunning(activeSession.status === "running");
    }

    function renderQueue() {
        if (!queueList) return;
        queueList.innerHTML = "";

        queue.forEach((session, index) => {
            const item = document.createElement("li");
            const sessionSeconds = getSessionSeconds(session);
            item.className = "queue-item";
            item.classList.toggle("is-dragging", session.id === draggedQueueId);
            item.dataset.sessionId = session.id;
            item.dataset.index = String(index);
            item.tabIndex = 0;
            item.setAttribute("role", "button");
            item.setAttribute("aria-label", `Edit ${session.title}`);
            item.innerHTML = `
                <span class="queue-index">${index + 1}</span>
                <div class="queue-copy">
                    <strong></strong>
                    <span></span>
                    <span class="session-tag ${getSessionTypeClass(session.type)}">${typeLabels[normaliseType(session.type)]}</span>
                </div>
                <div class="queue-meta">
                    <span>Queued</span>
                </div>
                <button class="icon-action session-play" type="button" aria-label="Start ${session.title}">
                    <img class="app-icon" src="/client/shared/assets/Icons/play.svg" alt="" aria-hidden="true">
                </button>
                <button class="icon-action session-drag" type="button" aria-label="Move ${session.title}" title="Move session">
                    <img class="app-icon" src="/client/shared/assets/Icons/menu.svg" alt="" aria-hidden="true">
                </button>
            `;

            item.querySelector(".queue-copy strong").textContent = session.title;
            item.querySelector(".queue-copy > span").textContent = `${formatDurationFromSeconds(sessionSeconds)} session`;
            queueList.appendChild(item);
        });

        const queueCount = queue.length;
        if (queueCountPill) queueCountPill.textContent = `${queueCount} ${queueCount === 1 ? "session" : "sessions"}`;
        if (queueEmptyState) {
            queueEmptyState.textContent = copy("study.empty.queue", "No study sessions queued yet.");
            queueEmptyState.hidden = queueCount > 0;
        }
    }

    function renderSuggestions() {
        if (!suggestionList) return;
        const subjects = subjectNameById();
        const suggestions = loadAssignments()
            .map((assignment) => buildSuggestionFromAssignment(assignment, subjects))
            .filter(Boolean)
            .sort((a, b) => {
                if (a.daysUntil !== b.daysUntil) return a.daysUntil - b.daysUntil;
                return b.priorityRank - a.priorityRank;
            })
            .slice(0, 4);
        currentSuggestions = suggestions;

        suggestionList.innerHTML = "";

        if (!suggestions.length) {
            const empty = document.createElement("p");
            empty.className = "study-empty-state";
            empty.textContent = copy("study.empty.suggestions", "No suggested focuses yet.");
            suggestionList.appendChild(empty);
            return;
        }

        suggestions.forEach((suggestion) => {
            const card = document.createElement("article");
            card.className = "suggestion-card";
            card.dataset.suggestionId = suggestion.id;
            card.classList.add(`suggestion-card-${suggestion.type}`);
            card.innerHTML = `
                <div class="suggestion-card-main">
                    <strong></strong>
                    <span>Suggested session:</span>
                    <div class="suggestion-session-meta">
                        <span class="session-tag ${getSessionTypeClass(suggestion.type)}">${typeLabels[suggestion.type]}</span>
                        <b>${formatDurationFromSeconds(suggestion.durationSeconds)}</b>
                    </div>
                    <p></p>
                </div>
                <div class="suggestion-actions">
                    <button class="quiet-action edit-suggestion" type="button">
                        <img class="app-icon" src="/client/shared/assets/Icons/edit.svg" alt="" aria-hidden="true">
                        Edit Suggestion
                    </button>
                    <button class="quiet-action add-suggestion" type="button">
                        <img class="app-icon" src="/client/shared/assets/Icons/add.svg" alt="" aria-hidden="true">
                        Add to Queue
                    </button>
                </div>
            `;
            card.querySelector("strong").textContent = suggestion.title;
            card.querySelector("p").textContent = suggestion.urgency;
            card.querySelector(".edit-suggestion").addEventListener("click", () => {
                openDetailModal("suggestion", suggestion.id);
            });
            card.querySelector(".add-suggestion").addEventListener("click", async () => {
                const saved = await addSessionToQueue({
                    ...getTemplateFromSession(suggestion),
                    id: createId("study_session"),
                    sourceAssignmentId: suggestion.id,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                });
                if (!saved) return;

                showToast(copy("study.toast.suggestionQueued", "Suggested focus added to queue."), "positive");
            });
            suggestionList.appendChild(card);
        });
    }

    function createHistoryCard(session, source) {
        const row = document.createElement("button");
        const sessionSeconds = getSessionSeconds(session);
        row.className = "history-row";
        row.type = "button";
        row.dataset.sessionId = session.id;
        row.dataset.source = source;
        row.innerHTML = `
            <span></span>
            <small></small>
            <b>${source === "favourites" ? "Add to Queue" : "Details"}</b>
        `;
        row.querySelector("span").textContent = session.title;
        row.querySelector("small").textContent = source === "favourites"
            ? `${typeLabels[normaliseType(session.type)]} - ${formatDurationFromSeconds(sessionSeconds)}`
            : `${typeLabels[normaliseType(session.type)]} - ${formatDateTime(session.completedAt)} - ${formatDurationFromSeconds(sessionSeconds)}`;
        return row;
    }

    function renderPanel(panelName, sessions, emptyText) {
        const panel = document.querySelector(`.history-panel[data-panel="${panelName}"]`);
        if (!panel) return;
        panel.innerHTML = "";
        if (!sessions.length) {
            const empty = document.createElement("p");
            empty.className = "study-empty-state";
            empty.textContent = emptyText;
            panel.appendChild(empty);
            return;
        }

        sessions.forEach((session) => {
            panel.appendChild(createHistoryCard(session, panelName));
        });
    }

    function renderHistoryPanels() {
        renderPanel("recent", completedSessions.slice(0, RECENT_LIMIT), copy("study.empty.recent", "No recent study sessions yet."));
        renderPanel("history", completedSessions, copy("study.empty.history", "Your completed sessions will appear here."));
        renderPanel("favourites", favouriteSessions, copy("study.empty.favourites", "No saved sessions yet."));
    }

    function renderStats() {
        const periodSessions = getSessionsForSummaryPeriod();
        const completedCount = periodSessions.length;
        const goal = loadStudyGoal(summaryPeriod);
        const totalFocusSeconds = periodSessions.reduce((total, session) => total + getSessionSeconds(session), 0);
        const totalMinutes = totalFocusSeconds / 60;
        const activeDays = new Set(periodSessions.map((session) => {
            const date = new Date(session.completedAt);
            return summaryPeriod === "month" ? date.getDate() : date.getDay() || 7;
        }));
        const sessionGoalPercent = goal?.targetSessions ? Math.min(100, Math.round((completedCount / goal.targetSessions) * 100)) : 0;
        const focusGoalPercent = goal?.targetFocusSeconds ? Math.min(100, Math.round((totalFocusSeconds / goal.targetFocusSeconds) * 100)) : 0;
        const activeDaysGoalPercent = goal?.activeDays ? Math.min(100, Math.round((activeDays.size / goal.activeDays) * 100)) : 0;
        const goalParts = [
            goal?.targetSessions ? sessionGoalPercent : null,
            goal?.targetFocusSeconds ? focusGoalPercent : null,
            goal?.activeDays ? activeDaysGoalPercent : null
        ].filter((value) => value !== null);
        const goalPercent = goalParts.length
            ? Math.round(goalParts.reduce((total, value) => total + value, 0) / goalParts.length)
            : 0;
        const goalLabel = summaryPeriod === "month" ? "monthly" : "weekly";
        const dayLimit = goal?.activeDays || getPeriodDayLimit();
        const typeTotals = {
            deep: 0,
            standard: 0,
            light: 0,
            custom: 0
        };

        queue.forEach((session) => {
            const type = normaliseType(session.type);
            if (type === "custom") {
                typeTotals.standard += 1;
                return;
            }
            typeTotals[type] += 1;
        });

        const totalTypedSessions = typeTotals.deep + typeTotals.standard + typeTotals.light;
        const deepPercent = totalTypedSessions ? Math.round((typeTotals.deep / totalTypedSessions) * 100) : 0;
        const standardPercent = totalTypedSessions ? Math.round((typeTotals.standard / totalTypedSessions) * 100) : 0;
        const lightPercent = totalTypedSessions ? Math.max(0, 100 - deepPercent - standardPercent) : 0;

        weekSummaryBtn?.classList.toggle("is-active", summaryPeriod === "week");
        weekSummaryBtn?.setAttribute("aria-selected", (summaryPeriod === "week").toString());
        monthSummaryBtn?.classList.toggle("is-active", summaryPeriod === "month");
        monthSummaryBtn?.setAttribute("aria-selected", (summaryPeriod === "month").toString());

        if (sessionsCompletedStat) sessionsCompletedStat.textContent = goal?.targetSessions ? `${completedCount} / ${goal.targetSessions}` : String(completedCount);
        if (sessionsCompletedProgress) sessionsCompletedProgress.style.width = `${sessionGoalPercent}%`;
        if (sessionsCompletedPercent) sessionsCompletedPercent.textContent = goal?.targetSessions ? `${sessionGoalPercent}%` : "Set goal";
        if (goalProgressStat) goalProgressStat.textContent = `${goalPercent}%`;
        if (goalProgressNote) goalProgressNote.textContent = goal ? `of ${goalLabel} goal` : `Set a ${goalLabel} study goal now`;
        if (goalProgressBar) goalProgressBar.style.width = `${goalPercent}%`;
        if (totalFocusTimeStat) {
            totalFocusTimeStat.textContent = goal?.targetFocusSeconds
                ? `${formatDurationFromSeconds(totalFocusSeconds)} / ${formatDurationFromSeconds(goal.targetFocusSeconds)}`
                : formatDurationFromSeconds(totalFocusSeconds);
        }
        if (totalFocusTimeNote) {
            totalFocusTimeNote.textContent = goal?.targetFocusSeconds
                ? `${focusGoalPercent}% of ${goalLabel} focus time goal`
                : totalFocusSeconds
                    ? `Logged this ${summaryPeriod}`
                    : "No study time logged yet";
        }
        if (activeDaysStat) activeDaysStat.textContent = `${activeDays.size} / ${dayLimit}`;
        if (deepFocusPercent) deepFocusPercent.textContent = `${deepPercent}%`;
        if (lightStudyPercent) lightStudyPercent.textContent = `${lightPercent}%`;
        if (standardFocusPercent) standardFocusPercent.textContent = `${standardPercent}%`;
        if (focusBalanceRing) {
            focusBalanceRing.classList.toggle("is-empty", totalTypedSessions === 0);
            focusBalanceRing.style.setProperty("--deep-focus", `${deepPercent}%`);
            focusBalanceRing.style.setProperty("--standard-focus", `${deepPercent + standardPercent}%`);
            focusBalanceRing.setAttribute("aria-label", totalTypedSessions
                ? `Deep work ${deepPercent} percent, standard focus ${standardPercent} percent, light study ${lightPercent} percent`
                : "No focus balance yet");
        }
        if (activeDaysList) {
            activeDaysList.setAttribute("aria-label", `${activeDays.size} active study days this week`);
            activeDaysList.querySelectorAll("i").forEach((dot, index) => {
                dot.classList.toggle("is-rest", !activeDays.has(index + 1));
            });
        }
    }

    function renderWeekPlan() {
        const weekDays = document.querySelectorAll(".week-day");
        if (!weekDays.length) return;

        const today = atNoon(new Date());
        const weekGrid = document.querySelector(".week-grid");
        const note = document.querySelector(".week-note");
        const miniLegend = document.querySelector(".week-heading .mini-legend");
        const isMonthView = summaryPeriod === "month";

        if (weekGrid) {
            weekGrid.hidden = isMonthView;
            weekGrid.classList.toggle("hidden", isMonthView);
        }
        if (monthPlanList) {
            monthPlanList.hidden = !isMonthView;
            monthPlanList.classList.toggle("hidden", !isMonthView);
        }
        if (miniLegend) {
            miniLegend.hidden = isMonthView;
            miniLegend.classList.toggle("hidden", isMonthView);
        }

        if (currentPlanPeriodBtn) {
            currentPlanPeriodBtn.textContent = isMonthView ? "This month" : "This week";
            currentPlanPeriodBtn.setAttribute("aria-label", isMonthView ? "Go to this month" : "Go to this week");
        }
        if (previousWeekBtn) previousWeekBtn.setAttribute("aria-label", isMonthView ? "Previous month" : "Previous week");
        if (nextWeekBtn) nextWeekBtn.setAttribute("aria-label", isMonthView ? "Next month" : "Next week");

        if (isMonthView) {
            renderMonthPlan(today, note);
            return;
        }

        const currentWeekStart = startOfWeekMonday(today);
        const selectedIsCurrentWeek = sameCalendarDay(selectedWeekStart, currentWeekStart);
        const todayIndex = Math.max(0, Math.min(6, (today.getDay() || 7) - 1));

        if (currentDateLabel) currentDateLabel.textContent = formatHeaderDate(today);
        if (weekPlanTitle) weekPlanTitle.textContent = `Week Plan (${formatWeekRange(selectedWeekStart)})`;

        weekDays.forEach((day, index) => {
            const date = addDays(selectedWeekStart, index);
            day.querySelectorAll("p").forEach((entry) => entry.remove());
            day.classList.toggle("is-today", sameCalendarDay(date, today));
            const heading = day.querySelector("strong");
            if (heading) {
                const weekday = new Intl.DateTimeFormat("en-AU", { weekday: "short" }).format(date);
                heading.innerHTML = `${weekday} <span>${date.getDate()}</span>`;
            }
            let list = day.querySelector(".week-session-list");
            if (!list) {
                list = document.createElement("div");
                list.className = "week-session-list";
                day.appendChild(list);
            }
            list.innerHTML = "";
        });

        const queueDay = selectedIsCurrentWeek ? weekDays[todayIndex] : null;
        queue.forEach((session) => {
            if (!queueDay) return;
            const list = queueDay.querySelector(".week-session-list") || queueDay;
            const type = normaliseType(session.type);
            const pill = document.createElement("p");
            pill.className = type === "light" ? "is-light" : type === "standard" ? "is-passive" : type === "custom" ? "is-custom" : "";
            pill.innerHTML = `<span></span><b>${formatDurationFromSeconds(getSessionSeconds(session))}</b>`;
            pill.querySelector("span").textContent = session.title;
            list.appendChild(pill);
        });

        if (note) {
            if (!selectedIsCurrentWeek) {
                note.textContent = "No queued study sessions planned for this week.";
            } else {
                note.textContent = queue.length ? `${queue.length} ${queue.length === 1 ? "session" : "sessions"} planned for today.` : "No study sessions planned so far for this week.";
            }
        }
    }

    function renderMonthPlan(today, note) {
        if (!monthPlanList) return;

        const selectedMonth = selectedMonthStart;
        const selectedIsCurrentMonth = sameCalendarMonth(selectedMonth, startOfMonth(today));
        const monthEnd = atNoon(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0));
        const firstWeekStart = startOfWeekMonday(selectedMonth);
        const buckets = [];

        for (let weekStart = firstWeekStart; weekStart <= monthEnd; weekStart = addDays(weekStart, 7)) {
            const start = atNoon(weekStart);
            const end = addDays(start, 6);
            buckets.push({
                start,
                end,
                sessions: 0,
                seconds: 0,
                typeTotals: {
                    deep: 0,
                    standard: 0,
                    light: 0
                }
            });
        }

        if (currentDateLabel) currentDateLabel.textContent = formatHeaderDate(today);
        if (weekPlanTitle) weekPlanTitle.textContent = `Month Plan (${formatMonthLabel(selectedMonth)})`;

        function addSessionToBucket(session, date) {
            const sessionDate = atNoon(date);
            const bucketIndex = buckets.findIndex((bucket) => sessionDate >= bucket.start && sessionDate <= bucket.end);
            if (bucketIndex < 0) return;
            const bucket = buckets[bucketIndex];
            const type = normaliseType(session.type);
            buckets[bucketIndex].sessions += 1;
            buckets[bucketIndex].seconds += getSessionSeconds(session);
            bucket.typeTotals[type === "custom" ? "standard" : type] += 1;
        }

        completedSessions.forEach((session) => {
            if (!session.completedAt) return;
            addSessionToBucket(session, session.completedAt);
        });

        if (selectedIsCurrentMonth) {
            queue.forEach((session) => {
                addSessionToBucket(session, today);
            });
        }

        monthPlanList.innerHTML = "";
        buckets.forEach((bucket, index) => {
            const card = document.createElement("article");
            card.className = "month-plan-card";
            const sessionLabel = bucket.sessions === 1 ? "session" : "sessions";
            const deepPercent = bucket.sessions ? Math.round((bucket.typeTotals.deep / bucket.sessions) * 100) : 0;
            const standardPercent = bucket.sessions ? Math.round((bucket.typeTotals.standard / bucket.sessions) * 100) : 0;
            const lightPercent = bucket.sessions ? Math.max(0, 100 - deepPercent - standardPercent) : 0;
            card.innerHTML = `
                <div class="month-plan-card-heading">
                    <strong>Week ${index + 1}</strong>
                    <span>${formatMonthWeekRange(bucket.start, bucket.end)}</span>
                </div>
                <div class="month-plan-bar" aria-hidden="true">
                    <i class="is-deep" style="width: ${deepPercent}%;"></i>
                    <i class="is-standard" style="width: ${standardPercent}%;"></i>
                    <i class="is-light" style="width: ${lightPercent}%;"></i>
                </div>
                <div class="month-plan-card-footer">
                    ${bucket.sessions
                        ? `<span>${bucket.sessions} ${sessionLabel}</span><span>${formatDurationFromSeconds(bucket.seconds)}</span>`
                        : `<span>Planned</span><span></span>`}
                </div>
            `;
            monthPlanList.appendChild(card);
        });

        if (note) {
            const totalSessions = buckets.reduce((total, bucket) => total + bucket.sessions, 0);
            const totalSeconds = buckets.reduce((total, bucket) => total + bucket.seconds, 0);
            note.textContent = totalSessions
                ? `Total: ${totalSessions} ${totalSessions === 1 ? "session" : "sessions"} planned this month. ${formatDurationFromSeconds(totalSeconds)} total focus time.`
                : `Set a study goal now to start planning ${formatMonthLabel(selectedMonth)}.`;
        }
    }

    function handleAppDataReset() {
        queue = [];
        completedSessions = [];
        favouriteSessions = [];
        suggestionOverrides = {};
        activeSession = null;
        lastPlayedTemplate = null;
        storage.removeItem(WEEKLY_GOAL_KEY);
        storage.removeItem(MONTHLY_GOAL_KEY);
        resetTimerDisplay();
        renderAll();
    }

    function renderAll() {
        renderQueue();
        renderCurrentSession();
        renderHistoryPanels();
        renderSuggestions();
        renderStats();
        renderWeekPlan();
    }

    function persistQueue() {
        saveList(QUEUE_KEY, queue);
    }

    function persistCompleted() {
        saveList(COMPLETED_KEY, completedSessions);
    }

    function persistFavourites() {
        saveList(FAVOURITES_KEY, favouriteSessions);
    }

    function openModal(modal) {
        addModalBackdrop?.classList.remove("hidden");
        modal?.classList.remove("hidden");
    }

    function closeModals() {
        addModalBackdrop?.classList.add("hidden");
        addModal?.classList.add("hidden");
        detailModal?.classList.add("hidden");
        studyGoalModal?.classList.add("hidden");
        detailContext = null;
        showNotice(addStatusText, "");
        showNotice(detailStatusText, "");
        showNotice(studyGoalStatusText, "");
    }

    function renderDurationPresetsFor(container, typeSelect, durationInput) {
        if (!container || !typeSelect || !durationInput) return;
        const type = normaliseType(typeSelect.value);
        const presets = PRESET_SECONDS[type] || [];
        container.innerHTML = "";

        presets.forEach((seconds) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "duration-preset";
            button.dataset.seconds = String(seconds);
            button.textContent = formatDurationFromSeconds(seconds);
            button.setAttribute("aria-label", `Use ${formatTimerInput(seconds)}`);
            button.classList.toggle("is-active", durationInput.value === formatTimerInput(seconds));
            container.appendChild(button);
        });
    }

    function renderDurationPresets() {
        renderDurationPresetsFor(addDurationPresets, addTypeSelect, addDurationInput);
    }

    function renderDetailDurationPresets() {
        renderDurationPresetsFor(detailDurationPresets, detailTypeSelect, detailDurationInput);
    }

    function setDurationForCategory(typeSelect, durationInput, presetContainer, shouldAutofill = true) {
        if (!typeSelect || !durationInput) return;
        const type = normaliseType(typeSelect.value);
        const presets = PRESET_SECONDS[type] || [];
        if (shouldAutofill) {
            durationInput.value = presets.length ? formatTimerInput(presets[0]) : "";
        }
        renderDurationPresetsFor(presetContainer, typeSelect, durationInput);
    }

    function resetAddModal() {
        if (addTitleInput) addTitleInput.value = "";
        if (addTypeSelect) addTypeSelect.value = "standard";
        if (addNotesInput) addNotesInput.value = "";
        showNotice(addStatusText, "");
        setDurationForCategory(addTypeSelect, addDurationInput, addDurationPresets, true);
    }

    function setSummaryPeriod(nextPeriod, options = {}) {
        summaryPeriod = nextPeriod === "month" ? "month" : "week";
        if (options.resetToCurrent !== false) {
            selectedWeekStart = startOfWeekMonday(new Date());
            selectedMonthStart = startOfMonth(new Date());
        }
        renderStats();
        renderWeekPlan();
    }

    function formatGoalTimeInput(seconds) {
        const totalSeconds = Math.max(0, Math.round(Number(seconds) || 0));
        if (!totalSeconds) return "";
        if (totalSeconds % 3600 === 0) return `${totalSeconds / 3600}h`;
        return formatTimerInput(totalSeconds);
    }

    function getActiveDaysLimit(period = summaryPeriod) {
        if (period !== "month") return 7;
        return new Date(selectedMonthStart.getFullYear(), selectedMonthStart.getMonth() + 1, 0).getDate();
    }

    function openStudyGoalModal() {
        const goal = loadStudyGoal(summaryPeriod);
        const isMonthly = summaryPeriod === "month";
        const activeDaysLimit = getActiveDaysLimit(summaryPeriod);
        if (studyGoalTitle) studyGoalTitle.textContent = isMonthly ? "SET MONTHLY STUDY GOAL" : "SET WEEKLY STUDY GOAL";
        if (goalTargetSessionsInput) goalTargetSessionsInput.value = goal?.targetSessions || (isMonthly ? 32 : 8);
        if (goalTargetTimeInput) goalTargetTimeInput.value = goal?.targetFocusSeconds ? formatGoalTimeInput(goal.targetFocusSeconds) : (isMonthly ? "40h" : "10h");
        if (goalActiveDaysInput) {
            goalActiveDaysInput.max = String(activeDaysLimit);
            goalActiveDaysInput.value = Math.min(goal?.activeDays || (isMonthly ? 16 : 4), activeDaysLimit);
        }
        if (goalDeepWorkInput) goalDeepWorkInput.value = goal?.focusBalance?.deep || 50;
        if (goalStandardFocusInput) goalStandardFocusInput.value = goal?.focusBalance?.standard || 30;
        if (goalLightStudyInput) goalLightStudyInput.value = goal?.focusBalance?.light || 20;
        showNotice(studyGoalStatusText, "");
        openModal(studyGoalModal);
        goalTargetSessionsInput?.focus();
    }

    function readPositiveInteger(input, label, options = {}) {
        const value = Number.parseInt(input?.value, 10);
        if (!Number.isFinite(value) || value <= 0) {
            return { error: `${label} must be a positive whole number.` };
        }
        if (options.max && value > options.max) {
            return { error: `${label} cannot be more than ${options.max}.` };
        }
        return { value };
    }

    function readPercent(input, label) {
        const value = Number.parseInt(input?.value, 10);
        if (!Number.isFinite(value) || value < 0 || value > 100) {
            return { error: `${label} must be between 0 and 100.` };
        }
        return { value };
    }

    async function saveStudyGoalFromModal() {
        const targetSessions = readPositiveInteger(goalTargetSessionsInput, "Target sessions");
        if (targetSessions.error) {
            showNotice(studyGoalStatusText, targetSessions.error, "negative");
            return;
        }

        const focusTime = parseGoalFocusTime(goalTargetTimeInput?.value || "");
        if (focusTime.error) {
            showNotice(studyGoalStatusText, focusTime.error, "negative");
            return;
        }
        if (goalTargetTimeInput) goalTargetTimeInput.value = formatGoalTimeInput(focusTime.seconds);

        const activeDaysLimit = getActiveDaysLimit(summaryPeriod);
        const activeDays = readPositiveInteger(goalActiveDaysInput, "Active days", { max: activeDaysLimit });
        if (activeDays.error) {
            showNotice(studyGoalStatusText, activeDays.error, "negative");
            return;
        }

        const deep = readPercent(goalDeepWorkInput, "Deep Work");
        const standard = readPercent(goalStandardFocusInput, "Standard Focus");
        const light = readPercent(goalLightStudyInput, "Light Study");
        const percentError = deep.error || standard.error || light.error;
        if (percentError) {
            showNotice(studyGoalStatusText, percentError, "negative");
            return;
        }

        const percentTotal = deep.value + standard.value + light.value;
        if (percentTotal !== 100) {
            showNotice(studyGoalStatusText, "Focus balance must total 100%.", "negative");
            return;
        }

        saveStudyGoal(summaryPeriod, {
            targetSessions: targetSessions.value,
            targetFocusSeconds: focusTime.seconds,
            activeDays: activeDays.value,
            focusBalance: {
                deep: deep.value,
                standard: standard.value,
                light: light.value
            },
            updatedAt: Date.now()
        });
        if (!(await confirmStudySaved("Could not save study goal right now.", studyGoalStatusText))) return;

        closeModals();
        renderStats();
        showToast(
            summaryPeriod === "month"
                ? copy("study.toast.monthlyGoalSaved", "Monthly study goal saved.")
                : copy("study.toast.weeklyGoalSaved", "Weekly study goal saved."),
            "positive"
        );
    }

    function openAddSessionModal() {
        resetAddModal();
        openModal(addModal);
        addTitleInput?.focus();
    }

    function getAddSessionPayload() {
        const title = (addTitleInput?.value || "").trim();
        const parsed = parseDurationInput(addDurationInput?.value || "");

        if (!title) {
            return { error: "Session title is required." };
        }

        if (parsed.error) {
            return { error: parsed.error };
        }

        const selectedType = normaliseType(addTypeSelect?.value);
        const type = selectedType === "custom" ? "custom" : selectedType || inferTypeFromSeconds(parsed.seconds);

        return {
            session: {
                id: createId("study_session"),
                title,
                type,
                durationSeconds: parsed.seconds,
                durationMinutes: parsed.minutes,
                notes: (addNotesInput?.value || "").trim().slice(0, 500),
                createdAt: Date.now(),
                updatedAt: Date.now()
            }
        };
    }

    async function addSessionToQueue(session) {
        queue.push(session);
        persistQueue();
        if (!(await confirmStudySaved("Could not save queued session right now."))) return false;

        renderAll();
        return true;
    }

    function persistSuggestionOverrides() {
        saveObject(SUGGESTION_OVERRIDES_KEY, suggestionOverrides);
    }

    function openDetailModal(source, id) {
        const session = getSessionBySource(source, id);
        if (!session) return;
        const isCompletedRecord = source === "completed" || source === "recent" || source === "history";
        const isSuggestion = source === "suggestion";
        detailContext = { source, id };
        if (detailModalTitle) detailModalTitle.textContent = isCompletedRecord ? "SESSION DETAILS" : "EDIT SESSION";
        if (detailTitleInput) detailTitleInput.value = session.title || "";
        if (detailTypeSelect) detailTypeSelect.value = normaliseType(session.type);
        if (detailDurationInput) detailDurationInput.value = formatTimerInput(getSessionSeconds(session));
        renderDetailDurationPresets();
        if (detailNotesInput) detailNotesInput.value = session.notes || "";
        [detailTitleInput, detailTypeSelect, detailDurationInput, detailNotesInput].forEach((field) => {
            if (!field) return;
            field.disabled = isCompletedRecord;
            if ("readOnly" in field) field.readOnly = isCompletedRecord;
        });
        if (saveDetailBtn) saveDetailBtn.classList.toggle("hidden", isCompletedRecord);
        if (deleteDetailBtn) deleteDetailBtn.classList.toggle("hidden", isCompletedRecord || isSuggestion);
        if (favouriteDetailBtn) {
            favouriteDetailBtn.classList.toggle("hidden", isSuggestion);
            favouriteDetailBtn.querySelector(".ui-btn-label").textContent = isFavourite(session) ? "Unfavourite" : "Favourite";
        }
        showNotice(detailStatusText, "");
        openModal(detailModal);
        if (isCompletedRecord) {
            closeDetailModalBtn?.focus();
        } else {
            detailTitleInput?.focus();
        }
    }

    function getSessionBySource(source, id) {
        if (source === "queue") return queue.find((session) => session.id === id);
        if (source === "recent" || source === "history" || source === "completed") return completedSessions.find((session) => session.id === id);
        if (source === "favourites") return favouriteSessions.find((session) => session.id === id);
        if (source === "suggestion") return currentSuggestions.find((session) => session.id === id);
        return null;
    }

    function sameSessionTemplate(first, second) {
        return first.title === second.title &&
            getSessionSeconds(first) === getSessionSeconds(second) &&
            normaliseType(first.type) === normaliseType(second.type);
    }

    function isFavourite(session) {
        return favouriteSessions.some((item) => sameSessionTemplate(item, session));
    }

    function updateSessionByContext(updated) {
        if (!detailContext) return;
        const { source, id } = detailContext;
        if (source === "recent" || source === "history" || source === "completed") return;
        if (source === "suggestion") {
            suggestionOverrides[id] = {
                ...suggestionOverrides[id],
                title: updated.title,
                type: updated.type,
                durationSeconds: updated.durationSeconds,
                durationMinutes: updated.durationMinutes,
                notes: updated.notes,
                updatedAt: Date.now()
            };
            persistSuggestionOverrides();
            return;
        }
        const list = source === "queue" ? queue : source === "favourites" ? favouriteSessions : completedSessions;
        const index = list.findIndex((session) => session.id === id);
        if (index === -1) return;
        list[index] = { ...list[index], ...updated, updatedAt: Date.now() };
        if (source === "queue") persistQueue();
        if (source === "favourites") persistFavourites();
        if (source === "recent" || source === "history" || source === "completed") persistCompleted();
    }

    async function saveDetailEdits() {
        if (detailContext && (detailContext.source === "recent" || detailContext.source === "history" || detailContext.source === "completed")) {
            showNotice(detailStatusText, "Completed sessions are read-only.", "neutral");
            return;
        }
        const title = (detailTitleInput?.value || "").trim();
        const parsed = parseDurationInput(detailDurationInput?.value || "");
        if (!title) {
            showNotice(detailStatusText, "Session title is required.", "negative");
            return;
        }
        if (parsed.error) {
            showNotice(detailStatusText, parsed.error, "negative");
            return;
        }

        const source = detailContext?.source;
        updateSessionByContext({
            title,
            durationSeconds: parsed.seconds,
            durationMinutes: parsed.minutes,
            type: normaliseType(detailTypeSelect?.value),
            notes: (detailNotesInput?.value || "").trim().slice(0, 500)
        });
        if (!(await confirmStudySaved("Could not save session changes right now.", detailStatusText))) return;

        closeModals();
        renderAll();
        showToast(
            source === "suggestion"
                ? copy("study.toast.suggestionUpdated", "Suggestion updated.")
                : copy("study.toast.sessionUpdated", "Session updated."),
            "positive"
        );
    }

    async function deleteDetailSession() {
        if (!detailContext) return;
        const { source, id } = detailContext;
        if (source === "queue") {
            queue = queue.filter((session) => session.id !== id);
            persistQueue();
        } else if (source === "favourites") {
            favouriteSessions = favouriteSessions.filter((session) => session.id !== id);
            persistFavourites();
        }
        if (!(await confirmStudySaved("Could not delete session right now.", detailStatusText))) return;

        closeModals();
        renderAll();
        showToast(copy("study.toast.sessionDeleted", "Session deleted."), "neutral");
    }

    async function toggleFavouriteFromDetail() {
        if (!detailContext) return;
        const session = getSessionBySource(detailContext.source, detailContext.id);
        if (!session) return;
        let toastMessage = "";
        let toastTone = "neutral";

        if (isFavourite(session)) {
            favouriteSessions = favouriteSessions.filter((item) => !sameSessionTemplate(item, session));
            toastMessage = copy("study.toast.favouriteRemoved", "Removed from favourites.");
        } else {
            const template = getTemplateFromSession(session);
            favouriteSessions.unshift({
                ...template,
                id: createId("study_favourite"),
                sourceSessionId: session.id,
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
            toastMessage = copy("study.toast.favouriteAdded", "Added to favourites.");
            toastTone = "positive";
        }

        persistFavourites();
        if (!(await confirmStudySaved("Could not update favourites right now.", detailStatusText))) return;

        closeModals();
        renderAll();
        showToast(toastMessage, toastTone);
    }

    function startSessionFromTemplate(template, options = {}) {
        const seconds = getSessionSeconds(template);
        if (!template || !seconds) return;
        const shouldRepeat = options.keepRepeat ? Boolean(activeSession?.isRepeating || activeSession?.isLooping) : Boolean(options.repeat);
        const startedAt = Date.now();
        activeSession = {
            id: createId("study_run"),
            title: template.title || "Timer",
            type: normaliseType(template.type),
            durationSeconds: seconds,
            durationMinutes: seconds / 60,
            notes: template.notes || "",
            totalSeconds: seconds,
            remainingSeconds: seconds,
            status: "running",
            isRepeating: shouldRepeat,
            isStandalone: Boolean(template.isStandalone),
            startedAt,
            lastTickAt: startedAt,
            deadlineAt: startedAt + (seconds * 1000)
        };
        lastPlayedTemplate = getTemplateFromSession(activeSession);
        saveActiveSession();
        renderAll();
    }

    function startQueueAt(index) {
        if (!queue[index]) {
            showToast(copy("study.toast.queueEmpty", "No queued session to start."), "neutral");
            return;
        }
        const [session] = queue.splice(index, 1);
        if (index > 0) queue.splice(0, index);
        persistQueue();
        startSessionFromTemplate(session, { keepRepeat: true });
    }

    async function requestStartQueueAt(index) {
        if (activeSession && !(await abandonActiveSession())) return;
        startQueueAt(index);
    }

    async function startNextQueuedSession() {
        await requestStartQueueAt(0);
    }

    async function confirmAbandonActive() {
        if (!activeSession) return true;
        return confirmAction({
            title: "Abandon session?",
            message: "This session will stop now and will not be added to your completed sessions.",
            cancelLabel: "Keep Studying",
            confirmLabel: "Abandon Session",
            tone: "negative"
        });
    }

    async function abandonActiveSession() {
        const confirmed = await confirmAbandonActive();
        if (!confirmed) return false;
        activeSession = null;
        saveActiveSession();
        resetTimerDisplay();
        renderAll();
        return true;
    }

    async function completeActiveSession() {
        if (!activeSession) return;
        const template = getTemplateFromSession(activeSession);
        const shouldRepeat = Boolean(activeSession.isRepeating || activeSession.isLooping);
        const completed = {
            ...template,
            id: createId("study_completed"),
            runId: activeSession.id,
            startedAt: activeSession.startedAt,
            completedAt: activeSession.deadlineAt || Date.now(),
            createdAt: Date.now()
        };
        completedSessions.unshift(completed);
        persistCompleted();
        lastPlayedTemplate = template;
        activeSession = null;
        saveActiveSession();

        if (shouldRepeat) {
            startSessionFromTemplate(template, { repeat: true });
        } else {
            renderAll();
        }
        const timerAlertsOn = window.NexaPreferences?.get?.("studyTimerAlerts") === true;
        if (timerAlertsOn) {
            playCompletionSound();
            window.NexaPreferences?.notifyStudyTimerComplete?.(
                copy("study.notification.completeTitle", "Study session complete"),
                copy("study.notification.completeBody", "Your study timer has finished.")
            );
        }
        if (!(await confirmStudySaved("Could not save completed session right now."))) return;
        showToast(
            timerAlertsOn
                ? copy("study.toast.timerAlert", "Study timer finished. Session saved to history.")
                : copy("study.toast.sessionCompleted", "Session completed."),
            "positive"
        );
    }

    async function previousSession() {
        const template = activeSession ? getTemplateFromSession(activeSession) : lastPlayedTemplate;
        if (!template) {
            showToast(copy("study.toast.previousEmpty", "No previous session yet."), "neutral");
            return;
        }
        if (activeSession && !(await abandonActiveSession())) return;
        startSessionFromTemplate(template);
    }

    async function nextSession() {
        if (!queue.length) {
            showToast(copy("study.toast.nextEmpty", "No next session in the queue."), "neutral");
            return;
        }
        if (activeSession && !(await abandonActiveSession())) return;
        startQueueAt(0);
    }

    function togglePause() {
        if (!activeSession) return;
        if (activeSession.status === "running") {
            tickTimer();
            if (!activeSession) return;
            activeSession.status = "paused";
            activeSession.deadlineAt = null;
        } else {
            activeSession.status = "running";
            activeSession.deadlineAt = Date.now() + (activeSession.remainingSeconds * 1000);
        }
        activeSession.lastTickAt = Date.now();
        saveActiveSession();
        renderAll();
    }

    function toggleRepeat() {
        if (!activeSession) {
            showToast(copy("study.toast.repeatNeedsSession", "Start a session before turning repeat on."), "neutral");
            return;
        }
        activeSession.isRepeating = !(activeSession.isRepeating || activeSession.isLooping);
        delete activeSession.isLooping;
        saveActiveSession();
        renderAll();
    }

    async function clearQueue() {
        if (!queue.length && !activeSession) {
            showToast(copy("study.toast.queueAlreadyClear", "Queue is already clear."), "neutral");
            return;
        }

        const confirmed = await confirmAction({
            title: "Clear queue?",
            message: "This will remove every queued session and abandon the current session if one is running.",
            cancelLabel: "Cancel",
            confirmLabel: "Clear Queue",
            tone: "negative"
        });
        if (!confirmed) return;

        queue = [];
        activeSession = null;
        persistQueue();
        saveActiveSession();
        if (!(await confirmStudySaved("Could not clear queue right now."))) return;

        resetTimerDisplay();
        renderAll();
        showToast(copy("study.toast.queueCleared", "Queue cleared."), "neutral");
    }

    function resetTimer() {
        if (activeSession) {
            activeSession = null;
            saveActiveSession();
        }
        resetTimerDisplay();
        renderAll();
    }

    function moveQueuedSession(draggedId, targetId) {
        if (!draggedId || !targetId || draggedId === targetId) return false;
        const fromIndex = queue.findIndex((session) => session.id === draggedId);
        const toIndex = queue.findIndex((session) => session.id === targetId);
        if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return false;
        const [moved] = queue.splice(fromIndex, 1);
        queue.splice(toIndex, 0, moved);
        persistQueue();
        renderQueue();
        renderWeekPlan();
        return true;
    }

    function clearQueueDragState() {
        draggedQueueId = null;
        document.body.classList.remove("is-dragging-study-session");
        queueList?.querySelectorAll(".is-dragging, .is-drop-target").forEach((item) => {
            item.classList.remove("is-dragging", "is-drop-target");
        });
    }

    function handleQueueDragMove(event) {
        if (!draggedQueueId || !queueList) return;
        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".queue-item");
        queueList.querySelectorAll(".is-drop-target").forEach((item) => item.classList.remove("is-drop-target"));
        if (!target || !queueList.contains(target) || target.dataset.sessionId === draggedQueueId) return;
        target.classList.add("is-drop-target");
        moveQueuedSession(draggedQueueId, target.dataset.sessionId);
    }

    function handleQueueDragEnd() {
        document.removeEventListener("pointermove", handleQueueDragMove);
        document.removeEventListener("pointerup", handleQueueDragEnd);
        document.removeEventListener("pointercancel", handleQueueDragEnd);
        clearQueueDragState();
        renderQueue();
    }

    function startQueueDrag(event) {
        const handle = event.target.closest(".session-drag");
        const item = event.target.closest(".queue-item");
        if (!handle || !item) return;
        event.preventDefault();
        draggedQueueId = item.dataset.sessionId;
        document.body.classList.add("is-dragging-study-session");
        item.classList.add("is-dragging");
        handle.setPointerCapture?.(event.pointerId);
        document.addEventListener("pointermove", handleQueueDragMove);
        document.addEventListener("pointerup", handleQueueDragEnd);
        document.addEventListener("pointercancel", handleQueueDragEnd);
    }

    async function startStandaloneTimer() {
        const parsed = parseDurationInput(getTimerInputValue(), {
            maxSeconds: STANDALONE_MAX_SECONDS,
            requiredMessage: "Enter a timer duration first."
        });
        if (parsed.error) {
            showToast(parsed.error, "negative");
            return;
        }

        setTimerDisplay(parsed.display);
        if (activeSession && !(await abandonActiveSession())) return;
        startSessionFromTemplate({
            title: "Timer",
            type: "custom",
            durationSeconds: parsed.seconds,
            durationMinutes: parsed.minutes,
            notes: "",
            isStandalone: true
        });
    }

    function normaliseDurationField(input, options = {}) {
        if (!input) return;
        const parsed = parseDurationInput(input.value, options);
        if (!parsed.error) {
            input.value = parsed.display;
            input.dataset.lastValidValue = parsed.display;
        } else if (input === countdownTimer) {
            input.value = input.dataset.lastValidValue || "00:00:00";
        }
        if (input === addDurationInput) renderDurationPresets();
    }

    function handleDurationKeydown(event) {
        if (event.metaKey || event.ctrlKey || event.altKey) return;
        if (durationControlKeys.has(event.key)) return;
        if (/^[0-9:]$/.test(event.key)) return;
        event.preventDefault();
    }

    function handleDurationPaste(event) {
        const text = event.clipboardData?.getData("text") || "";
        if (!text || /[^0-9:]/.test(text)) event.preventDefault();
    }

    function setCountdownFromDigits(digits) {
        const cleanDigits = String(digits || "").replace(/\D/g, "").slice(-6);
        countdownTimer.dataset.timerDigits = cleanDigits;

        if (!cleanDigits) {
            setTimerDisplay("00:00:00");
            return;
        }

        const padded = cleanDigits.padStart(6, "0");
        const hours = Number(padded.slice(0, -4));
        const minutes = Number(padded.slice(-4, -2));
        const seconds = Number(padded.slice(-2));
        setTimerDisplay(formatTimerInput((hours * 3600) + (minutes * 60) + seconds));
    }

    function handleCountdownKeydown(event) {
        if (activeSession) {
            if (event.key.length === 1 || event.key === "Backspace" || event.key === "Delete") event.preventDefault();
            return;
        }

        if (event.metaKey || event.ctrlKey || event.altKey) return;
        if (event.key === "Enter") {
            event.preventDefault();
            startStandaloneTimer();
            return;
        }
        if (event.key === "Tab" || event.key === "Escape") return;

        if (/^\d$/.test(event.key)) {
            event.preventDefault();
            const isReplacingAll = countdownTimer.selectionStart === 0 && countdownTimer.selectionEnd === countdownTimer.value.length;
            const currentDigits = isReplacingAll ? "" : countdownTimer.dataset.timerDigits || "";
            setCountdownFromDigits(`${currentDigits}${event.key}`);
            countdownTimer.setSelectionRange(countdownTimer.value.length, countdownTimer.value.length);
            return;
        }

        if (event.key === "Backspace" || event.key === "Delete") {
            event.preventDefault();
            const digits = countdownTimer.dataset.timerDigits || "";
            setCountdownFromDigits(digits.slice(0, -1));
            countdownTimer.setSelectionRange(countdownTimer.value.length, countdownTimer.value.length);
            return;
        }

        if (event.key === ":") return;
        if (durationControlKeys.has(event.key)) return;
        event.preventDefault();
    }

    function handleCountdownInput() {
        if (!countdownTimer || activeSession) return;
        const cleaned = cleanDurationInputValue(countdownTimer.value);
        if (countdownTimer.value !== cleaned) countdownTimer.value = cleaned;
        const parsed = parseDurationInput(cleaned, { maxSeconds: STANDALONE_MAX_SECONDS });
        if (!parsed.error) {
            countdownTimer.dataset.lastValidValue = parsed.display;
        }
    }

    function handleCountdownPaste(event) {
        const text = event.clipboardData?.getData("text") || "";
        if (!text || /[^0-9:]/.test(text)) {
            event.preventDefault();
            return;
        }

        event.preventDefault();
        const parsed = parseDurationInput(text, { maxSeconds: STANDALONE_MAX_SECONDS });
        if (parsed.error) return;
        setTimerDisplay(parsed.display);
        countdownTimer.dataset.timerDigits = text.replace(/\D/g, "").slice(-6);
    }

    addTypeSelect?.addEventListener("change", () => {
        setDurationForCategory(addTypeSelect, addDurationInput, addDurationPresets, true);
    });

    detailTypeSelect?.addEventListener("change", () => {
        setDurationForCategory(detailTypeSelect, detailDurationInput, detailDurationPresets, true);
    });

    addDurationPresets?.addEventListener("click", (event) => {
        const preset = event.target.closest(".duration-preset");
        if (!preset || !addDurationInput) return;
        addDurationInput.value = formatTimerInput(Number(preset.dataset.seconds) || 0);
        renderDurationPresets();
    });

    detailDurationPresets?.addEventListener("click", (event) => {
        const preset = event.target.closest(".duration-preset");
        if (!preset || !detailDurationInput) return;
        detailDurationInput.value = formatTimerInput(Number(preset.dataset.seconds) || 0);
        renderDetailDurationPresets();
    });

    [addDurationInput, detailDurationInput].forEach((input) => {
        input?.addEventListener("keydown", handleDurationKeydown);
        input?.addEventListener("paste", handleDurationPaste);
        input?.addEventListener("input", () => {
            input.value = cleanDurationInputValue(input.value);
            if (input === addDurationInput) renderDurationPresets();
            if (input === detailDurationInput) renderDetailDurationPresets();
        });
        input?.addEventListener("blur", () => {
            normaliseDurationField(input);
            if (input === detailDurationInput) renderDetailDurationPresets();
        });
    });

    countdownTimer?.addEventListener("focus", () => {
        if (activeSession) return;
        countdownTimer.dataset.timerDigits = "";
        countdownTimer.select();
    });
    countdownTimer?.addEventListener("keydown", handleCountdownKeydown);
    countdownTimer?.addEventListener("input", handleCountdownInput);
    countdownTimer?.addEventListener("paste", handleCountdownPaste);
    countdownTimer?.addEventListener("blur", () => {
        normaliseDurationField(countdownTimer, { maxSeconds: STANDALONE_MAX_SECONDS });
    });

    addSessionBtn?.addEventListener("click", openAddSessionModal);
    closeAddModalBtn?.addEventListener("click", closeModals);
    cancelAddModalBtn?.addEventListener("click", closeModals);
    closeDetailModalBtn?.addEventListener("click", closeModals);
    cancelDetailModalBtn?.addEventListener("click", closeModals);
    addModalBackdrop?.addEventListener("click", closeModals);

    confirmAddModalBtn?.addEventListener("click", async () => {
        const result = getAddSessionPayload();
        if (result.error) {
            showNotice(addStatusText, result.error, "negative");
            return;
        }
        if (addDurationInput) addDurationInput.value = formatTimerInput(result.session.durationSeconds);
        if (!(await addSessionToQueue(result.session))) return;

        closeModals();
        showToast(copy("study.toast.sessionQueued", "Session added to queue."), "positive");
    });

    saveDetailBtn?.addEventListener("click", () => {
        saveDetailEdits().catch((error) => {
            console.error("Failed to save study session:", error);
            showNotice(detailStatusText, "Could not save session changes right now.", "negative");
        });
    });
    deleteDetailBtn?.addEventListener("click", () => {
        deleteDetailSession().catch((error) => {
            console.error("Failed to delete study session:", error);
            showNotice(detailStatusText, "Could not delete session right now.", "negative");
        });
    });
    favouriteDetailBtn?.addEventListener("click", () => {
        toggleFavouriteFromDetail().catch((error) => {
            console.error("Failed to update favourites:", error);
            showNotice(detailStatusText, "Could not update favourites right now.", "negative");
        });
    });

    queueList?.addEventListener("click", (event) => {
        const item = event.target.closest(".queue-item");
        if (!item) return;
        const index = Number(item.dataset.index);
        if (event.target.closest(".session-play")) {
            if (Number.isInteger(index)) requestStartQueueAt(index);
            return;
        }
        if (event.target.closest(".session-drag")) return;
        openDetailModal("queue", item.dataset.sessionId);
    });

    queueList?.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const item = event.target.closest(".queue-item");
        if (!item) return;
        event.preventDefault();
        openDetailModal("queue", item.dataset.sessionId);
    });

    queueList?.addEventListener("pointerdown", startQueueDrag);

    document.querySelector(".session-history")?.addEventListener("click", (event) => {
        const row = event.target.closest(".history-row");
        if (!row) return;
        const source = row.dataset.source;
        const id = row.dataset.sessionId;
        if (source === "favourites" && event.target.closest("b")) {
            const favourite = favouriteSessions.find((session) => session.id === id);
            if (favourite) {
                addSessionToQueue({
                    ...getTemplateFromSession(favourite),
                    id: createId("study_session"),
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                }).then((saved) => {
                    if (saved) {
                        showToast(copy("study.toast.favouriteQueued", "Favourite added to queue."), "positive");
                    }
                }).catch((error) => {
                    console.error("Failed to queue favourite:", error);
                    showToast("Could not save queued session right now.", "negative");
                });
            }
            return;
        }
        openDetailModal(source, id);
    });

    playNextBtn?.addEventListener("click", startNextQueuedSession);
    clearQueueBtn?.addEventListener("click", clearQueue);
    previousBtn?.addEventListener("click", previousSession);
    pauseBtn?.addEventListener("click", () => {
        if (!activeSession) {
            startStandaloneTimer();
            return;
        }
        togglePause();
    });
    nextBtn?.addEventListener("click", nextSession);
    repeatBtn?.addEventListener("click", toggleRepeat);
    stopBtn?.addEventListener("click", abandonActiveSession);
    resetTimerBtn?.addEventListener("click", resetTimer);
    previousWeekBtn?.addEventListener("click", () => {
        if (summaryPeriod === "month") {
            selectedMonthStart = addMonths(selectedMonthStart, -1);
        } else {
            selectedWeekStart = addDays(selectedWeekStart, -7);
        }
        renderWeekPlan();
    });
    nextWeekBtn?.addEventListener("click", () => {
        if (summaryPeriod === "month") {
            selectedMonthStart = addMonths(selectedMonthStart, 1);
        } else {
            selectedWeekStart = addDays(selectedWeekStart, 7);
        }
        renderWeekPlan();
    });
    currentPlanPeriodBtn?.addEventListener("click", () => {
        selectedWeekStart = startOfWeekMonday(new Date());
        selectedMonthStart = startOfMonth(new Date());
        renderWeekPlan();
    });
    weekSummaryBtn?.addEventListener("click", () => setSummaryPeriod("week"));
    monthSummaryBtn?.addEventListener("click", () => setSummaryPeriod("month"));
    setStudyGoalBtn?.addEventListener("click", openStudyGoalModal);
    closeStudyGoalBtn?.addEventListener("click", closeModals);
    cancelStudyGoalBtn?.addEventListener("click", closeModals);
    saveStudyGoalBtn?.addEventListener("click", () => {
        saveStudyGoalFromModal().catch((error) => {
            console.error("Failed to save study goal:", error);
            showNotice(studyGoalStatusText, "Could not save study goal right now.", "negative");
        });
    });
    goalTargetTimeInput?.addEventListener("blur", () => {
        const parsed = parseGoalFocusTime(goalTargetTimeInput.value);
        if (!parsed.error) {
            goalTargetTimeInput.value = formatGoalTimeInput(parsed.seconds);
        }
    });
    goalActiveDaysInput?.addEventListener("input", () => {
        const max = getActiveDaysLimit(summaryPeriod);
        const value = Number.parseInt(goalActiveDaysInput.value, 10);
        if (Number.isFinite(value) && value > max) {
            goalActiveDaysInput.value = String(max);
        }
    });

    document.querySelectorAll(".study-tabs button").forEach((tab) => {
        tab.addEventListener("click", () => {
            const target = tab.dataset.tab;

            document.querySelectorAll(".study-tabs button").forEach((item) => {
                item.classList.toggle("is-active", item === tab);
            });

            document.querySelectorAll(".history-panel").forEach((panel) => {
                panel.classList.toggle("is-active", panel.dataset.panel === target);
            });
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && (!addModal?.classList.contains("hidden") || !detailModal?.classList.contains("hidden"))) {
            closeModals();
        }
    });

    window.addEventListener("nexa:app-data-reset", handleAppDataReset);
    document.addEventListener("click", prepareCompletionSound);
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) tickTimer();
    });
    window.addEventListener("focus", tickTimer);
    window.addEventListener("pageshow", tickTimer);
    window.NexaPreferences?.onChange?.((prefs, changedKey) => {
        if (changedKey === "appTone") {
            renderAll();
        }
    });

    window.addEventListener("storage", (event) => {
        if (event.key === ASSIGNMENTS_KEY || event.key === SUBJECTS_KEY) renderSuggestions();
    });

    hydrateState();
    setDurationForCategory(addTypeSelect, addDurationInput, addDurationPresets, true);
    reconcileActiveSessionOnLoad();
    renderAll();
});
