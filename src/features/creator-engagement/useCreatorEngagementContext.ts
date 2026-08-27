import { useMemo } from "react"
import { useBrain } from "../../context/useBrain"
import { useVideoAssetCatalog } from "../../context/VideoAssetCatalogContext"
import { useSimpleAuth } from "../../auth/AuthProvider"
import type { CreatorEngagementContext } from "./types"

export const useCreatorEngagementContext = (): CreatorEngagementContext => {
 const { brain } = useBrain()
 const catalog = useVideoAssetCatalog()
 const auth = useSimpleAuth()
 const session = auth.session

 return useMemo(() => {
  const channelId = String(session.channel?.id || "")
  const connected = session.status === "ready" && session.capabilities.youtubeRead
  const connectionState: CreatorEngagementContext["connectionState"] =
   session.status === "ready" ? "ready" :
   session.status === "reconnect_required" ? "needs_reconnect" :
   auth.loading ? "connecting" : "anonymous"

  return {
   channelId,
   channelName: String(session.channel?.title || "Your Channel"),
   channelHandle: String(session.channel?.handle || "").replace(/^@/, ""),
   channelThumbnail: String(session.channel?.thumbnail || ""),
   connected,
   connectionState,
   canReadYouTube: connected,
   canPostComments: session.status === "ready" && session.capabilities.youtubeWrite,
   reconnect: async () => { auth.login(window.location.pathname + window.location.search + window.location.hash) },
   videoAssets: catalog.snapshot.items,
   brain,
  }
 }, [auth, brain, catalog.snapshot.items, session])
}
