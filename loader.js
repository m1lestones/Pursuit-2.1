(function () {
    'use strict';

    const LOADER_SELECTOR = '[data-page-loader]';
    const PERCENT_SELECTOR = '[data-loader-percent]';

    let tickId = null;
    let percent = 0;
    let isActive = false;

    function getLoaderEl() {
        return document.querySelector(LOADER_SELECTOR);
    }

    function getPercentEl() {
        return document.querySelector(PERCENT_SELECTOR);
    }

    function renderPercent(n) {
        const el = getPercentEl();
        if (el) el.textContent = String(Math.max(0, Math.min(100, Math.round(n))));
    }

    function showLoader() {
        const loader = getLoaderEl();
        if (!loader) return;
        loader.classList.remove('is-hidden');
        loader.setAttribute('aria-hidden', 'false');
    }

    function hideLoader() {
        const loader = getLoaderEl();
        if (!loader) return;
        loader.classList.add('is-hidden');
        loader.setAttribute('aria-hidden', 'true');
    }

    function stopTick() {
        if (tickId) window.clearInterval(tickId);
        tickId = null;
    }

    function startTick({ cap = 92 } = {}) {
        stopTick();
        tickId = window.setInterval(() => {
            if (!isActive) return;
            // Ease: big steps early, smaller steps later.
            const remaining = Math.max(0, cap - percent);
            if (remaining <= 0) return;

            const step = Math.max(1, Math.round(remaining * (0.08 + Math.random() * 0.06)));
            percent = Math.min(cap, percent + step);
            renderPercent(percent);
        }, 60);
    }

    function startLoader() {
        isActive = true;
        percent = 1;
        renderPercent(percent);
        showLoader();
        startTick();
    }

    function finishLoader() {
        isActive = false;
        stopTick();
        percent = 100;
        renderPercent(percent);
        // Let the user see 100% for a beat.
        window.setTimeout(() => hideLoader(), 220);
    }

    function isInternalNavLink(anchor) {
        if (!anchor) return false;
        const href = anchor.getAttribute('href');
        if (!href) return false;

        if (href.startsWith('#')) return false;
        if (href.startsWith('mailto:') || href.startsWith('tel:')) return false;

        // External links.
        if (/^https?:\/\//i.test(href)) {
            try {
                const url = new URL(href, window.location.href);
                if (url.origin !== window.location.origin) return false;
            } catch {
                return false;
            }
        }

        const target = anchor.getAttribute('target');
        if (target && target !== '_self') return false;
        if (anchor.hasAttribute('download')) return false;

        return true;
    }

    function navigateWithLoader(url) {
        if (!url) return;
        startLoader();
        // Give the overlay a moment to paint.
        window.setTimeout(() => {
            window.location.href = url;
        }, 140);
    }

    function goBackWithLoader() {
        try {
            if (window.history && window.history.length > 1) {
                startLoader();
                // Give the overlay a moment to paint.
                window.setTimeout(() => window.history.back(), 80);
                return;
            }
        } catch {
            // ignore
        }

        navigateWithLoader('index.html');
    }

    function bindLinkInterception() {
        document.addEventListener('click', (e) => {
            const backEl = e.target && e.target.closest ? e.target.closest('[data-back]') : null;
            if (backEl) {
                e.preventDefault();
                goBackWithLoader();
                return;
            }

            const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
            if (!a) return;
            if (!isInternalNavLink(a)) return;

            // Respect default modified clicks (new tab, etc.)
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

            const href = a.getAttribute('href');
            if (!href) return;

            e.preventDefault();
            navigateWithLoader(href);
        });
    }

    function init() {
        // On fresh page load, show the loader instantly (it will be hidden after DOM is ready).
        // If loader element is missing, do nothing.
        const loader = getLoaderEl();
        if (!loader) return;

        // Make sure it's visible during initial parse.
        showLoader();
        renderPercent(1);
        isActive = true;
        percent = 1;
        startTick({ cap: 88 });

        window.addEventListener('DOMContentLoaded', () => {
            // Finish quickly once DOM is ready.
            window.setTimeout(() => finishLoader(), 180);
        });

        // If coming back from bfcache, ensure loader is hidden.
        window.addEventListener('pageshow', (e) => {
            if (e.persisted) {
                stopTick();
                hideLoader();
            }
        });

        bindLinkInterception();

        // Expose for scripts that use window.location directly.
        window.navigateWithLoader = navigateWithLoader;
        window.startPageLoader = startLoader;
        window.finishPageLoader = finishLoader;
    }

    init();
})();
