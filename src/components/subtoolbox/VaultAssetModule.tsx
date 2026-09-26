import React from "react"
import { FileText, Image as ImageIcon, Music, Play } from "lucide-react"
import { getAlphabeticalSpectrumColor } from "../../styles/toolboxPalette"
import { getToolboxColorPair, type ToolboxControlLevel } from "./tokens"
import "../../styles/vault-asset-module.css"

export type VaultAssetModuleKind = "image" | "video" | "audio" | "document"
export type VaultAssetModuleVariant =
  | "landscape"
  | "landscape-swapped"
  | "portrait-single"
  | "portrait-double"
  | "audio"
  | "document"

const DEFAULT_SHARED_TAG_LIBRARY = [
  "APPLE", "BALL", "BATTLE", "CAMERA", "DESIGN",
  "EDIT", "EXPORT", "FINAL", "HISTORY", "INTRO",
  "LANDSCAPE", "NAPOLEON", "PORTRAIT", "ROUGH", "SHORTS",
  "SOCIAL", "THUMBNAIL", "TUTORIAL", "VIDEO", "YOUTUBE",
]

const classes = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" ")

export interface VaultAssetModuleProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  level?: ToolboxControlLevel
  kind: VaultAssetModuleKind
  variant?: VaultAssetModuleVariant
  title: string
  previewUrl?: string | null
  mediaUrl?: string | null
  mimeType?: string | null
  durationLabel?: string | null
  fileTypeLabel?: string | null
  paletteIndex?: number
  selected?: boolean
  tags?: string[]
  sharedTags?: string[]
  notes?: string
  mediaFit?: "cover" | "contain"
  onSelectedChange?: (selected: boolean) => void
  onTitleChange?: (title: string) => void
  onTagsChange?: (tags: string[]) => void
  onNotesChange?: (notes: string) => void
  onPreviewAction?: () => void
}

const resolveVariant = (
  kind: VaultAssetModuleKind,
  variant?: VaultAssetModuleVariant,
): VaultAssetModuleVariant => {
  if (variant) return variant
  if (kind === "audio") return "audio"
  if (kind === "document") return "document"
  return "landscape"
}

const AssetIcon: React.FC<{ kind: VaultAssetModuleKind }> = ({ kind }) => {
  if (kind === "audio") return <Music aria-hidden="true" />
  if (kind === "document") return <FileText aria-hidden="true" />
  return <ImageIcon aria-hidden="true" />
}

const VaultSelection: React.FC<{
  checked: boolean
  label: string
  className?: string
  onChange?: (selected: boolean) => void
}> = ({ checked, label, className, onChange }) => (
  <input
    className={classes("vt-vault-module-check", className)}
    type="checkbox"
    checked={checked}
    aria-label={label}
    onChange={(event) => onChange?.(event.target.checked)}
  />
)

const VaultEditableTitle: React.FC<{
  value: string
  doubleHeight?: boolean
  onChange?: (title: string) => void
}> = ({ value, doubleHeight = false, onChange }) => {
  const [draft, setDraft] = React.useState(value)
  React.useEffect(() => setDraft(value), [value])

  const commit = () => {
    const next = draft.trim()
    if (!next) {
      setDraft(value)
      return
    }
    if (next !== value) onChange?.(next)
  }

  return (
    <textarea
      className={classes("vt-vault-module-title", doubleHeight && "is-double")}
      aria-label="Asset title"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setDraft(value)
          event.currentTarget.blur()
        }
        if (event.key === "Enter" && !doubleHeight) {
          event.preventDefault()
          event.currentTarget.blur()
        }
      }}
    />
  )
}

