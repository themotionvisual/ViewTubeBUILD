# Toolbox UI no-loss checklist

Before merge:

- Compare branch to latest main and account for every changed file.
- Preserve all current-main analytics/data import work.
- Do not touch auth, API, editor, analytics behavior or project tooling in this migration.
- Confirm Studio Hub still mounts Video Manager, Video Publisher, Media Analyzer, Thumbnail Studio, Community Posts, Comment Responder, End-Screen Architect, Pre-Launch Priming, Hook Generator, Actionable Tactics and Script Architect.
- Confirm UI Reference Library remains lazy-loaded and collapsible.
- Confirm main Toolbox header is 80px and Subtoolbox header is 56px.
- Confirm mobile Studio Hub toolboxes are full width.
- Confirm no horizontal overflow from split-left controls or dropdown menus.
- Confirm open dropdowns retain closed-trigger stroke/radius/shadow language.
- Confirm palette cycle and colored shadow derivation remain functional.
