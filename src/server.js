const express = require('express');
const { config } = require('./config');
const { readChecks, computeStats } = require('./store');

// Construye la app de Express con sus rutas. La separamos de listen() para
// poder probar las rutas sin levantar un puerto fijo.
function crearApp() {
  const app = express();
  app.use(express.json());

  // Salud del propio servicio de monitoreo.
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // Últimos chequeos registrados (los más recientes primero).
  app.get('/api/checks', (req, res) => {
    const limit = Number(req.query.limit) || 50;
    const checks = readChecks();
    res.json(checks.slice(-limit).reverse());
  });

  // Estadísticas agregadas por objetivo (uptime y latencia).
  app.get('/api/stats', (req, res) => {
    res.json(computeStats());
  });

  return app;
}

function iniciar() {
  const app = crearApp();
  return app.listen(config.port, () => {
    console.log(`Centinela escuchando en http://localhost:${config.port}`);
  });
}

module.exports = { crearApp, iniciar };

// Permite correrlo directo con: node src/server.js
if (require.main === module) {
  iniciar();
}
