// js/ui.js — Sistema completo con puntuación, timer y progreso
(function () {
  const safe = (fn) => { try { return fn(); } catch (e) { console.error('[ui.js]', e); return null; } };

  // Base de datos simulada
  const DB = {
    users: [
      { id: 1, username: 'admin', password: 'supersecret', secret: '🔐 Flag: CTF{sql_1nj3ct10n_m4st3r}' },
      { id: 2, username: 'alice', password: 'alice123', secret: 'Usuario Alice - Acceso permitido' },
      { id: 3, username: 'bob', password: 'bobpwd', secret: 'Usuario Bob - Datos de prueba' },
      { id: 4, username: 'user', password: 'password123', secret: 'No hay nada especial aquí' },
      { id: 5, username: 'guest', password: 'guest', secret: 'Usuario de prueba' }
    ]
  };

  // Estado del juego
  const gameState = {
    totalScore: 0,
    completedLevels: new Set(),
    totalHints: 0,
    startTime: null,
    levelStartTime: null,
    levelTimes: {},
    levelAttempts: {}
  };

  let totalTimerInterval = null;
  let levelTimerInterval = null;

  // Motor SQL simple (para niveles "vuln" y algunos "safe")
  function executeSQL(sql, db = DB) {
    try {
      // quita comentarios de línea
      sql = sql.replace(/--.*$/gm, '');

      // soporte básico UNION / UNION ALL
      if (/UNION/i.test(sql)) {
        const queries = sql.split(/UNION(?:\s+ALL)?/i);
        let allResults = [];
        queries.forEach(query => {
          const results = executeSingleQuery(query.trim(), db);
          allResults = allResults.concat(results);
        });
        return allResults;
      }

      return executeSingleQuery(sql, db);
    } catch (e) {
      console.error('Error ejecutando SQL:', e);
      return [];
    }
  }

  function executeSingleQuery(sql, db = DB) {
    try {
      const selectMatch = sql.match(/SELECT\s+(.*?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.*))?/i);

      // Soporta SELECT literales (sin FROM) tipo: SELECT 'a','b','c'
      if (!selectMatch && /SELECT/i.test(sql)) {
        const literalMatch = sql.match(/SELECT\s+(.+)$/i);
        if (literalMatch) {
          const values = literalMatch[1].split(',').map(v => {
            v = v.trim();
            if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
              return v.slice(1, -1);
            }
            return v;
          });

          return [{
            id: values[0] || 0,
            username: values[1] || '',
            secret: values[2] || ''
          }];
        }
        return [];
      }

      if (!selectMatch) return [];

      const [, , table, whereClause] = selectMatch;
      let data = db[table] || [];
      if (!whereClause) return data;

      // Filtro ingenuo evaluando la condición (didáctico)
      return data.filter(row => {
        let condition = whereClause.trim();
        if (!condition) return true;

        // sustituye variables por valores de "row"
        Object.keys(row).forEach(key => {
          const val = row[key];
          const regex = new RegExp(`\\b${key}\\b`, 'g');
          condition = condition.replace(regex, typeof val === 'string' ? `'${val}'` : String(val));
        });

        // Tautologías y falsedades frecuentes
        if (/'1'='1'|"1"="1"|1\s*=\s*1/i.test(condition)) return true;
        if (/'0'='1'|"0"="1"|1\s*=\s*0/i.test(condition)) return false;

        try {
          // eslint-disable-next-line no-eval
          return !!eval(condition);
        } catch {
          return false;
        }
      });
    } catch {
      return [];
    }
  }

  // Formatear tiempo
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // Calcular puntuación
  function calculateScore(levelTime, hintsUsed, attempts) {
    let baseScore = 1000;
    const timePenalty = Math.min(levelTime * 2, 300);
    const hintPenalty = hintsUsed * 100;
    const attemptPenalty = Math.max(0, (attempts - 1) * 50);
    const finalScore = Math.max(0, baseScore - timePenalty - hintPenalty - attemptPenalty);
    return Math.round(finalScore);
  }

  window.addEventListener('DOMContentLoaded', () => safe(async () => {
    const hero = document.querySelector('.hero');
    const appContainer = document.getElementById('appContainer');
    const finalScreen = document.getElementById('finalScreen');
    const startBtn = document.getElementById('startGame');
    const restartBtn = document.getElementById('restartGame');
    const levelsList = document.getElementById('levelsList');
    const levelTitle = document.getElementById('levelTitle');
    const levelDesc = document.getElementById('levelDescription');
    const levelBadge = document.getElementById('levelBadge');
    const levelTimer = document.getElementById('levelTimer');
    const serverCodeBox = document.getElementById('serverCodeBox');
    const serverCode = document.getElementById('serverCode');
    const challengeBox = document.getElementById('challengeBox');
    const queryBox = document.getElementById('queryBox');
    const queryDisplay = document.getElementById('queryDisplay');
    const resultsBox = document.getElementById('resultsBox');
    const sqlResults = document.getElementById('sqlResults');
    const checkBtn = document.getElementById('checkBtn');
    const hintBtn = document.getElementById('hintBtn');
    const resetBtn = document.getElementById('resetBtn');
    const prevLevelBtn = document.getElementById('prevLevel');
    const nextLevelBtn = document.getElementById('nextLevel');
    const feedback = document.getElementById('feedback');

    const totalTimer = document.getElementById('totalTimer');
    const totalScore = document.getElementById('totalScore');
    const completedCount = document.getElementById('completedCount');
    const hintsCount = document.getElementById('hintsCount');

    if (!appContainer || !levelsList || !challengeBox) {
      console.warn('[ui.js] IDs críticos no encontrados');
      return;
    }

    let LEVELS = [];
    let currentIndex = 0;

    function startTotalTimer() {
      gameState.startTime = Date.now();
      totalTimerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        if (totalTimer) totalTimer.textContent = formatTime(elapsed);
      }, 1000);
    }

    function startLevelTimer() {
      gameState.levelStartTime = Date.now();
      levelTimerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameState.levelStartTime) / 1000);
        if (levelTimer) levelTimer.textContent = formatTime(elapsed);
      }, 1000);
    }

    function stopLevelTimer() {
      if (levelTimerInterval) {
        clearInterval(levelTimerInterval);
        levelTimerInterval = null;
      }
    }

    function updateStats() {
      if (totalScore) totalScore.textContent = gameState.totalScore;
      if (completedCount) completedCount.textContent = `${gameState.completedLevels.size}/${LEVELS.length}`;
      if (hintsCount) hintsCount.textContent = gameState.totalHints;
    }

    // Carga de niveles (ruta relativa desde js/ui.js a levels/*.js)
    async function loadLevels() {
      // ✅ Import relativo correcto: js/ -> ../levels/levels.js
      const mod = await import('../levels/levels.js');
      // ✅ Soporta export default y/o export nombrado { levels }
      const arr = (Array.isArray(mod?.default) && mod.default.length) ? mod.default
                : (Array.isArray(mod?.levels) && mod.levels.length) ? mod.levels
                : [];
      if (arr.length === 0) {
        throw new Error('levels.js no exportó niveles válidos');
      }
      LEVELS = arr;
      console.log(`[ui.js] ${LEVELS.length} niveles cargados`);

      LEVELS.forEach((_, idx) => {
        gameState.levelAttempts[idx] = 0;
      });
    }

    function updateServerCode() {
      const lv = LEVELS[currentIndex];
      if (!lv || !serverCode) return;

      const inputs = {};
      (lv.ui?.inputs || []).forEach(inp => {
        const el = document.getElementById(`in_${inp.id}`);
        inputs[inp.id] = el ? el.value : '';
      });

      let code = lv.serverCode || '';
      Object.entries(inputs).forEach(([key, val]) => {
        const displayVal = val || `[${key}]`;
        code = code.replace(new RegExp(`\\{${key}\\}`, 'g'), displayVal);

        if (key === 'username') {
          code = code.replace(/\b(user|u)\b(?!sername)/g, `"${displayVal}"`);
        }
        if (key === 'password') {
          code = code.replace(/\b(pass|p)\b(?!assword)/g, `"${displayVal}"`);
        }
      });

      serverCode.textContent = code;
    }

    function renderLevelsList() {
      levelsList.innerHTML = '';
      LEVELS.forEach((lv, idx) => {
        const li = document.createElement('li');
        const isCompleted = gameState.completedLevels.has(idx);
        const isLocked = idx > 0 && !gameState.completedLevels.has(idx - 1);

        li.textContent = `${idx + 1}. ${lv.title || 'Nivel ' + (idx + 1)}`;

        if (idx === currentIndex) li.classList.add('active');
        if (isCompleted) li.classList.add('completed');
        if (isLocked) li.classList.add('locked');

        if (!isLocked) {
          li.addEventListener('click', () => {
            stopLevelTimer();
            currentIndex = idx;
            renderLevel();
            renderLevelsList();
            startLevelTimer();
          });
        }

        levelsList.appendChild(li);
      });
    }

    function renderLevel() {
      const lv = LEVELS[currentIndex];
      if (!lv) return;

      if (levelTitle) levelTitle.textContent = `Nivel ${currentIndex + 1}: ${lv.title || ''}`;
      if (levelDesc) levelDesc.textContent = lv.desc || '';
      if (levelBadge) levelBadge.textContent = `${currentIndex + 1}/${LEVELS.length}`;

      if (serverCodeBox && serverCode) {
        if (lv.serverCode) {
          serverCodeBox.style.display = 'block';
          serverCode.textContent = lv.serverCode;
        } else {
          serverCodeBox.style.display = 'none';
        }
      }

      if (feedback) feedback.innerHTML = '';
      if (queryBox) queryBox.style.display = 'none';
      if (resultsBox) resultsBox.style.display = 'none';
      challengeBox.innerHTML = '';

      if (lv.context) {
        const pre = document.createElement('pre');
        pre.style.cssText = 'background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 15px; overflow-x: auto; color: var(--text-primary); font-size: 0.9rem; margin-bottom: 15px;';
        pre.textContent = lv.context;
        challengeBox.appendChild(pre);
      }

      (lv.ui?.inputs || []).forEach(inp => {
        const group = document.createElement('div');
        group.className = 'mb-3';

        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = inp.label || inp.id;

        const input = document.createElement('input');
        input.type = inp.type || 'text';
        input.className = 'form-control';
        input.id = `in_${inp.id}`;
        input.placeholder = inp.placeholder || '';
        input.addEventListener('input', updateServerCode);

        group.append(label, input);
        challengeBox.appendChild(group);
      });

      if (checkBtn && lv.ui?.runText) {
        checkBtn.textContent = `▶️ ${lv.ui.runText}`;
      } else if (checkBtn) {
        checkBtn.textContent = '▶️ Ejecutar Query';
      }

      updateServerCode();

      if (prevLevelBtn) prevLevelBtn.disabled = (currentIndex === 0);
      if (nextLevelBtn) {
        const nextIsLocked = currentIndex < LEVELS.length - 1 && !gameState.completedLevels.has(currentIndex);
        nextLevelBtn.disabled = nextIsLocked;
      }
    }

    function executeLevel() {
      const lv = LEVELS[currentIndex];
      if (!lv) return;

      gameState.levelAttempts[currentIndex]++;

      const inputs = {};
      (lv.ui?.inputs || []).forEach(inp => {
        const el = document.getElementById(`in_${inp.id}`);
        inputs[inp.id] = el ? el.value : '';
      });

      let sql = lv.engine?.sql || '';
      let rows = [];

      // ---- MODO SAFE (parametrizado simulado) ----
      if (lv.engine?.mode === 'safe') {
        const params = (lv.engine?.params || []).map(p => inputs[p] || '');

        // Mostrar SQL parametrizado renderizado
        if (queryBox && queryDisplay) {
          let displaySql = sql;
          params.forEach((param) => {
            displaySql = displaySql.replace('?', `'${param}'`);
          });
          queryDisplay.textContent = displaySql;
          queryBox.style.display = 'block';
        }

        if (sql.toUpperCase().includes('LIKE')) {
          const pattern = params[0] || '';
          const regexPattern = pattern
            .replace(/%/g, '.*')
            .replace(/_/g, '.')
            .replace(/[.*+?^${}()|[\]\\]/g, (m) => (m === '.' || m === '*') ? m : '\\' + m);
          const regex = new RegExp(`^${regexPattern}`, 'i');
          rows = DB.users.filter(user => regex.test(user.username));
        } else {
          rows = DB.users.filter(user => {
            let match = true;
            params.forEach((param, idx) => {
              const paramName = lv.engine.params[idx];
              if (paramName === 'username' && user.username !== param) match = false;
              if (paramName === 'password' && user.password !== param) match = false;
            });
            return match;
          });
        }

      // ---- MODO SIMULADO (no ejecuta SQL; depende de validator/inputs) ----
      } else if (lv.engine?.mode === 'sim') {
        if (queryBox && queryDisplay) {
          queryDisplay.textContent = typeof sql === 'string' ? sql : '/* SIMULATION */';
          queryBox.style.display = 'block';
        }
        rows = []; // los validadores de 6/8/9 no dependen de rows

      // ---- MODO NONE (reto tipo texto, sin SQL) ----
      } else if (lv.engine?.mode === 'none') {
        if (queryBox) queryBox.style.display = 'none';
        rows = [];

      // ---- MODO VULN POR DEFECTO ----
      } else {
        // Sustituir placeholders {var} por inputs
        Object.entries(inputs).forEach(([key, val]) => {
          sql = sql.replace(new RegExp(`\\{${key}\\}`, 'g'), val);
        });

        if (queryBox && queryDisplay) {
          queryDisplay.textContent = sql;
          queryBox.style.display = 'block';
        }
        rows = executeSQL(sql, DB);
      }

      // Render de resultados
      if (resultsBox && sqlResults) {
        resultsBox.style.display = 'block';
        if (!rows || rows.length === 0) {
          sqlResults.innerHTML = '<p style="color: var(--text-muted); margin: 0;">No se encontraron resultados</p>';
        } else {
          let html = '<table style="width: 100%; border-collapse: collapse; color: var(--text-primary);">';
          html += '<thead><tr style="background: var(--bg-secondary); border-bottom: 2px solid var(--border-color);">';
          Object.keys(rows[0]).forEach(key => {
            html += `<th style="padding: 10px; text-align: left; font-weight: 600;">${key}</th>`;
          });
          html += '</tr></thead><tbody>';
          rows.forEach((row, idx) => {
            html += `<tr style="border-bottom: 1px solid var(--border-color); ${idx % 2 === 0 ? 'background: var(--bg-secondary);' : ''}">`;
            Object.values(row).forEach(val => {
              html += `<td style="padding: 10px;">${val}</td>`;
            });
            html += '</tr>';
          });
          html += '</tbody></table>';
          sqlResults.innerHTML = html;
        }
      }

      // Validación de éxito
      let isSuccess = false;
      if (typeof lv.validator === 'function') {
        try {
          isSuccess = !!lv.validator(rows, inputs);
        } catch (e) {
          console.warn('[ui.js] Error en validator:', e);
        }
      } else {
        isSuccess = Array.isArray(rows) && rows.length > 0;
      }

      // Feedback
      if (feedback) {
        feedback.innerHTML = '';
        const p = document.createElement('p');
        p.className = isSuccess ? 'ok' : 'err';
        p.textContent = isSuccess
          ? (lv.successText || '✅ ¡Correcto! Nivel completado.')
          : (lv.failText || '❌ Aún no. Revisa la query e intenta nuevamente.');
        feedback.appendChild(p);
      }

      // Si completó por primera vez, sumar score y avanzar
      if (isSuccess && !gameState.completedLevels.has(currentIndex)) {
        stopLevelTimer();

        const levelTime = Math.floor((Date.now() - gameState.levelStartTime) / 1000);
        gameState.levelTimes[currentIndex] = levelTime;

        const hintsUsed = lv._usedHints || 0;
        const attempts = gameState.levelAttempts[currentIndex];
        const score = calculateScore(levelTime, hintsUsed, attempts);

        gameState.totalScore += score;
        gameState.completedLevels.add(currentIndex);

        updateStats();
        renderLevelsList();

        if (feedback) {
          const scoreP = document.createElement('p');
          scoreP.style.cssText = 'background: rgba(34, 197, 94, 0.1); border: 1px solid var(--success); color: var(--success); padding: 12px; border-radius: 8px; margin-top: 10px; font-weight: 600;';
          scoreP.textContent = `🎯 +${score} puntos | ⏱️ Tiempo: ${formatTime(levelTime)} | 💡 Pistas: ${hintsUsed} | 🎲 Intentos: ${attempts}`;
          feedback.appendChild(scoreP);
        }

        setTimeout(() => {
          if (currentIndex < LEVELS.length - 1) {
            currentIndex++;
            renderLevel();
            renderLevelsList();
            startLevelTimer();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            showFinalScreen();
          }
        }, 2000);
      }
    }

    function showHint() {
      const lv = LEVELS[currentIndex];
      if (!lv) return;

      const used = (lv._usedHints = (lv._usedHints || 0) + 1);
      gameState.totalHints++;
      updateStats();

      const hint = lv.hints?.[used - 1] || 'Recuerda: cierra comillas y usa comentarios.';
      if (feedback) {
        const p = document.createElement('p');
        p.className = 'text-secondary';
        p.textContent = `💡 Pista ${used}: ${hint}`;
        feedback.appendChild(p);
      }
    }

    function resetLevel() {
      (LEVELS[currentIndex]?.ui?.inputs || []).forEach(inp => {
        const el = document.getElementById(`in_${inp.id}`);
        if (el) el.value = '';
      });
      if (feedback) feedback.innerHTML = '';
      if (queryBox) queryBox.style.display = 'none';
      if (resultsBox) resultsBox.style.display = 'none';
      updateServerCode();
    }

    function gotoNext() {
      if (!LEVELS.length) return;
      const nextIndex = currentIndex + 1;
      if (nextIndex >= LEVELS.length) return;
      if (!gameState.completedLevels.has(currentIndex)) return;

      stopLevelTimer();
      currentIndex = nextIndex;
      renderLevel();
      renderLevelsList();
      startLevelTimer();
    }

    function gotoPrev() {
      if (!LEVELS.length || currentIndex === 0) return;
      stopLevelTimer();
      currentIndex = currentIndex - 1;
      renderLevel();
      renderLevelsList();
      startLevelTimer();
    }

    function showFinalScreen() {
      stopLevelTimer();
      if (totalTimerInterval) {
        clearInterval(totalTimerInterval);
        totalTimerInterval = null;
      }

      appContainer.style.display = 'none';
      finalScreen.style.display = 'block';

      const totalTime = Math.floor((Date.now() - gameState.startTime) / 1000);
      const avgTime = Math.floor(totalTime / LEVELS.length);

      document.getElementById('finalTime').textContent = formatTime(totalTime);
      document.getElementById('finalScore').textContent = gameState.totalScore;
      document.getElementById('finalCompleted').textContent = `${gameState.completedLevels.size}/${LEVELS.length}`;
      document.getElementById('finalHints').textContent = gameState.totalHints;
      document.getElementById('finalAverage').textContent = formatTime(avgTime);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function restartGame() {
      // 🔒 Limpia timers activos antes de reiniciar
      if (levelTimerInterval) {
        clearInterval(levelTimerInterval);
        levelTimerInterval = null;
      }
      if (totalTimerInterval) {
        clearInterval(totalTimerInterval);
        totalTimerInterval = null;
      }

      gameState.totalScore = 0;
      gameState.completedLevels.clear();
      gameState.totalHints = 0;
      gameState.startTime = null;
      gameState.levelStartTime = null;
      gameState.levelTimes = {};

      LEVELS.forEach((lv, idx) => {
        lv._usedHints = 0;
        gameState.levelAttempts[idx] = 0;
      });

      currentIndex = 0;

      finalScreen.style.display = 'none';
      appContainer.style.display = 'block';

      updateStats();
      renderLevelsList();
      renderLevel();

      // ✅ Arranca timers limpios
      startTotalTimer();
      startLevelTimer();

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ==== EVENTOS ====
    if (startBtn) {
      startBtn.addEventListener('click', async () => {
        try {
          await loadLevels();
          if (hero) hero.style.display = 'none';
          appContainer.style.display = 'block';

          currentIndex = 0;
          renderLevelsList();
          renderLevel();
          updateStats();
          startTotalTimer();
          startLevelTimer();
        } catch (e) {
          console.error('[ui.js] Error cargando niveles:', e && e.message, e && e.stack);
          if (hero) hero.style.display = 'none';
          appContainer.style.display = 'block';
          if (levelsList) levelsList.innerHTML = '<li style="color:#dc2626">⚠️ Error al cargar niveles</li>';
          if (levelTitle) levelTitle.textContent = 'Error';
          if (levelDesc) levelDesc.textContent = 'Revisa la consola para más detalles.';
        }
      });
    }

    if (restartBtn) restartBtn.addEventListener('click', restartGame);

    checkBtn && checkBtn.addEventListener('click', executeLevel);
    hintBtn && hintBtn.addEventListener('click', showHint);
    resetBtn && resetBtn.addEventListener('click', resetLevel);
    nextLevelBtn && nextLevelBtn.addEventListener('click', gotoNext);
    prevLevelBtn && prevLevelBtn.addEventListener('click', gotoPrev);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && appContainer && appContainer.style.display === 'block') {
        e.preventDefault();
        executeLevel();
      }
    });
  }));
})();
