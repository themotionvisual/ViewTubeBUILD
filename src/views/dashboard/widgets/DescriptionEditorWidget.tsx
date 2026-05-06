import React, { useState, useEffect } from "react"
import { WidgetShell } from "../WidgetShell"
import { FileText, Copy, Check } from "lucide-react"

const FOOTER_KEY = "vt_desc_default_footer"

export const DescriptionEditorWidget = ({ widget, instance, editMode, onToggleCollapse, onCycleSize, onCycleHeight, onDecSize, onDecHeight, onRemove, data }: any) => {
 const common = {
  widget,
  instance,
  editMode,
  canEdit: true,
  onToggleCollapse,
  onCycleSize,
  onCycleHeight,
  onRemove,
  onDecSize,
  onCycleHeight,
  onDecHeight,
 }
 const [description, setDescription] = useState("")
 const [footer, setFooter] = useState(() => localStorage.getItem(FOOTER_KEY) || "")
 const [copied, setCopied] = useState(false)

 useEffect(() => {
  localStorage.setItem(FOOTER_KEY, footer)
 }, [footer])

 const fullDescription = [description, footer].filter(Boolean).join("\n\n---\n\n")

 const handleCopy = () => {
  navigator.clipboard.writeText(fullDescription)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
 }

 return (
  <WidgetShell {...common} icon={<FileText size={22} />}>
   <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "8px", overflowY: "auto" }}>
    {/* Main Description */}
    <div style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1 }}>
     <label style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.5 }}>Video Description</label>
     <textarea
      className="vt-textarea"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      placeholder="Write your video description here..."
      style={{ flex: 1, minHeight: "100px" }}
     />
    </div>

    {/* Default Footer */}
    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
     <label style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.5 }}>
      Default Footer <span style={{ fontSize: "7px", opacity: 0.6 }}>(auto-saved)</span>
     </label>
     <textarea
      className="vt-textarea"
      value={footer}
      onChange={(e) => setFooter(e.target.value)}
      placeholder="Links, socials, disclaimer — appended to every description..."
      style={{ minHeight: "70px" }}
     />
    </div>

    {/* Copy Button */}
    <button
     onClick={handleCopy}
     disabled={!description && !footer}
     style={{
      height: "36px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
      background: copied ? "#4FFF5B" : "#fff", border: "3px solid #000", borderRadius: "8px",
      fontSize: "10px", fontWeight: 900, textTransform: "uppercase", cursor: "pointer",
      boxShadow: "3px 3px 0 0 #000", transition: "all 0.15s",
     }}>
     {copied ? <Check size={14} /> : <Copy size={14} />}
     {copied ? "Copied!" : "Copy Full Description"}
    </button>
   </div>
  </WidgetShell>
 )
}
