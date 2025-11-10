// ========== LEVEL 9 ==========
// levels/level9.js
export const level9 = {
  id: 'L9',
  title: 'Timing Attack — Side Channel (simulado)',
  desc: 'El tiempo de respuesta revela información. Respuesta: cualquier cosa - es educativo.',
  ui: {
    inputs: [
      { id: 'payload', label: 'Payload (simulado)', placeholder: 'Ej: admin' }
    ],
    runText: 'Probar'
  },
  engine: {
    mode: 'sim',
    sql: 'TIMING',
    params: []
  },
  serverCode: `// ⏱️ Timing Attack - Side Channel (pseudo)
// Respuesta lenta = contraseña correcta
// Respuesta rápida = contraseña incorrecta
if (password.equals(inputPassword)) {
  Thread.sleep(500); // Demora intencional
  return true;
}
return false; // Respuesta inmediata`,
  context: `Concepto: Timing Attack (Ataque por Tiempo)
Algunas aplicaciones revelan información a través del tiempo de respuesta:
- Si la contraseña es correcta → respuesta lenta (procesa datos)
- Si es incorrecta → respuesta rápida (rechaza inmediatamente)

Atacante: midiendo tiempos, puede deducir la contraseña carácter por carácter.`,
  hints: [
    'Nivel educativo: escribe lo que quieras, el sistema simula una respuesta.',
    'Concepto: diferencias de tiempo pueden filtrar información sensible.'
  ],
  // Avance automático (educativo)
  validator: () => true,
  successText: '✅ Entendiste el concepto de Side Channel Timing Attack.',
  failText: '❌ (Este nivel siempre avanza - es educativo)'
};

export default level9;
