import React from "react";

const EditorV1Page: React.FC = () => {
  return (
    <section className="w-full h-full min-h-0 bg-[#111] border-[2px] border-black rounded-[10px] overflow-hidden flex flex-col">
      <iframe
        src="/editors/VT_E1.html"
        title="ViewTube Editor VT_E1"
        className="w-full flex-1 border-0"
        allow="clipboard-read; clipboard-write"
      />
    </section>
  );
};

export default EditorV1Page;
