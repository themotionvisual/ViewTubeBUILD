# ViewTube Resource Library

This folder contains the canonical Markdown source documents that populate the creator-facing **Resource Library** at `/resources`.

## Authority

- The Markdown document is the editable content authority for each resource.
- The production Resource Library renderer is the presentation authority.
- PDFs, screenshots and future exports are generated derivatives and must not become competing content authorities.
- Research claims should retain evidence status, source provenance and review metadata.

## Current Collection

| ID | Resource | Category | Status | Source |
|---|---|---|---|---|
| `youtube-recommendations-discovery` | How YouTube Finds Viewers for Your Videos | YouTube Strategy | Published | `library/how-youtube-recommendations-and-discovery-work.md` |
| `youtube-metrics-dimensions-glossary` | How to Read YouTube Analytics | Analytics | Published | `library/youtube-metrics-and-dimensions-master-glossary.md` |

**Initial creator-reference series:** 2 of 15 documents now authored and registered.

## Handoff

For the current implementation map, ingestion workflow, testing contract, known limitations, and next-agent instructions, read:

`RESOURCE_LIBRARY_HANDOFF.md`

## Template

Use:

`templates/VIEWTUBE_RESOURCE_DOCUMENT_TEMPLATE.md`

The template is intentionally semantic and creator-first rather than visually branded or developer-first. Every resource should explain the subject in plain creator language, show why it matters, teach how to diagnose or act on it in ViewTube, and move technical/API detail into optional advanced reference sections. The production renderer converts those structures into the ViewTube Toolbox/SubToolbox UI.

## Add a Resource

1. Research and author the resource as Markdown.
2. Start from the canonical template.
3. Keep the full research in the Markdown source.
4. Put one major concept under each `##` heading so it can become a SubToolbox.
5. Use tables for comparisons, checklists for actions and Mermaid for relationships/processes.
6. Add the source file to `RESOURCE_LIBRARY_ENTRIES`.
7. Verify search/filter metadata and direct `?resource=<id>` selection.
8. Run tests, typecheck, lint and production build.
9. Review desktop and mobile rendering before publishing.

## Planned First 15

1. How YouTube Finds Viewers for Your Videos
2. How to Read YouTube Analytics
3. Shorts vs Long-Form: Different Systems, Different Signals
4. Publishing Best Practices and Preflight Checklist
5. Thumbnail and Title Packaging Handbook
6. Audience Retention and Watch Behavior Guide
7. Traffic Sources and Discovery Pathways
8. Audience, Subscribers and Returning Viewers
9. YouTube Revenue and Monetization Fundamentals
10. Live Streaming Operations Handbook
11. Playlist, Series and Channel Architecture Guide
12. Comments, Community and Audience Feedback Playbook
13. Content Planning, Experiments and Learning Loops
14. Copyright, Rights, Reuse and AI-Generated Media Reference
15. Reading Analytics Correctly: Scope, Windows, Missingness and Statistical Traps
