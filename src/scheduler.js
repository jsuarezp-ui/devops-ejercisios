const cron = require('node-cron');
const { config, loadTargets } = require('./config');
const { checkAll } = require('./checker');
const { saveChecks } = require('./store');

// Corre una ronda de chequeos sobre todos los objetivos y guarda el resultado.
async function correrChequeo() {
  const targets = loadTargets();
  const resultados = await checkAll(targets);
  saveChecks(resultados);
  const caidos = resultados.filter((r) => !r.ok);
  console.log(
    `[${new Date().toISOString()}] ${resultados.length} chequeos, ${caidos.length} caído(s)`
  );
  return resultados;
}

// Programa los chequeos automáticos según la expresión cron de la config.
function iniciarProgramador() {
  console.log(`Programando chequeos con cron "${config.intervalCron}"`);
  cron.schedule(config.intervalCron, correrChequeo);
  // hacemos un primer chequeo de inmediato para no esperar al primer tick
  correrChequeo();
}

module.exports = { correrChequeo, iniciarProgramador };

if (require.main === module) {
  iniciarProgramador();
}
