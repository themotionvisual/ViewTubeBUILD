import React from 'react';
import { AccordionContainer } from '../components/AccordionContainer';
import { ToolHeader } from '../components/ToolHeader';
import { MobileLookChart } from '../components/MobileLookChart';
import { SprocketHoles } from '../components/SprocketHoles';
import { CustomIcon } from '../components/CustomIcon';
import { CommunityPostGenerator } from '../components/CommunityPostGenerator';
import { CommentResponder } from '../components/CommentResponder';
import { EndScreenTool } from '../components/EndScreenTool';
import { NexusCommander } from '../components/NexusCommander';
import { NativeUIKit } from '../components/NativeUIKit';
import { ProjectStudio } from '../components/ProjectStudio';
import PreLaunchPriming from '../components/PreLaunchPriming';
import MediaAnalyzer from '../components/MediaAnalyzer';

import Dashboard from '../views/Dashboard';
import StudioHub from '../views/StudioHub';
import PerformanceHub from '../views/PerformanceHub';
import SettingsHub from '../views/SettingsHub';
import ProjectsV3 from '../views/ProjectsV3';

interface LiveCanvasSpec {
  label: string;
  render: () => React.ReactNode;
}

const sampleLineData = [
  { Date: 'Mon', Views: 4200 },
  { Date: 'Tue', Views: 5100 },
  { Date: 'Wed', Views: 4700 },
  { Date: 'Thu', Views: 6100 },
  { Date: 'Fri', Views: 7300 },
  { Date: 'Sat', Views: 6900 },
  { Date: 'Sun', Views: 8050 },
];

const liveCanvasRegistry: Record<string, LiveCanvasSpec> = {
  'components/AccordionContainer.tsx': {
    label: 'AccordionContainer',
    render: () => (
      <AccordionContainer
        title="Preview Container"
        subtitle="Sample shell with injected content"
        icon="analytics"
        headerColor="bg-[#00CCFF]"
        iconBoxColor="bg-[#CCFF00]"
        isOpenInitial
      >
        <div className="space-y-2">
          <p className="font-black uppercase text-sm">Live Canvas Preview</p>
          <p className="font-bold text-xs opacity-70">This is a safe wrapper with mock content.</p>
        </div>
      </AccordionContainer>
    ),
  },
  'components/ToolHeader.tsx': {
    label: 'ToolHeader',
    render: () => (
      <div className="border-[5px] border-black rounded-2xl overflow-hidden">
        <ToolHeader title="Preview Header" icon="settings" titleBgColor="bg-[#CCFF00]" iconBgColor="bg-[#FF3399]" />
      </div>
    ),
  },
  'components/MobileLookChart.tsx': {
    label: 'MobileLookChart',
    render: () => <MobileLookChart data={sampleLineData} xKey="Date" yKey="Views" color="#00CCFF" height={260} />,
  },
  'components/SprocketHoles.tsx': {
    label: 'SprocketHoles',
    render: () => (
      <div className="bg-black rounded-xl p-4 h-16">
        <SprocketHoles count={18} color="white" />
      </div>
    ),
  },
  'components/CustomIcon.tsx': {
    label: 'CustomIcon',
    render: () => (
      <div className="flex flex-wrap gap-4">
        {['home', 'analytics', 'settings', '!!!GENERATE1', '!!!TRAFIC', '!!!POST-VIDEO'].map((iconName) => (
          <div key={iconName} className="border-[3px] border-black rounded-xl p-3 bg-white shadow-[4px_4px_0px_0px_black] flex items-center gap-2">
            <CustomIcon name={iconName} size={28} />
            <span className="text-[10px] font-black uppercase">{iconName}</span>
          </div>
        ))}
      </div>
    ),
  },
  'components/CommunityPostGenerator.tsx': { label: 'CommunityPostGenerator', render: () => <CommunityPostGenerator /> },
  'components/CommentResponder.tsx': { label: 'CommentResponder', render: () => <CommentResponder /> },
  'components/EndScreenTool.tsx': { label: 'EndScreenTool', render: () => <EndScreenTool /> },
  'components/PreLaunchPriming.tsx': { label: 'PreLaunchPriming', render: () => <PreLaunchPriming /> },
  'components/MediaAnalyzer.tsx': { label: 'MediaAnalyzer', render: () => <MediaAnalyzer /> },
  'components/NativeUIKit.tsx': { label: 'NativeUIKit', render: () => <NativeUIKit /> },
  'components/NexusCommander.tsx': { label: 'NexusCommander', render: () => <NexusCommander /> },
  'components/ProjectStudio.tsx': { label: 'ProjectStudio', render: () => <ProjectStudio /> },

  'views/Dashboard.tsx': { label: 'Dashboard', render: () => <Dashboard /> },
  'views/StudioHub.tsx': { label: 'StudioHub', render: () => <StudioHub /> },
  'views/PerformanceHub.tsx': { label: 'PerformanceHub', render: () => <PerformanceHub /> },
  'views/SettingsHub.tsx': { label: 'SettingsHub', render: () => <SettingsHub /> },
  'views/ProjectsV3.tsx': { label: 'ProjectsV3', render: () => <ProjectsV3 /> },
};

export const getLiveCanvasSpec = (path: string): LiveCanvasSpec | null => {
  return liveCanvasRegistry[path] || null;
};
