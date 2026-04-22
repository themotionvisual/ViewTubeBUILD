import { useState, useEffect } from "react"
import { youtubeService } from "../../services/youtubeService"

export interface VideoComment {
  id: string
  text: string
  author: string
  publishedAt: string
}

export const useVideoComments = (videoId: string | null) => {
  const [comments, setComments] = useState<VideoComment[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!videoId) return
    const loadComments = async () => {
      setLoading(true)
      try {
        const data = await youtubeService.fetchVideoComments(videoId)
        setComments(data)
      } catch (e) {
        console.error("Failed to load comments:", e)
      } finally {
        setLoading(false)
      }
    }
    loadComments()
  }, [videoId])

  return { comments, loading }
}
