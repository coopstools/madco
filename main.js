/* =============================================
   Metro Atlanta Dance — main.js
   ============================================= */

// ---- Hours from Google Sheet (tab named "active") ----
// Uses gviz JSONP (CSV has no CORS for browser fetch).
const HOURS_SPREADSHEET_ID = '1WWdQwXcYwcir6XWMVuoReHvPzxOB8tI7GAAlbeIb6OM';
const HOURS_SHEET_TAB = 'active';

function loadHoursFromGoogleSheet() {
  const headingEl = document.getElementById('hours-heading');
  const listEl = document.getElementById('hours-list');
  if (!headingEl || !listEl) return;

  const fallbackHeading = headingEl.textContent;
  const fallbackListHtml = listEl.innerHTML;

  function restoreDom() {
    headingEl.textContent = fallbackHeading;
    listEl.innerHTML = fallbackListHtml;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function cellValue(row, index) {
    const c = row.c?.[index];
    if (!c || c.v == null) return '';
    return String(c.v).trim();
  }

  const priorRoot = window.google;
  const priorSetter = priorRoot?.visualization?.Query?.setResponse;

  window.google = priorRoot || {};
  window.google.visualization = window.google.visualization || {};
  window.google.visualization.Query = window.google.visualization.Query || {};

  function cleanupGoogleNamespace() {
    if (!priorRoot) {
      try {
        delete window.google;
      } catch (_) {
        window.google = undefined;
      }
    } else {
      window.google.visualization.Query.setResponse = priorSetter;
    }
  }

  window.google.visualization.Query.setResponse = function onHoursResponse(resp) {
    window.google.visualization.Query.setResponse = priorSetter;

    try {
      if (!resp || resp.status !== 'ok' || !resp.table?.rows?.length) {
        restoreDom();
        return;
      }

      const rows = resp.table.rows;
      let i = 0;
      const title = cellValue(rows[0], 0);
      const subtitle = cellValue(rows[0], 1);
      if (title && !subtitle) {
        headingEl.textContent = title;
        i = 1;
      }

      const parts = [];
      for (; i < rows.length; i++) {
        const day = cellValue(rows[i], 0);
        const hours = cellValue(rows[i], 1);
        if (!day && !hours) continue;
        if (!day) continue;
        parts.push(
          `<div class="hours-row"><dt>${escapeHtml(day)}</dt><dd>${escapeHtml(hours || '—')}</dd></div>`
        );
      }

      if (!parts.length) {
        restoreDom();
        return;
      }

      listEl.innerHTML = parts.join('');
    } catch (_) {
      restoreDom();
    } finally {
      cleanupGoogleNamespace();
    }
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://docs.google.com/spreadsheets/d/${HOURS_SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(HOURS_SHEET_TAB)}`;
  script.onerror = () => {
    cleanupGoogleNamespace();
    restoreDom();
  };
  document.head.appendChild(script);
}

loadHoursFromGoogleSheet();

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

// Close mobile menu when jumping to in-page anchors from nav
document.querySelectorAll('#nav-menu a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    if (navMenu.classList.contains('mobile-open')) {
      closeMobileMenu();
    }
  });
});

// ---- Schedule boards (filter chips + class cards) ----
function parseFilterTokens(value) {
  return String(value || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function applyScheduleBoardFilter(board, activeFilter) {
  const cards = board.querySelectorAll('.class-card');
  const dayBlocks = board.querySelectorAll('.schedule-day-block');
  const emptyMsg = board.querySelector('.schedule-empty');

  let anyVisible = false;
  cards.forEach((card) => {
    const tokens = parseFilterTokens(card.getAttribute('data-filters'));
    const show = activeFilter === 'all' || tokens.includes(activeFilter);
    card.hidden = !show;
    card.setAttribute('aria-hidden', show ? 'false' : 'true');
    if (show) anyVisible = true;
  });

  dayBlocks.forEach((day) => {
    const hasVisible = [...day.querySelectorAll('.class-card')].some((c) => !c.hidden);
    day.hidden = !hasVisible;
  });

  if (emptyMsg) {
    emptyMsg.hidden = anyVisible;
    emptyMsg.setAttribute('aria-hidden', anyVisible ? 'true' : 'false');
  }
}

function initScheduleBoard(board) {
  const chips = board.querySelectorAll('.filter-chip');
  if (!chips.length) return;

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const val = chip.dataset.filter;
      chips.forEach((c) => {
        const on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      applyScheduleBoardFilter(board, val || 'all');
    });
  });
}

document.querySelectorAll('[data-schedule-board]').forEach(initScheduleBoard);

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
