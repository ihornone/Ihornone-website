(function () {
  'use strict';

  // Avoid multiple instances
  if (window.__MOKI_BADGE_INITIALIZED__) return;
  window.__MOKI_BADGE_INITIALIZED__ = true;

  // Resolve config from current script attributes and/or window.MokiBadgeConfig
  var currentScript = document.currentScript || document.querySelector('script[src*="moki-badge"]') || document.querySelector('script[src*="badge.js"]');
  var globalCfg = window.MokiBadgeConfig || {};

  function getAttr(name, fallback) {
    if (globalCfg[name] !== undefined) return globalCfg[name];
    if (currentScript && currentScript.getAttribute('data-' + name) !== null) {
      return currentScript.getAttribute('data-' + name);
    }
    return fallback;
  }

  var theme = getAttr('theme', 'light');
  var isDark = theme === 'dark';

  var config = {
    position: getAttr('position', 'bottom-right'), // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
    bg: getAttr('bg', isDark ? '#1E1414' : '#FFFFFF'),
    text: getAttr('text', isDark ? '#FAF1EC' : '#1E1414'),
    border: getAttr('border', isDark ? '#3D2D2D' : '#1E1414'),
    accent: getAttr('color', '#D09AFC'),
    telegram: getAttr('telegram', 'https://t.me/ihornone'),
    website: getAttr('website', 'https://ihornone.site'),
  };

  // Create isolated container
  var host = document.createElement('div');
  host.id = 'moki-badge-root';
  var shadow = host.attachShadow({ mode: 'open' });

  // Styles inside Shadow DOM
  var style = document.createElement('style');
  var pos = config.position;
  var isLeft = pos.indexOf('left') !== -1;
  var isTop = pos.indexOf('top') !== -1;

  style.textContent = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    :host {
      all: initial;
    }
    .moki-wrap {
      position: fixed;
      ${isTop ? 'top: 20px;' : 'bottom: 20px;'}
      ${isLeft ? 'left: 20px;' : 'right: 20px;'}
      z-index: 999999;
      user-select: none;
      -webkit-user-select: none;
    }
    .moki-btn {
      width: 62px;
      height: 62px;
      background: transparent;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: none;
      padding: 0;
      outline: none;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), filter 0.2s ease;
      filter: drop-shadow(0 6px 14px rgba(30, 20, 20, 0.2));
    }
    .moki-btn:hover {
      transform: scale(1.1) translateY(-2px);
      filter: drop-shadow(0 10px 20px rgba(30, 20, 20, 0.28));
    }
    .moki-btn:active {
      transform: scale(0.95) translateY(2px);
      filter: drop-shadow(0 2px 6px rgba(30, 20, 20, 0.15));
    }
    .moki-btn.active {
      transform: scale(1.05);
    }
    .moki-popup {
      position: absolute;
      ${isTop ? 'top: calc(100% + 12px);' : 'bottom: calc(100% + 12px);'}
      ${isLeft ? 'left: 0;' : 'right: 0;'}
      width: 190px;
      background: ${config.bg};
      border: 2px solid ${config.border};
      border-radius: 18px;
      padding: 6px;
      box-shadow: 0 8px 0 ${config.border};
      display: flex;
      flex-direction: column;
      gap: 4px;
      opacity: 0;
      pointer-events: none;
      transform: scale(0.95) ${isTop ? 'translateY(-6px)' : 'translateY(6px)'};
      transform-origin: ${isTop ? 'top' : 'bottom'} ${isLeft ? 'left' : 'right'};
      transition: opacity 0.15s cubic-bezier(0.16, 1, 0.3, 1), transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .moki-popup.open {
      opacity: 1;
      pointer-events: auto;
      transform: scale(1) translateY(0);
    }
    .moki-link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 12px;
      color: ${config.text};
      text-decoration: none;
      font-size: 13.5px;
      font-weight: 700;
      transition: background 0.12s ease, color 0.12s ease;
    }
    .moki-link:hover {
      background: ${isDark ? '#2D2222' : '#F5ECE6'};
    }
    .moki-icon {
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${config.text};
      flex-shrink: 0;
    }
  `;

  // HTML Markup
  var wrap = document.createElement('div');
  wrap.className = 'moki-wrap';

  wrap.innerHTML = `
    <div class="moki-popup" id="popup">
      <a href="${config.telegram}" target="_blank" rel="noopener noreferrer" class="moki-link">
        <span class="moki-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.5 2L2 9.5l6 2.5 2.5 6 3-3.5 4.5 3.5 3.5-16z"/>
            <path d="M8 12l10-7-7 8"/>
          </svg>
        </span>
        <span>Telegram</span>
      </a>
      <a href="${config.website}" target="_blank" rel="noopener noreferrer" class="moki-link">
        <span class="moki-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </span>
        <span>Website</span>
      </a>
    </div>

    <button type="button" class="moki-btn" id="btn" aria-label="Контакти">
      <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="30" fill="${config.accent}"/>
        <!-- Eyes -->
        <g id="eyes">
          <ellipse cx="34" cy="48" rx="6" ry="8" fill="#FFFFFF"/>
          <circle id="pupil-left" cx="34" cy="48" r="4" fill="#1E1414"/>
          <ellipse cx="66" cy="48" rx="6" ry="8" fill="#FFFFFF"/>
          <circle id="pupil-right" cx="66" cy="48" r="4" fill="#1E1414"/>
        </g>
      </svg>
    </button>
  `;

  shadow.appendChild(style);
  shadow.appendChild(wrap);

  var btn = wrap.querySelector('#btn');
  var popup = wrap.querySelector('#popup');
  var pupilL = wrap.querySelector('#pupil-left');
  var pupilR = wrap.querySelector('#pupil-right');
  var isOpen = false;

  function toggle() {
    isOpen = !isOpen;
    if (isOpen) {
      popup.classList.add('open');
      btn.classList.add('active');
    } else {
      popup.classList.remove('open');
      btn.classList.remove('active');
    }
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    toggle();
  });

  document.addEventListener('click', function (e) {
    if (isOpen && !host.contains(e.target)) {
      isOpen = false;
      popup.classList.remove('open');
      btn.classList.remove('active');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false;
      popup.classList.remove('open');
      btn.classList.remove('active');
    }
  });

  // Eyes follow mouse
  window.addEventListener('pointermove', function (e) {
    var rect = btn.getBoundingClientRect();
    if (!rect.width) return;
    var bx = rect.left + rect.width / 2;
    var by = rect.top + rect.height / 2;
    var dx = (e.clientX - bx) / (window.innerWidth / 2);
    var dy = (e.clientY - by) / (window.innerHeight / 2);
    dx = Math.max(-1, Math.min(1, dx));
    dy = Math.max(-1, Math.min(1, dy));

    if (pupilL && pupilR) {
      var ox = (dx * 2.5).toFixed(1);
      var oy = (dy * 2.5).toFixed(1);
      pupilL.setAttribute('cx', 34 + parseFloat(ox));
      pupilL.setAttribute('cy', 48 + parseFloat(oy));
      pupilR.setAttribute('cx', 66 + parseFloat(ox));
      pupilR.setAttribute('cy', 48 + parseFloat(oy));
    }
  }, { passive: true });

  // Attach to DOM when ready
  function init() {
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    document.body.appendChild(host);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
