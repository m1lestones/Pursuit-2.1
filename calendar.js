(() => {
    const TEST_MODE = new URLSearchParams(window.location.search).has('test');

    const CURRICULUM_STORAGE_KEY = `pursuit:curriculum:v1${TEST_MODE ? ':test' : ''}`;
    const SELECTED_DAY_STORAGE_KEY = `pursuit:selectedDay:v1${TEST_MODE ? ':test' : ''}`;
    const THEME_STORAGE_KEY = `pursuit:theme:v1`;
    const CALENDAR_VIEW_KEY = `pursuit:calendarView:v1${TEST_MODE ? ':test' : ''}`;

    const WEEK_START = 6; // Saturday (0=Sun ... 6=Sat)
    const DOW_ORDER = [6, 0, 1, 2, 3, 4, 5];

    function pad2(n) {
        return String(n).padStart(2, '0');
    }

    function dateId(d) {
        return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    }

    function monthKey(d) {
        return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
    }

    function loadJson(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch {
            return fallback;
        }
    }

    function setStoredTheme(theme) {
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch {
            // ignore
        }
    }

    function systemPrefersDark() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    function getStoredTheme() {
        try {
            const t = localStorage.getItem(THEME_STORAGE_KEY);
            return t === 'dark' || t === 'light' ? t : null;
        } catch {
            return null;
        }
    }

    function applyTheme(theme) {
        const root = document.documentElement;
        root.dataset.theme = theme;

        const btn = document.querySelector('[data-theme-toggle]');
        if (!btn) return;

        const isDark = theme === 'dark';
        btn.setAttribute('aria-pressed', String(isDark));
        const icon = btn.querySelector('[data-theme-icon]');
        const text = btn.querySelector('[data-theme-text]');
        if (icon) icon.textContent = isDark ? '☀️' : '🌙';
        if (text) text.textContent = isDark ? 'Day' : 'Night';
    }

    function initThemeToggle() {
        const stored = getStoredTheme();
        applyTheme(stored ?? (systemPrefersDark() ? 'dark' : 'light'));

        const btn = document.querySelector('[data-theme-toggle]');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const isDark = document.documentElement.dataset.theme === 'dark';
            const next = isDark ? 'light' : 'dark';
            setStoredTheme(next);
            applyTheme(next);
        });

        if (window.matchMedia) {
            const media = window.matchMedia('(prefers-color-scheme: dark)');
            const onChange = () => {
                if (getStoredTheme()) return;
                applyTheme(systemPrefersDark() ? 'dark' : 'light');
            };
            if (typeof media.addEventListener === 'function') media.addEventListener('change', onChange);
            else if (typeof media.addListener === 'function') media.addListener(onChange);
        }
    }

    function initSidebarExpandOnHighlight() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;

        const expand = () => document.body.classList.add('sidebar-expanded');
        const collapse = () => document.body.classList.remove('sidebar-expanded');

        sidebar.addEventListener('mouseenter', expand);
        sidebar.addEventListener('mouseleave', collapse);

        sidebar.addEventListener('focusin', expand);
        sidebar.addEventListener('focusout', () => {
            window.setTimeout(() => {
                if (!sidebar.contains(document.activeElement)) collapse();
            }, 0);
        });
    }

    function formatMonthTitle(d) {
        try {
            return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d);
        } catch {
            return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
        }
    }

    function parseMonthParam(v) {
        if (!v) return null;
        const m = String(v).match(/^\s*(\d{4})-(\d{2})\s*$/);
        if (!m) return null;
        const year = Number(m[1]);
        const monthIndex = Number(m[2]) - 1;
        if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) return null;
        if (monthIndex < 0 || monthIndex > 11) return null;
        return new Date(year, monthIndex, 1, 12, 0, 0, 0);
    }

    function toMonthStart(d) {
        return new Date(d.getFullYear(), d.getMonth(), 1, 12, 0, 0, 0);
    }

    function readInitialMonth() {
        const params = new URLSearchParams(window.location.search);
        const byUrl = parseMonthParam(params.get('month'));
        if (byUrl) return byUrl;

        const stored = loadJson(CALENDAR_VIEW_KEY, null);
        if (stored && typeof stored === 'object' && typeof stored.month === 'string') {
            const byStorage = parseMonthParam(stored.month);
            if (byStorage) return byStorage;
        }

        return toMonthStart(new Date());
    }

    function persistMonthView(monthStart) {
        try {
            localStorage.setItem(CALENDAR_VIEW_KEY, JSON.stringify({ month: monthKey(monthStart) }));
        } catch {
            // ignore
        }

        const url = new URL(window.location.href);
        url.searchParams.set('month', monthKey(monthStart));
        if (TEST_MODE) url.searchParams.set('test', '1');
        window.history.replaceState({}, '', url);
    }

    function buildMonthOptions(select) {
        if (!select) return;
        const monthNames = [];
        for (let i = 0; i < 12; i++) {
            const d = new Date(2026, i, 1);
            const name = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(d);
            monthNames.push(name);
        }

        select.innerHTML = '';
        monthNames.forEach((label, idx) => {
            const opt = document.createElement('option');
            opt.value = String(idx);
            opt.textContent = label;
            select.appendChild(opt);
        });
    }

    function getCurriculum() {
        const data = loadJson(CURRICULUM_STORAGE_KEY, {});
        return data && typeof data === 'object' ? data : {};
    }

    function pickBannerText(curriculum, monthStart) {
        const year = monthStart.getFullYear();
        const month = monthStart.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const id = `${year}-${pad2(month + 1)}-${pad2(day)}`;
            const goal = curriculum?.[id]?.goal;
            if (typeof goal === 'string' && goal.trim()) return goal.trim();
        }

        return '';
    }

    function renderMonth({ monthStart, titleEl, monthSelect, gridEl, bannerEl }) {
        if (!titleEl || !monthSelect || !gridEl) return;

        const curriculum = getCurriculum();
        const today = new Date();
        const todayId = dateId(today);

        let selectedDay = null;
        try {
            selectedDay = localStorage.getItem(SELECTED_DAY_STORAGE_KEY);
        } catch {
            selectedDay = null;
        }

        titleEl.textContent = formatMonthTitle(monthStart);
        monthSelect.value = String(monthStart.getMonth());

        if (bannerEl) {
            const bannerText = pickBannerText(curriculum, monthStart);
            if (bannerText) {
                bannerEl.textContent = `Week: ${bannerText}`;
                bannerEl.hidden = false;
            } else {
                bannerEl.hidden = true;
            }
        }

        // Find first visible date based on Saturday-start week.
        const firstOfMonth = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1, 12, 0, 0, 0);
        const offset = (firstOfMonth.getDay() - WEEK_START + 7) % 7;
        const cursor = new Date(firstOfMonth);
        cursor.setDate(cursor.getDate() - offset);

        gridEl.innerHTML = '';

        for (let i = 0; i < 42; i++) {
            const id = dateId(cursor);
            const inMonth = cursor.getMonth() === monthStart.getMonth();
            const isToday = id === todayId;
            const isSelected = selectedDay && id === selectedDay;

            const dayData = curriculum?.[id] || null;

            const el = document.createElement(inMonth ? 'a' : 'div');
            el.className = 'month-day';
            if (!inMonth) el.classList.add('month-day--outside');
            if (isToday) el.classList.add('month-day--today');
            if (isSelected) el.classList.add('month-day--selected');

            const dayNum = pad2(cursor.getDate());

            const hasCurriculum = Boolean(dayData && typeof dayData === 'object');
            const dotClass = hasCurriculum ? 'month-day-dot month-day-dot--active' : 'month-day-dot';

            const top = document.createElement('div');
            top.className = 'month-day-top';
            top.innerHTML = `
                <div class="month-day-number">${dayNum}</div>
                <div class="month-day-status"><span class="${dotClass}" aria-hidden="true"></span></div>
            `;

            const body = document.createElement('div');
            body.className = 'month-day-body';

            if (inMonth) {
                const href = `day.html?day=${encodeURIComponent(id)}${TEST_MODE ? '&test=1' : ''}`;
                el.setAttribute('href', href);
                el.setAttribute('role', 'gridcell');
                el.setAttribute('aria-label', id);
                el.dataset.day = id;
            } else {
                el.setAttribute('role', 'gridcell');
                el.setAttribute('aria-hidden', 'true');
            }

            if (!inMonth) {
                body.innerHTML = `<div class="month-day-empty"></div>`;
            } else if (!hasCurriculum) {
                body.innerHTML = `<div class="month-day-muted">No Class</div>`;
            } else {
                const items = Array.isArray(dayData.items) ? dayData.items : [];
                const lines = items
                    .filter((it) => it && it.type === 'task')
                    .slice(0, 4)
                    .map((it) => {
                        const title = String(it.title || '').trim() || 'Task';
                        const emoji = String(it.emoji || '').trim();
                        return `<div class="month-day-line"><span class="month-day-emoji" aria-hidden="true">${emoji}</span><span class="month-day-text">${title}</span></div>`;
                    });

                body.innerHTML = lines.length
                    ? lines.join('')
                    : `<div class="month-day-muted">No Class</div>`;
            }

            el.appendChild(top);
            el.appendChild(body);
            gridEl.appendChild(el);

            cursor.setDate(cursor.getDate() + 1);
        }

        persistMonthView(monthStart);
    }

    function initCalendar() {
        const titleEl = document.querySelector('[data-cal-title]');
        const monthSelect = document.querySelector('[data-cal-month]');
        const prevBtn = document.querySelector('[data-cal-prev]');
        const nextBtn = document.querySelector('[data-cal-next]');
        const gridEl = document.querySelector('[data-cal-grid]');
        const bannerEl = document.querySelector('[data-cal-banner]');

        if (!titleEl || !monthSelect || !prevBtn || !nextBtn || !gridEl) return;

        buildMonthOptions(monthSelect);

        let monthStart = readInitialMonth();

        const doRender = () => renderMonth({ monthStart, titleEl, monthSelect, gridEl, bannerEl });
        doRender();

        prevBtn.addEventListener('click', () => {
            monthStart = new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1, 12, 0, 0, 0);
            doRender();
        });

        nextBtn.addEventListener('click', () => {
            monthStart = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1, 12, 0, 0, 0);
            doRender();
        });

        monthSelect.addEventListener('change', () => {
            const m = Number(monthSelect.value);
            if (!Number.isFinite(m)) return;
            monthStart = new Date(monthStart.getFullYear(), m, 1, 12, 0, 0, 0);
            doRender();
        });

        gridEl.addEventListener('click', (e) => {
            const link = e.target.closest('a.month-day');
            if (!link) return;
            const id = link.dataset.day;
            if (!id) return;
            try {
                localStorage.setItem(SELECTED_DAY_STORAGE_KEY, id);
            } catch {
                // ignore
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) return;

            if (e.key === 'ArrowLeft') {
                monthStart = new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1, 12, 0, 0, 0);
                doRender();
            } else {
                monthStart = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1, 12, 0, 0, 0);
                doRender();
            }
        });
    }

    initThemeToggle();
    initSidebarExpandOnHighlight();
    initCalendar();
})();
