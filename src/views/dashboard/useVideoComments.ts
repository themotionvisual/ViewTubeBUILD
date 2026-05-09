import { useState, useEffect, useRef } from "react"
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
  const forbiddenRef = useRef<Set<string>>(new Set())
  const fetchedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!videoId) return
    if (forbiddenRef.current.has(videoId) || fetchedRef.current.has(videoId)) return
    fetchedRef.current.add(videoId)
    const loadComments = async () => {
      setLoading(true)
      try {
        const data = await youtubeService.fetchVideoComments(videoId)
        setComments(data)
      } catch (e) {
        const message = String((e as Error)?.message || e || "")
        if (message.includes("403") || message.toLowerCase().includes("forbidden")) {
          forbiddenRef.current.add(videoId)
          return
        }
        console.error("Failed to load comments:", e)
      } finally {
        setLoading(false)
      }
    }
    loadComments()
  }, [videoId])

  return { comments, loading }
}
