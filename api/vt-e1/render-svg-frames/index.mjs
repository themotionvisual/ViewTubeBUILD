import { proxyVtE1RenderRequest } from '../render/_proxy.mjs';

export default async function handler(req, res) {
  await proxyVtE1RenderRequest(req, res);
}
