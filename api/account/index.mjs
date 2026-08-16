import { routeAccountRequest } from "./_route.mjs";

export default async function handler(req, res) {
  await routeAccountRequest(req, res);
}
