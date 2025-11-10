// ========== LEVEL 7 ==========
// levels/level7.js
export const level7 = {
  id: 'L7',
  title: 'Escape / Encoding (concepto)',
  desc: 'Escapar caracteres especiales evita que la inyección funcione. Escribe cualquier cosa y avanza.',
  ui: {
    inputs: [
      { id: 'val', label: 'Valor a escapar', placeholder: "Ej: admin' OR '1'='1" }
    ],
    runText: 'Probar'
  },
  engine: {
    mode: 'safe',
    sql: 'SELECT id, username FROM users WHERE username = ?',
    params: ['val']
  },
  serverCode: `// ✅ Escape de caracteres especiales (seguro)
String safe = StringEscapeUtils.escapeSql(input);
ps.setString(1, safe);
ResultSet rs = ps.executeQuery();`,
  context: `Concepto: Escape / Encoding
Cuando los caracteres especiales se escapan, la inyección no funciona.
- Comilla (') → \\' 
- Comilla doble (") → \\" 
- Barra invertida (\\) → \\\\`,
  hints: [
    'Nivel educativo: escribe lo que quieras, el sistema lo escapará.',
    'Las librerías como OWASP ESAPI neutralizan ataques automáticamente.'
  ],
  // Este nivel avanza siempre: educativo
  validator: () => true,
  successText: '✅ ¡Correcto! Entendiste el concepto de escape.',
  failText: '❌ (Este nivel siempre avanza - es educativo)'
};

export default level7;
