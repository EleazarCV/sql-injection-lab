// levels/level10.js
const level10 = {
  id: 'L10',
  title: 'Reto final — Aplicación segura',
  desc: 'Explica cómo protegerías una aplicación contra inyección SQL (mínimo 10 caracteres).',
  ui: {
    inputs: [
      { id: 'answer', label: 'Tu respuesta', placeholder: 'Ej: Usaría prepared statements y validación...' }
    ],
  },
  engine: { mode: 'none', sql: '-- Final Challenge', params: [] },
  serverCode: `// ✅ Defensa contra SQL Injection
// 1. Prepared Statements
// 2. Validación de entrada
// 3. Escapar caracteres
// 4. Principio de menor privilegio
// 5. Logs y monitoreo`,
  context: `Reto Final: Defensa contra SQL Injection

Basándote en lo aprendido, explica cómo protegerías una aplicación.

Puntos a considerar:
✓ Prepared Statements / Parametrización
✓ Validación de entrada
✓ Escapar caracteres especiales
✓ Principio de menor privilegio
✓ Logs y alertas de seguridad`,
  hints: [
    'Mínimo 10 caracteres para validar tu respuesta.',
    'Ejemplo válido: "Usaría consultas parametrizadas, validación backend estricta y logs de seguridad"'
  ],
  validator: (rows, inputs) => {
    const answer = (inputs?.answer || '').trim();
    return answer.length > 10;
  },
  successText: '✅ ¡Felicidades! Completaste todos los 10 niveles. 🎓',
  failText: '❌ Debes escribir al menos 10 caracteres en tu respuesta.'
};

export default level10;
