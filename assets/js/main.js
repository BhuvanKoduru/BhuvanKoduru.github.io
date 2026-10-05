// ============================================
// Theme toggle (light by default; choice is remembered)
// ============================================

const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');

themeToggle?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme-v2', next); } catch (e) { /* storage unavailable */ }
});

// ============================================
// Contents: highlight the section being read
// ============================================

const tocLinks = [...document.querySelectorAll('.toc a[href^="#"]')];
const tocTargets = tocLinks
    .map(link => document.getElementById(link.getAttribute('href').slice(1)))
    .filter(Boolean);

if (tocTargets.length) {
    const setActive = id => tocLinks.forEach(link => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
    });

    // A section is "current" once its top passes the upper third of the viewport
    const updateActive = () => {
        const line = window.innerHeight * 0.33;
        let current = tocTargets[0].id;
        tocTargets.forEach(section => {
            if (section.getBoundingClientRect().top <= line) current = section.id;
        });
        // At the very bottom, the last section wins even if it's short
        if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
            current = tocTargets[tocTargets.length - 1].id;
        }
        setActive(current);
    };

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => { updateActive(); ticking = false; });
    }, { passive: true });
    updateActive();
}

// ============================================
// Contents: collapsed disclosure on narrow screens
// ============================================

const toc = document.querySelector('details.toc');
if (toc) {
    const narrow = window.matchMedia('(max-width: 960px)');
    const syncToc = () => { toc.open = !narrow.matches; };
    syncToc();
    narrow.addEventListener('change', syncToc);

    // On mobile, close the list after jumping to a section
    toc.addEventListener('click', e => {
        if (narrow.matches && e.target.closest('a')) toc.open = false;
    });
}

// ============================================
// Chart tooltips (hover + keyboard focus)
// ============================================

const bars = document.querySelectorAll('[data-tip]');
if (bars.length) {
    const tip = document.createElement('div');
    tip.className = 'chart-tip';
    tip.setAttribute('role', 'tooltip');
    document.body.appendChild(tip);

    const show = (bar, x, y) => {
        // Values lead, labels follow; textContent keeps labels inert
        const value = document.createElement('strong');
        value.textContent = bar.dataset.tipValue;
        tip.replaceChildren(value, document.createTextNode(bar.dataset.tip));
        tip.classList.add('is-visible');
        const r = tip.getBoundingClientRect();
        tip.style.left = `${Math.min(window.innerWidth - r.width - 8, Math.max(8, x - r.width / 2))}px`;
        tip.style.top = `${Math.max(8, y - r.height - 12)}px`;
    };
    const hide = () => tip.classList.remove('is-visible');

    bars.forEach(bar => {
        // Bars: the whole row is the hit target, so short bars are easy to hover.
        // Dots carry their own enlarged hit area.
        const row = bar.classList.contains('bar') ? bar.closest('.chart-track') : bar;
        row.addEventListener('pointermove', e => show(bar, e.clientX, e.clientY));
        row.addEventListener('pointerleave', hide);
        bar.addEventListener('focus', () => {
            const r = bar.getBoundingClientRect();
            show(bar, r.right, r.top);
        });
        bar.addEventListener('blur', hide);
    });
}
