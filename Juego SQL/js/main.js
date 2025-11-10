// ================================================
// SQL Injection Lab — Main Script (Modular)
// Autor: Eleazar Cruz
// ================================================

// ⬅️ Usa export default desde levels/levels.js
import levels from '../levels/levels.js';

// ⬅️ Reutiliza la DB de db.js (evita duplicidad)
import { ensureDB } from './db.js';

/* ==============================
   🔧 ESTADO LOCAL Y CONFIGURACIÓN
   ============================== */
const STORAGE = 'sqlin_mod_v1';
let state = JSON.parse(localStorage.getItem(STORAGE) || '{}');
state.score ??= 100;
state.completed ??= {};
state.hints ??= {};
state.auto ??= true;
saveState();

function saveState() {
  localStorage.setItem(STORAGE, JSON.stringify(state));
}

/* ==============================
   💾 FUNCIONES AUXILIARES
   ============================== */
function recAttempt(lvl, exerciseId, input, rows) {
  state.attempts ||= [];
  state.attempts.unshift({ lvl, exerciseId, input, rows, ts: new Date().toISOString() });
  state.attempts = state.attempts.slice(0, 500);
  saveState();
}

/* ==============================
   🧾 RENDER DE TABLAS SQL
   ============================== */
function renderTable(rows) {
  if (!rows || rows.length === 0) return '<div class="small-muted">No se encontraron filas.</div>';
  let html = '<table class="result-table"><thead><tr>';
  rows[0].forEach((_, i) => (html += `<th>col${i + 1}</th>`));
  html += '</tr></thead><tbody>';
  rows.forEach((r) => {
    html += '<tr>';
    r.forEach((c) => (html += `<td>${String(c)}</td>`));
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

/* ==============================
   🚀 CARGAR NIVEL
   ============================== */
export async function loadLevel(index, mountPoint) {
  const L = levels[index];
  const DB = await ensureDB();

  mountPoint.innerHTML = `
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 class="mb-0">Nivel ${index + 1}: ${L.title}</h4>
          <small class="text-muted">${L.desc || ''}</small>
        </div>
        <div><strong>Puntaje:</strong> <span id="scoreNow">${state.score}</span></div>
      </div>
      <hr/>
      <div id="exerciseArea"></div>
      <div id="sqlArea" class="mt-3">
        <h6>Consulta generada</h6>
        <div class="query-box"><pre id="sqlBox">-- Aquí aparecerá la consulta</pre></div>
      </div>
      <div id="resultArea" class="mt-3"></div>
    </div>
  `;

  const exerciseArea = mountPoint.querySelector('#exerciseArea');

  // Inputs
  (L.ui?.inputs || []).forEach((inp) => {
    const row = document.createElement('div');
    row.className = 'mb-2';
    const label = document.createElement('label');
    label.textContent = inp.label || inp.id;
    const el = document.createElement('input');
    el.className = 'form-control';
    el.id = 'in_' + inp.id;
    el.placeholder = inp.placeholder || '';
    if (inp.type === 'password') el.type = 'password';
    row.append(label, el);
    exerciseArea.append(row);
  });

  // Botones
  const runBtn = document.createElement('button');
  runBtn.className = 'btn btn-primary';
  runBtn.textContent = L.ui?.runText || 'Probar';

  const hintBtn = document.createElement('button');
  hintBtn.className = 'btn btn-outline-warning ms-2';
  hintBtn.textContent = 'Pedir pista';

  const viewServer = document.createElement('button');
  viewServer.className = 'btn btn-outline-secondary ms-2';
  viewServer.textContent = 'Ver código servidor';

  const viewInternal = document.createElement('button');
  viewInternal.className = 'btn btn-outline-info ms-2';
  viewInternal.textContent = 'Ver ejecución';

  exerciseArea.append(runBtn, hintBtn, viewServer, viewInternal);

  // Pistas
  hintBtn.onclick = () => {
    const used = state.hints[index] || 0;
    if (used >= (L.hints?.length || 2)) {
      alert('Límite de pistas alcanzado.');
      return;
    }
    state.hints[index] = used + 1;
    state.score = Math.max(0, (state.score || 100) - 15);
    saveState();
    mountPoint.querySelector('#scoreNow').textContent = state.score;
    mountPoint.querySelector('#resultArea').innerHTML = `<div class="hint-card">💡 ${L.hints[used]}</div>`;
  };

  // Ver código servidor
  viewServer.onclick = () => {
    showModal('Código servidor', `<pre>${L.serverCode || 'No disponible'}</pre>`);
  };

  // Ver ejecución (consulta vulnerable vs parametrizada)
  viewInternal.onclick = () => {
    const inputs = {};
    (L.ui?.inputs || []).forEach((inp) => (inputs[inp.id] = document.getElementById('in_' + inp.id).value || ''));

    if (L.engine.mode === 'vuln') {
      const q = L.engine.sql.replace(/\{(\w+)\}/g, (_, k) => inputs[k] ?? '');
      mountPoint.querySelector('#sqlBox').textContent = q;
      showConsole([
        { type: 'cmd', text: q },
        { type: 'info', text: '⚠️ Consulta vulnerable (concatena input directamente).' }
      ]);
    } else {
      const params = JSON.stringify((L.engine.params || []).map((p) => inputs[p] || ''));
      mountPoint.querySelector('#sqlBox').textContent = L.engine.sql + '\n-- params: ' + params;
      showConsole([
        { type: 'cmd', text: L.engine.sql },
        { type: 'info', text: '✅ Consulta parametrizada: protegida contra inyección.' }
      ]);
    }
  };

  // Ejecutar nivel
  runBtn.onclick = async () => {
    const inputs = {};
    (L.ui?.inputs || []).forEach((inp) => (inputs[inp.id] = document.getElementById('in_' + inp.id).value || ''));

    let executed = [];
    try {
      if (L.engine.mode === 'vuln') {
        const q = L.engine.sql.replace(/\{(\w+)\}/g, (_, k) => inputs[k] ?? '');
        mountPoint.querySelector('#sqlBox').textContent = q;
        const out = (await DB.exec(q)) || [];
        executed = out.length ? out[0].values : [];
      } else if (L.engine.mode === 'safe') {
        const stmt = DB.prepare(L.engine.sql);
        stmt.bind((L.engine.params || []).map((p) => inputs[p] || ''));
        while (stmt.step()) executed.push(stmt.get());
        stmt.free();
      } else if (L.engine.mode === 'sim') {
        executed = [['SIMULATION', 'OK']];
      }
    } catch (e) {
      mountPoint.querySelector('#resultArea').innerHTML = `<div class="text-danger">Error: ${e.message}</div>`;
      return;
    }

    recAttempt(index + 1, L.id, JSON.stringify(inputs), executed.length);
    mountPoint.querySelector('#resultArea').innerHTML = renderTable(executed);

    const ok = (L.validator || (() => false))(executed, inputs);
    if (ok) {
      state.score += 10;
      state.completed[index] = true;
      saveState();
      mountPoint.querySelector('#scoreNow').textContent = state.score;
      if (state.auto) {
        setTimeout(() => {
          if (index + 1 < levels.length) loadLevel(index + 1, mountPoint);
          else showModal('🎉 ¡Felicidades!', `<h5>Completaste todos los niveles.<br>Puntaje final: ${state.score}</h5>`);
        }, 900);
      }
    } else {
      state.score = Math.max(0, state.score - 5);
      saveState();
      mountPoint.querySelector('#scoreNow').textContent = state.score;
    }
  };
}

/* ==============================
   🪟 MODAL SIMPLE
   ============================== */
function showModal(title, html) {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="d-flex justify-content-between align-items-center">
        <h5>${title}</h5>
        <button class="btn btn-sm btn-outline-secondary">Cerrar</button>
      </div>
      <hr/>
      <div style="max-height:360px;overflow:auto;">${html}</div>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelector('button').onclick = () => modal.remove();
}

/* ==============================
   💻 SIMULACIÓN DE CONSOLA
   ============================== */
async function showConsole(lines, delay = 40) {
  showModal('Ejecución interna', '<div id="consoleSim" style="background:#0b1d33;color:#bfe3ff;padding:12px;border-radius:8px;font-family:monospace;"></div>');
  const area = document.getElementById('consoleSim');
  for (const line of lines) {
    const el = document.createElement('div');
    if (line.type === 'cmd') el.innerHTML = `<span style="color:#8cf1ff">&gt; ${line.text}</span>`;
    else if (line.type === 'info') el.innerHTML = `<span style="color:#ffd37a">${line.text}</span>`;
    else el.textContent = line.text;
    area.appendChild(el);
    await new Promise((r) => setTimeout(r, delay));
    area.scrollTop = area.scrollHeight;
  }
}
