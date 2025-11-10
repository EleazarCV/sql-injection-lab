// ========== LEVEL 4 ==========
// levels/level4.js
export const level4 = {
  id: 'L4',
  title: 'Login seguro — Prepared Statement',
  desc: 'Mismo login, pero con parámetros. No es vulnerable a inyección.',
  ui: {
    inputs: [
      { id: 'username', label: 'Usuario' },
      { id: 'password', label: 'Contraseña', type: 'password' }
    ],
    runText: 'Probar login (seguro)'
  },
  engine: {
    mode: 'safe',
    sql: "SELECT id, username, secret FROM users WHERE username = ? AND password = ?",
    params: ['username', 'password']
  },
  serverCode: `// ✅ Ejemplo seguro
PreparedStatement ps = conn.prepareStatement(sql);
ps.setString(1, user);
ps.setString(2, pass);`,
  hints: [
    'Aquí no puedes usar inyección: debes ingresar credenciales válidas.',
    'Usuarios válidos: alice/alice123, bob/bobpwd, admin/supersecret'
  ],
  // En modo "safe" la comprobación espera credenciales válidas (rows > 0)
  validator: (rows) => Array.isArray(rows) && rows.length > 0,
  successText: '✅ Login correcto — estás usando prepared statements.',
  failText: '❌ Credenciales inválidas o falta entrada válida.'
};

export default level4;