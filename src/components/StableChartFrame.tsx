import React, { useEffect, useRef, useState } from "react"
import { ResponsiveContainer } from "recharts"

type StableChartFrameProps = {
 children: React.ReactNode
 className?: string
 minHeightClassName?: string
}

export const StableChartFrame: React.FC<StableChartFrameProps> = ({
 children,
 className = "",
 minHeightClassName = "min-h-[220px]",
}) => {
 const hostRef = useRef<HTMLDivElement | null>(null)
 const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })

 useEffect(() => {
  const host = hostRef.current
  if (!host) return
  let raf = 0

  const update = () => {
   if (raf) cancelAnimationFrame(raf)
   raf = requestAnimationFrame(() => {
    if (!host.isConnected) return
    const hiddenByLayout = host.offsetParent === null
    if (hiddenByLayout) {
     setSize({ width: 0, height: 0 })
     return
    }
    const rect = host.getBoundingClientRect()
    setSize({
     width: Number.isFinite(rect.width) && rect.width > 1 ? rect.width : 0,
     height: Number.isFinite(rect.height) && rect.height > 1 ? rect.height : 0,
    })
   })
  }

  update()
  let observer: ResizeObserver | null = null
  if (typeof ResizeObserver !== "undefined") {
   observer = new ResizeObserver(update)
   observer.observe(host)
  }
  window.addEventListener("resize", update)
  return () => {
   if (raf) cancelAnimationFrame(raf)
   observer?.disconnect()
   window.removeEventListener("resize", update)
  }
 }, [])

 return (
  <div
   ref={hostRef}
   className={`relative h-full w-full min-w-[1px] ${minHeightClassName} ${className}`}>
   {size.width > 0 && size.height > 0 ? (
    <ResponsiveContainer width={size.width} height={size.height}>
     {children}
    </ResponsiveContainer>
   ) : null}
  </div>
 )
}
