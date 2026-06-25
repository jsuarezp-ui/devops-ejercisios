const { config } = require('./config');

// Hace una petición HTTP GET a un objetivo y devuelve el resultado del chequeo:
// si está arriba, el código de estado, la latencia y un posible error.
async function checkTarget(target) {
  const start = Date.now();
  const controller = new AbortController();
  // si la petición tarda más del timeout, la cancelamos
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  const base = {
    name: target.name,
    url: target.url,
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await fetch(target.url, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'User-Agent': 'centinela/1.0' },
    });
    const latencyMs = Date.now() - start;
    // liberamos el cuerpo de la respuesta para no dejar la conexión abierta
    // (solo nos interesa el estado, no el contenido)
    await res.body?.cancel().catch(() => {});
    return {
      ...base,
      ok: res.ok,
      statusCode: res.status,
      latencyMs,
      error: null,
    };
  } catch (err) {
    const latencyMs = Date.now() - start;
    const error = err.name === 'AbortError' ? 'timeout' : err.message;
    return { ...base, ok: false, statusCode: null, latencyMs, error };
  } finally {
    clearTimeout(timer);
  }
}

// Chequea una lista de objetivos en paralelo.
async function checkAll(targets) {
  return Promise.all(targets.map(checkTarget));
}

module.exports = { checkTarget, checkAll };
