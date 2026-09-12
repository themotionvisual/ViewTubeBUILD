import React from "react";
import VTE1Editor from "../features/editor/VT_E1.jsx";
import { ResponsiveEditorShell, useEditorState } from "../features/editor/mobile";
import {
  EDITOR_FRONTEND_MODES,
  editorHostModeFor,
  readEditorFrontendMode,
  writeEditorFrontendMode,
  type EditorFrontendMode,
} from "../features/editor/editorFrontendMode";
import {
  readEditorProjectBridgeSnapshot,
  writeEditorProjectBridgeSnapshot,
} from "../features/editor/editorProjectBridge";

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

const EditorFrontendSwitcher: React.FC<{
  mode: EditorFrontendMode;
  onChange: (mode: EditorFrontendMode) => void;
}> = ({ mode, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const active = EDITOR_FRONTEND_MODES.find((item) => item.id === mode) ?? EDITOR_FRONTEND_MODES[0];

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="pointer-events-auto absolute right-2 top-2 z-[120] flex flex-col items-end gap-1">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 items-center gap-2 rounded-[7px] border-[2px] border-black bg-white px-2.5 text-[9px] font-black uppercase tracking-[0.08em] text-black"
        title="Switch editor frontend"
      >
        <span aria-hidden="true">⚙</span>
        <span>Editor UI</span>
        <span className="rounded-[4px] border border-black bg-[#40C6E9] px-1.5 py-0.5 text-[8px]">
          {active.shortLabel}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Editor frontend"
          className="w-[300px] max-w-[calc(100vw-16px)] rounded-[10px] border-[3px] border-black bg-[#f0f0f4] p-2 text-black"
        >
          <div className="px-1 pb-2 pt-0.5">
            <div className="text-[10px] font-black uppercase tracking-[0.12em]">Editor Frontend</div>
            <div className="mt-0.5 text-[9px] font-bold leading-4 text-black/60">
              Both modes use the same VT_E1 engine. Current Main uses the responsive host; Linked Branch reproduces the classic direct VT_E1 host from the linked deployment.
            </div>
          </div>
          <div className="grid gap-1.5">
            {EDITOR_FRONTEND_MODES.map((item) => {
              const selected = item.id === mode;
              return (
                <button
                  key={item.id}
                  role="menuitemradio"
                  aria-checked={selected}
                  type="button"
                  onClick={() => {
                    onChange(item.id);
                    setOpen(false);
                  }}
                  className="w-full rounded-[8px] border-[2px] border-black px-3 py-2 text-left"
                  style={{ background: selected ? "#FFFF61" : "#ffffff" }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-black uppercase">{item.label}</span>
                    <span className="text-[8px] font-black uppercase">{selected ? "Active" : "Switch"}</span>
                  </div>
                  <div className="mt-1 text-[9px] font-bold leading-4 text-black/65">{item.description}</div>
                </button>
              );
            })}
          </div>
          <div className="mt-2 border-t-2 border-black/15 px-1 pt-2 text-[8px] font-bold leading-4 text-black/55">
            Preference is saved on this device. Direct QA: <b>?editorStyle=current</b> or <b>?editorStyle=linked</b>.
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * VT_E1 editor host with two selectable front-end presentations over one
 * canonical desktop editor engine:
 *
 * - Current Main: responsive host. On mobile it uses the touch-first mobile
 *   editor; on desktop it mounts canonical VT_E1.
 * - Linked Branch: classic/direct host used by the linked Vercel deployment.
 *   The linked deployment's VT_E1.jsx and VT_E1.css blobs are identical to
 *   current main, so forcing the desktop host reproduces that presentation
 *   without maintaining a second 1 MB editor implementation.
 *
 * The mobile editor store is owned by this route rather than by MobileEditor.
 * That keeps mobile timeline/project edits alive if a user temporarily switches
 * to the classic host and then returns to the responsive/mobile presentation.
 * Mobile project data also writes through the small versioned project bridge so
 * route remounts can restore the clip/transition project without coupling the
 * mobile UI to the giant desktop component. The canonical VT_E1 desktop model
 * still needs its adapter to complete two-way desktop<->mobile synchronization.
 */
const EditorV1Page: React.FC = () => {
  const forced = React.useMemo(() => {
    if (typeof window === "undefined") return "auto" as const;
    const v = new URLSearchParams(window.location.search).get("editor");
    if (v === "mobile" || v === "desktop") return v;
    return "auto" as const;
  }, []);

  const [frontendMode, setFrontendMode] = React.useState<EditorFrontendMode>(() => readEditorFrontendMode());
  const restoredMobileProject = React.useMemo(() => {
    const snapshot = readEditorProjectBridgeSnapshot();
    return snapshot?.source === 'mobile' ? snapshot.project : undefined;
  }, []);
  const mobileStore = useEditorState(restoredMobileProject);

  const switchFrontend = React.useCallback((nextMode: EditorFrontendMode) => {
    writeEditorFrontendMode(nextMode);
    setFrontendMode(nextMode);
  }, []);

  const shellMode = editorHostModeFor(frontendMode, forced);

  React.useEffect(() => {
    if (shellMode !== 'mobile') return;
    writeEditorProjectBridgeSnapshot('mobile', mobileStore.state.project);
  }, [shellMode, mobileStore.state.project]);

  return (
    <section
      data-editor-frontend={frontendMode}
      className="
        relative h-full min-h-0 w-full overflow-hidden bg-[#111] flex flex-col
        rounded-[10px] border-[2px] border-black
        landscape:max-[932px]:border-0 landscape:max-[932px]:rounded-none
        max-[560px]:border-0 max-[560px]:rounded-none
      "
    >
      <EditorFrontendSwitcher mode={frontendMode} onChange={switchFrontend} />
      <EditorRouteBoundary>
        <ResponsiveEditorShell
          mode={shellMode}
          desktop={<VTE1Editor />}
          externalStore={mobileStore}
        />
      </EditorRouteBoundary>
    </section>
  );
};

export default EditorV1Page;
