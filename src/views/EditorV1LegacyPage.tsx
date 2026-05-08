import React from "react";

const EditorV1LegacyPage: React.FC = () => {
  return (
    <section className="w-full h-[calc(100vh-10rem)] min-h-[640px] bg-[#111] border-[2px] border-black rounded-[10px] overflow-hidden">
      <iframe
        src="/editors/CODEX_EDITOR_X_V1.html"
        title="ViewTube Editor X_V1 Legacy"
        className="w-full h-full border-0"
        allow="clipboard-read; clipboard-write"
      />
    </section>
  );
};

export default EditorV1LegacyPage;
