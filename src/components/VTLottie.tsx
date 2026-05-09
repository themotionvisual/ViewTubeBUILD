import React from 'react';
import Lottie from 'lottie-react';

interface VTLottieProps {
  animationUrl: string;
  loop?: boolean;
  autoplay?: boolean;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const FAILED_LOTTIE_URLS = new Set<string>()

export const VTLottie: React.FC<VTLottieProps> = ({
  animationUrl,
  loop = true,
  autoplay = true,
  size = 24,
  className,
  style,
}) => {
  const [animationData, setAnimationData] = React.useState<any>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    let active = true
    setAnimationData(null)
    setFailed(false)
    if (FAILED_LOTTIE_URLS.has(animationUrl)) {
      setFailed(true)
      return () => {
        active = false
      }
    }
    fetch(animationUrl)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const contentType = String(res.headers.get("content-type") || "").toLowerCase()
        if (!contentType.includes("json")) {
          throw new Error(`Unexpected content-type: ${contentType || "unknown"}`)
        }
        return res.json()
      })
      .then((data) => {
        if (!active) return
        setAnimationData(data)
      })
      .catch((err) => {
        if (!active) return
        setFailed(true)
        FAILED_LOTTIE_URLS.add(animationUrl)
        void err
      });
    return () => {
      active = false
    }
  }, [animationUrl]);

  if (!animationData) {
    return (
      <div
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
        {failed ? (
          <span
            aria-hidden="true"
            style={{
              width: Math.max(8, Math.floor(size * 0.4)),
              height: Math.max(8, Math.floor(size * 0.4)),
              borderRadius: "999px",
              background: "#111",
              opacity: 0.35,
              display: "inline-block",
            }}
          />
        ) : null}
      </div>
    )
  }

  return (
    <div 
      style={{ 
        width: size, 
        height: size, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        ...style 
      }} 
      className={className}
    >
      <Lottie 
        animationData={animationData} 
        loop={loop} 
        autoplay={autoplay}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};
