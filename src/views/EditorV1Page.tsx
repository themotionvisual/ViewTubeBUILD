import React from "react";
import VTE1Editor from "../features/editor/VT_E1.jsx";

interface EditorRouteBoundaryState {
  error: Error | null;
}

class EditorRouteBoundary extends React.Component<React.PropsWithChildren, EditorRouteBoundaryState> {
  state: EditorRouteBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): EditorRouteBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[VT_E1] Editor route failed to render", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <section className="flex h-full min-h-[520px] w-full items-center justify-center rounded-[10px] border-[4px] border-black bg-[#f0f0f4] p-6">
        <div className="max-w-3xl rounded-[14px] border-[4px] border-black bg-white p-6 shadow-[8px_8px_0_#000]">
          <div className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-black/60">
            VT_E1 Route Boundary
          </div>
          <h1 className="mb-3 text-3xl font-black uppercase leading-none">
            Editor failed to load
          </h1>
          <p className="mb-4 text-sm font-bold leading-6">
            The ViewTube shell is running, but the VT_E1 editor component threw during mount. This fallback replaces the previous blank iframe panel so the failure is visible.
          </p>
          <pre className="max-h-56 overflow-auto rounded-[10px] border-[3px] border-black bg-[#fff7f7] p-3 text-xs font-bold text-[#7a1010]">
            {this.state.error.message || String(this.state.error)}
          </pre>
          <button
            className="mt-4 rounded-[10px] border-[3px] border-black bg-[#40C6E9] px-4 py-2 text-xs font-black uppercase shadow-[4px_4px_0_#000]"
            onClick={() => this.setState({ error: null })}
            type="button"
          >
            Retry Editor
          </button>
        </div>
      </section>
    );
  }
}

const EditorV1Page: React.FC = () => {
  return (
    <section className="w-full h-full min-h-0 bg-[#111] md:border-[2px] md:border-black md:rounded-[10px] overflow-hidden flex flex-col">
      <EditorRouteBoundary>
        <VTE1Editor />
      </EditorRouteBoundary>
    </section>
  );
};

export default EditorV1Page;
