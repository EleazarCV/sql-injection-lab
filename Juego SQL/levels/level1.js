// ========== LEVEL 1 ==========
// levels/level1.js
export const level1 = {
  id: 'L1',
  title: 'Login — Tautología (vulnerable)',
  desc: 'Login vulnerable: concatena username y password directamente en la consulta.',
  ui: {
    inputs: [
      { id: 'username', label: 'Usuario' },
      { id: 'password', label: 'Contraseña', type: 'password' }
    ],
    runText: 'Probar login (vulnerable)'
  },
  engine: {
    mode: 'vuln',
    sql: "SELECT id, username, secret FROM users WHERE username='{username}' AND password='{password}'",
    params: ['username', 'password']
  },
  serverCode: `// ❌ Ejemplo inseguro
String sql = "SELECT * FROM users WHERE username = '" + user +
             "' AND password = '" + pass + "'";`,
  hints: [
    'Cierra la comilla y usa -- para comentar el resto del query.',
    "Prueba una tautología: admin' OR '1'='1"
  ],
  validator: (rows) => (rows && rows.length > 0)
};

export default level1;