export const VaultAssetTagEditor: React.FC<{
  tags: string[]
  sharedTags?: string[]
  onTagsChange?: (tags: string[]) => void
}> = ({ tags, sharedTags = DEFAULT_SHARED_TAG_LIBRARY, onTagsChange }) => {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState("")
  const [existing, setExisting] = React.useState("")
  const [selected, setSelected] = React.useState<string | null>(null)

  const library = React.useMemo(
    () => [...new Set([...DEFAULT_SHARED_TAG_LIBRARY, ...sharedTags, ...tags].map((value) => value.trim().toUpperCase()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b)),
    [sharedTags, tags],
  )

  const finishEditing = () => {
    setEditing(false)
    setDraft("")
    setExisting("")
  }

  const addTag = () => {
    const next = (draft.trim() || existing).toUpperCase()
    if (!next) return
    const merged = [...new Set([...tags.map((tag) => tag.toUpperCase()), next])].sort((a, b) => a.localeCompare(b))
    onTagsChange?.(merged)
    setSelected(next)
    finishEditing()
  }

  const removeSelected = () => {
    if (!selected) return
    onTagsChange?.(tags.filter((tag) => tag.toUpperCase() !== selected))
    setSelected(null)
  }

  return (
    <div className={classes(
      "vt-vault-tag-panel",
      editing && "is-editing",
      selected && "has-selection",
      tags.length > 0 && "has-tags",
    )}>
      <div className="vt-vault-tag-inline-row">
        <span className="vt-vault-tag-label">TAGS:</span>
        <div className="vt-vault-tag-list">
          {[...tags].sort((a, b) => a.localeCompare(b)).map((tag) => {
            const normalized = tag.toUpperCase()
            const color = getAlphabeticalSpectrumColor(normalized)
            return (
              <button
                type="button"
                key={normalized}
                className={classes("vt-vault-tag-badge", selected === normalized && "is-selected")}
                data-tag={normalized}
                style={{
                  ["--vt-vault-tag-stroke" as string]: color,
                  ["--vt-vault-tag-fill" as string]: `color-mix(in srgb, ${color} 35%, white)`,
                } as React.CSSProperties}
                onClick={() => setSelected((current) => current === normalized ? null : normalized)}
              >
                {normalized}
              </button>
            )
          })}
        </div>
        <button type="button" className="vt-vault-add-tag" aria-label="Add tag" onClick={() => {
          setSelected(null)
          setEditing(true)
        }}>+</button>
        {!editing && selected ? (
          <button type="button" className="vt-vault-remove-selected" aria-label="Remove selected tag" onClick={removeSelected}>×</button>
        ) : null}
      </div>

      {editing ? (
        <div className="vt-vault-tag-control-row">
          <select
            className="vt-vault-existing-tag-select"
            aria-label="Existing tags"
            value={existing}
            onChange={(event) => {
              setExisting(event.target.value)
              if (event.target.value) setDraft("")
            }}
          >
            <option value="">TAGS</option>
            {library.map((tag) => <option value={tag} key={tag}>{tag}</option>)}
          </select>
          <input
            autoFocus
            className="vt-vault-new-tag-input"
            type="text"
            placeholder="NEW TAG"
            aria-label="New tag"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value.toUpperCase())
              if (event.target.value) setExisting("")
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                addTag()
              }
              if (event.key === "Escape") finishEditing()
            }}
          />
          <button type="button" className="vt-vault-tag-submit" aria-label="Save tag" onClick={addTag}>✓</button>
          <button type="button" className="vt-vault-tag-cancel" aria-label="Cancel tag editing" onClick={finishEditing}>×</button>
        </div>
      ) : null}
    </div>
  )
}

export const VaultAssetNotes: React.FC<{
  value?: string
  onChange?: (notes: string) => void
}> = ({ value = "", onChange }) => {
  const [draft, setDraft] = React.useState(value)
  const [stored, setStored] = React.useState(value)
  const [overflowing, setOverflowing] = React.useState(false)
  const ref = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    setDraft(value)
    setStored(value)
  }, [value])

  const updateOverflow = React.useCallback(() => {
    const input = ref.current
    if (!input) return
    setOverflowing(input.scrollHeight > input.clientHeight + 1)
  }, [])

  React.useEffect(() => {
    updateOverflow()
    const onResize = () => updateOverflow()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [updateOverflow])

  const dirty = draft !== stored

  return (
    <div className={classes("vt-vault-note-panel", dirty && "is-dirty", overflowing && "has-overflow")}>
      <textarea
        ref={ref}
        className="vt-vault-note-input"
        placeholder="NOTES:"
        aria-label="Asset notes"
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value)
          requestAnimationFrame(updateOverflow)
        }}
      />
      {dirty ? (
        <button
          type="button"
          className="vt-vault-save-note"
          onClick={() => {
            setStored(draft)
            onChange?.(draft)
          }}
        >SAVE</button>
      ) : null}
    </div>
  )
}

