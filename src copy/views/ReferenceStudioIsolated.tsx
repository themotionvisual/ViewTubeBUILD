import { useMemo, type FC } from "react"
import { useLocation, useParams } from "react-router-dom"

const DEFAULT_TAB = "toolbox-system"

const ReferenceStudioIsolated: FC = () => {
  const { tabId } = useParams<{ tabId?: string }>()
  const location = useLocation()

  const safeTabId = tabId?.trim() ? tabId : DEFAULT_TAB
  const iframeSrc = useMemo(() => {
    return `/render-bench/reference-studio/${encodeURIComponent(
      safeTabId,
    )}${location.search || ""}${location.hash || ""}`
  }, [location.hash, location.search, safeTabId])

  return (
    <section className="w-full h-[calc(100vh-6rem)] min-h-[780px] border-[5px] border-black rounded-2xl bg-white shadow-[10px_10px_0px_0px_black] overflow-hidden">
      <iframe
        title="Reference Studio (Isolated)"
        src={iframeSrc}
        className="w-full h-full border-0 bg-[#f3f4f6]"
        loading="eager"
      />
    </section>
  )
}

export default ReferenceStudioIsolated
