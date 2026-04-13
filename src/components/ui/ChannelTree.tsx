import React, { useState } from "react"

interface TreeItem {
 label: string
 icon?: string
 children?: TreeItem[]
 isLeaf?: boolean
}

interface ChannelTreeProps {
 items: TreeItem[]
}

export const ChannelTree: React.FC<ChannelTreeProps> = ({ items }) => {
 return (
  <div className="pl-0">
   {items.map((item, index) => (
    <TreeNode key={index} item={item} />
   ))}
  </div>
 )
}

const TreeNode: React.FC<{ item: TreeItem }> = ({ item }) => {
 const [isOpen, setIsOpen] = useState(false)
 const children = item.children ?? []
 const hasChildren = children.length > 0

 if (item.isLeaf || !hasChildren) {
  return (
   <div
    className="
          mt-[5px] px-3 py-[7px]
          border-2 border-[#E8E8E8] rounded-md
          font-black text-[12px] uppercase tracking-wide
          text-[#AAAAAA]
          bg-[#E8E8E8]
          cursor-pointer
          transition-colors
          hover:bg-[#00CCFF] hover:text-black hover:border-black
        ">
    {item.icon && <span className="mr-2">{item.icon}</span>}
    {item.label}
   </div>
  )
 }

 return (
  <div className="border-l-[4px] border-black pl-[14px] mb-[5px]">
   <div
    onClick={() => setIsOpen(!isOpen)}
    className={`
          flex items-center gap-2
          px-3 py-2
          border-[3px] border-black rounded-md
          font-black text-[13px] uppercase tracking-wide
          cursor-pointer
          bg-white
          shadow-[3px_3px_0_black]
          transition-colors
          hover:bg-[#E8E8E8]
          ${isOpen ? "bg-[#CCFF00]" : ""}
        `}>
    {item.icon && <span className="mr-1">{item.icon}</span>}
    {item.label}
    <span
     className={`
            ml-auto
            text-[11px]
            transition-transform duration-200
            ${isOpen ? "rotate-90" : "rotate-0"}
          `}>
     ▶
    </span>
   </div>
   {isOpen && (
    <div className="mt-[5px] max-h-[800px] overflow-hidden transition-all duration-200">
     {children.map((child, index) => (
      <TreeNode key={index} item={child} />
     ))}
    </div>
   )}
  </div>
 )
}
