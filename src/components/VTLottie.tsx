import React from "react"

interface VTLottieProps {
  animationUrl: string
  loop?: boolean
  autoplay?: boolean
  size?: number
  className?: string
  style?: React.CSSProperties
}

const VTLottie: React.FC<VTLottieProps> = ({ animationUrl, size = 24, className, style }) => {
  return (
    <div
      aria-hidden="true"
      data-animation-url={animationUrl}
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
      className={className}
    >
      <style>{`
        @keyframes vt-lottie-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes vt-lottie-pulse {
          0%, 100% { opacity: 0.72; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.06); }
        }
      `}</style>
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="8.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="28 12"
          style={{ animation: "vt-lottie-spin 1.05s linear infinite" }}
        />
        <path
          d="M12 6.5v3.4m0 4.2v3.4m-5.5-5.5h3.4m4.2 0h3.4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ animation: "vt-lottie-pulse 1.05s ease-in-out infinite" }}
        />
      </svg>
    </div>
  )
}

export { VTLottie }
