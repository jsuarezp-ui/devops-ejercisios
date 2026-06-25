const test = require('node:test');
const assert = require('node:assert');
const { computeStats } = require('../src/store');

test('computeStats calcula uptime y latencia promedio por objetivo', () => {
  const checks = [
    { name: 'A', url: 'http://a', ok: true, latencyMs: 100 },
    { name: 'A', url: 'http://a', ok: false, latencyMs: 200 },
    { name: 'B', url: 'http://b', ok: true, latencyMs: 50 },
  ];

  const stats = computeStats(checks);
  const a = stats.find((s) => s.name === 'A');
  const b = stats.find((s) => s.name === 'B');

  assert.strictEqual(a.chequeos, 2);
  assert.strictEqual(a.uptime, 50); // 1 de 2 exitosos
  assert.strictEqual(a.latenciaPromedioMs, 150); // (100 + 200) / 2

  assert.strictEqual(b.chequeos, 1);
  assert.strictEqual(b.uptime, 100);
  assert.strictEqual(b.latenciaPromedioMs, 50);
});

test('computeStats devuelve una lista vacía cuando no hay datos', () => {
  assert.deepStrictEqual(computeStats([]), []);
});
