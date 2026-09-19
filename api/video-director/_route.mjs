import {
  cancelOwnedVideoDirectorJob,
  getOwnedVideoDirectorJob,
  listOwnedVideoDirectorJobs,
  submitVideoDirectorJob,
  toVideoDirectorApiError,
} from "../../server/video-director-api.mjs";

const json = (res, status, payload) => {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
};

export const routeVideoDirector = async (req, res) => {
  const method = String(req.method || "GET").toUpperCase();
  const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const routedPath = String(
    parsedUrl.searchParams.get("__vt_video_director_path") || "",
  ).replace(/^\/+|\/+$/g, "");
  const pathname = routedPath
    ? `/api/video-director/${routedPath}`
    : (parsedUrl.pathname.replace(/\/$/, "") || "/");

  try {
    if (pathname === "/api/video-director/jobs" && method === "POST") {
      return json(res, 202, await submitVideoDirectorJob({ req }));
    }

    if (pathname === "/api/video-director/jobs" && method === "GET") {
      return json(res, 200, await listOwnedVideoDirectorJobs({ req, parsedUrl }));
    }

    const cancelMatch = pathname.match(/^\/api\/video-director\/jobs\/([^/]+)\/cancel$/);
    if (cancelMatch && method === "POST") {
      return json(res, 200, await cancelOwnedVideoDirectorJob({
        req,
        jobId: decodeURIComponent(cancelMatch[1]),
      }));
    }

    const jobMatch = pathname.match(/^\/api\/video-director\/jobs\/([^/]+)$/);
    if (jobMatch && method === "GET") {
      return json(res, 200, await getOwnedVideoDirectorJob({
        req,
        jobId: decodeURIComponent(jobMatch[1]),
      }));
    }

    return json(res, 404, {
      error: { code: "NOT_FOUND", message: "Video Director route not found." },
    });
  } catch (error) {
    const mapped = toVideoDirectorApiError(error);
    return json(res, mapped.status, mapped.body);
  }
};
