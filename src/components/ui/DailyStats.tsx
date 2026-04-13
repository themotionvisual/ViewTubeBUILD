import React from "react"

interface DailyStatsRow {
 metric: string
 today: string | number
 delta: string
 deltaDirection?: "up" | "down"
}

interface DailyStatsProps {
 title?: string
 data: DailyStatsRow[]
 collapsed?: boolean
}

export const DailyStats: React.FC<DailyStatsProps> = ({
 title = "Daily Stats",
 data,
 collapsed = false,
}) => {
 const [isCollapsed, setIsCollapsed] = React.useState(collapsed)

 return (
  <div
   className="
        border-[4px] border-black
        rounded-[16px]
        overflow-hidden
        bg-white
        shadow-[4px_4px_0_black]
        max-w-[480px]
      ">
   {/* Header */}
   <div
    className="
          flex items-center justify-between
          h-[52px] px-4
          bg-[#00CCFF]
          border-b-[4px] border-black
        ">
    <div className="flex items-center gap-3">
     <div
      className="
              w-[52px] h-full
              bg-black
              flex items-center justify-center
              text-white text-[16px]
              border-r-[4px] border-black
            ">
      □
     </div>
     <span
      className="
              font-black uppercase
              text-[18px]
              text-white
            ">
      {title}
     </span>
    </div>
    <button
     onClick={() => setIsCollapsed(!isCollapsed)}
     className="
            w-[36px] h-[36px]
            border-[3px] border-black
            rounded-md
            bg-black/10
            flex items-center justify-center
            font-black text-[22px]
            text-black
            transition-colors
            hover:bg-black/25
          ">
     {isCollapsed ? "+" : "−"}
    </button>
   </div>

   {/* Body */}
   {!isCollapsed && (
    <div className="bg-white">
     <table className="w-full border-collapse">
      <thead>
       <tr>
        <th
         className="
                    px-[10px] py-[7px] text-left
                    bg-black text-white
                    font-black text-[10px] uppercase tracking-[0.14em]
                    border-b-[4px] border-black
                  ">
         Metric
        </th>
        <th
         className="
                    px-[10px] py-[7px] text-left
                    bg-black text-white
                    font-black text-[10px] uppercase tracking-[0.14em]
                    border-b-[4px] border-black
                  ">
         Today
        </th>
        <th
         className="
                    px-[10px] py-[7px] text-left
                    bg-black text-white
                    font-black text-[10px] uppercase tracking-[0.14em]
                    border-b-[4px] border-black
                  ">
         Δ
        </th>
       </tr>
      </thead>
      <tbody>
       {data.map((row, index) => (
        <tr key={index} className="hover:bg-[#F5F5EE] transition-colors">
         <td
          className="
                      px-[10px] py-[7px]
                      font-black text-[11px] uppercase tracking-wide
                      border-b-[2px] border-[#E8E8E8]
                    ">
          {row.metric}
         </td>
         <td
          className="
                      px-[10px] py-[7px]
                      font-black text-[13px]
                      border-b-[2px] border-[#E8E8E8]
                    ">
          {row.today}
         </td>
         <td
          className={`
                      px-[10px] py-[7px]
                      font-black text-[13px]
                      border-b-[2px] border-[#E8E8E8]
                      ${row.deltaDirection === "down" ? "text-[#FF3399]" : "text-[#1AAA55]"}
                    `}>
          {row.delta}
         </td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>
   )}
  </div>
 )
}
