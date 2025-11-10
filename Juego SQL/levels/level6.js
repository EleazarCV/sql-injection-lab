// ========== LEVEL 6 ==========
// levels/level6.js
export const level6 = {
  id: 'L6',
  title: 'Blind (boolean) — Simulado',
  desc: "El endpoint responde TRUE/FALSE; crea un payload que evalúe TRUE. Respuestas: 1=1 ó OR '1'='1'",
  ui: {
    inputs: [
      { id: 'probe', label: 'Payload / Prueba', placeholder: 'Ej: 1=1' }
    ],
    runText: 'Probar payload'
  },
  engine: {
    mode: 'sim',
    sql: 'SIMULATED BOOLEAN CHECK',
    params: []
  },
  serverCode: `// 🔍 Simulación de respuesta booleana
// La app responde TRUE si la condición es válida`,
  context: `Técnica: Blind SQL Injection (Boolean-based)
El servidor solo responde TRUE/FALSE, sin mostrar datos.
Objetivo: Crear un payload que siempre sea verdadero.`,
  hints: [
    'Respuesta fácil: 1=1 (siempre verdadero)',
    "Respuesta alternativa: OR '1'='1' (cierra comilla primero)"
  ],
  validator: (rows, inputs) => {
    const p = (inputs && (inputs.probe || '')) .toString().toLowerCase().trim();
    // Acepta: 1=1, OR '1'='1', AND 1=1, etc.
    return /1\s*=\s*1/.test(p) || /or\s+'1'\s*=\s*'1'/.test(p) || /and\s+1\s*=\s*1/.test(p);
  },
  successText: '✅ ¡Correcto! Payload booleano válido.',
  failText: "❌ Intenta con: 1=1 ó OR '1'='1'"
};

export default level6;