import React from "react"
import type { VideoAsset } from "../../../services/videoAssets"
import { buildVideoAssetOptions } from "./videoAssetOptions"

interface VideoAssetSelectProps {
 assets: VideoAsset[]
 value: string
 onChange: (videoId: string) => void
 query?: string
 limit?: number
 placeholder?: string
 className?: string
 style?: React.CSSProperties
 disabled?: boolean
}

export const VideoAssetSelect: React.FC<VideoAssetSelectProps> = ({
 assets,
 value,
 onChange,
 query = "",
 limit = 50,
 placeholder,
 className = "vt-input",
 style,
 disabled = false,
}) => {
 const options = buildVideoAssetOptions(assets, query, limit, placeholder)
 return (
  <select
   className={className}
   value={value}
   disabled={disabled}
   style={style}
   onChange={(event) => onChange(event.target.value)}
  >
   {options.map((option) => (
    <option key={option.key} value={option.val}>{option.lbl}</option>
   ))}
  </select>
 )
}
