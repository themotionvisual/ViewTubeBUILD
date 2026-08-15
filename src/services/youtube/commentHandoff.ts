/**
 * YouTube Data API has no endpoint for rating comments.  Keep the native
 * YouTube handoff in one place so UI never presents a local state as a real
 * comment like.
 */
export const buildYouTubeCommentUrl = (videoId?: string, commentId?: string) => {
  const safeVideoId = videoId?.trim()
  const safeCommentId = commentId?.trim()
  if (!safeVideoId || !safeCommentId) return null

  return `https://www.youtube.com/watch?v=${encodeURIComponent(safeVideoId)}&lc=${encodeURIComponent(safeCommentId)}`
}
