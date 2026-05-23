import React from "react"

interface KPIStatCardProps {
 label: string
 value: string | number
 delta?: string
 deltaDirection?: "up" | "down"
 color?: "cyan" | "lime" | "yellow" | "pink" | "orange" | "purple" | "white"
}

const colorClasses = {
 cyan: "bg-[#00CCFF]",
 lime: "bg-[#CCFF00]",
 yellow: "bg-[#FFD600]",
 pink: "bg-[#FF3399]",
 orange: "bg-[#FFB158]",
 purple: "bg-[#9B59FF] text-white",
 white: "bg-white",
}

export const KPIStatCard: React.FC<KPIStatCardProps> = ({
 label,
 value,
 delta,
 deltaDirection = "up",
 color = "white",
}) => {
 return (
  <div
   className={`
        p-4
        border-[4px] border-black
        rounded-[16px]
        shadow-[4px_4px_0_black]
        min-w-[140px]
        ${colorClasses[color]}
      `}>
   <div
    className={`
          font-black text-[10px] uppercase tracking-[0.14em]
          mb-1
          ${color === "purple" || color === "pink" ? "text-white/60" : "text-black/50"}
        `}>
    {label}
   </div>
   <div
    className={`
          font-black leading-none
          ${color === "purple" || color === "pink" ? "text-white" : "text-black"}
        `}
    style={{ fontSize: "38px" }}>
    {value}
   </div>
   {delta && (
    <div
     className={`
            mt-1
            font-black text-[11px]
            ${deltaDirection === "up" ? "text-[#1AAA55]" : "text-[#FF3399]"}
          `}>
     {deltaDirection === "up" ? "↑" : "↓"} {delta}
    </div>
   )}
  </div>
 )
}

interface KPIStatRowProps {
 stats: Array<{
  label: string
  value: string | number
  delta?: string
  deltaDirection?: "up" | "down"
  color?: KPIStatCardProps["color"]
 }>
}

export const KPIStatRow: React.FC<KPIStatRowProps> = ({ stats }) => {
 return (
  <div className="grid grid-cols-3 gap-6">
   {stats.map((stat, index) => (
    <KPIStatCard
     key={index}
     label={stat.label}
     value={stat.value}
     delta={stat.delta}
     deltaDirection={stat.deltaDirection}
     color={stat.color}
    />
   ))}
  </div>
 )
}
