# ViewTube Agent Ready Report — 2026-09-24

**Status:** REFERENCE / external agent-readability scan  
**Target:** https://viewtube.live  
**Scan ID:** `mnxXALyQHC`  
**Scan date:** 2026-09-24  
**Purpose:** preserve the external Agent Ready findings as planning evidence. This report is not an internal AI architecture authority.

## Scores

- **Agent readability:** 31 / 100 — needs improvement
- **llms.txt:** 0 / 100
- **Accessibility:** 100 / 100
- **Percentile:** 6th percentile in the scan corpus
- **Pages scanned/discovered:** 1 / 1

## What already passes

- HTTPS
- root page returns HTTP 200
- no redirect chain
- valid HTML content type
- no restrictive `x-robots-tag`
- valid `lang="en"`
- Markdown mirror exists
- `sitemap.md` exists
- `AGENTS.md` exists
- no detected cloaking between crawler and ordinary page response

## Highest-value failures

### Public discovery

- no `/llms.txt`
- no `/llms-full.txt`
- no valid `sitemap.xml`
- `sitemap.md` lacks a useful heading/link structure
- no discoverable root OpenAPI document

### Page metadata / structured content

- no canonical link
- no meta description
- no Open Graph title/description
- no JSON-LD
- no meaningful heading hierarchy
- static HTML contains almost no useful text
- site depends heavily on client-side JavaScript for visible content

### Markdown / alternate representation

- Markdown mirror has no frontmatter
- no HTML alternate link for Markdown
- Markdown response has no canonical Link header
- no `Accept: text/markdown` content negotiation
- no Markdown sitemap section

### Agent instruction quality

`AGENTS.md` exists, but the scanner could not recognize enough installation/configuration/usage structure.

## llms.txt-specific failures

The scanner found no usable root `llms.txt`, so all llms.txt checks failed:

- accessibility
- H1/title
- Markdown structure
- blockquote summary
- H2 file sections
- link format/accessibility
- optional section semantics
- text/plain response
- expanded full-context file

## Accessibility notes

The dedicated accessibility score was strong, but the public root still had two structural warnings relevant to both humans and agents:

- no useful H1/content hierarchy;
- no `<main>` landmark or skip link marking where primary content begins.

## Relationship to AI Systems Management

This report informs the Finish Program's **Public Agent Interface / agent-readiness** track.

It must **not** cause internal authenticated architecture, prompts, private evidence, user data, secrets or operational controls to be published.

The intended relationship is:

```
Internal AI Systems Master Resource
        ↓ selected public-safe projection only
Public AGENTS.md / llms.txt / sitemap / metadata / Markdown docs
```

## Planned public-readiness work

1. Add root `llms.txt`.
2. Consider `llms-full.txt` for public-safe documentation only.
3. Restructure `AGENTS.md` with recognizable sections.
4. Add `sitemap.xml` and improve `sitemap.md`.
5. Add canonical/meta/Open Graph/JSON-LD metadata.
6. Add public static/SSR text so the root is useful without JS.
7. Add Markdown alternate links and canonical response headers.
8. Add public glossary/terminology links where appropriate.
9. Add `<main>`/heading landmarks.
10. Re-scan and record score changes.

## Important privacy boundary

Do not publish:

- raw Prompt Registry contents that contain internal-only details;
- authenticated endpoint maps;
- private repository-only plans;
- Channel Profile/Knowledge data;
- user evidence;
- provider keys or model credentials;
- operational action schemas that expose unsafe mutation paths;
- private agent logs/Herald ledger;
- internal security/auth diagnostics.

## Scan reference

Agent Ready result:
`https://agent-ready.dev/scan/mnxXALyQHC`
