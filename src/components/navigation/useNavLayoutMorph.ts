import { useCallback, useRef } from "react"
import { flushSync } from "react-dom"
import type { NavigationLayout } from "./navigationContract"

type VtNavStyleSnapshot = {
  fontSize: string
  letterSpacing: string
  fontWeight: string
  lineHeight: string
  borderRadius: string
  paddingLeft: string
  paddingRight: string
  justifyContent: string
}

const styleSnapshot = (el: Element): VtNavStyleSnapshot => {
  const cs = getComputedStyle(el)
  return {
    fontSize: cs.fontSize,
    letterSpacing: cs.letterSpacing,
    fontWeight: cs.fontWeight,
    lineHeight: cs.lineHeight,
    borderRadius: cs.borderRadius,
    paddingLeft: cs.paddingLeft,
    paddingRight: cs.paddingRight,
    justifyContent: cs.justifyContent,
  }
}

const cloneFor = (el: HTMLElement, rect: DOMRect): HTMLElement => {
  const clone = el.cloneNode(true) as HTMLElement
  clone.classList.add("vt-nav-flight-clone")
  clone.removeAttribute("id")
  clone.setAttribute("aria-hidden", "true")
  clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"))
  const cs = getComputedStyle(el)
  Object.assign(clone.style, {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    background: cs.backgroundColor,
    borderRadius: cs.borderRadius,
    borderWidth: cs.borderTopWidth,
    display: cs.display,
    fontFamily: cs.fontFamily,
    fontSize: cs.fontSize,
    letterSpacing: cs.letterSpacing,
    fontWeight: cs.fontWeight,
    lineHeight: cs.lineHeight,
    textTransform: cs.textTransform,
    paddingLeft: cs.paddingLeft,
    paddingRight: cs.paddingRight,
    justifyContent: cs.justifyContent,
  })
  return clone
}

const PAGE_CONTEXT_DURATION = 1770 // 1180 * 1.5

const animatePageContext = async (
  main: HTMLElement | null,
  fromRect: DOMRect | null,
  toRect: DOMRect | null,
): Promise<void> => {
  if (!main || !fromRect || !toRect) return
  const dx = fromRect.left - toRect.left
  const dy = fromRect.top - toRect.top
  const sx = fromRect.width / Math.max(toRect.width, 1)
  const sy = fromRect.height / Math.max(toRect.height, 1)
  main.style.transformOrigin = "top left"
  main.style.willChange = "transform,opacity,filter"
  const anim = main.animate(
    [
      { transform: `translate(${dx}px,${dy}px) scale(${sx},${sy})`, opacity: 0.94, filter: "saturate(.96)" },
      {
        transform: `translate(${dx * 0.46}px,${dy * 0.46}px) scale(${1 + (sx - 1) * 0.46},${1 + (sy - 1) * 0.46})`,
        opacity: 0.975,
        offset: 0.46,
      },
      { transform: "translate(0,0) scale(1,1)", opacity: 1, filter: "saturate(1)" },
    ],
    { duration: PAGE_CONTEXT_DURATION, easing: "ease-in-out", fill: "both" },
  )
  try {
    await anim.finished
  } catch {
    // animation was cancelled (e.g. unmount) — nothing to clean up beyond the finally block
  } finally {
    main.style.transformOrigin = ""
    main.style.willChange = ""
  }
}

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

type VtFlightItem = { el: HTMLElement }

// Durations/stagger below are the prototype's originals scaled 1.5x.
const STAGGER_STEP = 225 // 150 * 1.5
const PAUSE_STEP = 75 // 50 * 1.5
const TO_SIDEBAR_PHASE1_DURATION = 780 // 520 * 1.5
const TO_SIDEBAR_PHASE2_DURATION = 750 // 500 * 1.5
const TO_TOP_PHASE1_DURATION = 750 // 500 * 1.5
const TO_TOP_PHASE2_DURATION = 780 // 520 * 1.5

