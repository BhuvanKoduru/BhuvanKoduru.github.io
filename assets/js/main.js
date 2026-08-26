// ============================================
// Theme Toggle (Dark/Light Mode)
// ============================================

const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;
const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');

// Check for saved theme preference or default to dark
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle?.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    if (sunIcon && moonIcon) {
        if (theme === 'dark') {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    }
}

// ============================================
// Custom Cursor Follower
// ============================================

const cursor = document.createElement('div');
cursor.className = 'cursor-follower';
document.body.appendChild(cursor);

const cursorDot = document.createElement('div');
cursorDot.className = 'cursor-dot';
document.body.appendChild(cursorDot);

// Add cursor styles dynamically
const cursorStyles = document.createElement('style');
cursorStyles.textContent = `
    .cursor-follower {
        position: fixed;
        width: 40px;
        height: 40px;
        border: 2px solid var(--color-accent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.15s ease-out, opacity 0.3s ease;
        transform: translate(-50%, -50%);
        opacity: 0;
    }
    .cursor-dot {
        position: fixed;
        width: 8px;
        height: 8px;
        background: var(--color-accent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    .cursor-follower.visible, .cursor-dot.visible {
        opacity: 1;
    }
    .cursor-follower.hover {
        transform: translate(-50%, -50%) scale(1.5);
        border-color: var(--color-accent-light);
        background: rgba(45, 106, 79, 0.1);
    }
    @media (max-width: 768px) {
        .cursor-follower, .cursor-dot { display: none; }
    }
`;
document.head.appendChild(cursorStyles);

let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
    cursor.classList.add('visible');
    cursorDot.classList.add('visible');
});

document.addEventListener('mouseleave', () => {
    cursor.classList.remove('visible');
    cursorDot.classList.remove('visible');
});

function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    requestAnimationFrame(animateCursor);
}
animateCursor();

// Cursor hover effects on interactive elements
document.querySelectorAll('a, button, .project-card, .publication-item').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

// ============================================
// Scroll-Triggered Animations
// ============================================

const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            animationObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    // Only observe elements that don't already have 'visible' class
    const animatedElements = document.querySelectorAll('.animate:not(.visible)');
    animatedElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
        animationObserver.observe(el);
    });
});

// ============================================
// Floating Table of Contents
// ============================================

const tocLinks = document.querySelectorAll('.floating-toc a');
const sections = document.querySelectorAll('section[id]');

function updateTOC() {
    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (window.scrollY >= sectionTop - 200) {
            currentSection = section.getAttribute('id');
        }
    });

    tocLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateTOC);
updateTOC();

// ============================================
// Navbar Scroll Effect
// ============================================

const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// ============================================
// Smooth Scroll for Anchor Links
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// Active Navigation State
// ============================================

const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPage || (currentPage === '' && href === 'index.html'))) {
        link.classList.add('active');
    }
});

// ============================================
// Typing Animation Enhancement
// ============================================

const typingElement = document.querySelector('.typing-name');
if (typingElement) {
    // Reset animation on page load for consistent experience
    typingElement.style.width = '0';
    setTimeout(() => {
        typingElement.style.width = '100%';
    }, 300);
}

// ============================================
// Project Card 3D Tilt Effect
// ============================================

document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// ============================================
// Social Link Magnetic Effect
// ============================================

document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('mousemove', (e) => {
        const rect = link.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        link.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) translateY(-4px)`;
    });

    link.addEventListener('mouseleave', () => {
        link.style.transform = 'translate(0, 0)';
    });
});

// ============================================
// Publication Item Hover Animation
// ============================================

document.querySelectorAll('.publication-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
});

// ============================================
// Parallax Scroll Effect for Hero
// ============================================

const hero = document.querySelector('.hero');
if (hero) {
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        hero.style.setProperty('--scroll-offset', `${scrolled * 0.3}px`);
    });
}

// ============================================
// Text Reveal Animation on Scroll
// ============================================

const revealElements = document.querySelectorAll('.reveal-text');
revealElements.forEach(el => {
    el.innerHTML = el.textContent.split('').map(char =>
        `<span style="opacity: 0; transform: translateY(20px); display: inline-block; transition: all 0.3s ease;">${char === ' ' ? '&nbsp;' : char}</span>`
    ).join('');
});

// ============================================
// Stagger Animation for Grid Items
// ============================================

document.querySelectorAll('.projects-grid').forEach(grid => {
    const cards = grid.querySelectorAll('.project-card');
    cards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });
});

// ============================================
// Interactive Particle Network Canvas
// ============================================

const canvas = document.createElement('canvas');
canvas.id = 'particle-canvas';
canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
`;
document.body.prepend(canvas);

const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: -1000, y: -1000, radius: 200 };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget) {
        mouse.x = -1000;
        mouse.y = -1000;
    }
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = Math.random() * 30 + 1;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
    }

    update() {
        // Mouse interaction - push particles away
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius && distance > 0) {
            let force = (mouse.radius - distance) / mouse.radius;
            let angle = Math.atan2(dy, dx);
            let pushX = Math.cos(angle) * force * 8;
            let pushY = Math.sin(angle) * force * 8;
            this.x -= pushX;
            this.y -= pushY;
        }

        // Gentle floating motion
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges with padding
        if (this.x < 10) { this.x = 10; this.vx *= -1; }
        if (this.x > canvas.width - 10) { this.x = canvas.width - 10; this.vx *= -1; }
        if (this.y < 10) { this.y = 10; this.vy *= -1; }
        if (this.y > canvas.height - 10) { this.y = canvas.height - 10; this.vy *= -1; }
    }

    draw() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        ctx.fillStyle = isDark ? 'rgba(82, 183, 136, 0.8)' : 'rgba(45, 106, 79, 0.6)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const numParticles = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }
}
initParticles();
window.addEventListener('resize', initParticles);

