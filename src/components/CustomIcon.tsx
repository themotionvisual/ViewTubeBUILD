import React from 'react';

/**
 * CustomIcon Component
 * Renders proprietary VT Icons from the assets directory.
 */

type IconName = 
  | 'home' 
  | 'search' 
  | 'video' 
  | 'image' 
  | 'analytics' 
  | 'ideas' 
  | 'settings'
  | 'zap'
  | 'sparkles'
  | 'target'
  | 'cloud'
  | 'database'
  | 'mic'
  | 'volume'
  | 'headset';

interface CustomIconProps {
  name: IconName | string;
  size?: number;
  className?: string;
}

const iconMap: Record<string, string> = {
  home: 'home_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  search: 'search_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  video: 'video_file_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  image: 'photo_library_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  analytics: 'analytics_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  ideas: 'lightbulb_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  settings: 'settings_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  zap: 'azm_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  sparkles: 'wand_stars_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48(1).svg',
  target: 'center_focus_weak_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  cloud: 'cloud_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  database: 'storage_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  mic: 'mic_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  volume: 'volume_up_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  headset: 'podcasts_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg'
};

export const CustomIcon: React.FC<CustomIconProps> = ({ name, size = 24, className = "" }) => {
  const fileName = iconMap[name] || name;
  const path = `/src/assets/icons/${fileName}`;

  return (
    <img 
      src={path} 
      alt={`${name} icon`} 
      style={{ width: size, height: size }}
      className={`inline-block select-none pointer-events-none ${className}`}
    />
  );
};
