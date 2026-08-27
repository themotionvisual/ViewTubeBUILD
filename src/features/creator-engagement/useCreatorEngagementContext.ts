import { useMemo } from "react"
import { useBrain } from "../../context/useBrain"
import { useUnifiedAccount } from "../../context/UnifiedAccountContext"
import { useVideoAssetCatalog } from "../../context/VideoAssetCatalogContext"
import type { CreatorEngagementContext } from "./types"

export const useCreatorEngagementContext = (): CreatorEngagementContext => {
 const { brain, authState } = useBrain()
 const account = useUnifiedAccount()
 const catalog = useVideoAssetCatalog()

 return useMemo(() => {
  const serverConnected = account.serverEnabled &&
   account.snapshot.authentication.status === "authenticated" &&
   account.snapshot.google.status === "connected"
  const channelId = String(
   account.snapshot.google.channelId || catalog.snapshot.channelId || authState.channelId || brain.channelProfile?.id || "",
  )
  const channelHandle = String(authState.channelHandle || brain.channelProfile?.handle || "").replace(/^@/, "")
  return {
   channelId,
   channelName: String(authState.channelName || brain.channelProfile?.name || "Your Channel"),
   channelHandle,
   channelThumbnail: String(authState.channelThumbnail || brain.channelProfile?.thumbnail || ""),
   connected: account.serverEnabled ? serverConnected : catalog.connected,
   canPostComments: !account.serverEnabled || account.snapshot.grantedCapabilities.includes("youtube_comments"),
   reconnect: () => account.start("reconnect_channel", window.location.pathname),
   videoAssets: catalog.snapshot.items,
   brain,
  }
 }, [account, authState, brain, catalog.connected, catalog.snapshot.channelId, catalog.snapshot.items])
}