export const useNavLayoutMorph = ({
  mainViewportRef,
  accountButtonRef,
  layout,
  setLayout,
}: {
  mainViewportRef: React.RefObject<HTMLElement | null>
  accountButtonRef: React.RefObject<HTMLButtonElement | null>
  layout: NavigationLayout
  setLayout: (next: NavigationLayout) => void
}) => {
  const shellRef = useRef<HTMLDivElement | null>(null)
  const linksRef = useRef<Map<string, HTMLAnchorElement>>(new Map())
  const controlElRef = useRef<HTMLElement | null>(null)
  const busyRef = useRef(false)

  const registerLink = useCallback(
    (id: string) => (el: HTMLAnchorElement | null) => {
      if (el) linksRef.current.set(id, el)
      else linksRef.current.delete(id)
    },
    [],
  )

  const registerControl = useCallback((el: HTMLElement | null) => {
    controlElRef.current = el
  }, [])

  const runMorph = useCallback(
    async (nextLayout: NavigationLayout) => {
      if (busyRef.current || layout === nextLayout) return
      const shell = shellRef.current
      const main = mainViewportRef.current
      const items: VtFlightItem[] = [
        ...[...linksRef.current.values()].map((el) => ({ el })),
        ...(controlElRef.current ? [{ el: controlElRef.current }] : []),
        ...(accountButtonRef.current ? [{ el: accountButtonRef.current }] : []),
      ]

      if (!shell || !items.length || prefersReducedMotion()) {
        setLayout(nextLayout)
        return
      }

      busyRef.current = true
      shell.classList.add("vt-nav-transitioning")

      const mainStart = main ? main.getBoundingClientRect() : null
      const start = items.map((item) => item.el.getBoundingClientRect())
      const startStyles = items.map((item) => styleSnapshot(item.el))

      const flightLayer = document.createElement("div")
      flightLayer.className = "vt-nav-flight-layer"
      document.body.appendChild(flightLayer)

      const clones = items.map((item, index) => {
        const clone = cloneFor(item.el, start[index])
        flightLayer.appendChild(clone)
        item.el.classList.add("vt-nav-source-hidden")
        return clone
      })

      flushSync(() => setLayout(nextLayout))
      void shell.offsetWidth

      // The control element may have been unmounted/remounted as a different node by the flushSync
      // re-render (single "enter sidebar" button <-> 3-button layout-controls group) — re-read it fresh.
      const endEls = [
        ...[...linksRef.current.values()],
        ...(controlElRef.current ? [controlElRef.current] : []),
        ...(accountButtonRef.current ? [accountButtonRef.current] : []),
      ]
      const end = endEls.map((el) => el.getBoundingClientRect())
      const endStyles = endEls.map(styleSnapshot)
      const mainEnd = main ? main.getBoundingClientRect() : null
      // Elements that persisted across the re-render (links, account trigger) already carry the
      // hidden class from before flushSync; a brand-new node (e.g. the swapped control button/group)
      // needs it applied fresh so it doesn't show through underneath its own flying clone.
      endEls.forEach((el) => el.classList.add("vt-nav-source-hidden"))

      const pageJob = animatePageContext(main, mainStart, mainEnd)
      const total = clones.length
      const reversing = nextLayout === "top"

      const jobs = clones.map((clone, index) => (async () => {
        const s = start[index]
        const e = end[index]
        const sStyle = startStyles[index]
        const eStyle = endStyles[index]
        await new Promise((resolve) => setTimeout(resolve, index * STAGGER_STEP))
        clone.classList.add("is-shining")

        if (!reversing) {
          // Top -> sidebar: contract both dimensions while dropping into the target row, then dock the
          // already-smaller button into the sidebar column. This makes the sidebar-only size change visible
          // as part of the morph instead of looking like a width snap at the end.
          const contractedLeft = s.left + (s.width - e.width) / 2
          await clone.animate(
            [
              { left: `${s.left}px`, top: `${s.top}px`, width: `${s.width}px`, height: `${s.height}px`, fontSize: sStyle.fontSize, letterSpacing: sStyle.letterSpacing, fontWeight: sStyle.fontWeight, lineHeight: sStyle.lineHeight, borderRadius: sStyle.borderRadius, paddingLeft: sStyle.paddingLeft, paddingRight: sStyle.paddingRight },
              { left: `${s.left + (contractedLeft - s.left) * 0.62}px`, top: `${s.top + (e.top - s.top) * 0.56}px`, width: `${s.width + (e.width - s.width) * 0.62}px`, height: `${s.height + (e.height - s.height) * 0.72}px`, fontSize: `calc(${sStyle.fontSize} * .55 + ${eStyle.fontSize} * .45)`, letterSpacing: eStyle.letterSpacing, fontWeight: eStyle.fontWeight, lineHeight: eStyle.lineHeight, borderRadius: eStyle.borderRadius, paddingLeft: eStyle.paddingLeft, paddingRight: eStyle.paddingRight, offset: 0.58 },
              { left: `${contractedLeft}px`, top: `${e.top}px`, width: `${e.width}px`, height: `${e.height}px`, fontSize: eStyle.fontSize, letterSpacing: eStyle.letterSpacing, fontWeight: eStyle.fontWeight, lineHeight: eStyle.lineHeight, borderRadius: eStyle.borderRadius, paddingLeft: eStyle.paddingLeft, paddingRight: eStyle.paddingRight },
            ],
            { duration: TO_SIDEBAR_PHASE1_DURATION, easing: "cubic-bezier(.55,.02,.85,.42)", fill: "forwards" },
          ).finished

          // Top item pauses longest before its horizontal slide; each lower item begins sooner.
          const pause = (total - 1 - index) * PAUSE_STEP
          if (pause) await new Promise((resolve) => setTimeout(resolve, pause))

          await clone.animate(
            [
              { left: `${contractedLeft}px`, top: `${e.top}px`, width: `${e.width}px`, height: `${e.height}px`, fontSize: eStyle.fontSize, letterSpacing: eStyle.letterSpacing, fontWeight: eStyle.fontWeight, lineHeight: eStyle.lineHeight, borderRadius: eStyle.borderRadius, paddingLeft: eStyle.paddingLeft, paddingRight: eStyle.paddingRight },
              { left: `${e.left}px`, top: `${e.top}px`, width: `${e.width}px`, height: `${e.height}px`, fontSize: eStyle.fontSize, letterSpacing: eStyle.letterSpacing, fontWeight: eStyle.fontWeight, lineHeight: eStyle.lineHeight, borderRadius: eStyle.borderRadius, paddingLeft: eStyle.paddingLeft, paddingRight: eStyle.paddingRight },
            ],
            { duration: TO_SIDEBAR_PHASE2_DURATION, easing: "cubic-bezier(.12,.72,.18,1)", fill: "forwards" },
          ).finished
        } else {
          // sidebar -> top: slide right while shrinking to bar width first, then move up into the row.
          await clone.animate(
            [
              { left: `${s.left}px`, top: `${s.top}px`, width: `${s.width}px`, height: `${s.height}px`, fontSize: sStyle.fontSize, letterSpacing: sStyle.letterSpacing, fontWeight: sStyle.fontWeight, lineHeight: sStyle.lineHeight, borderRadius: sStyle.borderRadius, paddingLeft: sStyle.paddingLeft, paddingRight: sStyle.paddingRight },
              { left: `${e.left}px`, top: `${s.top}px`, width: `${e.width}px`, height: `${s.height}px`, fontSize: `calc(${sStyle.fontSize} * .55 + ${eStyle.fontSize} * .45)`, letterSpacing: eStyle.letterSpacing, fontWeight: eStyle.fontWeight, lineHeight: eStyle.lineHeight, borderRadius: eStyle.borderRadius, paddingLeft: eStyle.paddingLeft, paddingRight: eStyle.paddingRight },
            ],
            { duration: TO_TOP_PHASE1_DURATION, easing: "cubic-bezier(.55,.02,.85,.42)", fill: "forwards" },
          ).finished

          await clone.animate(
            [
              { left: `${e.left}px`, top: `${s.top}px`, width: `${e.width}px`, height: `${s.height}px`, fontSize: `calc(${sStyle.fontSize} * .55 + ${eStyle.fontSize} * .45)`, letterSpacing: eStyle.letterSpacing, fontWeight: eStyle.fontWeight, lineHeight: eStyle.lineHeight, borderRadius: eStyle.borderRadius, paddingLeft: eStyle.paddingLeft, paddingRight: eStyle.paddingRight },
              { left: `${e.left}px`, top: `${s.top + (e.top - s.top) * 0.44}px`, width: `${e.width}px`, height: `${e.height}px`, fontSize: eStyle.fontSize, letterSpacing: eStyle.letterSpacing, fontWeight: eStyle.fontWeight, lineHeight: eStyle.lineHeight, borderRadius: eStyle.borderRadius, paddingLeft: eStyle.paddingLeft, paddingRight: eStyle.paddingRight, offset: 0.42 },
              { left: `${e.left}px`, top: `${e.top}px`, width: `${e.width}px`, height: `${e.height}px`, fontSize: eStyle.fontSize, letterSpacing: eStyle.letterSpacing, fontWeight: eStyle.fontWeight, lineHeight: eStyle.lineHeight, borderRadius: eStyle.borderRadius, paddingLeft: eStyle.paddingLeft, paddingRight: eStyle.paddingRight },
            ],
            { duration: TO_TOP_PHASE2_DURATION, easing: "cubic-bezier(.12,.72,.18,1)", fill: "forwards" },
          ).finished
        }
      })())

      await Promise.all([...jobs, pageJob])

      clones.forEach((clone) => clone.remove())
      flightLayer.remove()
      items.forEach((item) => item.el.classList.remove("vt-nav-source-hidden"))
      endEls.forEach((el) => el.classList.remove("vt-nav-source-hidden"))
      shell.classList.remove("vt-nav-transitioning")
      busyRef.current = false
    },
    [accountButtonRef, layout, mainViewportRef, setLayout],
  )

  const animateToSidebar = useCallback(() => {
    if (layout !== "top") return
    void runMorph("wide")
  }, [layout, runMorph])

  const animateToTop = useCallback(() => {
    if (layout === "top") return
    void runMorph("top")
  }, [layout, runMorph])

  return { shellRef, registerLink, registerControl, animateToSidebar, animateToTop }
}
