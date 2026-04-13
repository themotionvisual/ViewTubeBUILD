import React, { useState } from "react"

interface ToggleProps {
 label?: string
 active?: boolean
 color?: "lime" | "cyan" | "pink" | "white"
 badge?: string
 onChange?: (active: boolean) => void
}

const colorClasses = {
 lime: "bg-[#CCFF00]",
 cyan: "bg-[#00CCFF]",
 pink: "bg-[#FF3399]",
 white: "bg-white",
}

export const Toggle: React.FC<ToggleProps> = ({
 label,
 active = false,
 color = "white",
 badge,
 onChange,
}) => {
 const [isOn, setIsOn] = useState(active)

 const handleClick = () => {
  const newState = !isOn
  setIsOn(newState)
  onChange?.(newState)
 }

 return (
  <div className="flex items-center gap-3">
   <div
    onClick={handleClick}
    className={`
          w-[54px] h-[30px]
          border-[3px] border-black
          rounded-full
          cursor-pointer
          shadow-[2px_2px_0px_0px_black]
          flex-shrink-0
          relative
          ${isOn ? colorClasses[color] : "bg-white"}
        `}>
    <div
     className={`
            absolute top-1/2 -translate-y-1/2
            w-[20px] h-[20px]
            bg-black
            rounded-full
            transition-transform
            duration-75
            ${isOn ? "translate-x-[28px]" : "translate-x-[2px]"}
          `}
    />
   </div>
   <span className="font-black uppercase text-xs opacity-40">test</span>
   {badge && (
    <span className="ml-2 bg-black text-white px-2 py-1 rounded text-xs font-black uppercase">
     {badge}
    </span>
   )}
  </div>
 )
}

interface CheckboxProps {
 label?: string
 active?: boolean
 color?: "lime" | "pink" | "cyan" | "white"
 done?: boolean
 onChange?: (active: boolean) => void
}

export const Checkbox: React.FC<CheckboxProps> = ({
 label,
 active = false,
 color = "white",
 done = false,
 onChange,
}) => {
 const [isOn, setIsOn] = useState(active)

 const handleClick = () => {
  const newState = !isOn
  setIsOn(newState)
  onChange?.(newState)
 }

 const colorClass = {
  lime: "bg-[#CCFF00] text-black",
  pink: "bg-[#FF3399] text-black",
  cyan: "bg-[#00CCFF] text-black",
  white: "bg-white text-black",
 }

 return (
  <div onClick={handleClick} className="flex items-center gap-3">
   <div
    className={`
          w-[30px] h-[30px]
          border-[3px] border-black
          rounded-[6px]
          flex items-center justify-center
          shadow-[2px_2px_0px_0px_black]
          flex-shrink-0
          ${isOn ? colorClass[color] : "bg-white"}
        `}>
    {isOn && (
     <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="stroke-black"
      style={{ strokeWidth: 3, strokeLinecap: "round" }}>
      <line x1="3" y1="3" x2="13" y2="13" />
      <line x1="13" y1="3" x2="3" y2="13" />
     </svg>
    )}
   </div>
   <span className="font-black uppercase text-xs opacity-40">test</span>
  </div>
 )
}

interface RadioProps {
 label?: string
 active?: boolean
 color?: "cyan" | "lime" | "pink" | "white"
 groupName: string
 onChange?: () => void
}

const radioColorClasses = {
 cyan: "bg-[#00CCFF]",
 lime: "bg-[#CCFF00]",
 pink: "bg-[#FF3399]",
 white: "bg-black",
}

export const Radio: React.FC<RadioProps> = ({
 label,
 active = false,
 color = "white",
 groupName,
 onChange,
}) => {
 const [isOn, setIsOn] = useState(active)

 const handleClick = () => {
  const newState = !isOn
  setIsOn(newState)
  onChange?.()
 }

 return (
  <div onClick={handleClick} className="flex items-center gap-3">
   <div
    className={`
          w-[30px] h-[30px]
          border-[3px] border-black
          rounded-full
          flex items-center justify-center
          shadow-[2px_2px_0px_0px_black]
          flex-shrink-0
          bg-white
        `}>
    {isOn && (
     <div
      className={`
              w-[18px] h-[18px]
              rounded-full
              ${radioColorClasses[color]}
            `}
     />
    )}
   </div>
   <span className="font-black uppercase text-xs opacity-40">test</span>
  </div>
 )
}
