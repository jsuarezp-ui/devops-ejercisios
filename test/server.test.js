const test = require('node:test');
const assert = require('node:assert');
const { crearApp } = require('../src/server');

test('GET /health responde con status ok', async () => {
  const server = crearApp().listen(0);
  const { port } = server.address();

  const res = await fetch(`http://localhost:${port}/health`);
  const body = await res.json();

  assert.strictEqual(res.status, 200);
  assert.strictEqual(body.status, 'ok');
  assert.ok(typeof body.uptime === 'number');

  server.close();
});

test('GET /api/stats responde con un arreglo', async () => {
  const server = crearApp().listen(0);
  const { port } = server.address();

  const res = await fetch(`http://localhost:${port}/api/stats`);
  const body = await res.json();

  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(body));

  server.close();
});
