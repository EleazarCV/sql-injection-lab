// db.js
// Inicialización de SQL.js + función utilitaria para la DB en memoria
// Autor: Eleazar Cruz

import initSqlJs from 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/sql-wasm.js';

let SQL = null;
let DB = null;

// Key para localStorage — mantiene consistencia con main.js
export const STORAGE_KEY = 'sqlin_mod_v1';

// Asegura y devuelve la base de datos en memoria (singleton)
export async function ensureDB() {
  if (DB) return DB;

  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file) => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/' + file
    });
  }

  DB = new SQL.Database();

  // Crear tabla si no existe
  DB.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT,
      password TEXT,
      secret TEXT
    );
  `);

  // Insertar muestras **solo si la tabla está vacía**
  try {
    const countRes = DB.exec("SELECT COUNT(*) AS c FROM users;");
    const count = (countRes && countRes[0] && countRes[0].values && countRes[0].values[0]) 
      ? Number(countRes[0].values[0][0]) : 0;

    if (!count) {
      const stmt = DB.prepare("INSERT INTO users (id, username, password, secret) VALUES (?,?,?,?)");
      const sample = [
        [1, 'alice', 'alice123', 'flag_alice'],
        [2, 'bob', 'bobpwd', 'flag_bob'],
        [3, 'admin', 'supersecret', 'flag_admin']
      ];
      sample.forEach((r) => stmt.run(r));
      stmt.free();
    }
  } catch (e) {
    // en caso de error no fatal, devolvemos la DB tal cual (pero logueamos)
    console.warn('ensureDB: error comprobando/inserando muestras', e);
  }

  return DB;
}

// Export: convertir historial/attempts a CSV para descarga
export function exportResultsAsCSV(arr) {
  let csv = 'level,input,rows,timestamp\n';
  (arr || []).forEach(r => {
    const safeInput = (r.input || '').replace(/"/g, '""');
    csv += `${r.level},"${safeInput}",${r.rows},${r.ts}\n`;
  });
  return new Blob([csv], { type: 'text/csv' });
}
