import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  AlertTriangle,
  Activity,
  Video,
  Type,
  Settings2,
  Eye,
  Cloud,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";
import { useBrain } from "../context/useBrain";
import { CustomIcon } from "../components/CustomIcon";
import { SprocketHoles } from "../components/SprocketHoles";
import { SubToolbox, ToolboxScaffold } from "../components/Toolbox";
import BrainLiveToolInbox from "../components/brain/BrainLiveToolInbox";
import {
  synthesizeSpeech,
  enhanceSpeech,
  pollEnhancedSpeech,
  getAudioProviderStatus,
} from "../services/audioProviderAdapter";
import { nexusSyncService } from "../services/nexusSyncService";
import { generateStoryboard } from "../services/gemini";
import { PostActionReflection } from "../components/PostActionReflection";
import type { Scene } from "../types";
import { createVersionedAsset } from "../services/assetEngine";
import {
  recordContentBuildToolInput,
  recordContentBuildToolOutput,
  resolveWorkspaceContentBuildToolContext,
} from "../services/asset-engine/ToolContext";

const calculateDuration = (text: string) => {
  const words = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  return Math.max(1, Math.round(words / 2.5));
};
const calculateEmotion = (text: string) => {
  if (!text) return 10;
  const exclamations = (text.match(/!/g) || []).length * 15;
  const questions = (text.match(/\?/g) || []).length * 10;
  const words = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const avgWordLength = words.length ? words.join("").length / words.length : 5;
  return Math.min(
    100,
    Math.max(
      5,
      20 + exclamations + questions + Math.max(0, (6 - avgWordLength) * 5),
    ),
  );
};
const sceneFromUnknown = (raw: any, index: number): Scene => {
  const text = String(
    raw?.text ?? raw?.script ?? raw?.voiceover ?? raw?.narration ?? "",
  );
  return {
    id: String(raw?.id ?? `handoff-${Date.now()}-${index}`),
    name: String(raw?.name ?? raw?.title ?? `Scene ${index + 1}`),
    text,
    broll: String(
      raw?.broll ??
        raw?.visual ??
        raw?.visualDirection ??
        raw?.assetNeeds ??
        "",
    ),
    imageUrl: raw?.imageUrl ?? null,
    voiceoverUrl: raw?.voiceoverUrl ?? null,
    emotionScore: Number(raw?.emotionScore ?? calculateEmotion(text)),
    durationEstimate: Number(raw?.durationEstimate ?? calculateDuration(text)),
  };
};
const scriptToScenes = (script: string, requestedCount?: number): Scene[] => {
  const chunks = script
    .split(/\n\s*\n|(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
  const count = Math.max(
    1,
    Math.min(requestedCount || Math.min(8, chunks.length || 1), 20),
  );
  if (!chunks.length) return [];
  const per = Math.max(1, Math.ceil(chunks.length / count));
  const scenes: Scene[] = [];
  for (let i = 0; i < chunks.length; i += per) {
    const text = chunks.slice(i, i + per).join(" ");
    scenes.push(
      sceneFromUnknown(
        { name: `Scene ${scenes.length + 1}`, text },
        scenes.length,
      ),
    );
  }
  return scenes;
};

interface StoryboardStudioProps {
  embedded?: boolean;
  collapsible?: boolean;
  isOpenInitial?: boolean;
  paletteIndex?: number;
}
const StoryboardStudio: React.FC<StoryboardStudioProps> = ({
  embedded = false,
  collapsible = false,
  isOpenInitial = true,
  paletteIndex = 0,
}) => {
  const audioStatus = getAudioProviderStatus();
  const { brain, registerProvider, unregisterProvider, setStoryboardState } =
    useBrain();
  const [handoffStatus, setHandoffStatus] = useState<string | null>(null);
  useEffect(() => {
    registerProvider("STORYBOARD_STUDIO");
    return () => unregisterProvider("STORYBOARD_STUDIO");
  }, []);
  const [scenes, setScenes] = useState<Scene[]>([
    {
      id: "1",
      name: "The Hook",
      text: "Imagine a world where your creative output is synchronized with the algorithmic pulse. Today, we bridge that gap.",
      broll: "High-energy motion graphics transitions, 3D typography spinning.",
      imageUrl: null,
      emotionScore: 85,
      durationEstimate: 8,
    },
    {
      id: "2",
      name: "The Problem",
      text: "Most creators struggle with fragmentation. Tools are scattered, data is siloed, and the vision gets lost in the noise.",
      broll:
        "Slow pan across a cluttered digital workspace, transitioning to clear, vibrant UI overlays.",
      imageUrl: null,
      emotionScore: 40,
      durationEstimate: 12,
    },
  ]);
  const totalDuration = scenes.reduce((acc, s) => acc + s.durationEstimate, 0);
  const warnings = useMemo(() => {
    const w: string[] = [];
    scenes.forEach((s, idx) => {
      if (s.durationEstimate > 20 && s.broll.length < 10)
        w.push(
          `${s.name || "Scene " + (idx + 1)} is ${s.durationEstimate}s long with almost no visual changes planned. Add B-roll!`,
        );
      if (s.durationEstimate < 2)
        w.push(
          `${s.name || "Scene " + (idx + 1)} is too short (under 2s). Hard to pace visually.`,
        );
    });
    return w;
  }, [scenes]);
  useEffect(() => {
    setStoryboardState({
      scenes,
      estimatedDuration: totalDuration,
      pacingHealth:
        warnings.length > 2
          ? "Critical"
          : warnings.length > 0
            ? "Warning"
            : "Excellent",
    });
  }, [scenes, totalDuration, warnings.length]);
  const [generatingVoiceId, setGeneratingVoiceId] = useState<string | null>(
      null,
    ),
    [isEnhancingId, setIsEnhancingId] = useState<string | null>(null),
    [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false),
    [hasGenerated, setHasGenerated] = useState(false),
    [isSyncing, setIsSyncing] = useState(false),
    [isOpen, setIsOpen] = useState(isOpenInitial);
  const applyHandoff = (payload: Record<string, unknown>) => {
    const p: any = payload;
    let incoming: Scene[] = [];
    if (Array.isArray(p.scenes)) incoming = p.scenes.map(sceneFromUnknown);
    else if (Array.isArray(p.storyboard))
      incoming = p.storyboard.map(sceneFromUnknown);
    else if (Array.isArray(p.beats)) incoming = p.beats.map(sceneFromUnknown);
    else {
      const script = String(
        p.script ?? p.text ?? p.sourceIdea ?? p.normalizedIdea ?? "",
      );
      if (script.trim())
        incoming = scriptToScenes(script, Number(p.sceneCount) || undefined);
    }
    if (!incoming.length) {
      setHandoffStatus(
        "Handoff loaded, but it did not contain scene or script content. The original packet remains available for review.",
      );
      return;
    }
    const assetNeeds = String(p.assetNeeds ?? p.visualDirection ?? "");
    if (assetNeeds)
      incoming = incoming.map((scene) => ({
        ...scene,
        broll: scene.broll || assetNeeds,
      }));
    setScenes(incoming);
    setHasGenerated(true);
    setHandoffStatus(
      `Loaded ${incoming.length} editable scene${incoming.length === 1 ? "" : "s"} from the incoming production handoff.`,
    );
  };
  const handleAutoBRoll = async () => {
    const fullScript = scenes.map((s) => s.text).join("\n");
    if (!fullScript.trim()) {
      alert("Add some script text to the Blueprint first!");
      return;
    }
    setIsGeneratingStoryboard(true);
    try {
      const generatedScenes = await generateStoryboard(
        fullScript,
        brain.coreConcept || "General Project",
        brain,
      );
      if (generatedScenes.length > 0) {
        const normalizedScenes = generatedScenes.map((gs, i) => ({
          ...gs,
          id: gs.id || Date.now() + i + "",
          imageUrl: null,
          voiceoverUrl: null,
          durationEstimate: calculateDuration(gs.text),
          emotionScore: calculateEmotion(gs.text),
        }));
        setHasGenerated(true);
        setScenes(normalizedScenes);

        const contentContext = resolveWorkspaceContentBuildToolContext(
          brain,
          "storyboard-studio",
          ["script", "storyboard"],
        );
        if (contentContext) {
          recordContentBuildToolInput({
            contentBuildId: contentContext.contentBuildId,
            toolId: "storyboard-studio",
            assetIds: [
              contentContext.selectedAssets.script?.id,
              contentContext.selectedAssets.storyboard?.id,
            ].filter((id): id is string => Boolean(id)),
            summary: "Generate a storyboard from the active ContentBuild script and production context.",
            metadata: { requestedScenes: normalizedScenes.length },
          });

          const created = createVersionedAsset({
            sourceToolId: "storyboard-studio",
            sourceKind: "project",
            payloadKind: "storyboard",
            name: `Storyboard · ${brain.coreConcept || contentContext.build.profile.workingConcept || "ContentBuild"}`,
            summary: `${normalizedScenes.length} generated storyboard scenes`,
            kind: "document",
            payload: { scenes: normalizedScenes, estimatedDuration: normalizedScenes.reduce((sum, scene) => sum + scene.durationEstimate, 0) },
            tags: ["storyboard", "content-build"],
            slot: "storyboard",
            label: `Storyboard V${(contentContext.build.versions || []).filter(version => version.slot === "storyboard").length + 1}`,
            parentAssetId: contentContext.selectedAssets.storyboard?.id || contentContext.selectedAssets.script?.id || null,
            context: {
              contentBuildId: contentContext.contentBuildId,
              projectId: contentContext.build.legacyProjectId || null,
              projectName: contentContext.build.legacyProjectName || null,
              videoId: contentContext.build.youtube?.videoId || null,
              stage: "visual-plan",
              parentAssetIds: [
                contentContext.selectedAssets.script?.id,
                contentContext.selectedAssets.storyboard?.id,
              ].filter((id): id is string => Boolean(id)),
            },
          });
          recordContentBuildToolOutput({
            contentBuildId: contentContext.contentBuildId,
            toolId: "storyboard-studio",
            assetIds: [created.asset.id],
            generationRecordId: created.generationRecordId,
            summary: `Created storyboard version ${created.version?.version || 1} with ${normalizedScenes.length} scenes.`,
            metadata: { sceneCount: normalizedScenes.length, versionId: created.version?.id || null },
          });
        }
      }
    } catch (e) {
      console.error("Storyboard generation failed:", e);
      alert("Failed to generate storyboard. Check console.");
    } finally {
      setIsGeneratingStoryboard(false);
    }
  };
  const updateScene = (id: string, field: keyof Scene, value: any) =>
    setScenes((current) =>
      current.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, [field]: value };
        if (field === "text") {
          updated.durationEstimate = calculateDuration(value as string);
          updated.emotionScore = calculateEmotion(value as string);
        }
        return updated;
      }),
    );
  const generateVoiceover = async (sceneId: string, text: string) => {
    if (!text) return;
    if (!audioStatus.elevenLabsReady && !audioStatus.geminiReady) {
      alert(
        "No speech provider key found. Add ElevenLabs or Gemini key in Settings.",
      );
      return;
    }
    setGeneratingVoiceId(sceneId);
    try {
      const audioUrl = await synthesizeSpeech({
        text,
        provider: audioStatus.elevenLabsReady ? "elevenlabs" : "gemini",
      });
      updateScene(sceneId, "voiceoverUrl", audioUrl);
    } catch (e: any) {
      console.error(e);
      alert(e.message);
    } finally {
      setGeneratingVoiceId(null);
    }
  };
  const handleSyncToDrive = async () => {
    setIsSyncing(true);
    try {
      await nexusSyncService.syncStoryboardToDrive(
        brain.coreConcept || "General",
        scenes,
      );
      alert("Storyboard synced to Cloud Vault!");
    } catch (e: any) {
      console.error(e);
      alert(`Cloud Sync failed: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };
  const handleEnhance = async (
    sceneId: string,
    audioUrl: string,
    title: string,
  ) => {
    if (!audioStatus.auphonicReady) {
      alert("Auphonic key missing in Settings.");
      return;
    }
    setIsEnhancingId(sceneId);
    try {
      const response = await enhanceSpeech(audioUrl, title);
      const uuid = response.data?.uuid;
      if (!uuid) throw new Error("No production UUID returned");
      let status = "started",
        attempts = 0;
      while (status !== "done" && status !== "error" && attempts < 10) {
        const poll = await pollEnhancedSpeech(uuid);
        status = poll.data?.status_string || "error";
        if (status === "done")
          updateScene(
            sceneId,
            "voiceoverUrl",
            poll.data.output_files?.[0]?.download_url,
          );
        await new Promise((r) => setTimeout(r, 4000));
        attempts++;
      }
    } catch (e) {
      console.error(e);
      alert("Auphonic Enhancement failed. Check your API key.");
    } finally {
      setIsEnhancingId(null);
    }
  };
  const addScene = () =>
    setScenes((current) => [
      ...current,
      {
        id: Date.now().toString(),
        name: `Scene ${current.length + 1}`,
        text: "",
        broll: "",
        imageUrl: null,
        emotionScore: 10,
        durationEstimate: 0,
      },
    ]);
  const deleteScene = (id: string) =>
    setScenes((current) => current.filter((s) => s.id !== id));
  const chartData = useMemo(
    () =>
      scenes.map((s, i) => ({
        name: s.name || `S${i + 1}`,
        passion: s.emotionScore,
        duration: s.durationEstimate,
      })),
    [scenes],
  );
  const formatTime = (secs: number) =>
    `${Math.floor(secs / 60)}:${Math.floor(secs % 60)
      .toString()
      .padStart(2, "0")}`;
  const blueprintActions = (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSyncToDrive}
        disabled={isSyncing}
        className="rounded-lg border-[2px] border-black bg-white px-2 py-1 text-[10px] font-black uppercase"
      >
        <Cloud size={13} className="inline" /> {isSyncing ? "Syncing" : "Sync"}
      </button>
      <span className="hidden text-xs font-black sm:inline">{formatTime(totalDuration)}</span>
      <button
        onClick={addScene}
        className="grid size-8 place-items-center rounded-lg border-[2px] border-black bg-white"
        aria-label="Add storyboard scene"
      >
        <Plus size={14} />
      </button>
    </div>
  );
  const visualCanvasAction = (
    <button
      onClick={handleAutoBRoll}
      disabled={isGeneratingStoryboard}
      className="rounded-lg border-[2px] border-black bg-white px-2 py-1 text-[10px] font-black uppercase"
    >
      <Sparkles size={12} className="inline" /> {isGeneratingStoryboard ? "Thinking" : "Auto B-roll"}
    </button>
  );
  const oracleStatus = (
    <span className="hidden rounded-md border-[2px] border-black bg-white px-2 py-1 text-[9px] font-black uppercase sm:inline">
      {warnings.length ? `${warnings.length} warnings` : "All clear"}
    </span>
  );
  return (
    <ToolboxScaffold
      title="STORYBOARD STUDIO"
      icon={<Video size={40} strokeWidth={3} className="text-black" />}
      paletteIndex={paletteIndex}
      headerColor="bg-[#FFB158]"
      iconBoxColor="bg-[#FF6666]"
      collapsible={collapsible}
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      embedded={embedded}
      chrome={embedded ? "none" : "full"}
      shellClassName={embedded ? "" : "animate-fade-in"}
      contentClassName={embedded ? "p-0" : "p-8"}
    >
      <BrainLiveToolInbox
        destinationToolId="storyboard-studio"
        onPrefill={applyHandoff}
      />
      {handoffStatus && (
        <div className="mb-4 border-[3px] border-black rounded-xl bg-[#CCFF00] p-3 text-xs font-black uppercase">
          {handoffStatus}
        </div>
      )}
      {brain.seoState.winningTitle && (
        <div className="mb-4 bg-white border-[3px] border-black rounded-lg p-3 shadow-[4px_4px_0px_0px_black] flex items-center gap-3">
          <span className="bg-[#00d2ff] px-2 py-1 text-xs font-black uppercase rounded border-2 border-black">
            Target Topic
          </span>
          <span className="font-bold text-xl">
            “{brain.seoState.winningTitle}”
          </span>
        </div>
      )}
      {hasGenerated && (
        <div className="mb-4">
          <PostActionReflection toolId="STORYBOARD_STUDIO" />
        </div>
      )}
      <div className="grid flex-1 grid-cols-1 items-start gap-6 xl:grid-cols-[0.9fr_1.8fr_0.8fr]">
        <SubToolbox
          title="THE BLUEPRINT"
          icon={<Type />}
          paletteIndex={0}
          collapsible
          isOpenInitial
          actionButton={blueprintActions}
          contentClassName="p-0"
          shellClassName="h-full"
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {scenes.map((scene) => (
              <div
                key={scene.id}
                className="border-[3px] border-black p-3 bg-white rounded-lg group"
              >
                <input
                  className="w-full font-black text-lg bg-transparent mb-2 text-[#ff3399]"
                  value={scene.name}
                  onChange={(e) =>
                    updateScene(scene.id, "name", e.target.value)
                  }
                />
                <textarea
                  className="w-full h-24 p-2 text-sm border-2 rounded"
                  value={scene.text}
                  onChange={(e) =>
                    updateScene(scene.id, "text", e.target.value)
                  }
                />
                <div className="mt-2 flex justify-between text-xs font-bold">
                  <span>{formatTime(scene.durationEstimate)}</span>
                  <button onClick={() => deleteScene(scene.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SubToolbox>
        <SubToolbox
          title="VISUAL CANVAS"
          icon={<Eye />}
          paletteIndex={1}
          collapsible
          isOpenInitial
          actionButton={visualCanvasAction}
          contentClassName="p-0"
          shellClassName="h-full"
        >
          <div className="flex-1 overflow-y-auto p-6 bg-[#f3f4f6]">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {scenes.map((scene) => (
                <div
                  key={scene.id}
                  className="bg-white border-[3px] border-black rounded-xl overflow-hidden"
                >
                  <div className="bg-black text-white px-3 py-2 flex justify-between">
                    <b>{scene.name}</b>
                    <span>{formatTime(scene.durationEstimate)}</span>
                  </div>
                  <div className="bg-black">
                    <div className="h-4">
                      <SprocketHoles
                        count={20}
                        color="white"
                        className="h-full w-full"
                      />
                    </div>
                    <div className="aspect-video bg-gray-900 flex items-center justify-center">
                      {scene.imageUrl ? (
                        <img
                          src={scene.imageUrl}
                          className="w-full h-full object-cover"
                          alt={`${scene.name} storyboard frame`}
                        />
                      ) : (
                        <ImageIcon size={32} className="text-white/30" />
                      )}
                    </div>
                    <div className="h-4">
                      <SprocketHoles
                        count={20}
                        color="white"
                        className="h-full w-full"
                      />
                    </div>
                  </div>
                  <div className="p-3">
                    <textarea
                      className="w-full h-20 bg-gray-50 p-2"
                      value={scene.broll}
                      onChange={(e) =>
                        updateScene(scene.id, "broll", e.target.value)
                      }
                    />
                  </div>
                  <div className="p-3 border-t-[3px] border-black">
                    {scene.voiceoverUrl ? (
                      <>
                        <audio
                          src={scene.voiceoverUrl}
                          controls
                          className="w-full"
                        />
                        <button
                          onClick={() =>
                            handleEnhance(
                              scene.id,
                              scene.voiceoverUrl!,
                              scene.name,
                            )
                          }
                          disabled={isEnhancingId === scene.id}
                          className="mt-2 w-full bg-[#00d2ff] border-2 border-black font-black text-xs py-1"
                        >
                          PRO-POLISH
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => generateVoiceover(scene.id, scene.text)}
                        disabled={generatingVoiceId === scene.id || !scene.text}
                        className="w-full bg-black text-[#ccff00] rounded p-2 text-xs font-black"
                      >
                        <CustomIcon
                          name="volume"
                          size={14}
                          className="inline"
                        />{" "}
                        GENERATE TTS
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SubToolbox>
        <SubToolbox
          title="THE ORACLE"
          icon={<Settings2 />}
          paletteIndex={2}
          collapsible
          isOpenInitial
          actionButton={oracleStatus}
          contentClassName="p-0"
          shellClassName="h-full"
        >
          <div className="p-4">
            <h3 className="font-black mb-3 flex gap-2">
              <Activity size={16} /> Emotion Arc
            </h3>
            <div className="h-40 bg-black rounded-xl p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="passion"
                    stroke="#00d2ff"
                    strokeWidth={4}
                    fill="#00d2ff"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-5 space-y-2">
              {warnings.map((warning, i) => (
                <div
                  key={i}
                  className="border-2 border-black rounded p-2 text-xs font-bold flex gap-2"
                >
                  <AlertTriangle size={14} />
                  {warning}
                </div>
              ))}
            </div>
          </div>
        </SubToolbox>
      </div>
    </ToolboxScaffold>
  );
};
export default StoryboardStudio;