const VaultMedia: React.FC<{
  kind: VaultAssetModuleKind
  src?: string | null
  title: string
  selected?: boolean
  showSelection?: boolean
  fit: "cover" | "contain"
  onSelectedChange?: (selected: boolean) => void
  onPreviewAction?: () => void
}> = ({ kind, src, title, selected = false, showSelection = false, fit, onSelectedChange, onPreviewAction }) => (
  <div className="vt-vault-media-frame" style={{ ["--vt-vault-media-fit" as string]: fit } as React.CSSProperties}>
    {src ? <img src={src} alt="" /> : <AssetIcon kind={kind} />}
    {showSelection ? (
      <VaultSelection
        checked={selected}
        label={`Select ${title}`}
        className="is-thumb"
        onChange={onSelectedChange}
      />
    ) : null}
    {kind === "video" ? (
      <button type="button" className="vt-vault-play-button" aria-label={`Preview ${title}`} onClick={onPreviewAction}>
        <Play aria-hidden="true" />
      </button>
    ) : null}
  </div>
)

const AudioPreview: React.FC<{ durationLabel?: string | null; onPreviewAction?: () => void }> = ({ durationLabel, onPreviewAction }) => (
  <div className="vt-vault-half-preview vt-vault-audio-preview">
    <div className="vt-vault-waveform"><i /><i /><i /><i /><i /><i /><i /></div>
    <div className="vt-vault-audio-time">{durationLabel || "01:24"}</div>
    <button type="button" className="vt-vault-audio-mini-play" aria-label="Play audio" onClick={onPreviewAction}>▶</button>
  </div>
)

const DocumentPreview: React.FC<{ fileType?: string | null }> = ({ fileType }) => (
  <div className="vt-vault-half-preview vt-vault-document-preview">
    <div className="vt-vault-document-sheet">
      <div className="vt-vault-document-line" />
      <div className="vt-vault-document-line" />
      <div className="vt-vault-document-line" />
    </div>
    <span className="vt-vault-file-type">{(fileType || "DOC").replace(".", "").toUpperCase()}</span>
  </div>
)

