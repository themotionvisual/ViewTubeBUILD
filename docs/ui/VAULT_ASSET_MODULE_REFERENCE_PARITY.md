# Vault Asset Module Reference Parity Contract

**Status:** production implementation authority for the compact Creator Vault asset modules  
**Reference donor:** `viewtube_vault_fixed_notes_scrollbars_inline_tag_plus(1).html`  
**Reference SHA-256:** `d219728c89ede8587d3a8dd57402c28b313e43f0bf4702e1d89dc3b68d2c4988`  
**Reference length:** 1,255 lines  
**Production component:** `src/components/subtoolbox/VaultAssetModule.tsx`  
**Production CSS:** `src/styles/vault-asset-module.css`  
**Shared geometry authority:** `VAULT_ASSET_MODULE_DNA` in `src/components/subtoolbox/tokens.ts`

## Decision

The uploaded standalone HTML is the visual and interaction donor for this component family. Production may inherit ViewTube's current Toolbox palette, typography context, focus safety, accessibility behavior, and surrounding layout rules, but those systems must not silently redesign the donor geometry.

The production component is therefore a fixed compound rather than another L0/L1/L2-scaled control. Its internal controls remain reusable primitives, while the module owns its own size and composition.


## Single-asset scope

These modules are the compact / medium representations of **one asset** in the Vault Asset Library. A module represents exactly one image, one video clip, one audio file, or one document.

They are **not** projects, packages, engines, builds, collections, workflows, or project-management containers.

The module itself may visually contain only the donor-backed single-asset anatomy:
- preview / thumbnail (or audio / document representation);
- editable asset title;
- selection control;
- editable spectrum tags;
- editable notes;
- donor-defined variant/layout treatment.

Project assignment, lifecycle controls, favorite/archive/trash actions, protection, replacement workflows, content-build state, package state, and other higher-level Vault operations remain outside this compact module unless a later approved design explicitly adds them.

Existing application systems may continue to act on the selected asset through Inspector, context menus, keyboard commands, or other Vault tools; those systems must not force additional visible sections into the compact asset module.

## Frozen donor geometry

- module: 276 × 189 px
- stroke: 2 px
- inner: 272 × 185 px
- header: 30 px
- double portrait header: 60 px
- landscape media: 184 × 103.5 px
- portrait media: 104.0625 × 185 px
- portrait left work area: 167.9375 px
- half-height audio/document module: 276 × 94.5 px
- half body: 60.5 px
- half preview rail: 72 px
- outer radius: 10 px

These values live in `VAULT_ASSET_MODULE_DNA`. Do not recreate them in feature files.

## Supported production variants

1. `landscape`
2. `landscape-swapped`
3. `portrait-single`
4. `portrait-double`
5. `audio`
6. `document`

Image and video assets use the landscape/portrait layouts. Audio and document assets retain the donor half-height anatomy.

## Interaction parity

### Editable title
The title remains an inline transparent textarea in the colored header. Focus uses the donor inset black edit treatment. A single-height title commits on blur/Enter; the double portrait title preserves multiline editing.

### Tags
The Vault module owns the compact inline donor interaction:
- alphabetical spectrum badges;
- contextual selection glow;
- inline + button;
- existing-tag selector;
- new-tag input;
- confirm/cancel controls;
- contextual selected-tag deletion;
- alphabetical sorting;
- a shared tag library derived from live Vault assets.

The production spectrum color resolver remains ViewTube's canonical 12-color resolver.

### Notes
Notes preserve the donor dirty-save model. SAVE appears only after a change. Black square scrollbars appear only when the note actually overflows.

### Selection
Selection keeps the donor placement:
- landscape and half-height modules: header checkbox;
- portrait single: media-overlay checkbox;
- portrait double: second icon-rail cell.

### Media
Default production fitting is `cover` to match the donor. The component exposes an explicit `mediaFit` prop so later product decisions can use `contain` without changing the base anatomy.

## Creator Vault integration

`CreatorVaultOS.tsx` is a data adapter only:
- persisted title → `onTitleChange`;
- persisted tags → `onTagsChange`;
- persisted notes → `onNotesChange`;
- selection model → `onSelectedChange`;
- preview URL / media URL → media renderer;
- metadata orientation → portrait/landscape variant;
- audio/document kind → half-height variant.

Advanced Vault lifecycle, project, favorite, archive, trash, version and inspector systems remain Vault-owned. They must not be reimplemented inside the visual primitive.

## Studio Hub certification

The primitive track must render all six donor variants using the real `VaultAssetModule`, not a catalog-only imitation. Title, tags, notes and selection must remain interactive in the library.

The frozen hardcoded catalog remains a baseline and is not expanded merely to mirror new production primitives.

## Parity gate

A Vault module change is not complete until:
- the relevant donor variant is rendered at 276px width;
- title/tag/note editing works;
- selection placement matches the donor;
- audio/document half-height proportions remain unchanged;
- the 12-color ViewTube pair is the only intentional visual-system substitution;
- Creator Vault and Studio Hub use the same production component/CSS.
