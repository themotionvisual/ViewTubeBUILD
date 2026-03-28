import React from 'react';
import { AccordionContainer } from '../components/AccordionContainer';
import SeoGenerator from './SeoGenerator';
import ThumbnailStudio from './ThumbnailStudio';
import StoryboardStudio from './StoryboardStudio';
import MediaAnalyzer from './MediaAnalyzer';
import HookGenerator from './HookGenerator';
import PreLaunchPriming from '../components/PreLaunchPriming';
import { CommunityPostGenerator } from '../components/CommunityPostGenerator';
import { CommentResponder } from '../components/CommentResponder';
import { EndScreenTool } from '../components/EndScreenTool';

const StudioHub: React.FC = () => {
  return (
    <div className="flex flex-col space-y-2 max-w-7xl mx-auto pb-24">

      {/* Page Header */}
      <div className="mb-10 px-2 mt-4 text-center">
        <h2 className="text-7xl font-[1000] uppercase tracking-[calc(-0.06em)] leading-none text-black">
          STUDIO <span className="text-[#FF3399]">HUB</span>
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 mt-4">Production & Optimization Suite</p>
      </div>

      {/* Accordion Modules */}
      <div className="space-y-6">

        {/* SEO Generator Accordion */}
        <AccordionContainer
          title="SEO Generator"
          subtitle="Viral Keyword & Metadata Optimization"
          headerColor="bg-[#00CCFF]"
          icon="!!!IDEA"
          iconBoxColor="bg-[#FFDD00]"
          isOpenInitial={true}
        >
          <SeoGenerator />
        </AccordionContainer>

        {/* Thumbnail Studio Accordion */}
        <AccordionContainer
          title="Thumbnail Studio"
          subtitle="Visual Hook Generation & Analysis"
          headerColor="bg-[#FFDD00]"
          icon="image"
          iconBoxColor="bg-[#FF3399]"
        >
          <ThumbnailStudio />
        </AccordionContainer>

        {/* Storyboard Studio Accordion */}
        <AccordionContainer
          title="Storyboard Studio"
          subtitle="Narrative Flow & Narrative Analysis"
          headerColor="bg-[#FF3399]"
          icon="!!!POST-VIDEO"
          iconBoxColor="bg-[#00CCFF]"
        >
          <StoryboardStudio />
        </AccordionContainer>

        {/* Media Analyzer Accordion */}
        <AccordionContainer
          title="Content Analyzer"
          subtitle="AI Script & Pacing Breakdown"
          headerColor="bg-[#FFB158]"
          icon="search"
          iconBoxColor="bg-[#FF7497]"
        >
          <MediaAnalyzer />
        </AccordionContainer>

        {/* Hook Generator Accordion */}
        <AccordionContainer
          title="Hook Generator"
          subtitle="6-Part Scroll-Stopping Intros"
          headerColor="bg-[#FF6666]"
          icon="!!!IDEA"
          iconBoxColor="bg-[#FFE850]"
        >
          <HookGenerator />
        </AccordionContainer>

        {/* Pre-Launch Priming Accordion */}
        <AccordionContainer
          title="Pre-Launch Priming"
          subtitle="Community & Algorithm Seeding"
          headerColor="bg-[#CC99FF]"
          icon="!!!TRAFIC"
          iconBoxColor="bg-[#FFE850]"
        >
          <PreLaunchPriming />
        </AccordionContainer>

        {/* Community Post Generator */}
        <AccordionContainer
          title="Community Posts"
          subtitle="7-Day Schedule Generator"
          headerColor="bg-[#00CCFF]"
          icon="!!!TEXT"
          iconBoxColor="bg-[#FFDD00]"
        >
          <CommunityPostGenerator />
        </AccordionContainer>

        {/* Comment Responder */}
        <AccordionContainer
          title="Comment Responder"
          subtitle="Smart Audience Engagement & Linking"
          headerColor="bg-[#FF3399]"
          icon="!!!IDEA"
          iconBoxColor="bg-[#00CCFF]"
        >
          <CommentResponder />
        </AccordionContainer>

        <AccordionContainer title="End-Screen Architect" subtitle="Max Conversion Outros" headerColor="bg-[#CCFF00]" icon="!!!POST-VIDEO" iconBoxColor="bg-[#FF3399]">
          <EndScreenTool />
        </AccordionContainer>

      </div>
    </div>
  );
};

export default StudioHub;
