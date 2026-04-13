import React, { useState } from "react"

interface SidebarLink {
 icon: string
 label: string
 active?: boolean
 onClick?: () => void
}

interface SidebarProps {
 logo?: string
 badges?: Array<{ label: string; color?: "lime" | "black" }>
 links: SidebarLink[]
 statusBadge?: { label: string; active?: boolean }
}

export const Sidebar: React.FC<SidebarProps> = ({
 logo = "UsTube",
 badges = [],
 links,
 statusBadge,
}) => {
 const [activeIndex, setActiveIndex] = useState(
  links.findIndex((l) => l.active),
 )

 const handleLinkClick = (index: number, onClick?: () => void) => {
  setActiveIndex(index)
  onClick?.()
 }

 const badgeColorClasses = {
  lime: "bg-[#CCFF00]",
  black: "bg-black text-white",
 }

 return (
  <div
   className="
        w-[220px]
        flex flex-col gap-2
        p-4
        bg-white
      ">
   {/* Logo */}
   <div
    className="
          font-black uppercase
          text-[32px]
          tracking-tighter
          mb-2
        ">
    {logo}
   </div>

   {/* Badges */}
   {badges.length > 0 && (
    <div className="flex gap-1.5 mb-5">
     {badges.map((badge, index) => (
      <span
       key={index}
       className={`
                px-2 py-0.5
                text-[10px] font-black uppercase tracking-wider
                rounded-sm
                shadow-[2px_2px_0_black]
                border-2 border-black
                ${badgeColorClasses[badge.color || "lime"]}
              `}>
       {badge.label}
      </span>
     ))}
    </div>
   )}

   {/* Links */}
   <div className="flex flex-col gap-2">
    {links.map((link, index) => (
     <button
      key={index}
      onClick={() => handleLinkClick(index, link.onClick)}
      className={`
              flex items-center gap-2.5
              px-4 py-[11px]
              border-[3px] border-black
              rounded-[10px]
              font-black text-[14px] uppercase tracking-wide
              transition-all duration-75
              text-black
              ${
               activeIndex === index
                ? "bg-[#CCFF00] shadow-[4px_4px_0_black]"
                : "bg-white shadow-[3px_3px_0_black] hover:bg-[#E8E8E8]"
              }
            `}>
      <span className="w-6 text-center text-[16px] flex-shrink-0">
       {link.icon}
      </span>
      {link.label}
     </button>
    ))}
   </div>

   {/* Status Badge */}
   {statusBadge && (
    <div className="mt-5">
     <span
      className={`
              w-full flex items-center justify-center gap-2
              py-2.5
              text-[10px] font-black uppercase tracking-wider
              rounded-sm
              shadow-[2px_2px_0_black]
              border-2 border-black
              ${statusBadge.active ? "bg-[#CCFF00]" : "bg-white"}
            `}>
      <span
       className={`
                w-2 h-2 rounded-full
                border-2 border-black
                ${statusBadge.active ? "bg-[#CCFF00] animate-pulse" : "bg-gray-300"}
              `}
      />
      {statusBadge.label}
     </span>
    </div>
   )}
  </div>
 )
}
