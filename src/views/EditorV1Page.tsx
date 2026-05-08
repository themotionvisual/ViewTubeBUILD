import React from "react";

type EditorUiStyle = "generic" | "clay";

const STYLE_STORAGE_KEY = "vt_editor_ui_style_v1";

const STYLE_TO_SRC: Record<EditorUiStyle, string> = {
  generic: "/editors/VT_E1_GENERIC.html",
  clay: "/editors/VT_E1_CLAY.html",
};

const EditorV1Page: React.FC = () => {
  const [uiStyle, setUiStyle] = React.useState<EditorUiStyle>(() => {
    const saved = window.localStorage.getItem(STYLE_STORAGE_KEY);
    return saved === "clay" ? "clay" : "generic";
  });

  React.useEffect(() => {
    window.localStorage.setItem(STYLE_STORAGE_KEY, uiStyle);
  }, [uiStyle]);

  return (
    <section className="w-full h-full min-h-0 bg-[#111] border-[2px] border-black rounded-[10px] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between gap-2 p-2 bg-[#f0f0f4] border-b-[2px] border-black">
        <div className="text-[11px] font-black tracking-wide uppercase">Editor UI Style</div>
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 text-[11px] font-black uppercase border-[2px] border-black rounded-[8px]"
            style={{ background: uiStyle === "generic" ? "#4FFF5B" : "#fff" }}
            onClick={() => setUiStyle("generic")}
          >
            Generic
          </button>
          <button
            className="px-2 py-1 text-[11px] font-black uppercase border-[2px] border-black rounded-[8px]"
            style={{ background: uiStyle === "clay" ? "#40C6E9" : "#fff" }}
            onClick={() => setUiStyle("clay")}
          >
            Clay
          </button>
        </div>
      </div>
      <iframe
        src={STYLE_TO_SRC[uiStyle]}
        title="ViewTube Editor VT_E1"
        className="w-full flex-1 border-0"
        allow="clipboard-read; clipboard-write"
      />
    </section>
  );
};

export default EditorV1Page;
