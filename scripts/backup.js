const fs = require('fs');
const path = require('path');
const { config } = require('../src/config');

// Tarea de automatización: crea una copia de seguridad del historial de
// chequeos con la fecha en el nombre, y borra los backups más viejos que
// RETENCION_DIAS para que la carpeta no crezca sin control.
const RETENCION_DIAS = Number(process.env.RETENCION_DIAS) || 7;

function backup() {
  const backupsDir = path.join(config.root, 'backups');
  if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });

  if (!fs.existsSync(config.dataFile)) {
    console.log('No hay datos que respaldar todavía.');
    return;
  }

  const sello = new Date().toISOString().replace(/[:.]/g, '-');
  const destino = path.join(backupsDir, `checks-${sello}.json`);
  fs.copyFileSync(config.dataFile, destino);
  console.log(`Backup creado: ${path.relative(config.root, destino)}`);

  limpiarViejos(backupsDir);
}

// Borra backups con más de RETENCION_DIAS de antigüedad.
function limpiarViejos(dir) {
  const limite = Date.now() - RETENCION_DIAS * 24 * 60 * 60 * 1000;
  let borrados = 0;
  for (const archivo of fs.readdirSync(dir)) {
    const ruta = path.join(dir, archivo);
    if (fs.statSync(ruta).mtimeMs < limite) {
      fs.unlinkSync(ruta);
      borrados += 1;
    }
  }
  if (borrados) console.log(`Limpieza: ${borrados} backup(s) viejo(s) borrado(s).`);
}

if (require.main === module) backup();

module.exports = { backup };
