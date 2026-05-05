import React from "react"
import Lottie from "lottie-react"

interface VTLottieProps {
  animationUrl: string
  size?: number
  loop?: boolean
  autoplay?: boolean
}

export const VTLottie: React.FC<VTLottieProps> = ({
  animationUrl,
  size = 24,
  loop = true,
  autoplay = true,
}) => {
  const [animationData, setAnimationData] = React.useState<any>(null)

  React.useEffect(() => {
    fetch(animationUrl)
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Failed to load Lottie animation:", err))
  }, [animationUrl])

  if (!animationData) {
    return <div style={{ width: size, height: size }} />
  }

  return (
    <div style={{ width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{ width: size, height: size }}
      />
    </div>
  )
}
