import { proxyVtE1RenderRequest } from './_proxy.mjs';

export default async function handler(req, res) {
  await proxyVtE1RenderRequest(req, res);
}