function connectParticles() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const maxDistance = 120;

    for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
            let dx = particles[a].x - particles[b].x;
            let dy = particles[a].y - particles[b].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < maxDistance) {
                let opacity = 1 - (distance / maxDistance);
                ctx.strokeStyle = isDark
                    ? `rgba(82, 183, 136, ${opacity * 0.4})`
                    : `rgba(45, 106, 79, ${opacity * 0.3})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(particles[b].x, particles[b].y);
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    connectParticles();
    requestAnimationFrame(animateParticles);
}
animateParticles();

// ============================================
// Aurora Gradient Background
// ============================================

const auroraStyles = document.createElement('style');
auroraStyles.textContent = `
    .aurora-bg {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
    }
    .aurora-layer {
        position: absolute;
        width: 200%;
        height: 200%;
        top: -50%;
        left: -50%;
        background: linear-gradient(
            45deg,
            transparent 0%,
            rgba(45, 106, 79, 0.03) 25%,
            transparent 50%,
            rgba(64, 145, 108, 0.05) 75%,
            transparent 100%
        );
        animation: auroraMove 20s ease-in-out infinite;
    }
    .aurora-layer:nth-child(2) {
        background: linear-gradient(
            -45deg,
            transparent 0%,
            rgba(82, 183, 136, 0.04) 30%,
            transparent 60%,
            rgba(116, 198, 157, 0.03) 80%,
            transparent 100%
        );
        animation: auroraMove 25s ease-in-out infinite reverse;
        animation-delay: -5s;
    }
    .aurora-layer:nth-child(3) {
        background: radial-gradient(
            ellipse at 30% 20%,
            rgba(45, 106, 79, 0.08) 0%,
            transparent 50%
        );
        animation: auroraPulse 15s ease-in-out infinite;
    }
    @keyframes auroraMove {
        0%, 100% {
            transform: translate(0, 0) rotate(0deg);
        }
        25% {
            transform: translate(2%, 1%) rotate(1deg);
        }
        50% {
            transform: translate(-1%, 2%) rotate(-1deg);
        }
        75% {
            transform: translate(-2%, -1%) rotate(0.5deg);
        }
    }
    @keyframes auroraPulse {
        0%, 100% {
            opacity: 0.5;
            transform: scale(1);
        }
        50% {
            opacity: 1;
            transform: scale(1.2);
        }
    }
    [data-theme="dark"] .aurora-layer {
        background: linear-gradient(
            45deg,
            transparent 0%,
            rgba(64, 145, 108, 0.06) 25%,
            transparent 50%,
            rgba(82, 183, 136, 0.08) 75%,
            transparent 100%
        );
    }
    [data-theme="dark"] .aurora-layer:nth-child(2) {
        background: linear-gradient(
            -45deg,
            transparent 0%,
            rgba(82, 183, 136, 0.07) 30%,
            transparent 60%,
            rgba(116, 198, 157, 0.05) 80%,
            transparent 100%
        );
    }
    [data-theme="dark"] .aurora-layer:nth-child(3) {
        background: radial-gradient(
            ellipse at 30% 20%,
            rgba(64, 145, 108, 0.12) 0%,
            transparent 50%
        );
    }
    @media (max-width: 768px) {
        .aurora-bg { display: none; }
    }
`;
document.head.appendChild(auroraStyles);

const auroraBg = document.createElement('div');
auroraBg.className = 'aurora-bg';
auroraBg.innerHTML = '<div class="aurora-layer"></div><div class="aurora-layer"></div><div class="aurora-layer"></div>';
document.body.prepend(auroraBg);

// ============================================
// Console Easter Egg
// ============================================

console.log('%c> Hello, fellow developer!', 'color: #2d6a4f; font-size: 16px; font-weight: bold;');
console.log('%c> Feel free to explore the code.', 'color: #666; font-size: 12px;');
console.log('%c> Built with vanilla HTML, CSS, and JS.', 'color: #666; font-size: 12px;');
