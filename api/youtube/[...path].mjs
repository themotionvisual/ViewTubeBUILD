import { routeSimpleYouTube } from "../youtube/_route.mjs";
export default async function handler(req, res) {
  await routeSimpleYouTube(req, res);
}
