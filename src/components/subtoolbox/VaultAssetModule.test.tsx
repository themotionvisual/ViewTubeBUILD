import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { VaultAssetModule, type VaultAssetModuleVariant } from "./VaultAssetModule"

const variants: VaultAssetModuleVariant[] = [
  "landscape",
  "landscape-swapped",
  "portrait-single",
  "portrait-double",
  "audio",
  "document",
]

describe("VaultAssetModule", () => {
  it("renders every donor variant with the fixed production compound marker", () => {
    for (const variant of variants) {
      const kind = variant === "audio" ? "audio" : variant === "document" ? "document" : "video"
      const html = renderToStaticMarkup(
        <VaultAssetModule
          kind={kind}
          variant={variant}
          title="NAPOLEON_ASSET_01"
          tags={["NAPOLEON", "HISTORY"]}
          selected
          previewUrl={kind === "video" ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" : null}
          onSelectedChange={() => undefined}
          onTitleChange={() => undefined}
          onTagsChange={() => undefined}
        />,
      )
      expect(html).toContain(`data-vt-vault-asset-variant="${variant}"`)
      expect(html).toContain("--vt-vault-module-w:276px")
      expect(html).toContain("--vt-vault-header-h:30px")
      expect(html).toContain("vt-vault-module-title")
      expect(html).toContain("vt-vault-tag-panel")
      expect(html).not.toContain("vt-vault-note-panel")
      expect(html).toContain("vt-vault-card-meta")
    }
  })

  it("only renders factual audio duration when one is provided", () => {
    const unknown = renderToStaticMarkup(<VaultAssetModule kind="audio" variant="audio" title="UNKNOWN.WAV" />)
    const known = renderToStaticMarkup(<VaultAssetModule kind="audio" variant="audio" title="KNOWN.WAV" durationLabel="00:42" />)

    expect(unknown).not.toContain("vt-vault-audio-time")
    expect(known).toContain("00:42")
  })

  it("keeps dense cards to three visible tags with an explicit overflow affordance", () => {
    const html = renderToStaticMarkup(
      <VaultAssetModule
        kind="image"
        variant="landscape"
        title="DENSE.PNG"
        tags={["ALPHA", "BRAVO", "CHARLIE", "DELTA", "ECHO"]}
      />,
    )

    expect(html).toContain("ALPHA")
    expect(html).toContain("BRAVO")
    expect(html).toContain("CHARLIE")
    expect(html).toContain("+2")
    expect(html).not.toContain('data-tag="DELTA"')
  })

  it("makes image and document media surfaces natural preview targets without permanent action bars", () => {
    const imageHtml = renderToStaticMarkup(
      <VaultAssetModule kind="image" variant="landscape" title="IMAGE.PNG" onPreviewAction={() => {}} />,
    )
    const documentHtml = renderToStaticMarkup(
      <VaultAssetModule kind="document" variant="document" title="RESEARCH.MD" onPreviewAction={() => {}} />,
    )

    expect(imageHtml).toContain('class="vt-vault-media-open"')
    expect(imageHtml).toContain('aria-label="Preview IMAGE.PNG"')
    expect(documentHtml).toContain('aria-label="Preview RESEARCH.MD"')
  })

  it("renders a factual document excerpt when canonical text content is available", () => {
    const html = renderToStaticMarkup(
      <VaultAssetModule
        kind="document"
        variant="document"
        title="RESEARCH.MD"
        documentExcerpt="Napoleon moved the Grande Armée toward the Danube."
      />,
    )

    expect(html).toContain("vt-vault-document-excerpt")
    expect(html).toContain("Napoleon moved the Grande Armée toward the Danube.")
  })

  it("preserves half-height audio/document anatomy and portrait selection placement", () => {
    const audio = renderToStaticMarkup(<VaultAssetModule kind="audio" variant="audio" title="AUDIO.WAV" />)
    const document = renderToStaticMarkup(<VaultAssetModule kind="document" variant="document" title="NOTES.PDF" />)
    const portrait = renderToStaticMarkup(<VaultAssetModule kind="image" variant="portrait-single" title="PORTRAIT.PNG" selected />)

    expect(audio).toContain("vt-vault-audio-preview")
    expect(audio).not.toContain("01:24")
    expect(document).toContain("vt-vault-document-preview")
    expect(portrait).toContain("is-thumb")
  })
})