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
    const areas = [...art.querySelectorAll('.stream-label')].map((label, index) => {
        const angle = (+label.dataset.angle * Math.PI) / 180;
        return { index, label, angle, dx: Math.cos(angle), dy: Math.sin(angle), rgb: hexToRgb(label.dataset.color.slice(1)) };
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
        d.area = area.index;
        // Hover tint is strongest along the area's diagonal and fades toward its edges
        const off = angularDistance(area.angle, angle) / (Math.PI / areas.length);
        d.tint = Math.min(1, (0.3 + 0.7 * Math.max(0, 1 - off)) * (0.85 + Math.random() * 0.3));
        d.ramp = Array.from({ length: STEPS }, (_, k) => mixRgb(area.rgb, d.rgb, k / (STEPS - 1)));
        d.hx = 0;                                          // hover push, eased
        d.hy = 0;
        d.k = 0.55 + Math.random() * 0.9;                  // per-dot sensitivity: an organic edge
        d.swirl = (Math.random() < 0.5 ? -1 : 1) * (0.2 + Math.random() * 0.3);
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

    // Dots near the pointer are pushed aside and spring back when it leaves
    const pointer = { x: 0, y: 0, active: false };
    const track = e => {
        const m = masthead.getBoundingClientRect();
        pointer.x = e.clientX - m.left;
        pointer.y = e.clientY - m.top;
        pointer.active = true;
    };
    const release = () => { pointer.active = false; };
    masthead.addEventListener('pointermove', track);
    masthead.addEventListener('pointerdown', track);
    masthead.addEventListener('pointerleave', release);
    masthead.addEventListener('pointercancel', release);
    masthead.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') release(); });

    // Hovering (or focusing) an area's label tints its dots back to the area colour
    const glow = areas.map(() => 0);
    let glowTarget = -1;
    areas.forEach(a => {
        a.label.addEventListener('pointerenter', () => { glowTarget = a.index; });
        a.label.addEventListener('pointerleave', () => { if (glowTarget === a.index) glowTarget = -1; });
        a.label.addEventListener('focus', () => { glowTarget = a.index; });
        a.label.addEventListener('blur', () => { if (glowTarget === a.index) glowTarget = -1; });
    });

    clearTimeout(fallback);
    art.classList.add('is-animated');
    requestAnimationFrame(() => art.classList.add('is-streaming'));

    const TAU = Math.PI * 2;
    let t0 = performance.now();
    let lastDraw = 0;
    let running = true;
    let labelsHidden = false;
    let disturbed = false;   // any dot still displaced by the pointer

    const draw = now => {
        const t = (now - t0) / 1000;
        const settled = t > introEnd;
        const reach = pw * 0.17;                            // hover radius
        const reach2 = reach * reach;
        const push = pw * 0.035;                            // max displacement
        const near = pointer.active
            && pointer.x > ox - reach && pointer.x < ox + pw + reach
            && pointer.y > oy - reach && pointer.y < oy + vh * scale + reach;
        let glowing = false;
        for (let i = 0; i < glow.length; i++) {
            glow[i] += ((i === glowTarget ? 1 : 0) - glow[i]) * 0.12;
            if (glow[i] < 0.005) glow[i] = 0;
            if (glow[i] > 0) glowing = true;
        }
        // Once formed and untouched, the drift only needs ~30fps
        if (settled && !near && !disturbed && !glowing && now - lastDraw < 30) return;
        lastDraw = now;

        const pad = 8 + push;
        if (settled) ctx.clearRect(ox - pad, oy - pad, pw + pad * 2, vh * scale + pad * 2);
        else ctx.clearRect(0, 0, W, H);
        disturbed = false;

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

            // Hover: ease toward a push away from the pointer, or back to rest
            let tx = 0, ty = 0;
            if (near) {
                const ddx = x - pointer.x, ddy = y - pointer.y;
                const dd = ddx * ddx + ddy * ddy;
                if (dd < reach2) {
                    const dist = Math.sqrt(dd) || 1;
                    const f = 1 - dist / reach;
                    const amt = f * f * push * d.k;
                    const ux = ddx / dist, uy = ddy / dist;
                    // mostly outward, with a little sideways swirl, like stirring paint
                    tx = (ux - uy * d.swirl) * amt;
                    ty = (uy + ux * d.swirl) * amt;
                }
            }
            d.hx += (tx - d.hx) * 0.16;
            d.hy += (ty - d.hy) * 0.16;
            if (Math.abs(d.hx) + Math.abs(d.hy) > 0.05) {
                x += d.hx;
                y += d.hy;
                disturbed = true;
            } else {
                d.hx = d.hy = 0;
            }
            ctx.globalAlpha = d.a * Math.min(1, p * 4);
            const landed = Math.round(Math.max(0, (p - 0.45) / 0.55) * (STEPS - 1));
            const lit = Math.round((1 - 0.6 * glow[d.area] * d.tint) * (STEPS - 1));
            ctx.fillStyle = d.ramp[Math.min(landed, lit)];
            ctx.beginPath();
            ctx.arc(x, y, d.r * scale, 0, TAU);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        if (!labelsHidden && t > introEnd - 0.6) {
            labelsHidden = true;
            art.classList.remove('is-streaming');
            art.classList.add('is-formed');
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

// ============================================
// Paper page: hear a style, see what each model said
// ============================================

document.querySelectorAll('[data-tryit]').forEach(box => {
    const buttons = [...box.querySelectorAll('.style-picker button')];
    const play = box.querySelector('.play');
    const audio = box.querySelector('audio');
    const spoken = box.querySelector('[data-spoken]');
    const answers = [...box.querySelectorAll('[data-answer]')];
    let current = buttons.find(b => b.getAttribute('aria-pressed') === 'true') || buttons[0];
    let loaded = null;  // the style whose clip is in the <audio> element

    const setPlaying = on => play.classList.toggle('is-playing', on);
    audio.addEventListener('play', () => setPlaying(true));
    audio.addEventListener('pause', () => setPlaying(false));
    audio.addEventListener('ended', () => setPlaying(false));

    const show = btn => {
        current = btn;
        buttons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
        spoken.textContent = btn.dataset.style;
        play.setAttribute('aria-label', `Play the ${btn.dataset.style} recording`);
        answers.forEach(card => {
            const k = card.dataset.answer;
            const said = btn.dataset['a' + k];
            card.querySelector('.answer-said').textContent = said;
            card.querySelector('.answer-note').textContent = btn.dataset['n' + k] || '';
            card.classList.toggle('is-neutral', said === 'neutral');
            card.classList.toggle('is-match', ('m' + k) in btn.dataset);
        });
    };

    const playCurrent = () => {
        if (loaded !== current) {
            audio.src = current.dataset.audio;
            loaded = current;
        }
        audio.currentTime = 0;
        audio.play().catch(() => setPlaying(false));
    };

    // Choosing a style plays it straight away (the click counts as the user gesture)
    buttons.forEach(btn => btn.addEventListener('click', () => { show(btn); playCurrent(); }));
    play.addEventListener('click', () => {
        if (!audio.paused && loaded === current) audio.pause();
        else playCurrent();
    });
    show(current);
});

// ============================================
// Copy buttons (BibTeX)
// ============================================

document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
        const text = document.querySelector(btn.dataset.copy).textContent;
        try {
            await navigator.clipboard.writeText(text);
        } catch (e) {
            // Fallback: select the text so the visitor can copy it manually
            const range = document.createRange();
            range.selectNodeContents(document.querySelector(btn.dataset.copy));
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
        btn.textContent = 'Copied';
        btn.classList.add('is-done');
        setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('is-done'); }, 1800);
    });
});

// ============================================
// Charts draw in when they scroll into view
// ============================================

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const figures = document.querySelectorAll('.figure');
    if (figures.length) {
        // stagger rows a little
        figures.forEach(fig => fig.querySelectorAll('.chart-row').forEach((row, i) => row.style.setProperty('--row', i)));
        document.documentElement.classList.add('charts-armed');
        const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-in');
            reveal.unobserve(entry.target);
        }), { rootMargin: '0px 0px -15% 0px' });
        figures.forEach(fig => reveal.observe(fig));
    }
}
