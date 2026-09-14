(() => {
  const KEY_SEARCH = "viewtube.masterData.showSearch"
  const KEY_TOTALS = "viewtube.masterData.showTotals"
  const read = (key, fallback = true) => {
    try { const value = localStorage.getItem(key); return value === null ? fallback : value === "true" } catch { return fallback }
  }
  const write = (key, value) => { try { localStorage.setItem(key, String(value)) } catch {} }

  let showSearch = read(KEY_SEARCH)
  let showTotals = read(KEY_TOTALS)

  const setSwitchState = (button, checked) => {
    button.classList.toggle("is-on", checked)
    button.setAttribute("aria-checked", String(checked))
  }

  const applyVisibility = (root) => {
    root.querySelectorAll(".vt-sync-search").forEach((node) => { node.hidden = !showSearch })
    root.querySelectorAll(".vt-sync-total-row").forEach((node) => { node.hidden = !showTotals })
  }

  const makeControl = (label, checked, onChange, color) => {
    const control = document.createElement("label")
    control.className = "vt-sync-settings-control vt-master-data-injected-control"
    const text = document.createElement("span")
    text.textContent = label
    const button = document.createElement("button")
    button.type = "button"
    button.className = "vt-sync-switch"
    button.setAttribute("role", "switch")
    button.setAttribute("aria-label", label)
    button.style.setProperty("--vt-toggle-color", color)
    const thumb = document.createElement("span")
    button.appendChild(thumb)
    setSwitchState(button, checked)
    button.addEventListener("click", () => onChange(button))
    control.append(text, button)
    return control
  }

  const injectDisplayControls = (root) => {
    const grid = root.querySelector(".vt-sync-settings-grid")
    if (!grid || grid.querySelector("[data-master-data-display-controls]")) return
    const marker = document.createElement("div")
    marker.dataset.masterDataDisplayControls = "true"
    marker.style.display = "contents"
    marker.append(
      makeControl("Search bar", showSearch, (button) => {
        showSearch = !showSearch
        write(KEY_SEARCH, showSearch)
        document.querySelectorAll(".vt-sync-toolbox-table").forEach(applyVisibility)
        setSwitchState(button, showSearch)
      }, "#36E0F6"),
      makeControl("Totals rows", showTotals, (button) => {
        showTotals = !showTotals
        write(KEY_TOTALS, showTotals)
        document.querySelectorAll(".vt-sync-toolbox-table").forEach(applyVisibility)
        setSwitchState(button, showTotals)
      }, "#FFDA47"),
    )
    grid.appendChild(marker)
  }

  const removeLifetimeDescriptions = (root) => {
    root.querySelectorAll(".vt-sync-total-row *").forEach((node) => {
      if (node.children.length) return
      const text = (node.textContent || "").trim()
      if (/^lifetime analytics(?: unavailable)?$/i.test(text)) node.textContent = ""
    })
  }

  const moveMetricGroupsBelowTotals = (root) => {
    root.querySelectorAll(".vt-sync-data-table thead").forEach((thead) => {
      const group = thead.querySelector(":scope > .vt-sync-group-row")
      const totals = thead.querySelector(":scope > .vt-sync-total-row")
      if (group && totals && totals.nextElementSibling !== group) totals.after(group)
    })
  }

  const enhance = () => {
    document.querySelectorAll(".vt-sync-toolbox-table").forEach((root) => {
      applyVisibility(root)
      injectDisplayControls(root)
      removeLifetimeDescriptions(root)
      moveMetricGroupsBelowTotals(root)
    })
  }

  let queued = false
  const schedule = () => {
    if (queued) return
    queued = true
    requestAnimationFrame(() => { queued = false; enhance() })
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, { once: true })
  else schedule()
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true })
})()
