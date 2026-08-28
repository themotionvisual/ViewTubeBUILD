import { listCommentThreads, markCommentAsSpam, moderateComment, postCommentReply, postTopLevelComment, toApiError } from "../../server/simple-youtube.mjs";

const json = (res, status, payload) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(payload));
};

export const routeSimpleYouTube = async (req, res) => {
  const method = String(req.method || "GET").toUpperCase();
  const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname.replace(/\/$/, "") || "/";

  try {
    if (method === "GET" && pathname === "/api/youtube/comments/threads") {
      return json(res, 200, await listCommentThreads({ req, parsedUrl }));
    }
    if (method === "POST" && pathname === "/api/youtube/comments/reply") {
      return json(res, 200, await postCommentReply({ req }));
    }
    if (method === "POST" && pathname === "/api/youtube/comments/top-level") {
      return json(res, 200, await postTopLevelComment({ req }));
    }
    if (method === "POST" && pathname === "/api/youtube/comments/moderate") {
      return json(res, 200, await moderateComment({ req }));
    }
    if (method === "POST" && pathname === "/api/youtube/comments/mark-spam") {
      return json(res, 200, await markCommentAsSpam({ req }));
    }
    return json(res, 404, { error: { code: "NOT_FOUND", message: "Not found." } });
  } catch (error) {
    const mapped = toApiError(error);
    return json(res, mapped.status, mapped.body);
  }
};
