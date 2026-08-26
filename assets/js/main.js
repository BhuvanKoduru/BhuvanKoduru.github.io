// ============================================
// Theme Toggle (Dark/Light Mode)
// ============================================

const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;
const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');

// Check for saved theme preference or default to light
const savedTheme = localStorage.getItem('theme') || 'light';
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
// Console Easter Egg
// ============================================

console.log('%c> Hello, fellow developer!', 'color: #2d6a4f; font-size: 16px; font-weight: bold;');
console.log('%c> Feel free to explore the code.', 'color: #666; font-size: 12px;');
console.log('%c> Built with vanilla HTML, CSS, and JS.', 'color: #666; font-size: 12px;');
