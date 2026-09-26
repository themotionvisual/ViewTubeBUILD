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
          notes="NOTES"
          selected
          previewUrl={kind === "video" ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" : null}
          onSelectedChange={() => undefined}
          onTitleChange={() => undefined}
          onTagsChange={() => undefined}
          onNotesChange={() => undefined}
        />,
      )
      expect(html).toContain(`data-vt-vault-asset-variant="${variant}"`)
      expect(html).toContain("--vt-vault-module-w:276px")
      expect(html).toContain("--vt-vault-header-h:30px")
      expect(html).toContain("vt-vault-module-title")
      expect(html).toContain("vt-vault-tag-panel")
      expect(html).toContain("vt-vault-note-panel")
    }
  })

  it("preserves half-height audio/document anatomy and portrait selection placement", () => {
    const audio = renderToStaticMarkup(<VaultAssetModule kind="audio" variant="audio" title="AUDIO.WAV" />)
    const document = renderToStaticMarkup(<VaultAssetModule kind="document" variant="document" title="NOTES.PDF" />)
    const portrait = renderToStaticMarkup(<VaultAssetModule kind="image" variant="portrait-single" title="PORTRAIT.PNG" selected />)

    expect(audio).toContain("vt-vault-audio-preview")
    expect(document).toContain("vt-vault-document-preview")
    expect(portrait).toContain("is-thumb")
  })
})
