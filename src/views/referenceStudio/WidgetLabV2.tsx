import React from "react";
import { LayoutGrid, Sparkles, Workflow, Wrench } from "lucide-react";
import { Toolbox } from "../../components/Toolbox";
import { WIDGET_LAB_SPECS, type WidgetPromotionState } from "./widgetContracts";

const STATUS_STYLE: Record<WidgetPromotionState, string> = {
  prototype: "bg-[#FFE357]",
  "ready-for-prod": "bg-[#CCFF00]",
  "needs-backend": "bg-[#FF7497]",
};

const formatDeps = (deps: string[]) =>
  deps.map((dep) => dep.replaceAll("_", " ").toUpperCase()).filter(Boolean);

const WidgetLabV2: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* 1. WIDGET LAB CORE SCAFFOLD */}
      <Toolbox
        variant="scaffold"
        title="WIDGET LAB"
        iconName="layers"
        headerColor="bg-[#B14AED]"
        iconBoxColor="bg-[#CCFF00]"
        defaultOpen={true}
      >
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 p-6">
          {/* A. Widget Pipeline - SubToolbox */}
          <Toolbox
            variant="sub"
            title="Widget Pipeline"
            iconName="video"
            headerColor="bg-[#24D3FF]"
          >
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2">
                Phase Progress
              </p>
              {[
                { stage: "Stage A", text: "widget-preview.html to Widget Lab" },
                { stage: "Stage B", text: "Typed React widget modules + backend contracts" },
                { stage: "Stage C", text: "Feature-flag rollout into live dashboard" },
              ].map((item) => (
                <div key={item.stage} className="border-[3px] border-black rounded-xl p-4 bg-white shadow-[4px_4px_0px_0px_black]">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#B14AED] mb-1">
                    {item.stage}
                  </p>
                  <p className="text-sm font-[900] leading-tight">{item.text}</p>
                </div>
              ))}
            </div>
          </Toolbox>

          {/* B. Widget Registry - SubToolbox */}
          <div className="xl:col-span-2">
            <Toolbox
              variant="sub"
              title="Widget Registry"
              iconName="settings"
              headerColor="bg-[#FFB158]"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {WIDGET_LAB_SPECS.map((widget) => (
                  <article
                    key={widget.id}
                    className="border-[3px] border-black rounded-2xl bg-white p-4 shadow-[6px_6px_0px_0px_black] hover:-translate-y-1 transition-transform"
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h3 className="text-base font-[1000] uppercase tracking-tight leading-none">
                        {widget.title}
                      </h3>
                      <span
                        className={`px-3 py-1 border-[2px] border-black rounded-lg text-[9px] font-black uppercase tracking-[0.12em] ${
                          STATUS_STYLE[widget.status.state]
                        }`}
                      >
                        {widget.status.state}
                      </span>
                    </div>
                    
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-3">
                      {widget.category}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {formatDeps(widget.status.dependencies).map((dep) => (
                        <span key={dep} className="px-2 py-0.5 bg-black text-white rounded text-[8px] font-black">
                          {dep}
                        </span>
                      ))}
                    </div>

                    <div className="p-3 bg-gray-50 border-[2px] border-black rounded-xl">
                       <p className="text-xs font-bold leading-normal italic text-black/70">"{widget.status.notes}"</p>
                    </div>
                  </article>
                ))}
              </div>
            </Toolbox>
          </div>
        </div>
      </Toolbox>

      {/* 2. WIDGET PREVIEW SOURCE SURFACE */}
      <Toolbox
        variant="scaffold"
        title="WIDGET PREVIEW SOURCE"
        iconName="image"
        headerColor="bg-[#CCFF00]"
        iconBoxColor="bg-[#24D3FF]"
        defaultOpen={false}
      >
        <div className="p-6">
          <Toolbox variant="sub" title="Source Preview" iconName="sparkles" headerColor="bg-[#FFE357]">
            <div className="border-[4px] border-black rounded-[2rem] overflow-hidden shadow-[12px_12px_0px_0px_black]">
              <div className="h-10 px-4 border-b-[4px] border-black bg-black text-white flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Authoritative Source</span>
                <span className="text-[9px] font-black opacity-50 uppercase">Viewport Sync Active</span>
              </div>
              <iframe
                src="/widget-preview.html"
                title="widget-preview.html"
                className="w-full h-[800px] bg-white"
                loading="lazy"
              />
            </div>
          </Toolbox>
        </div>
      </Toolbox>
    </div>
  );
};

export default WidgetLabV2;
