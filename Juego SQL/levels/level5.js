// ========== LEVEL 5 ==========
// levels/level5.js
export const level5 = {
  id: 'L5',
  title: 'Búsqueda segura (LIKE con parámetros)',
  desc: 'Usa LIKE con parámetros para búsquedas seguras. Respuesta: al%',
  ui: {
    inputs: [
      { id: 'pattern', label: 'Patrón (ej: al%)' }
    ],
    runText: 'Buscar'
  },
  engine: {
    mode: 'safe',
    sql: "SELECT id, username, secret FROM users WHERE username LIKE ?",
    params: ['pattern']
  },
  serverCode: `// ✅ LIKE parametrizado (seguro)
ps.setString(1, pattern);
ResultSet rs = ps.executeQuery();`,
  hints: [
    'Respuesta: al% (encuentra usuarios que empiezan con "al")',
    'El % es un comodín. Prueba: al%, a%, admin%, etc.'
  ],
  validator: (rows, inputs) => {
    if (!Array.isArray(rows) || rows.length === 0) return false;
    const pattern = (inputs && inputs.pattern) || '';
    // Valida que el usuario haya usado el comodín % y que haya resultados
    return pattern.includes('%') && rows.length > 0;
  },
  successText: '✅ ¡Correcto! LIKE parametrizado completado.',
  failText: '❌ Usa un patrón con % (ej: al%)'
};

export default level5;