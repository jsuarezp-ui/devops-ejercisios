const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const { checkTarget } = require('../src/checker');

// Levanta un servidor HTTP de prueba en un puerto libre para no depender
// de internet en los tests.
function servidorDePrueba(handler) {
  return new Promise((resolve) => {
    const server = http.createServer(handler);
    server.listen(0, () => resolve(server));
  });
}

test('checkTarget marca ok cuando el servicio responde 200', async () => {
  const server = await servidorDePrueba((req, res) => {
    res.writeHead(200);
    res.end('ok');
  });
  const { port } = server.address();

  const r = await checkTarget({ name: 'Local', url: `http://localhost:${port}` });

  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.statusCode, 200);
  assert.strictEqual(typeof r.latencyMs, 'number');
  assert.strictEqual(r.error, null);

  server.close();
});

test('checkTarget marca caído cuando el servicio responde 500', async () => {
  const server = await servidorDePrueba((req, res) => {
    res.writeHead(500);
    res.end('boom');
  });
  const { port } = server.address();

  const r = await checkTarget({ name: 'Local', url: `http://localhost:${port}` });

  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.statusCode, 500);

  server.close();
});

test('checkTarget captura el error cuando no hay nada escuchando', async () => {
  // puerto 1: prácticamente garantizado que no hay nada ahí
  const r = await checkTarget({ name: 'Muerto', url: 'http://localhost:1' });

  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.statusCode, null);
  assert.ok(r.error, 'debería tener un mensaje de error');
});
