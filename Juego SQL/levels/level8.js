// ========== LEVEL 8 ==========
// levels/level8.js
export const level8 = {
  id: 'L8',
  title: 'Stored Procedures y Whitelisting',
  desc: 'Solo comandos aprobados se ejecutan: concepto de whitelist. Respuestas: SELECT, INSERT, UPDATE',
  ui: {
    inputs: [
      { id: 'cmd', label: 'Comando simulado', placeholder: 'Ej: SELECT' }
    ],
    runText: 'Enviar comando'
  },
  engine: {
    mode: 'sim',
    sql: 'WHITELIST CHECK',
    params: []
  },
  serverCode: `// ✅ Validación por lista blanca (pseudo)
const allowed = ['SELECT', 'INSERT', 'UPDATE'];
if (!allowed.includes(cmd.toUpperCase())) throw new SecurityException();`,
  context: `Concepto: Whitelist (Lista Blanca)
Solo ciertos comandos predefinidos pueden ejecutarse.
Comandos permitidos: SELECT, INSERT, UPDATE
Comandos bloqueados: DROP, DELETE, ALTER, EXEC, etc.`,
  hints: [
    'Intenta con: SELECT, INSERT ó UPDATE',
    'Solo comandos en la lista blanca serán aceptados.'
  ],
  validator: (rows, inputs) => {
    const cmd = (inputs && inputs.cmd || '').toUpperCase().trim();
    const allowed = ['SELECT', 'INSERT', 'UPDATE'];
    return allowed.includes(cmd);
  },
  successText: '✅ ¡Correcto! Comando autorizado.',
  failText: '❌ Comando no en lista blanca. Intenta: SELECT, INSERT, UPDATE'
};

export default level8;