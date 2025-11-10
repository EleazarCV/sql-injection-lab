<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#f4f7fb" />
  <title>SQL Injection Lab — by Eleazar Cruz</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" />
  <link rel="icon" href="https://cdn-icons-png.flaticon.com/512/2965/2965278.png" />
  <style>
    /* ===== Variables de tema ===== */
    :root {
      --bg-primary: #f4f7fb;
      --bg-secondary: #ffffff;
      --bg-card: #ffffff;
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --text-muted: #64748b;
      --border-color: #e2e8f0;
      --shadow: rgba(0,0,0,0.1);
      --success: #22c55e;
      --error: #ef4444;
    }

    body.dark-mode {
      --bg-primary: #0f172a;
      --bg-secondary: #1e293b;
      --bg-card: #1e293b;
      --text-primary: #f1f5f9;
      --text-secondary: #cbd5e1;
      --text-muted: #94a3b8;
      --border-color: #334155;
      --shadow: rgba(0,0,0,0.3);
      --success: #10b981;
      --error: #f87171;
    }

    /* ===== Estilos base ===== */
    * {
      box-sizing: border-box;
    }

    body {
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-family: 'Segoe UI', Roboto, sans-serif;
      transition: background 0.4s ease, color 0.4s ease;
      min-height: 100vh;
    }

    /* Botón de modo oscuro */
    .theme-toggle {
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--bg-secondary);
      border: 2px solid var(--border-color);
      border-radius: 50%;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.5rem;
      transition: all 0.3s ease;
      z-index: 1000;
      box-shadow: 0 2px 8px var(--shadow);
    }

    .theme-toggle:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px var(--shadow);
    }

    /* Pantalla inicial */
    .hero {
      text-align: center;
      margin-top: 6vh;
      padding: 20px;
    }

    .hero img {
      width: 130px;
      margin-bottom: 15px;
      filter: drop-shadow(0 4px 6px var(--shadow));
    }

    .hero h1 {
      font-weight: 700;
      margin-bottom: 5px;
      font-size: 2.5rem;
    }

    .hero p {
      color: var(--text-secondary);
      margin-bottom: 18px;
      font-size: 1.1rem;
    }

    .btn-start {
      font-size: 1.1rem;
      padding: 12px 24px;
      border-radius: 10px;
      background: linear-gradient(90deg, #0b5cff, #2563eb);
      color: #fff;
      border: none;
      transition: transform 0.3s ease, filter 0.3s ease;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-start:hover {
      transform: scale(1.05);
      filter: brightness(1.15);
    }

    .link-secondary {
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .link-secondary:hover {
      color: var(--text-secondary);
      text-decoration: underline;
    }

    /* Contenedor del juego */
    #appContainer {
      display: none;
      padding: 20px 0;
      animation: fadeIn 0.5s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .hero.hidden {
      display: none;
    }

    /* Layout del juego */
    .game-layout {
      display: grid;
      grid-template-columns: 250px 1fr;
      gap: 20px;
      margin-top: 20px;
    }

    @media (max-width: 768px) {
      .game-layout {
        grid-template-columns: 1fr;
      }
    }

    /* Sidebar de niveles */
    .levels-sidebar {
      background: var(--bg-card);
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px var(--shadow);
      border: 1px solid var(--border-color);
      height: fit-content;
      position: sticky;
      top: 20px;
    }

    .levels-sidebar h3 {
      font-size: 1.2rem;
      margin-bottom: 15px;
      color: var(--text-primary);
      font-weight: 600;
    }

    #levelsList {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    #levelsList li {
      padding: 10px 12px;
      margin-bottom: 8px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: var(--text-secondary);
      font-size: 0.95rem;
    }

    #levelsList li:hover {
      background: var(--bg-primary);
      color: var(--text-primary);
    }

    #levelsList li.active {
      background: linear-gradient(90deg, #0b5cff, #2563eb);
      color: white;
      font-weight: 600;
    }

    /* Área principal del nivel */
    .level-main {
      background: var(--bg-card);
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 8px var(--shadow);
      border: 1px solid var(--border-color);
    }

    .level-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 10px;
    }

    #levelTitle {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }

    #levelBadge {
      background: var(--bg-primary);
      color: var(--text-secondary);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    #levelDescription {
      color: var(--text-secondary);
      margin-bottom: 25px;
      line-height: 1.6;
    }

    /* Challenge box */
    #challengeBox {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
    }

    #challengeBox pre {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 15px;
      overflow-x: auto;
      color: var(--text-primary);
      font-size: 0.9rem;
    }

    /* Form controls */
    .form-label {
      color: var(--text-primary);
      font-weight: 500;
      margin-bottom: 8px;
    }

    .form-control {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      border-radius: 8px;
      padding: 10px 14px;
      transition: all 0.2s ease;
    }

    .form-control:focus {
      background: var(--bg-secondary);
      border-color: #2563eb;
      color: var(--text-primary);
      outline: none;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    /* Botones de acción */
    .action-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 20px;
    }

    .btn {
      padding: 10px 20px;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: linear-gradient(90deg, #0b5cff, #2563eb);
      color: white;
    }

    .btn-primary:hover {
      filter: brightness(1.1);
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: var(--bg-primary);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }

    .btn-secondary:hover {
      background: var(--bg-secondary);
    }

    /* Navegación de niveles */
    .level-navigation {
      display: flex;
      gap: 10px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid var(--border-color);
    }

    /* Feedback */
    #feedback {
      margin-top: 20px;
      padding: 15px;
      border-radius: 8px;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    #feedback p.ok {
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid var(--success);
      color: var(--success);
      padding: 12px;
      border-radius: 8px;
      margin: 0 0 10px 0;
      font-weight: 600;
    }

    #feedback p.err {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid var(--error);
      color: var(--error);
      padding: 12px;
      border-radius: 8px;
      margin: 0 0 10px 0;
    }

    #feedback .text-secondary {
      color: var(--text-secondary);
      font-style: italic;
      padding: 8px;
      margin: 5px 0;
    }

    /* Footer */
    footer {
      margin-top: 50px;
      padding: 20px;
      text-align: center;
      font-size: 0.9rem;
      color: var(--text-muted);
    }
  </style>