export const VaultAssetModule: React.FC<VaultAssetModuleProps> = ({
  level = "l1",
  kind,
  variant,
  title,
  previewUrl,
  mediaUrl,
  mimeType,
  durationLabel,
  fileTypeLabel,
  paletteIndex = 0,
  selected = false,
  tags = [],
  sharedTags,
  notes = "",
  mediaFit = "cover",
  onSelectedChange,
  onTitleChange,
  onTagsChange,
  onNotesChange,
  onPreviewAction,
  className,
  style,
  ...props
}) => {
  const resolvedVariant = resolveVariant(kind, variant)
  const colors = getToolboxColorPair(paletteIndex)
  const isHalf = resolvedVariant === "audio" || resolvedVariant === "document"
  const src = previewUrl || mediaUrl || null
  const fileType = fileTypeLabel
    || mimeType?.split("/").pop()
    || title.split(".").pop()
    || "DOC"

  const mergedStyle = {
    ["--vt-vault-header" as string]: colors.body,
    ["--vt-vault-icon" as string]: colors.rail,
    ["--vt-vault-check" as string]: colors.rail,
    ...style,
  } as React.CSSProperties

  if (isHalf) {
    return (
      <article
        className={classes("vt-vault-asset-module", "is-half", `is-${resolvedVariant}`, className)}
        data-vt-control-level={level}
        data-vt-vault-asset-variant={resolvedVariant}
        style={mergedStyle}
        {...props}
      >
        <div className="vt-vault-module-header">
          <div className="vt-vault-icon-box"><AssetIcon kind={kind} /></div>
          <VaultEditableTitle value={title} onChange={onTitleChange} />
          <VaultSelection checked={selected} label={`Select ${title}`} onChange={onSelectedChange} />
        </div>
        <div className="vt-vault-half-body">
          <div className="vt-vault-half-left">
            <VaultAssetTagEditor tags={tags} sharedTags={sharedTags} onTagsChange={onTagsChange} />
            <VaultAssetNotes value={notes} onChange={onNotesChange} />
          </div>
          {resolvedVariant === "audio"
            ? <AudioPreview durationLabel={durationLabel} onPreviewAction={onPreviewAction} />
            : <DocumentPreview fileType={fileType} />}
        </div>
      </article>
    )
  }

  if (resolvedVariant === "portrait-single" || resolvedVariant === "portrait-double") {
    const double = resolvedVariant === "portrait-double"
    return (
      <article
        className={classes("vt-vault-asset-module", "is-portrait", double ? "is-portrait-double" : "is-portrait-single", className)}
        data-vt-control-level={level}
        data-vt-vault-asset-variant={resolvedVariant}
        style={mergedStyle}
        {...props}
      >
        <div className="vt-vault-portrait-left">
          <div className={classes("vt-vault-module-header", double && "is-double")}>
            <div className={classes("vt-vault-icon-box", double && "is-double")}>
              {double ? (
                <>
                  <div className="vt-vault-icon-stack-top"><AssetIcon kind={kind} /></div>
                  <div className="vt-vault-icon-stack-bottom">
                    <VaultSelection checked={selected} label={`Select ${title}`} onChange={onSelectedChange} />
                  </div>
                </>
              ) : <AssetIcon kind={kind} />}
            </div>
            <VaultEditableTitle value={title} doubleHeight={double} onChange={onTitleChange} />
          </div>
          <VaultAssetTagEditor tags={tags} sharedTags={sharedTags} onTagsChange={onTagsChange} />
          <VaultAssetNotes value={notes} onChange={onNotesChange} />
        </div>
        <VaultMedia
          kind={kind}
          src={src}
          title={title}
          selected={selected}
          showSelection={!double}
          fit={mediaFit}
          onSelectedChange={onSelectedChange}
          onPreviewAction={onPreviewAction}
        />
      </article>
    )
  }

  if (resolvedVariant === "landscape-swapped") {
    return (
      <article
        className={classes("vt-vault-asset-module", "is-landscape-swapped", className)}
        data-vt-control-level={level}
        data-vt-vault-asset-variant={resolvedVariant}
        style={mergedStyle}
        {...props}
      >
        <div className="vt-vault-module-header">
          <div className="vt-vault-icon-box"><AssetIcon kind={kind} /></div>
          <VaultEditableTitle value={title} onChange={onTitleChange} />
          <VaultSelection checked={selected} label={`Select ${title}`} onChange={onSelectedChange} />
        </div>
        <div className="vt-vault-landscape-middle">
          <VaultMedia kind={kind} src={src} title={title} fit={mediaFit} onPreviewAction={onPreviewAction} />
          <VaultAssetNotes value={notes} onChange={onNotesChange} />
        </div>
        <VaultAssetTagEditor tags={tags} sharedTags={sharedTags} onTagsChange={onTagsChange} />
      </article>
    )
  }

  return (
    <article
      className={classes("vt-vault-asset-module", "is-landscape", className)}
      data-vt-control-level={level}
      data-vt-vault-asset-variant="landscape"
      style={mergedStyle}
      {...props}
    >
      <div className="vt-vault-module-header">
        <div className="vt-vault-icon-box"><AssetIcon kind={kind} /></div>
        <VaultEditableTitle value={title} onChange={onTitleChange} />
        <VaultSelection checked={selected} label={`Select ${title}`} onChange={onSelectedChange} />
      </div>
      <div className="vt-vault-landscape-middle">
        <VaultMedia kind={kind} src={src} title={title} fit={mediaFit} onPreviewAction={onPreviewAction} />
        <VaultAssetTagEditor tags={tags} sharedTags={sharedTags} onTagsChange={onTagsChange} />
      </div>
      <VaultAssetNotes value={notes} onChange={onNotesChange} />
    </article>
  )
}

export default VaultAssetModule
