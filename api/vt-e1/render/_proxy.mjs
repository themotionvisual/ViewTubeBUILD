import { Readable } from 'node:stream';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

const readBody = async (req) => new Promise((resolve, reject) => {
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('error', reject);
  req.on('end', () => resolve(Buffer.concat(chunks)));
});

const getHeaderEntries = (headers = {}) => Object.entries(headers)
  .filter(([key]) => !HOP_BY_HOP_HEADERS.has(String(key).toLowerCase()))
  .filter(([, value]) => typeof value !== 'undefined')
  .map(([key, value]) => [key, Array.isArray(value) ? value.join(', ') : String(value)]);

const writeJson = (res, status, payload) => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
};

const resolveRenderServiceUrl = () => String(
  process.env.VT_E1_RENDER_SERVICE_URL ||
  process.env.RENDER_SERVICE_URL ||
  ''
).trim().replace(/\/+$/, '');

export const proxyVtE1RenderRequest = async (req, res) => {
  const method = String(req.method || 'GET').toUpperCase();

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-VT-File-Name, X-VT-Mime-Type',
      'Cache-Control': 'no-store',
    });
    res.end();
    return;
  }

  const serviceUrl = resolveRenderServiceUrl();
  if (!serviceUrl) {
    writeJson(res, 502, {
      ok: false,
      error: 'VT_E1_RENDER_SERVICE_URL_MISSING',
      message: 'Hosted VT_E1 render worker is not configured. Set VT_E1_RENDER_SERVICE_URL in the production environment.',
      mode: 'hosted-proxy',
    });
    return;
  }

  const incomingUrl = new URL(req.url || '/', `https://${req.headers.host || 'viewtube.live'}`);
  const targetUrl = new URL(`${incomingUrl.pathname}${incomingUrl.search}`, `${serviceUrl}/`);
  const headers = Object.fromEntries(getHeaderEntries(req.headers));
  const sharedSecret = String(process.env.VT_E1_RENDER_SHARED_SECRET || '').trim();
  if (sharedSecret) headers.Authorization = `Bearer ${sharedSecret}`;
  headers['X-VT-Render-Proxy'] = 'viewtube-live';
  headers['X-VT-Render-Proxy-Origin'] = String(process.env.VT_E1_RENDER_PUBLIC_ORIGIN || `https://${req.headers.host || 'viewtube.live'}`);

  const body = ['GET', 'HEAD'].includes(method) ? undefined : await readBody(req);

  let upstream;
  try {
    upstream = await fetch(targetUrl, { method, headers, body, redirect: 'manual' });
  } catch (error) {
    writeJson(res, 502, {
      ok: false,
      error: 'VT_E1_RENDER_SERVICE_UNREACHABLE',
      message: `Hosted VT_E1 render worker could not be reached: ${error instanceof Error ? error.message : String(error)}`,
      target: serviceUrl,
    });
    return;
  }

  const responseHeaders = {};
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) responseHeaders[key] = value;
  });
  responseHeaders['Cache-Control'] = responseHeaders['Cache-Control'] || 'no-store';

  res.writeHead(upstream.status, responseHeaders);
  if (!upstream.body) {
    res.end();
    return;
  }
  Readable.fromWeb(upstream.body).pipe(res);
};
