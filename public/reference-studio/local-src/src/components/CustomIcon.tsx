import React, { useState } from 'react';

/**
 * CustomIcon Component
 * Renders proprietary VT Icons from the assets directory.
 * Supports animation sequences (starting with >) and mandatory mappings (starting with !!!).
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
  | 'headset'
  | string;

interface CustomIconProps {
  name: IconName;
  size?: number;
  className?: string;
  animate?: boolean;
}

const iconMap: Record<string, string> = {
  home: 'home_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  search: 'search_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  video: '!!!POST-VIDEO.svg',
  image: '!!!POST-IMAGE.svg',
  analytics: '!!!TRAFIC.svg',
  ideas: 'lightbulb_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  settings: '!!!SETTINGS.svg',
  zap: '!!!GENERATE1.svg',
  sparkles: 'wand_stars_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48(1).svg',
  target: 'center_focus_weak_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  cloud: '!!!CLOUD.svg',
  database: 'storage_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  mic: 'mic_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  volume: 'volume_up_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  headset: 'podcasts_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  calendar: 'calendar_apps_script_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  checklist: 'rule_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  play: '!!!GENERATE1.svg',
  pause: '!!!GENERATE2.svg',
  layers: '!!!COLLECTION.svg',
  eye: '!!!GENERATE1.svg',
  'eye-off': '!!!DELETE.svg',
  audio: 'mic_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  '!!!A:B-TESTING': '!!!A:B-TESTING.svg',
  '!!!TRAFIC': '!!!TRAFIC.svg',
  '!!!REVENUE': '!!!REVENUE.svg',
  '!!!SUBSCRIBERS': '!!!SUBSCRIBERS.svg',
  '!!!GEOGRAPHY': '!!!GEOGRAPHY.svg',
  '!!!YOUTUBE': '!!!YOUTUBE.svg',
  '!!!POST-VIDEO': '!!!POST-VIDEO.svg',
  '!!!IDEA': 'lightbulb_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  '!!!ANALYTICS': '!!!TRAFIC.svg',
  '!!!PALETTE': 'palette_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  '!!!TEXT': 'format_shapes_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  '!!!COLLECTION': 'view_cozy_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  '!!!CLOUD': 'cloud_70dp_1F1F1F_FILL0_wght700_GRAD0_opsz48.svg',
  '!!!GENERATE1': '!!!GENERATE1.svg',
  '!!!GENERATE2': '!!!GENERATE2.svg',
  'SYMBOLS 19': '*SYMBOLS19.svg',
  'SYMBOLS 22': '*SYMBOLS22.svg'
};

export const CustomIcon: React.FC<CustomIconProps> = ({ name, size = 24, className = "", animate = true }) => {
  const [hovered, setHovered] = useState(false);
  
  // Resolve filename from map or use name directly
  let fileName = iconMap[name] || name;
  if (!fileName.endsWith('.svg') && !fileName.endsWith('.png')) {
    fileName += '.svg';
  }

  // Handle animation sequences (e.g., >A1, >A2)
  // If animate is on and we are hovering, look for the "next" in sequence if it exists
  const isSequence = name.startsWith('>');
  let finalPath = `/src/assets/icons/${fileName}`;
  
  if (isSequence && animate && hovered) {
    // Attempt to find #2 in sequence (e.g., >A1 -> >A2)
    if (name.endsWith('1')) {
      const altName = name.replace('1', '2');
      finalPath = `/src/assets/icons/${altName}.svg`;
    }
  }

  return (
    <img 
      src={finalPath} 
      alt={`${name} icon`} 
      style={{ width: size, height: size }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`inline-block select-none pointer-events-none transition-transform duration-200 ${hovered ? 'scale-110' : ''} ${className}`}
    />
  );
};
