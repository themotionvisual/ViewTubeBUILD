import React from "react"

interface VideoCardProps {
 title: string
 views?: string
 ctr?: string
 duration?: string
 status?: "LIVE" | "SCHED" | "DRAFT" | "UPLOADING"
 thumbnail?: string
 placeholderIcon?: string
 gradientColors?: [string, string]
 onClick?: () => void
}

export const VideoCard: React.FC<VideoCardProps> = ({
 title,
 views,
 ctr,
 duration,
 status,
 thumbnail,
 placeholderIcon,
 gradientColors = ["#00CCFF", "#CCFF00"],
 onClick,
}) => {
 const statusColorClasses = {
  LIVE: "bg-[#CCFF00]",
  SCHED: "bg-[#FFD600]",
  DRAFT: "bg-[#FF3399]",
  UPLOADING: "bg-[#00CCFF]",
 }

 return (
  <div
   onClick={onClick}
   className="
        border-[4px] border-black
        rounded-[16px]
        overflow-hidden
        bg-white
        shadow-[4px_4px_0_black]
        transition-all duration-150
        cursor-pointer
        hover:translate-x-[-3px] hover:translate-y-[-3px]
        hover:shadow-[11px_11px_0_black]
      ">
   {/* Thumbnail */}
   <div className="w-full h-[120px] bg-[#E8E8E8] relative border-b-[3px] border-black">
    {thumbnail ? (
     <img src={thumbnail} alt="" className="w-full h-full object-cover block" />
    ) : (
     <div
      className="w-full h-full flex items-center justify-center"
      style={{
       background: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`,
      }}>
      {placeholderIcon && (
       <span className="text-[32px]" style={{ background: "transparent" }}>
        {placeholderIcon}
       </span>
      )}
     </div>
    )}

    {/* Duration Badge */}
    {duration && (
     <div
      className="
              absolute bottom-[7px] right-[7px]
              bg-black text-white
              font-black text-[10px]
              px-[7px] py-[2px]
              rounded-[4px]
              border-2 border-black
            ">
      {duration}
     </div>
    )}
   </div>

   {/* Info */}
   <div className="p-[10px] px-3">
    <div
     className="
            font-black text-[13px] uppercase
            tracking-wide leading-tight
            mb-[6px]
          ">
     {title}
    </div>

    <div className="flex gap-2 flex-wrap">
     {views && (
      <span
       className="
                font-black text-[10px]
                text-[#AAAAAA]
                uppercase tracking-wide
              ">
       {views} views
      </span>
     )}
     {ctr && (
      <span
       className="
                font-black text-[10px]
                text-[#AAAAAA]
                uppercase tracking-wide
              ">
       {ctr} CTR
      </span>
     )}
     {status && (
      <span
       className={`
                px-2 py-0.5
                text-[9px] font-black uppercase
                rounded-sm
                shadow-[2px_2px_0_black]
                border-2 border-black
                ${statusColorClasses[status]}
              `}>
       {status}
      </span>
     )}
    </div>
   </div>
  </div>
 )
}

interface VideoCardGridProps {
 videos: Array<{
  title: string
  views?: string
  ctr?: string
  duration?: string
  status?: VideoCardProps["status"]
  thumbnail?: string
  placeholderIcon?: string
  gradientColors?: [string, string]
 }>
}

export const VideoCardGrid: React.FC<VideoCardGridProps> = ({ videos }) => {
 return (
  <div className="grid grid-cols-3 gap-4">
   {videos.map((video, index) => (
    <VideoCard key={index} {...video} />
   ))}
  </div>
 )
}
