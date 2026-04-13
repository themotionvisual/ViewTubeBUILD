import React, { useEffect } from "react"

interface ModalProps {
 isOpen: boolean
 onClose: () => void
 title: string
 children: React.ReactNode
 footer?: React.ReactNode
 headerColor?: "cyan" | "lime" | "pink" | "yellow" | "black"
}

export const Modal: React.FC<ModalProps> = ({
 isOpen,
 onClose,
 title,
 children,
 footer,
 headerColor = "cyan",
}) => {
 useEffect(() => {
  if (isOpen) {
   document.body.style.overflow = "hidden"
  } else {
   document.body.style.overflow = ""
  }
  return () => {
   document.body.style.overflow = ""
  }
 }, [isOpen])

 if (!isOpen) return null

 const headerColorClasses = {
  cyan: "bg-[#00CCFF]",
  lime: "bg-[#CCFF00]",
  pink: "bg-[#FF3399]",
  yellow: "bg-[#FFD600]",
  black: "bg-black text-white",
 }

 return (
  <div
   className="
        fixed inset-0
        bg-black/55
        flex items-center justify-center
        z-[999]
        backdrop-blur-[2px]
        animate-in fade-in duration-150
      "
   onClick={onClose}>
   <div
    className="
          w-[440px] max-w-[92vw]
          bg-white
          border-[5px] border-black
          rounded-[16px]
          shadow-[12px_12px_0px_black]
          overflow-hidden
          animate-[slideUp_0.2s_ease]
        "
    onClick={(e) => e.stopPropagation()}>
    {/* Header */}
    <div
     className={`
            flex justify-between items-center
            px-5 py-4
            border-b-[4px] border-black
            ${headerColorClasses[headerColor]}
          `}>
     <span
      className={`
              font-black text-[20px] uppercase tracking-wide
              ${headerColor === "black" ? "text-white" : "text-black"}
            `}>
      {title}
     </span>
     <button
      onClick={onClose}
      className="
              w-[30px] h-[30px]
              bg-black text-white
              border-2 border-black
              rounded-md
              flex items-center justify-center
              font-black text-[14px]
              cursor-pointer
              hover:bg-black/80
            ">
      ✕
     </button>
    </div>

    {/* Body */}
    <div className="p-5">{children}</div>

    {/* Footer */}
    {footer && (
     <div
      className="
              px-5 py-4
              border-t-[4px] border-black
              flex justify-end gap-2.5
            ">
      {footer}
     </div>
    )}
   </div>

   {/* CSS Keyframes for slideUp animation */}
   <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
  </div>
 )
}
