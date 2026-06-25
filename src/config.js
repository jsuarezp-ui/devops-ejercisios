const fs = require('fs');
const path = require('path');
require('dotenv').config();

const ROOT = path.resolve(__dirname, '..');

// Configuración central de la app. Todo lo que se pueda cambiar por entorno
// (puerto, frecuencia del cron, timeout) sale de variables de entorno con
// un valor por defecto razonable.
const config = {
  port: Number(process.env.PORT) || 3000,
  // expresión cron para el chequeo automático (por defecto cada 5 minutos)
  intervalCron: process.env.CRON || '*/5 * * * *',
  // cuánto esperar como máximo por cada petición, en milisegundos
  timeoutMs: Number(process.env.TIMEOUT_MS) || 5000,
  dataFile: path.join(ROOT, 'data', 'checks.json'),
  targetsFile: path.join(ROOT, 'config', 'targets.json'),
  root: ROOT,
};

// Lee la lista de servicios a vigilar desde config/targets.json.
function loadTargets() {
  const raw = fs.readFileSync(config.targetsFile, 'utf-8');
  return JSON.parse(raw).targets;
}

module.exports = { config, loadTargets };
