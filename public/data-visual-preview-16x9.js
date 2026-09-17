/* Enforces the selected data-visual preview contract across current and legacy shells.
   AnalyticsVisualShell titles are not guaranteed to be semantic headings, so
   matching uses the bounded visual shell text and marks the preview body directly. */
(() => {
  const requestedTitles = [
    "CHANNEL PREVIEW",
    "CHANNEL PROGRESS",
    "HEAT MATRIX",
    "PUBLISH OPTIMAL CLOCK",
    "SHORTS RETENTION",
    "TRAFFIC SOURCE EVOLUTION",
    "TRAFFIC SOURCE MIX",
    "ENGAGEMENT PULSE",
    "ENGAGEMENT LINES",
    "WATCH PULSE",
    "CONTENT TREEMAP",
  ]

  const normalize = (text) => String(text || "").replace(/\s+/g, " ").trim().toUpperCase()
  const matchesRequestedTitle = (text) => {
    const normalized = normalize(text)
    return requestedTitles.some((title) => normalized.includes(title))
  }

  /* A chart body that has migrated to the Data Visual canvas contract already
     has one geometry owner (VisualCanvasViewport). This legacy title-matching
     pass must not become a second one, so it skips those bodies entirely. */
  const CANVAS_OWNED = "[data-vt-data-visual-canvas-owned]"
  const isCanvasOwned = (body) => body instanceof HTMLElement && body.matches(CANVAS_OWNED)

  const markCard = (card) => {
    if (!(card instanceof HTMLElement)) return
    const chartBodies = Array.from(card.querySelectorAll("[data-vt-chart-body]")).filter((body) => !isCanvasOwned(body))
    if (!chartBodies.length || !matchesRequestedTitle(card.textContent)) return
    card.setAttribute("data-vt-preview-16x9", "")
    chartBodies.forEach((body) => body.setAttribute("data-vt-preview-canvas-16x9", ""))
  }

  const scan = (root = document) => {
    if (!(root instanceof Document || root instanceof HTMLElement)) return
    if (root instanceof HTMLElement && root.matches("[data-vt-visual-card], [data-vt-visual-module]")) markCard(root)
    root.querySelectorAll?.("[data-vt-visual-card], [data-vt-visual-module]").forEach(markCard)

    root.querySelectorAll?.("[data-vt-chart-body]").forEach((body) => {
      if (!(body instanceof HTMLElement) || body.hasAttribute("data-vt-preview-canvas-16x9")) return
      if (isCanvasOwned(body)) return
      let ancestor = body.parentElement
      for (let depth = 0; ancestor && depth < 7; depth += 1, ancestor = ancestor.parentElement) {
        if (matchesRequestedTitle(ancestor.textContent)) {
          body.setAttribute("data-vt-preview-canvas-16x9", "")
          ancestor.setAttribute("data-vt-preview-16x9", "")
          break
        }
      }
    })
  }

  const start = () => {
    scan()
    const observer = new MutationObserver(() => scan())
    observer.observe(document.body, { childList: true, subtree: true })
    window.addEventListener("resize", () => scan(), { passive: true })
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true })
  else start()
})()
