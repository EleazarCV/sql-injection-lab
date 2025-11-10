// helpers.js
// Utilidades globales — estado, notificaciones y extras (sin tema)
// Autor: Eleazar Cruz

import { STORAGE_KEY } from './db.js';

// ----------------------------
// 🎯 Gestión de estado
// ----------------------------
export function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}
export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state || {}));
}
export function ensureScore(state) {
  state.score ??= 100;
  state.hintsUsed ??= 0;
  state.hintsPerLevel ||= {};
  saveState(state);
  return state;
}
export function useHint(state, levelId) {
  state = ensureScore(state);
  state.hintsUsed += 1;
  state.score = Math.max(0, state.score - 15);
  state.hintsPerLevel[levelId] = (state.hintsPerLevel[levelId] || 0) + 1;
  saveState(state);
  return state;
}
export function recordAttempt(levelId, inputText, rows) {
  const now = new Date().toISOString();
  const state = loadState();
  state.attempts ||= [];
  state.attempts.unshift({ level: levelId, input: inputText, rows, ts: now });
  state.attempts = state.attempts.slice(0, 300);
  saveState(state);
}

// ----------------------------
// 💬 Notificaciones (toast)
// ----------------------------
export function toast(message, type = 'info', timeout = 2500) {
  const isDark = document.body.classList.contains('dark');
  const colors = {
    info: isDark ? '#1E293B' : '#f8f9fa',
    success: '#16a34a',
    error: '#dc2626'
  };
  const el = document.createElement('div');
  el.textContent = message;
  Object.assign(el.style, {
    position: 'fixed', bottom: '20px', right: '20px',
    padding: '10px 15px', borderRadius: '8px',
    color: '#fff', fontWeight: '500', fontFamily: 'Segoe UI, Roboto, sans-serif',
    background: colors[type] || colors.info, zIndex: 9999, opacity: '0',
    transition: 'opacity 0.4s ease, transform 0.4s ease', transform: 'translateY(20px)'
  });
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, 50);
  setTimeout(() => {
    el.style.opacity = '0'; el.style.transform = 'translateY(10px)';
    setTimeout(() => el.remove(), 500);
  }, timeout);
}

// ----------------------------
// 🎉 Confetti simple
// ----------------------------
export function confetti() {
  const c = document.createElement('div');
  Object.assign(c.style, { position: 'fixed', left: '50%', top: '20%', transform: 'translateX(-50%)', zIndex: 9999 });
  c.innerHTML = '<div style="font-size:42px; animation: pop 900ms ease;">🎉🎉</div>';
  document.body.appendChild(c);
  setTimeout(() => c.remove(), 1200);
}
