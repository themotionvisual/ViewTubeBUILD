import React, { useState } from "react"

interface StyleChipProps {
 label: string
 active?: boolean
 color?: "cyan" | "lime" | "yellow" | "pink" | "purple" | "orange" | "default"
 onClick?: () => void
}

const colorClasses = {
 cyan: "bg-[#00CCFF] text-black",
 lime: "bg-[#CCFF00] text-black",
 yellow: "bg-[#FFD600] text-black",
 pink: "bg-[#FF3399] text-white",
 purple: "bg-[#9B59FF] text-white",
 orange: "bg-[#FFB158] text-black",
 default: "bg-white text-black",
}

const activeColorClasses = {
 cyan: "!bg-[#00CCFF]",
 lime: "!bg-[#CCFF00]",
 yellow: "!bg-[#FFD600]",
 pink: "!bg-[#FF3399]",
 purple: "!bg-[#9B59FF]",
 orange: "!bg-[#FFB158]",
 default: "!bg-black text-white",
}

export const StyleChip: React.FC<StyleChipProps> = ({
 label,
 active = false,
 color = "default",
 onClick,
}) => {
 const [isOn, setIsOn] = useState(active)

 const handleClick = () => {
  setIsOn(!isOn)
  onClick?.()
 }

 return (
  <button
   onClick={handleClick}
   className={`
         px-4 py-2
         border-[3px] border-black
         rounded-xl
         font-black
         text-sm
         uppercase
         tracking-wide
         cursor-pointer
         transition-all
         duration-75
         shadow-[6px_6px_0px_0px_black]
         hover:shadow-none
         hover:translate-x-[2px]
         hover:translate-y-[2px]
         ${isOn ? activeColorClasses[color] : colorClasses[color]}
       `}>
   {label}
  </button>
 )
}

interface StyleChipRowProps {
 chips: Array<{
  label: string
  color?: StyleChipProps["color"]
  active?: boolean
 }>
}

export const StyleChipRow: React.FC<StyleChipRowProps> = ({ chips }) => {
 return (
  <div className="grid grid-cols-3 gap-4">
   {chips.map((chip, index) => (
    <StyleChip
     key={index}
     label={chip.label}
     color={chip.color}
     active={chip.active}
    />
   ))}
  </div>
 )
}
