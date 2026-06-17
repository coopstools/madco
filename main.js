/* =============================================
   Metro Atlanta Dance — main.js
   ============================================= */

// ---- Year in footer ----
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---- Nav: scroll class ----
const nav = document.getElementById('main-nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ---- Nav: dropdown menus ----
const dropdowns = document.querySelectorAll('.nav-dropdown');

dropdowns.forEach(dropdown => {
  const btn = dropdown.querySelector('.nav-folder');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.contains('open');
    // close all others
    dropdowns.forEach(d => {
      d.classList.remove('open');
      const b = d.querySelector('.nav-folder');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      dropdown.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

document.addEventListener('click', () => {
  dropdowns.forEach(d => {
    d.classList.remove('open');
    const b = d.querySelector('.nav-folder');
    if (b) b.setAttribute('aria-expanded', 'false');
  });
});

// Close dropdowns on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    dropdowns.forEach(d => {
      d.classList.remove('open');
      const b = d.querySelector('.nav-folder');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
    const toggle = document.getElementById('nav-toggle');
    if (toggle && toggle.classList.contains('open')) {
      closeMobileMenu();
    }
  }
});

// ---- Nav: mobile hamburger ----
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

function openMobileMenu() {
  navMenu.classList.add('mobile-open');
  navToggle.classList.add('open');
  navToggle.setAttribute('aria-expanded', 'true');
  navToggle.setAttribute('aria-label', 'Close menu');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  navMenu.classList.remove('mobile-open');
  navToggle.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Open menu');
  document.body.style.overflow = '';
}

navToggle.addEventListener('click', () => {
  if (navToggle.classList.contains('open')) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
});

// ---- Scroll reveal ----
const reveals = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => revealObserver.observe(el));
} else {
  // Fallback: just show everything
  reveals.forEach(el => el.classList.add('visible'));
}
