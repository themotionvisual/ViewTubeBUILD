import { useMemo } from "react"
import { useBrain } from "../../context/useBrain"
import { useUnifiedAccount } from "../../context/UnifiedAccountContext"
import { useVideoAssetCatalog } from "../../context/VideoAssetCatalogContext"
import { useAccountStatus } from "../../services/auth-canon"
import type { CreatorEngagementContext } from "./types"

export const useCreatorEngagementContext = (): CreatorEngagementContext => {
 const { brain, authState } = useBrain()
 const account = useUnifiedAccount()
 const accountStatus = useAccountStatus()
 const catalog = useVideoAssetCatalog()

 return useMemo(() => {
  const channelId = String(
   account.snapshot.google.channelId || catalog.snapshot.channelId || authState.channelId || brain.channelProfile?.id || "",
  )
  const channelHandle = String(account.snapshot.google.channelHandle || authState.channelHandle || brain.channelProfile?.handle || "").replace(/^@/, "")
  return {
   channelId,
   channelName: String(account.snapshot.google.channelTitle || authState.channelName || brain.channelProfile?.name || "Your Channel"),
   channelHandle,
   channelThumbnail: String(account.snapshot.google.channelThumbnail || authState.channelThumbnail || brain.channelProfile?.thumbnail || ""),
   connected: accountStatus.canReadYouTube,
   connectionState: accountStatus.status,
   canReadYouTube: accountStatus.canReadYouTube,
   canPostComments: accountStatus.canPostComments,
   reconnect: async () => {
    await account.start("reconnect_channel", window.location.pathname)
    await account.refresh()
   },
   videoAssets: catalog.snapshot.items,
   brain,
  }
 }, [account, accountStatus, authState, brain, catalog.snapshot.channelId, catalog.snapshot.items])
}
