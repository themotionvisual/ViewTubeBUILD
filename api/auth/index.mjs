import { routeSimpleAuth } from "./_route.mjs";
export default async function handler(req, res) {
  await routeSimpleAuth(req, res);
}
