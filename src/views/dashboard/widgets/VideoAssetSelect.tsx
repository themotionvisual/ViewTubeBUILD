import React from "react"
import type { VideoAsset } from "../../../services/videoAssets"
import { buildVideoAssetOptions } from "./videoAssetOptions"
import { WidgetSelect } from "../WidgetPrimitives"

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
 className = "",
 style,
 disabled = false,
}) => {
 const options = buildVideoAssetOptions(assets, query, limit, placeholder)
 return (
  <WidgetSelect
   className={className}
   value={value}
   disabled={disabled}
   style={style}
   onChange={onChange}
   label={placeholder || "Select a video"}
   placeholder={placeholder || "Select a video…"}
   options={options.map((option) => ({ value: option.val, label: option.lbl }))}
  />
 )
}
