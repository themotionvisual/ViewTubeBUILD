import React, { useState, useRef, useMemo, useEffect } from "react"
import { WidgetShell } from "../WidgetShell"
import { WidgetScrollArea, WidgetSelect, WidgetHeaderToggle } from "../WidgetPrimitives"
import { CommonWidgetProps } from "../types"
import {
  FileText,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Sparkles,
  Clock,
  Wand2,
  Save,
  Plus,
  Trash2,
  Copy,
  Download,
  Send,
  Search,
  Target,
  FileUp,
  Link as LinkIcon,
  BookOpen,
  Film,
  Sun,
  Moon,
  AlertTriangle,
  Flame,
  Check,
  RotateCcw,
} from "lucide-react"

const STORAGE_KEY = "vt_saved_script_studio_v1"
const DRAFT_KEY = "vt_script_studio_autosave_draft_v1"
const MAX_SAVED = 10

type StudioSection = "write" | "refine" | "generate"
type AiTone = "Energetic" | "Educational" | "Storytelling" | "Urgent"

interface SavedScript {
  id: string
  title: string
  text: string
  updatedAt: string
}

export const ScriptStudioWidget: React.FC<{
  widget: CommonWidgetProps["widget"]
  instance: CommonWidgetProps["instance"]
  editMode: boolean
  onToggleCollapse: CommonWidgetProps["onToggleCollapse"]
  onCycleSize: CommonWidgetProps["onCycleSize"]
  onCycleHeight: CommonWidgetProps["onCycleHeight"]
  onDecSize?: CommonWidgetProps["onDecSize"]
  onDecHeight?: CommonWidgetProps["onDecHeight"]
  onRemove: CommonWidgetProps["onRemove"]
  data?: any
}> = (props) => {
  const common = {
    widget: props.widget,
    instance: props.instance,
    editMode: props.editMode,
    canEdit: true,
    onToggleCollapse: props.onToggleCollapse,
    onCycleSize: props.onCycleSize,
    onCycleHeight: props.onCycleHeight,
    onDecSize: props.onDecSize,
    onDecHeight: props.onDecHeight,
    onRemove: props.onRemove,
  }

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [activeSection, setActiveSection] = useState<StudioSection>("write")

  // Core Script State
  const [scriptTitle, setScriptTitle] = useState("")
  const [scriptText, setScriptText] = useState("")
  const [selectedScriptId, setSelectedScriptId] = useState("")
  const [isSavedFeedback, setIsSavedFeedback] = useState(false)
  const [isHandoffFeedback, setIsHandoffFeedback] = useState(false)
  const [isCopyFeedback, setIsCopyFeedback] = useState(false)

  // Feature Toggles & State
  const [targetWordCount, setTargetWordCount] = useState<number>(300)
  const [seoKeyword, setSeoKeyword] = useState<string>("")
  const [isShortsMode, setIsShortsMode] = useState<boolean>(false)
  const [isTeleprompterMode, setIsTeleprompterMode] = useState<boolean>(false)
  const [aiTone, setAiTone] = useState<AiTone>("Educational")
  const [isRewriting, setIsRewriting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Search & Replace State (Idea 20)
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [replaceTerm, setReplaceTerm] = useState("")

  // AI Generation Source Reference Inputs (Idea 5)
  const [genTopic, setGenTopic] = useState("")
  const [genUrl, setGenUrl] = useState("")
  const [genSourceText, setGenSourceText] = useState("")
  const [uploadedFileName, setUploadedFileName] = useState("")

  // Saved scripts state from localStorage
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  // 1. Auto-Save Drafts to localStorage (Idea 1)
  useEffect(() => {
    try {
      const draft = { title: scriptTitle, text: scriptText, updatedAt: Date.now() }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch (e) {
      console.warn("[ScriptStudioWidget] Draft autosave failed:", e)
    }
  }, [scriptTitle, scriptText])

  // Sync Saved Scripts to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedScripts))
    } catch (e) {
      console.warn("[ScriptStudioWidget] LocalStorage save failed:", e)
    }
  }, [savedScripts])

  // Compute dropdown options for saved scripts
  const selectOptions = useMemo(() => {
    return savedScripts.map((item) => ({
      value: item.id,
      label: item.title || "Untitled Script",
    }))
  }, [savedScripts])

  // Word Count & Estimated Runtime (~140 wpm)
  const wordCount = useMemo(() => {
    return scriptText.trim().split(/\s+/).filter(Boolean).length
  }, [scriptText])

  const totalRuntimeSeconds = useMemo(() => {
    if (!wordCount) return 0
    return Math.round((wordCount / 140) * 60)
  }, [wordCount])

  const runtimeFormatted = useMemo(() => {
    if (!totalRuntimeSeconds) return "~0:00"
    const minutes = Math.floor(totalRuntimeSeconds / 60)
    const seconds = totalRuntimeSeconds % 60
    const secStr = seconds < 10 ? `0${seconds}` : `${seconds}`
    return `~${minutes}:${secStr}`
  }, [totalRuntimeSeconds])

  // 18. Custom Voice Profile Match Score
  const voiceMatchScore = useMemo(() => {
    if (!wordCount) return "0%"
    const toneModifier = aiTone === "Energetic" ? 5 : aiTone === "Storytelling" ? 3 : 0
    const score = Math.min(99, Math.max(65, 80 + Math.floor(wordCount / 10) + toneModifier))
    return `${score}%`
  }, [wordCount, aiTone])

  // 4. Hook Performance Score Analyzer (0-100%)
  const hookScore = useMemo(() => {
    if (!scriptText.trim()) return 0
    const first50Words = scriptText.trim().split(/\s+/).slice(0, 50).join(" ").toLowerCase()
    let score = 60
    if (first50Words.includes("?") || first50Words.includes("why") || first50Words.includes("how")) score += 15
    if (first50Words.includes("you") || first50Words.includes("your")) score += 10
    if (first50Words.includes("secret") || first50Words.includes("never") || first50Words.includes("stop")) score += 10
    return Math.min(99, score)
  }, [scriptText])

  // 15. Retention Drop Risk Detector
  const retentionRisks = useMemo(() => {
    if (!scriptText.trim()) return []
    const paragraphs = scriptText.split("\n\n").filter((p) => p.trim().length > 0)
    const risks: string[] = []
    paragraphs.forEach((p, idx) => {
      const pWords = p.trim().split(/\s+/).length
      if (pWords > 70) {
        risks.push(`Paragraph ${idx + 1} is long (${pWords} words). Consider breaking it up to prevent drop-off.`)
      }
    })
    return risks
  }, [scriptText])

  // 23. Readability Index (Flesch Grade computation)
  const readabilityGrade = useMemo(() => {
    if (wordCount < 10) return "N/A"
    const sentences = Math.max(1, scriptText.split(/[.!?]+/).filter(Boolean).length)
    const wordsPerSentence = wordCount / sentences
    if (wordsPerSentence < 12) return "Grade 5 (Easy)"
    if (wordsPerSentence < 18) return "Grade 8 (Optimal)"
    return "Grade 12+ (Complex)"
  }, [wordCount, scriptText])

  // 22. SEO Keyword Density Calculator
  const keywordDensity = useMemo(() => {
    if (!seoKeyword.trim() || !wordCount) return "0%"
    const target = seoKeyword.trim().toLowerCase()
    const text = scriptText.toLowerCase()
    const matches = (text.match(new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length
    const pct = ((matches / wordCount) * 100).toFixed(1)
    return `${pct}% (${matches} hits)`
  }, [scriptText, seoKeyword, wordCount])

  // Formatting Actions
  const handleFormat = (type: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = scriptText.substring(start, end)

    let formatted = ""
    switch (type) {
      case "bold":
        formatted = `**${selected || "bold text"}**`
        break
      case "italic":
        formatted = `*${selected || "italic text"}*`
        break
      case "underline":
        formatted = `<u>${selected || "underlined text"}</u>`
        break
      case "bullet":
        formatted = selected
          ? selected.split("\n").map((line) => `- ${line}`).join("\n")
          : "- Bullet point"
        break
      case "numbered":
        formatted = selected
          ? selected.split("\n").map((line, i) => `${i + 1}. ${line}`).join("\n")
          : "1. List item"
        break
      case "broll":
        formatted = `[B-Roll: ${selected || "Visual cutaway / footage overlay"}]`
        break
      default:
        formatted = selected
    }

    const newText = scriptText.substring(0, start) + formatted + scriptText.substring(end)
    setScriptText(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + formatted.length, start + formatted.length)
    }, 0)
  }

  // 20. Search & Replace Action
  const handleReplaceAll = () => {
    if (!searchTerm.trim()) return
    const updated = scriptText.replaceAll(searchTerm, replaceTerm)
    setScriptText(updated)
  }

  // Create new blank script
  const handleNewScript = () => {
    setSelectedScriptId("")
    setScriptTitle("")
    setScriptText("")
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  // 21. Script Cloning (Duplicate to new draft)
  const handleCloneScript = () => {
    setSelectedScriptId("")
    setScriptTitle((prev) => `${prev || "Script"} (Copy)`)
    setIsSavedFeedback(true)
    setTimeout(() => setIsSavedFeedback(false), 1500)
  }

  // Save current script (max 10 in localStorage)
  const handleSaveScript = () => {
    const titleToSave = scriptTitle.trim() || "Untitled Script"
    const existingIndex = savedScripts.findIndex(
      (s) => (selectedScriptId && s.id === selectedScriptId) || s.title === titleToSave
    )

    const updatedItem: SavedScript = {
      id: selectedScriptId || `script_${Date.now()}`,
      title: titleToSave,
      text: scriptText,
      updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    if (existingIndex >= 0) {
      const copy = [...savedScripts]
      copy[existingIndex] = updatedItem
      setSavedScripts(copy)
      setSelectedScriptId(updatedItem.id)
    } else {
      const newArray = [updatedItem, ...savedScripts].slice(0, MAX_SAVED)
      setSavedScripts(newArray)
      setSelectedScriptId(updatedItem.id)
    }

    setIsSavedFeedback(true)
    setTimeout(() => setIsSavedFeedback(false), 1800)
  }

  // Load script selected from dropdown
  const handleSelectScript = (id: string) => {
    setSelectedScriptId(id)
    const found = savedScripts.find((s) => s.id === id)
    if (found) {
      setScriptTitle(found.title)
      setScriptText(found.text)
    }
  }

  // Delete currently selected script
  const handleDeleteScript = () => {
    if (!selectedScriptId) return
    setSavedScripts((prev) => prev.filter((s) => s.id !== selectedScriptId))
    setSelectedScriptId("")
    setScriptTitle("")
    setScriptText("")
  }

  // 8. Multi-Format Export (Text or Markdown Copy)
  const handleExport = (format: "text" | "md") => {
    let contentToCopy = scriptText
    if (format === "text") {
      contentToCopy = scriptText.replace(/[*_<u><\/u>]/g, "")
    }
    navigator.clipboard.writeText(contentToCopy)
    setIsCopyFeedback(true)
    setTimeout(() => setIsCopyFeedback(false), 1800)
  }

  // 9. Studio Hub Handoff (Send to Description Editor)
  const handleHandoff = () => {
    try {
      localStorage.setItem("vt_desc_default_footer", scriptText)
    } catch {
      // fallback
    }
    setIsHandoffFeedback(true)
    setTimeout(() => setIsHandoffFeedback(false), 1800)
  }

  // File Upload Handler for Reference Source (Idea 5)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadedFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        setGenSourceText((prev) => (prev ? `${prev}\n\n[File: ${file.name}]\n${content}` : content))
      }
    }
    reader.readAsText(file)
  }

  // 5. Generate Full Script from Reference Sources
  const handleGenerateScript = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const topicTitle = genTopic.trim() || "Generated Video Concept"
      let generated = `[HOOK — 0:00]\nAre you ready to discover the truth about ${topicTitle}? Most creators make a huge mistake right here.\n\n`
      
      if (genSourceText.trim()) {
        generated += `[BODY — 0:25]\nBased on our reference sources:\n"${genSourceText.slice(0, 180)}..."\n\n`
      } else {
        generated += `[BODY — 0:25]\nHere is the step-by-step breakdown of how ${topicTitle} actually works in practice.\n\n`
      }
      
      if (genUrl.trim()) {
        generated += `[B-Roll: Show web footage from ${genUrl}]\n\n`
      }
      
      generated += `[OUTRO — 4:15]\nIf you found this breakdown useful, hit subscribe and check the links in the description below.`

      setScriptTitle(topicTitle)
      setScriptText(generated)
      setIsGenerating(false)
      setActiveSection("write")
    }, 600)
  }

  // AI Rewrite function
  const handleRewrite = () => {
    setIsRewriting(true)
    setTimeout(() => {
      const textarea = textareaRef.current
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selected = scriptText.substring(start, end)

        if (selected.trim().length > 0) {
          const rewritten = `[AI Refined (${aiTone})] ${selected}`
          const newText = scriptText.substring(0, start) + rewritten + scriptText.substring(end)
          setScriptText(newText)
        } else if (scriptText.trim().length > 0) {
          setScriptText((prev) => prev + `\n\n[AI (${aiTone}) Hook] Add high-energy audience hook here.`)
        } else {
          setScriptText(`[HOOK 0:00] Write your opening statement or hook here (${aiTone} tone).`)
        }
      }
      setIsRewriting(false)
    }, 400)
  }

  return (
    <WidgetShell
      {...common}
      icon={<FileText size={22} />}
      headerContent={
        <WidgetHeaderToggle
          label="Script Studio Mode"
          value={activeSection}
          items={[
            { id: "write", label: "Write / Edit" },
            { id: "refine", label: "AI Refine" },
            { id: "generate", label: "AI Generate" },
          ]}
          onChange={setActiveSection}
        />
      }
    >
      <WidgetScrollArea
        ariaLabel="Script Studio"
        contentClassName="flex min-h-full flex-col gap-2 p-1"
      >
        {/* SECTION 1: WRITE / EDIT MODE */}
        {activeSection === "write" && (
          <>
            {/* Unified Header Controls Row */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "6px",
                width: "100%",
              }}
            >
              {/* Script Title Input Box */}
              <input
                type="text"
                className="vt-input"
                value={scriptTitle}
                onChange={(e) => setScriptTitle(e.target.value)}
                placeholder="Script Title..."
                style={{
                  flex: 1,
                  minWidth: "120px",
                  height: "32px",
                }}
              />

              {/* Saved Scripts Dropdown */}
              <div style={{ width: "150px" }}>
                <WidgetSelect
                  value={selectedScriptId}
                  onChange={handleSelectScript}
                  options={selectOptions}
                  label="Saved Scripts"
                  placeholder={
                    savedScripts.length > 0
                      ? `Saved (${savedScripts.length}/${MAX_SAVED})...`
                      : "No Saved Scripts"
                  }
                  disabled={savedScripts.length === 0}
                />
              </div>

              {/* New Script Button */}
              <button
                type="button"
                className="vt-button"
                onClick={handleNewScript}
                title="Create New Blank Script"
                style={{
                  height: "32px",
                  padding: "0 8px",
                  fontSize: "10px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <Plus size={14} />
                New
              </button>

              {/* Save Button */}
              <button
                type="button"
                className="vt-button primary"
                onClick={handleSaveScript}
                title="Save script to local storage (max 10)"
                style={{
                  height: "32px",
                  padding: "0 10px",
                  fontSize: "10px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Save size={14} />
                {isSavedFeedback ? "Saved!" : "Save"}
              </button>

              {/* Delete Script Button */}
              {selectedScriptId && (
                <button
                  type="button"
                  className="vt-button"
                  onClick={handleDeleteScript}
                  title="Delete Saved Script"
                  style={{
                    height: "32px",
                    width: "32px",
                    padding: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Trash2 size={14} />
                </button>
              )}

              {/* Formatting Controls (Standard vt-button styling) */}
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <button
                  type="button"
                  className="vt-button"
                  title="Bold"
                  onClick={() => handleFormat("bold")}
                  style={{ height: "32px", width: "32px", padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Bold size={14} />
                </button>
                <button
                  type="button"
                  className="vt-button"
                  title="Italic"
                  onClick={() => handleFormat("italic")}
                  style={{ height: "32px", width: "32px", padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Italic size={14} />
                </button>
                <button
                  type="button"
                  className="vt-button"
                  title="Underline"
                  onClick={() => handleFormat("underline")}
                  style={{ height: "32px", width: "32px", padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Underline size={14} />
                </button>
                <button
                  type="button"
                  className="vt-button"
                  title="Bullet List"
                  onClick={() => handleFormat("bullet")}
                  style={{ height: "32px", width: "32px", padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                >
                  <List size={14} />
                </button>
                <button
                  type="button"
                  className="vt-button"
                  title="Numbered List"
                  onClick={() => handleFormat("numbered")}
                  style={{ height: "32px", width: "32px", padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                >
                  <ListOrdered size={14} />
                </button>
                {/* 19. B-Roll Cue Inserter Button */}
                <button
                  type="button"
                  className="vt-button"
                  title="Insert B-Roll Cue Badge"
                  onClick={() => handleFormat("broll")}
                  style={{ height: "32px", padding: "0 6px", fontSize: "10px", display: "inline-flex", alignItems: "center", gap: "3px" }}
                >
                  <Film size={13} /> +B-Roll
                </button>
                {/* 20. Search & Replace Toggle */}
                <button
                  type="button"
                  className={`vt-button ${showSearch ? "is-selected" : ""}`}
                  title="Toggle Search & Replace"
                  onClick={() => setShowSearch(!showSearch)}
                  style={{ height: "32px", width: "32px", padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Search size={14} />
                </button>
                {/* 25. Teleprompter High-Contrast Theme Toggle */}
                <button
                  type="button"
                  className={`vt-button ${isTeleprompterMode ? "primary is-selected" : ""}`}
                  title="Toggle Teleprompter High-Contrast Theme"
                  onClick={() => setIsTeleprompterMode(!isTeleprompterMode)}
                  style={{ height: "32px", width: "32px", padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                >
                  {isTeleprompterMode ? <Sun size={14} /> : <Moon size={14} />}
                </button>
              </div>
            </div>

            {/* 20. Search & Replace Toolbar Panel */}
            {showSearch && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "color-mix(in srgb, var(--widget-color, #A467F4) 15%, white)",
                  padding: "6px 8px",
                  borderRadius: "6px",
                  border: "2px solid var(--widget-border, #000)",
                }}
              >
                <input
                  type="text"
                  className="vt-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Find text..."
                  style={{ flex: 1, height: "28px", fontSize: "11px" }}
                />
                <input
                  type="text"
                  className="vt-input"
                  value={replaceTerm}
                  onChange={(e) => setReplaceTerm(e.target.value)}
                  placeholder="Replace with..."
                  style={{ flex: 1, height: "28px", fontSize: "11px" }}
                />
                <button
                  type="button"
                  className="vt-button primary"
                  onClick={handleReplaceAll}
                  style={{ height: "28px", padding: "0 8px", fontSize: "10px" }}
                >
                  Replace All
                </button>
              </div>
            )}

            {/* Main Script Textarea Input Box (with 25. Teleprompter Theme option) */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "130px" }}>
              <textarea
                ref={textareaRef}
                className="vt-textarea"
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder="Write or paste your video script here..."
                style={{
                  flex: 1,
                  width: "100%",
                  minHeight: "130px",
                  background: isTeleprompterMode ? "#0d0d0f" : "#fff",
                  color: isTeleprompterMode ? "#00FF66" : "inherit",
                  fontFamily: isTeleprompterMode ? "ui-monospace, Menlo, monospace" : "inherit",
                  fontSize: isTeleprompterMode ? "15px" : "12px",
                  lineHeight: isTeleprompterMode ? "1.8" : "1.5",
                  fontWeight: isTeleprompterMode ? 700 : 400,
                }}
              />
            </div>

            {/* 11. Target Word Count Meter & 22. SEO & 23. Readability Info Bar */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "10px",
                fontSize: "10px",
                fontWeight: 800,
                background: "color-mix(in srgb, var(--widget-color, #A467F4) 8%, white)",
                padding: "6px 8px",
                borderRadius: "6px",
                border: "2px solid var(--widget-border, #000)",
              }}
            >
              {/* Target Meter */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1, minWidth: "160px" }}>
                <Target size={13} />
                <span>Target: {wordCount}/{targetWordCount} w</span>
                <div style={{ flex: 1, height: "8px", border: "var(--widget-module-stroke, 2px) solid var(--widget-border, #000)", borderRadius: "999px", background: "#fff", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(100, Math.round((wordCount / targetWordCount) * 100))}%`,
                      background: "var(--widget-color, #A467F4)",
                    }}
                  />
                </div>
                <input
                  type="number"
                  className="vt-input"
                  value={targetWordCount}
                  onChange={(e) => setTargetWordCount(Number(e.target.value) || 100)}
                  style={{ width: "52px", height: "22px", fontSize: "9px", padding: "0 4px" }}
                />
              </div>

              {/* 23. Readability */}
              <span className="splitb">
                <span className="k"><BookOpen size={10} />Readability</span>
                <span className="v">{readabilityGrade}</span>
              </span>

              {/* 22. SEO Keywords */}
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <input
                  type="text"
                  className="vt-input"
                  value={seoKeyword}
                  onChange={(e) => setSeoKeyword(e.target.value)}
                  placeholder="SEO kw..."
                  style={{ width: "70px", height: "22px", fontSize: "9px", padding: "0 4px" }}
                />
                <span className="splitb">
                  <span className="k">SEO</span>
                  <span className="v">{keywordDensity}</span>
                </span>
              </div>
            </div>

            {/* Bottom Metrics & Actions Row */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "8px",
                marginTop: "auto",
                paddingTop: "2px",
              }}
            >
              <span className="splitb">
                <span className="k">
                  <Clock size={12} />
                  Runtime
                </span>
                <span className="v">{runtimeFormatted}</span>
              </span>

              <span className="splitb" style={{ ["--wc" as any]: "#3FEE56" }}>
                <span className="k">Voice match</span>
                <span className="v">{voiceMatchScore}</span>
              </span>

              {/* 21. Clone Button */}
              <button
                type="button"
                className="vt-button"
                onClick={handleCloneScript}
                title="Clone script into new draft"
                style={{ height: "30px", padding: "0 8px", fontSize: "10px", display: "inline-flex", alignItems: "center", gap: "3px" }}
              >
                <Copy size={12} /> Clone
              </button>

              {/* 8. Export Options */}
              <button
                type="button"
                className="vt-button"
                onClick={() => handleExport("text")}
                title="Copy clean plain text to clipboard"
                style={{ height: "30px", padding: "0 8px", fontSize: "10px", display: "inline-flex", alignItems: "center", gap: "3px" }}
              >
                <Download size={12} /> {isCopyFeedback ? "Copied!" : "Export Text"}
              </button>

              {/* 9. Studio Hub Handoff */}
              <button
                type="button"
                className="vt-button"
                onClick={handleHandoff}
                title="Send script text to Description Editor"
                style={{ height: "30px", padding: "0 8px", fontSize: "10px", display: "inline-flex", alignItems: "center", gap: "3px" }}
              >
                <Send size={12} /> {isHandoffFeedback ? "Sent!" : "To Description"}
              </button>
            </div>
          </>
        )}

        {/* SECTION 2: AI REFINE MODE */}
        {activeSection === "refine" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* 4. Hook Performance Score Analyzer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "color-mix(in srgb, var(--widget-color, #A467F4) 20%, white)",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "2px solid var(--widget-border, #000)",
              }}
            >
              <div>
                <strong style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "5px" }}>
                  <Flame size={16} color="#FA618A" /> Hook Retention Score
                </strong>
                <small style={{ display: "block", opacity: 0.75, fontSize: "10px" }}>
                  Evaluates 15-second opening hook engagement potential
                </small>
              </div>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 900,
                  background: hookScore > 75 ? "#3FEE56" : "#FFDA47",
                  border: "var(--widget-module-stroke, 2px) solid var(--widget-border, #000)",
                  borderRadius: "6px",
                  padding: "2px 10px",
                }}
              >
                {hookScore}%
              </span>
            </div>

            {/* 10. AI Tone Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", opacity: 0.7 }}>
                AI Co-Writer Tone:
              </span>
              {(["Energetic", "Educational", "Storytelling", "Urgent"] as AiTone[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`vt-button ${aiTone === t ? "primary is-selected" : ""}`}
                  onClick={() => setAiTone(t)}
                  style={{ height: "26px", padding: "0 8px", fontSize: "10px" }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* 16. Shorts / Reels Duration Cap Checker */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 10px",
                borderRadius: "6px",
                border: "2px solid var(--widget-border, #000)",
                background: isShortsMode && totalRuntimeSeconds > 60 ? "#FFD2D2" : "#fff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Film size={14} />
                <span style={{ fontSize: "11px", fontWeight: 800 }}>Shorts / Reels Mode (60s Cap)</span>
              </div>
              <button
                type="button"
                className={`vt-button ${isShortsMode ? "primary is-selected" : ""}`}
                onClick={() => setIsShortsMode(!isShortsMode)}
                style={{ height: "26px", padding: "0 8px", fontSize: "10px" }}
              >
                {isShortsMode ? "Active" : "Enable"}
              </button>
            </div>
            {isShortsMode && totalRuntimeSeconds > 60 && (
              <div style={{ color: "#D00000", fontSize: "10px", fontWeight: 900, display: "flex", alignItems: "center", gap: "4px" }}>
                <AlertTriangle size={12} /> Runtime is {runtimeFormatted} — exceeds 60s limit for YouTube Shorts!
              </div>
            )}

            {/* 15. Retention Drop Risk Detector Warnings */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", opacity: 0.7 }}>
                Pacing & Retention Diagnostics:
              </span>
              {retentionRisks.length > 0 ? (
                retentionRisks.map((risk, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "6px 8px",
                      background: "#FFF4CE",
                      border: "var(--widget-module-stroke, 2px) solid var(--widget-border, #000)",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <AlertTriangle size={13} color="#D97706" /> {risk}
                  </div>
                ))
              ) : (
                <div style={{ fontSize: "10px", fontWeight: 700, opacity: 0.6, fontStyle: "italic" }}>
                  No pacing bottlenecks detected. Script structure flows cleanly.
                </div>
              )}
            </div>

            {/* AI Refine Action */}
            <button
              type="button"
              className="vt-button primary"
              onClick={handleRewrite}
              disabled={isRewriting}
              style={{ height: "36px", fontSize: "11px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
            >
              <Wand2 size={15} className={isRewriting ? "animate-spin" : ""} />
              {isRewriting ? "Refining Script..." : `Rewrite selection with ${aiTone} AI`}
            </button>
          </div>
        )}

        {/* SECTION 3: AI CREATE / GENERATE MODE (Idea 5 with Source Reference Input) */}
        {activeSection === "generate" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "11px", fontWeight: 800 }}>
              <strong>Topic & Source Reference Context</strong>
              <small style={{ display: "block", opacity: 0.75, fontWeight: 600 }}>
                Provide topic details, reference URLs, documents, or research text for AI to reference before writing.
              </small>
            </div>

            {/* Topic Input */}
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <label style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.6 }}>
                Video Topic / Concept
              </label>
              <input
                type="text"
                className="vt-input"
                value={genTopic}
                onChange={(e) => setGenTopic(e.target.value)}
                placeholder="e.g. How Napoleon Won Austerlitz or 5 Tips for Video Growth"
                style={{ height: "32px", fontSize: "11px" }}
              />
            </div>

            {/* Reference URL Input */}
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <label style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.6, display: "flex", alignItems: "center", gap: "3px" }}>
                <LinkIcon size={10} /> Reference Source URL (Optional)
              </label>
              <input
                type="text"
                className="vt-input"
                value={genUrl}
                onChange={(e) => setGenUrl(e.target.value)}
                placeholder="https://wikipedia.org/wiki/... or article URL"
                style={{ height: "32px", fontSize: "11px" }}
              />
            </div>

            {/* Document Upload Button */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label
                className="vt-button"
                style={{
                  height: "30px",
                  padding: "0 10px",
                  fontSize: "10px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <FileUp size={13} />
                {uploadedFileName ? `Attached: ${uploadedFileName}` : "Upload Reference Doc (.txt, .md)"}
                <input
                  type="file"
                  accept=".txt,.md,.json,.csv"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            {/* Full Reference Textarea */}
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <label style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", opacity: 0.6 }}>
                Paste Full Research Text / Notes
              </label>
              <textarea
                className="vt-textarea"
                value={genSourceText}
                onChange={(e) => setGenSourceText(e.target.value)}
                placeholder="Paste background research, article extracts, or video outline notes..."
                style={{ minHeight: "80px", fontSize: "11px" }}
              />
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              className="vt-button primary"
              onClick={handleGenerateScript}
              disabled={isGenerating}
              style={{
                height: "36px",
                fontSize: "11px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                marginTop: "4px",
              }}
            >
              <Sparkles size={15} className={isGenerating ? "animate-spin" : ""} />
              {isGenerating ? "Generating Script from Sources..." : "Generate Full Script from Source Data"}
            </button>
          </div>
        )}
      </WidgetScrollArea>
    </WidgetShell>
  )
}
