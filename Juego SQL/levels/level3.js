// ========== LEVEL 3 ==========
// levels/level3.js
export const level3 = {
  id: 'L3',
  title: 'UNION SELECT — Extraer datos',
  desc: 'Usa UNION para combinar resultados y extraer información secreta.',
  ui: {
    inputs: [
      { id: 'username', label: 'Usuario' }
    ],
    runText: 'Ejecutar consulta'
  },
  engine: {
    mode: 'vuln',
    sql: "SELECT id, username, secret FROM users WHERE username='{username}'",
    params: ['username']
  },
  serverCode: `// ❌ Ejemplo vulnerable con UNION
String q = "SELECT id, username, secret FROM users WHERE username='" + u + "'";`,
  hints: [
    'UNION puede combinar resultados si las columnas coinciden (mismo número y tipos compatibles).',
    "Ejemplo: admin' UNION SELECT 1, 'hacker', 'flag_union' --"
  ],
  // Éxito si hay al menos una fila (resultado combinado por UNION)
  validator: (rows) => Array.isArray(rows) && rows.length > 0
};

export default level3;