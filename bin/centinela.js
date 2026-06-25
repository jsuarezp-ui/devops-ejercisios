#!/usr/bin/env node
const { program } = require('commander');
const chalk = require('chalk');
const { loadTargets } = require('../src/config');
const { checkAll } = require('../src/checker');
const { saveChecks, computeStats } = require('../src/store');
const { iniciar } = require('../src/server');
const { iniciarProgramador } = require('../src/scheduler');

program
  .name('centinela')
  .description('Monitor de disponibilidad de servicios web')
  .version('1.0.0');

// centinela check  -> chequea una vez y muestra el estado de cada servicio
program
  .command('check')
  .description('Chequea una vez todos los objetivos y muestra el resultado')
  .option('--no-save', 'no guardar el resultado en el historial')
  .action(async (opts) => {
    const targets = loadTargets();
    const resultados = await checkAll(targets);
    for (const r of resultados) {
      const estado = r.ok ? chalk.green('● ARRIBA') : chalk.red('● CAÍDO ');
      const detalle = r.statusCode ?? r.error;
      console.log(
        `${estado}  ${r.name.padEnd(12)} ${String(detalle).padEnd(10)} ${r.latencyMs}ms  ${r.url}`
      );
    }
    if (opts.save) saveChecks(resultados);
  });

// centinela stats  -> muestra el uptime acumulado de cada servicio
program
  .command('stats')
  .description('Muestra estadísticas de uptime por objetivo')
  .action(() => {
    const stats = computeStats();
    if (stats.length === 0) {
      console.log('Todavía no hay datos. Corre "centinela check" primero.');
      return;
    }
    for (const s of stats) {
      const color =
        s.uptime >= 99 ? chalk.green : s.uptime >= 90 ? chalk.yellow : chalk.red;
      console.log(
        `${s.name.padEnd(12)} uptime ${color(s.uptime + '%')}  ` +
          `lat ${s.latenciaPromedioMs ?? '-'}ms  (${s.chequeos} chequeos)`
      );
    }
  });

// centinela serve  -> levanta la API de monitoreo
program
  .command('serve')
  .description('Levanta la API de monitoreo')
  .action(() => iniciar());

// centinela watch  -> arranca los chequeos automáticos programados
program
  .command('watch')
  .description('Arranca el chequeo automático programado (cron)')
  .action(() => iniciarProgramador());

program.parse();
