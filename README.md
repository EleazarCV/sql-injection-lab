# SQL Injection Lab — Eleazar Cruz

**Proyecto educativo**: laboratorio interactivo para aprender técnicas de SQL Injection y defensas (prepared statements, escape, whitelist, etc.). Interfaz web con 10 niveles didácticos (vulnerables, simulados y seguros).

## Descripción
Aplicación estática (HTML/CSS/JS) que simula escenarios de SQL Injection para uso educativo. Cada nivel presenta un reto distinto (login vulnerable, UNION, blind, prepared statements, etc.) y muestra ejemplos de código del lado servidor para ilustrar buenas/malas prácticas.

## Features principales
- 10 niveles con modos: `vuln`, `safe`, `sim`, `none`.
- Motor SQL simulado (no usa DB real).
- Temporizador, puntuación y pistas.
- Código del servidor visible por nivel.
- Modo claro/oscuro.
- Niveles en `levels/*.js` para extender fácilmente.

## Estructura del proyecto
/
├─ index.html

├─ README.md

├─ css/

├─ js/

│ ├─ ui.js

│ └─ db.js

├─ levels/

│ ├─ level1.js

│ ├─ level2.js

│ └─ levels.js

└─ images/ (opcional)


## Requisitos
Un navegador moderno. Para evitar restricciones de módulos ES (imports) sirve el proyecto con un servidor HTTP simple (Python/Node).

## Ejecutar localmente

### Opción A — Python 3
Desde la raíz del proyecto:
```bash
python3 -m http.server 8080
Abrir en el navegador: http://localhost:8080/

(Si prefieres otro puerto reemplaza 8080 por 3000, 8000, etc.)
```

Opción B — Node (http-server)
```bash
npm install -g http-server
http-server -p 8080
# abrir http://localhost:8080
```
Problema común: puerto 8000 ocupado
Si python -m http.server 8000 falla y 8080 funciona, otro proceso usa el puerto 8000.

Detectar proceso en Linux/macOS:

```bash
lsof -i :8000
# o
fuser -v 8000/tcp
```
En Windows (PowerShell):

```bash
powershell
netstat -ano | findstr :8000
```
Cerrar proceso (Linux ejemplo):

```bash
Copy code
lsof -ti :8000 | xargs kill -9
```
## Recomendación
Usa puertos altos durante el desarrollo (por ejemplo: **8080**, **3000**) para evitar conflictos con procesos del sistema.

---

## Cómo jugar / usar
1. Sirve el proyecto localmente y abre `index.html`.  
2. Pulsa **Iniciar Juego**.  
3. Selecciona un nivel en la columna izquierda.  
4. Lee la descripción y el **código del servidor** mostrado.  
5. Introduce payloads / valores y pulsa **Ejecutar Query**.  
6. Pulsa **Pista** si lo necesitas. Al completar niveles sumarás puntuación.

> **Nota:** la "base de datos" es un *array simulado* (no persistente) en `js/ui.js` o `js/db.js`.

---

## Añadir / editar niveles
- Cada nivel se define en `levels/levelN.js` y **exporta** un objeto `level`.
- Campos clave del objeto `level`:
  - `id`  
  - `title`  
  - `desc`  
  - `ui.inputs`  
  - `engine.mode`  
  - `engine.sql`  
  - `hints`  
  - `validator(rows, inputs)`  
  - `serverCode`

Asegúrate de importar el nuevo archivo en `levels/levels.js`.

---

**Creado por Eleazar Cruz — Proyecto educativo 2025.**

