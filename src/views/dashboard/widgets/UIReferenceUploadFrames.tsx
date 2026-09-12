import React from "react"
import { UploadCloud } from "lucide-react"
import { WidgetStandardUploadFrame } from "../WidgetStandardUploadFrame"

/** Reference-library pair for the canonical upload primitive. */
export default function UIReferenceUploadFrames() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <small className="text-[8px] font-black uppercase tracking-wider opacity-55">16:9 Standard</small>
        <WidgetStandardUploadFrame
          shape="landscape"
          icon={<UploadCloud strokeWidth={2.7} />}
          title="Drop File"
          detail="Drag & drop or click to browse"
          onBrowse={() => undefined}
        />
      </div>
      <div className="grid gap-2">
        <small className="text-[8px] font-black uppercase tracking-wider opacity-55">Circle</small>
        <div className="flex justify-center p-2">
          <WidgetStandardUploadFrame
            shape="circle"
            icon={<UploadCloud strokeWidth={2.7} />}
            title="Drop File"
            onBrowse={() => undefined}
          />
        </div>
      </div>
    </div>
  )
}
