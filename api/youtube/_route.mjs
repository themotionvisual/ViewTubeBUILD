import { addVideoToPlaylist, getOwnedVideo, listCommentThreads, listOwnedVideos, listPlaylists, listVideoPlaylistMemberships, markCommentAsSpam, moderateComment, patchOwnedVideo, postCommentReply, postTopLevelComment, removeVideoFromPlaylist, setVideoThumbnail, toApiError } from "../../server/simple-youtube.mjs";

const json = (res, status, payload) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(payload));
};

export const routeSimpleYouTube = async (req, res) => {
  const method = String(req.method || "GET").toUpperCase();
  const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname.replace(/\/$/, "") || "/";

  try {
    if (method === "GET" && pathname === "/api/youtube/videos") {
      return json(res, 200, await listOwnedVideos({ req }));
    }
    if (method === "GET" && pathname === "/api/youtube/playlists") {
      return json(res, 200, await listPlaylists({ req }));
    }
    if (method === "POST" && pathname === "/api/youtube/playlists/memberships") {
      const videoId = String(parsedUrl.searchParams.get("videoId") || "");
      return json(res, 200, await listVideoPlaylistMemberships({ req, videoId }));
    }
    if (method === "POST" && pathname === "/api/youtube/playlists/items") {
      return json(res, 200, await addVideoToPlaylist({ req }));
    }
    const playlistItemMatch = pathname.match(/^\/api\/youtube\/playlists\/items\/([^/]+)$/);
    if (playlistItemMatch && method === "DELETE") {
      return json(res, 200, await removeVideoFromPlaylist({ req, playlistItemId: decodeURIComponent(playlistItemMatch[1]) }));
    }
    const videoMatch = pathname.match(/^\/api\/youtube\/videos\/([^/]+)$/);
    if (videoMatch && method === "GET") {
      return json(res, 200, await getOwnedVideo({ req, videoId: decodeURIComponent(videoMatch[1]) }));
    }
    if (videoMatch && method === "PATCH") {
      return json(res, 200, await patchOwnedVideo({ req, videoId: decodeURIComponent(videoMatch[1]) }));
    }
    const thumbnailMatch = pathname.match(/^\/api\/youtube\/videos\/([^/]+)\/thumbnail$/);
    if (thumbnailMatch && method === "POST") {
      return json(res, 200, await setVideoThumbnail({ req, videoId: decodeURIComponent(thumbnailMatch[1]) }));
    }
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
