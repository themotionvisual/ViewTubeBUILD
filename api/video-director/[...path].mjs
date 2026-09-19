import { routeVideoDirector } from "../video-director/_route.mjs";

export default async function handler(req, res) {
  await routeVideoDirector(req, res);
}
