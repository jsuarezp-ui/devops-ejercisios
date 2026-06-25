const fs = require('fs');
const path = require('path');
const { config } = require('./config');

// Se asegura de que exista la carpeta y el archivo de datos antes de usarlo.
function ensureDataFile() {
  const dir = path.dirname(config.dataFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(config.dataFile)) fs.writeFileSync(config.dataFile, '[]');
}

// Lee todo el historial de chequeos guardado.
function readChecks() {
  ensureDataFile();
  const raw = fs.readFileSync(config.dataFile, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch {
    // si el archivo se corrompió, devolvemos un historial vacío en vez de romper
    return [];
  }
}

// Agrega nuevos resultados al historial y lo guarda en disco.
function saveChecks(results) {
  const all = readChecks();
  all.push(...results);
  fs.writeFileSync(config.dataFile, JSON.stringify(all, null, 2));
  return all.length;
}

// Calcula estadísticas por objetivo: uptime (% de chequeos exitosos) y
// latencia promedio. Acepta una lista de chequeos para poder probarla fácil;
// si no se le pasa nada, lee el historial guardado.
function computeStats(checks = readChecks()) {
  const porNombre = {};

  for (const c of checks) {
    if (!porNombre[c.name]) {
      porNombre[c.name] = {
        name: c.name,
        url: c.url,
        total: 0,
        exitosos: 0,
        latencias: [],
      };
    }
    const s = porNombre[c.name];
    s.total += 1;
    if (c.ok) s.exitosos += 1;
    if (typeof c.latencyMs === 'number') s.latencias.push(c.latencyMs);
  }

  return Object.values(porNombre).map((s) => {
    const uptime = s.total ? (s.exitosos / s.total) * 100 : 0;
    const latProm = s.latencias.length
      ? Math.round(s.latencias.reduce((a, b) => a + b, 0) / s.latencias.length)
      : null;
    return {
      name: s.name,
      url: s.url,
      chequeos: s.total,
      uptime: Number(uptime.toFixed(2)),
      latenciaPromedioMs: latProm,
    };
  });
}

module.exports = { readChecks, saveChecks, computeStats, ensureDataFile };
