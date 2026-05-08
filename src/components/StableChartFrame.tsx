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
 const [isReady, setIsReady] = useState(false)

 useEffect(() => {
  const host = hostRef.current
  if (!host) return

  const update = () => {
   const rect = host.getBoundingClientRect()
   setIsReady(rect.width > 1 && rect.height > 1)
  }

  update()
  let observer: ResizeObserver | null = null
  if (typeof ResizeObserver !== "undefined") {
   observer = new ResizeObserver(update)
   observer.observe(host)
  }
  window.addEventListener("resize", update)
  return () => {
   observer?.disconnect()
   window.removeEventListener("resize", update)
  }
 }, [])

 return (
  <div
   ref={hostRef}
   className={`relative h-full w-full min-w-[1px] ${minHeightClassName} ${className}`}>
   {isReady ? (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
     {children}
    </ResponsiveContainer>
   ) : null}
  </div>
 )
}
