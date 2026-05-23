import React from "react"

interface TooltipProps {
 content: string
 children: React.ReactNode
 position?: "top" | "bottom" | "left" | "right"
}

export const Tooltip: React.FC<TooltipProps> = ({
 content,
 children,
 position = "top",
}) => {
 const positionClasses = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2 after:top-full after:left-1/2 after:-translate-x-1/2 after:border-t-black",
  bottom:
   "top-full left-1/2 -translate-x-1/2 mt-2 after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-b-black",
  left:
   "right-full top-1/2 -translate-y-1/2 mr-2 after:left-full after:top-1/2 after:-translate-y-1/2 after:border-l-black",
  right:
   "left-full top-1/2 -translate-y-1/2 ml-2 after:right-full after:top-1/2 after:-translate-y-1/2 after:border-r-black",
 }

 return (
  <div className="relative inline-block group">
   {children}
   <div
    className={`
          absolute
          bg-black text-white
          font-black text-[11px] uppercase tracking-wide
          px-[11px] py-[6px]
          rounded-md
          whitespace-nowrap
          opacity-0
          pointer-events-none
          transition-opacity duration-150
          shadow-[3px_3px_0_black]
          z-50
          group-hover:opacity-100
          ${positionClasses[position]}
        `}>
    {content}
    {/* Arrow */}
    <div
     className="absolute
            after:content-['']
            after:absolute
            after:border-[5px]
            after:border-transparent
          "
     style={{ display: "none" }}
    />
   </div>
  </div>
 )
}

// Simplified version with CSS-only arrow
export const TooltipSimple: React.FC<TooltipProps> = ({
 content,
 children,
}) => {
 return (
  <div className="relative inline-block group">
   {children}
   <div
    className="
          absolute
          bottom-full left-1/2 -translate-x-1/2
          mb-2
          bg-black text-white
          font-black text-[11px] uppercase tracking-[0.06em]
          px-[11px] py-[6px]
          rounded-md
          whitespace-nowrap
          opacity-0
          pointer-events-none
          transition-all duration-150
          shadow-[3px_3px_0_black]
          z-50
          group-hover:opacity-100
          group-hover:translate-y-0
          translate-y-[4px]
        ">
    {content}
    {/* CSS Arrow */}
    <div
     className="
            absolute top-full left-1/2 -translate-x-1/2
            border-[5px] border-transparent
            border-t-black
          "
    />
   </div>
  </div>
 )
}
