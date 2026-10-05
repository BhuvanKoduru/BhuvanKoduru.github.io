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

// ============================================
// Figure tabs (one panel visible at a time)
// ============================================

document.querySelectorAll('[role="tablist"]').forEach(list => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const select = tab => tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => select(tab));
        tab.addEventListener('keydown', e => {
            const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
            if (!step) return;
            const next = tabs[(i + step + tabs.length) % tabs.length];
            select(next);
            next.focus();
        });
    });
});

// ============================================
// Portrait: dots stream in from four research areas, form the photo, then drift
// ============================================

const portrait = document.querySelector('.hero-art[data-dots]');
if (portrait) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        portrait.classList.add('is-static');
    } else {
        startPortrait(portrait).catch(() => portrait.classList.add('is-static'));
    }
}

async function startPortrait(art) {
    const masthead = art.closest('.masthead');
    const img = art.querySelector('img');
    // Never leave the portrait blank: show the static image if setup stalls
    const fallback = setTimeout(() => art.classList.add('is-static'), 3000);

    // Same file as the <img>, so this is normally served from cache
    const res = await fetch(art.dataset.dots);
    if (!res.ok) throw new Error('portrait unavailable');
    const svg = await res.text();

    const [vx, vy, vw, vh] = svg.match(/viewBox="([^"]+)"/)[1].trim().split(/\s+/).map(Number);
    const circle = /cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)" fill="#([0-9a-f]{6})"(?: fill-opacity="([\d.]+)")?/g;
    const dots = [...svg.matchAll(circle)].map(m => ({
        x: +m[1] - vx, y: +m[2] - vy, r: +m[3], rgb: hexToRgb(m[4]), a: m[5] ? +m[5] : 1,
    }));
    if (!dots.length) throw new Error('no dots');

    // One research area per direction; each dot comes from the side it sits on
    const areas = [...art.querySelectorAll('.stream-label')].map(label => {
        const angle = (+label.dataset.angle * Math.PI) / 180;
        return { angle, dx: Math.cos(angle), dy: Math.sin(angle), rgb: hexToRgb(label.dataset.color.slice(1)) };
    });
    const STEPS = 8;  // colour shift from area colour to true colour
    const cx = vw / 2, cy = vh / 2;
    dots.forEach(d => {
        const angle = Math.atan2(d.y - cy, d.x - cx);
        const area = areas.reduce((best, a) =>
            angularDistance(a.angle, angle) < angularDistance(best.angle, angle) ? a : best);
        const dist = 0.9 + Math.random() * 0.8;           // in portrait widths
        const spread = (Math.random() - 0.5) * 0.9;
        d.sx = area.dx * dist - area.dy * spread;          // start offset from home
        d.sy = area.dy * dist + area.dx * spread;
        d.px = -area.dy;                                   // perpendicular, for a gentle bow
        d.py = area.dx;
        d.bow = (Math.random() - 0.5) * 0.25;
        d.delay = 0.15 + Math.random() * 0.9;
        d.dur = 1.4 + Math.random() * 0.9;
        d.amp = 0.5 + Math.random();                       // idle drift, CSS px
        d.w1 = 0.6 + Math.random() * 0.8;
        d.w2 = 0.6 + Math.random() * 0.8;
        d.p1 = Math.random() * Math.PI * 2;
        d.p2 = Math.random() * Math.PI * 2;
        d.ramp = Array.from({ length: STEPS }, (_, k) => mixRgb(area.rgb, d.rgb, k / (STEPS - 1)));
    });
    const introEnd = Math.max(...dots.map(d => d.delay + d.dur)) + 1.2;

    const canvas = document.createElement('canvas');
    canvas.className = 'dots-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    masthead.prepend(canvas);
    const ctx = canvas.getContext('2d');

    let W = 0, H = 0, scale = 1, ox = 0, oy = 0, pw = 0;
    const layout = () => {
        const m = masthead.getBoundingClientRect();
        const a = img.getBoundingClientRect();
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        W = m.width; H = m.height;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        pw = a.width;
        scale = a.width / vw;
        ox = a.left - m.left;
        oy = a.top - m.top;
    };
    layout();
    new ResizeObserver(layout).observe(masthead);

    clearTimeout(fallback);
    art.classList.add('is-animated');
    requestAnimationFrame(() => art.classList.add('is-streaming'));

    const TAU = Math.PI * 2;
    let t0 = performance.now();
    let lastDraw = 0;
    let running = true;
    let labelsHidden = false;

    const draw = now => {
        const t = (now - t0) / 1000;
        const settled = t > introEnd;
        // Once formed, the drift only needs ~30fps
        if (settled && now - lastDraw < 30) return;
        lastDraw = now;

        if (settled) ctx.clearRect(ox - 8, oy - 8, pw + 16, vh * scale + 16);
        else ctx.clearRect(0, 0, W, H);

        for (const d of dots) {
            let p = (t - d.delay) / d.dur;
            if (p <= 0) continue;
            if (p > 1) p = 1;
            const e = 1 - (1 - p) ** 3;                     // ease-out
            const left = 1 - e;                             // share of the journey still to go
            const bow = Math.sin(Math.PI * e) * d.bow;
            let x = ox + d.x * scale + (d.sx * left + d.px * bow) * pw;
            let y = oy + d.y * scale + (d.sy * left + d.py * bow) * pw;
            const drift = Math.min(1, Math.max(0, (t - d.delay - d.dur) / 1.2));
            if (drift > 0) {
                x += Math.sin(t * d.w1 + d.p1) * d.amp * drift;
                y += Math.cos(t * d.w2 + d.p2) * d.amp * drift;
            }
            ctx.globalAlpha = d.a * Math.min(1, p * 4);
            ctx.fillStyle = d.ramp[Math.round(Math.max(0, (p - 0.45) / 0.55) * (STEPS - 1))];
            ctx.beginPath();
            ctx.arc(x, y, d.r * scale, 0, TAU);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        if (!labelsHidden && t > introEnd - 0.6) {
            labelsHidden = true;
            art.classList.remove('is-streaming');
        }
    };

    const loop = now => {
        if (!running) return;
        draw(now);
        requestAnimationFrame(loop);
    };
    const setRunning = on => {
        if (on === running) return;
        running = on;
        if (on) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    // Pause when the masthead is off-screen or the tab is hidden
    let onScreen = true;
    new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        setRunning(onScreen && !document.hidden);
    }).observe(masthead);
    document.addEventListener('visibilitychange', () => setRunning(onScreen && !document.hidden));
}

function hexToRgb(hex) {
    const n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mixRgb(from, to, k) {
    const c = from.map((v, i) => Math.round(v + (to[i] - v) * k));
    return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function angularDistance(a, b) {
    const d = Math.abs(a - b) % (Math.PI * 2);
    return d > Math.PI ? Math.PI * 2 - d : d;
}
