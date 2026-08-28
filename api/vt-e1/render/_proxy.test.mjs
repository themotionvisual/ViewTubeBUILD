import assert from 'node:assert/strict';
import test from 'node:test';

const original = {
  serviceUrl: process.env.VT_E1_RENDER_SERVICE_URL,
  fallbackUrl: process.env.RENDER_SERVICE_URL,
  timeout: process.env.VT_E1_RENDER_PROXY_TIMEOUT_MS,
  secret: process.env.VT_E1_RENDER_SHARED_SECRET,
};

const restore = () => {
  for (const [key, value] of Object.entries({
    VT_E1_RENDER_SERVICE_URL: original.serviceUrl,
    RENDER_SERVICE_URL: original.fallbackUrl,
    VT_E1_RENDER_PROXY_TIMEOUT_MS: original.timeout,
    VT_E1_RENDER_SHARED_SECRET: original.secret,
  })) {
    if (typeof value === 'undefined') delete process.env[key];
    else process.env[key] = value;
  }
};

test('render proxy reports a clear unavailable state when a worker is not configured', async () => {
  delete process.env.VT_E1_RENDER_SERVICE_URL;
  delete process.env.RENDER_SERVICE_URL;
  const { proxyVtE1RenderRequest } = await import(`./_proxy.mjs?missing=${Date.now()}`);
  const headers = {};
  let body = '';
  const res = {
    writeHead(status, nextHeaders) {
      this.status = status;
      Object.assign(headers, nextHeaders);
    },
    end(value = '') { body += value; },
  };
  await proxyVtE1RenderRequest({ method: 'GET', url: '/api/vt-e1/render/capabilities', headers: {} }, res);
  const payload = JSON.parse(body);
  assert.equal(res.status, 503);
  assert.equal(payload.error, 'RENDERER_NOT_CONFIGURED');
  assert.equal(payload.capabilities.ready, false);
  assert.equal(headers['Content-Type'], 'application/json; charset=utf-8');
  restore();
});

test('render proxy trims worker URLs and exposes only server-side configuration', async () => {
  process.env.VT_E1_RENDER_SERVICE_URL = 'https://worker.example.com///';
  process.env.VT_E1_RENDER_PROXY_TIMEOUT_MS = '9000';
  process.env.VT_E1_RENDER_SHARED_SECRET = 'secret';
  const { getRenderProxyConfig } = await import(`./_proxy.mjs?configured=${Date.now()}`);
  assert.deepEqual(getRenderProxyConfig(), {
    serviceUrl: 'https://worker.example.com',
    timeoutMs: 9000,
    hasSharedSecret: true,
  });
  restore();
});