</head>
<body>
  <!-- Botón de modo oscuro -->
  <button class="theme-toggle" id="themeToggle" title="Cambiar tema">
    <span id="themeIcon">🌙</span>
  </button>

  <!-- Pantalla inicial -->
  <div class="hero container" id="heroScreen">
    <img src="https://cdn-icons-png.flaticon.com/512/2965/2965278.png" alt="SQL Logo" />
    <h1>SQL Injection Lab</h1>
    <p>Un entorno educativo interactivo sobre seguridad SQL</p>
    <button id="startGame" class="btn-start">🚀 Iniciar Juego</button>
    <div class="mt-3">
      <a href="https://www.w3schools.com/sql/sql_injection.asp" target="_blank" class="link-secondary">📖 Aprende sobre SQL Injection</a>
    </div>
  </div>

  <!-- Área del juego -->
  <div id="appContainer">
    <div class="container">
      <div class="game-layout">
        <!-- Sidebar de niveles -->
        <aside class="levels-sidebar">
          <h3>📚 Niveles</h3>
          <ul id="levelsList"></ul>
        </aside>

        <!-- Área principal del nivel -->
        <main class="level-main">
          <div class="level-header">
            <h2 id="levelTitle">Cargando nivel...</h2>
            <span id="levelBadge">1/5</span>
          </div>
          
          <p id="levelDescription">Descripción del nivel</p>
          
          <!-- Challenge box donde se renderizan los inputs -->
          <div id="challengeBox"></div>
          
          <!-- Botones de acción -->
          <div class="action-buttons">
            <button id="checkBtn" class="btn btn-primary">✓ Verificar</button>
            <button id="hintBtn" class="btn btn-secondary">💡 Pista</button>
            <button id="resetBtn" class="btn btn-secondary">↻ Reiniciar</button>
          </div>
          
          <!-- Feedback -->
          <div id="feedback"></div>
          
          <!-- Navegación entre niveles -->
          <div class="level-navigation">
            <button id="prevLevel" class="btn btn-secondary">← Anterior</button>
            <button id="nextLevel" class="btn btn-secondary">Siguiente →</button>
          </div>
        </main>
      </div>
    </div>
  </div>

  <!-- Créditos -->
  <footer>
    Creado por <strong>Eleazar Cruz</strong> · Proyecto educativo 2025
  </footer>

  <!-- Script para modo oscuro -->
  <script>
    // Modo oscuro con persistencia en memoria
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    let isDarkMode = false;

    themeToggle.addEventListener('click', () => {
      isDarkMode = !isDarkMode;
      document.body.classList.toggle('dark-mode');
      themeIcon.textContent = isDarkMode ? '☀️' : '🌙';
      
      // Actualizar meta theme-color
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.content = isDarkMode ? '#0f172a' : '#f4f7fb';
      }
    });
  </script>

  <!-- Tu lógica de UI del juego -->
  <script type="module" src="js/ui.js"></script>
</body>
</html>