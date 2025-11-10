// ========== LEVEL 2 ==========
// levels/level2.js
export const level2 = {
  id: 'L2',
  title: 'Login — Comentario para bypass (vulnerable)',
  desc: 'Usa comentarios SQL para saltarte la comprobación de contraseña.',
  ui: {
    inputs: [
      { id: 'username', label: 'Usuario' },
      { id: 'password', label: 'Contraseña', type: 'password' }
    ],
    runText: 'Ejecutar login vulnerable'
  },
  engine: {
    mode: 'vuln',
    sql: "SELECT id, username, secret FROM users WHERE username='{username}' AND password='{password}'",
    params: ['username', 'password']
  },
  serverCode: `// ❌ Vulnerable a comentarios
String q = "SELECT * FROM users WHERE username='" + u + "' AND password='" + p + "'";`,
  hints: [
    "Usa '--' después del usuario para comentar la parte de la contraseña.",
    "Ejemplo: admin' --"
  ],
  validator: (rows) => (rows && rows.length > 0)
};
export default level2;
