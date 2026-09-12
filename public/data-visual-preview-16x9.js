/* Marks only the requested data-visual cards for the 16:9 preview contract.
   This compatibility layer is intentionally DOM-scoped so legacy/core and
   Tube Explorer renderers can share one canvas rule without changing their
   outer toolbox geometry. */
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

  const matchesRequestedTitle = (text) => {
    const normalized = String(text || "").replace(/\s+/g, " ").trim().toUpperCase()
    return requestedTitles.some((title) => normalized.includes(title))
  }

  const markCard = (card) => {
    if (!(card instanceof HTMLElement)) return
    const chartBody = card.querySelector("[data-vt-chart-body]")
    if (!chartBody) return

    const headings = card.querySelectorAll("h1,h2,h3,h4,[data-vt-visual-title]")
    const titleMatch = Array.from(headings).some((node) => matchesRequestedTitle(node.textContent))
    if (titleMatch) card.setAttribute("data-vt-preview-16x9", "")
  }

  const scan = (root = document) => {
    if (root instanceof HTMLElement && root.matches("[data-vt-visual-card], [data-vt-visual-module]")) markCard(root)
    root.querySelectorAll?.("[data-vt-visual-card], [data-vt-visual-module]").forEach(markCard)
  }

  const start = () => {
    scan()
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) scan(node)
        })
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true })
  else start()
})()
