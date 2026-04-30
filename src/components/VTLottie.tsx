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

export const VTLottie: React.FC<VTLottieProps> = ({
  animationUrl,
  loop = true,
  autoplay = true,
  size = 24,
  className,
  style,
}) => {
  const [animationData, setAnimationData] = React.useState<any>(null);

  React.useEffect(() => {
    fetch(animationUrl)
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error('Failed to load Lottie animation:', err));
  }, [animationUrl]);

  if (!animationData) return <div style={{ width: size, height: size, ...style }} className={className} />;

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
