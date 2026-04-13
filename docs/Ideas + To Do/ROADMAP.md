# ViewTUBE v2.1 — Master Integration Roadmap
> Consolidated from all artifacts, brainstorms, and legacy codebase analysis.
> Last update: 2026-03-23

---

## 🗺️ Overview

This is the single source of truth for **every tool, feature, and plan** across the ViewTUBE Creator OS. It cross-references the legacy `ustubeZZZ` codebase (20 views), the current `viewtube` codebase (10 views), and all strategic planning artifacts.

---

## ✅ LIVE IN VIEWTUBE v2.1 (Completed)
These tools exist and are functional in the current ViewTUBE project.

| # | Tool | File | Status |
|---|------|------|--------|
| 1 | Dashboard (Overview) | `Dashboard.tsx` | ✅ Live |
| 2 | Storyboard Studio | `StoryboardStudio.tsx` | ✅ Live |
| 3 | SEO Engine | `SeoGenerator.tsx` | ✅ Live |
| 4 | Thumbnail Studio | `ThumbnailStudio.tsx` | ✅ Live |
| 5 | Channelytics | `Channelytics.tsx` | ✅ Live |
| 6 | Launch Calendar | `LaunchCalendar.tsx` | ✅ Live |
| 7 | Ideas Vault | `IdeasVault.tsx` | ✅ Live |
| 8 | Asset Vault (Project Vault) | `AssetVault.tsx` | ✅ Live |
| 9 | Video Manager | `VideoManager.tsx` | ✅ Live |
| 10 | Settings | `Settings.tsx` | ✅ Live |

---

## 🔶 READY TO PORT (Exist in Legacy, Not Yet in ViewTUBE)
These tools are fully built in the `ustubeZZZ` project and need to be ported + restyled for v2.1's Neo-Brutalist design.

| # | Tool | Legacy File | Size | Priority | Notes |
|---|------|-------------|------|----------|-------|
| 1 | **Research Lab** | `ResearchLab.tsx` | 223KB | 🔴 HIGH | Massive — includes Video Value Matrix, Audience Geography, Viewer Loyalty, Honesty Scale, and 10+ advanced chart types |
| 2 | **Simple Analytics (Pulse)** | `SimpleAnalytics.tsx` | 46KB | 🔴 HIGH | The 18-station universal dashboard — the crown jewel of analytics |
| 3 | **Projects (Kanban)** | `Projects.tsx` | 79KB | 🔴 HIGH | Full project lifecycle management with Kanban board, Blueprint mode, and AI plan generation |
| 4 | **Analytics Lab** | `AnalyticsLab.tsx` | 71KB | 🟡 MED | Classic Google Charts interface with CSV upload/analysis |
| 5 | **SEO Generator (Full)** | `SeoGenerator.tsx` | 38KB | 🟡 MED | The legacy version is more feature-rich than ViewTUBE's current slim version |
| 6 | **Thumbnail Studio (Full)** | `ThumbnailStudio.tsx` | 27KB | 🟡 MED | Legacy has AI generation, rating, and visual editing features |
| 7 | **Hook Generator** | `HookGenerator.tsx` | 18KB | 🟡 MED | AI-powered first-10-second script generator |
| 8 | **Strategy Chat** | `StrategyChat.tsx` | 5KB | 🟢 LOW | Gemini Pro thinking-mode consultant |
| 9 | **Keyword Research** | `KeywordResearch.tsx` | 21KB | 🟡 MED | Scatter plots, trend graphs, and sentiment analysis |
| 10 | **Algorithm Architect** | `AlgorithmArchitect.tsx` | 19KB | 🟡 MED | Deep algorithmic dissection of views/impressions/retention |
| 11 | **Media Analyzer** | `MediaAnalyzer.tsx` | 10KB | 🟢 LOW | Video/image file upload for AI analysis |
| 12 | **Studio Hub** | `StudioHub.tsx` | 18KB | 🟢 LOW | Centralized creation launcher |
| 13 | **Report Archive** | `ReportArchive.tsx` | 7KB | 🟢 LOW | Storage for generated analytical reports |
| 14 | **Help Guide** | `HelpGuide.tsx` | 33KB | 🟢 LOW | In-app documentation and onboarding |

---

## 🔵 PLANNED BUT NEVER BUILT (Have Implementation Plans)
These features have detailed technical blueprints but no code was ever written.

| # | Feature | Source Artifact | Complexity |
|---|---------|-----------------|------------|
| 1 | **Algorithmic Displacement Timeline** | `comprehensive_feature_audit.md` | 100% Stacked Area chart tracking Browse→Suggested traffic shift |
| 2 | **Thumbnail Neon/Contrast Matrix** | `comprehensive_feature_audit.md` | AI brightness/saturation analysis vs CTR correlation |
| 3 | **Watch Time ROI Matrix** | `comprehensive_feature_audit.md` | Bubble chart: Production Effort vs Revenue yield |
| 4 | **RPM Stability Index** | `comprehensive_feature_audit.md` | Dual-axis chart for topic RPM vs seasonal volatility |
| 5 | **Topic Authority Scorecard** | `comprehensive_feature_audit.md` | Radar chart: Reach, Stickiness, Conversion, Value, Bingeability |
| 6 | **Binge-Session Catalyst Map** | `comprehensive_feature_audit.md` | Sankey diagram showing feeder→binge video flows |
| 7 | **Project Storyboard Planner** | `comprehensive_feature_audit.md` | Visual + Blueprint dual-mode for Projects.tsx |
| 8 | **The Shelf-Life Index** | `comprehensive_feature_audit.md` | Legacy video value predictor |

---

## 🟣 GCP API INTEGRATIONS (Strategic Expansion)
From the `gcp_api_opportunity_map.md` — Google Cloud services to supercharge the OS.

### Standard Tier (Free Google Account)
| # | Integration | API | Feature Unlocked |
|---|-------------|-----|------------------|
| 1 | **Mobile Bridge: Google Photos** | Photos Library API | Import phone B-roll into Asset Vault |
| 2 | **Mobile Bridge: Google Keep** | Keep API | Sync mobile notes/ideas into Ideas Vault |
| 3 | **Global SEO: Search Console** | Search Console API | Track video rankings in Google Search (not just YouTube) |

### Power-User Tier (Google One / GCP Project)
| # | Integration | API | Feature Unlocked |
|---|-------------|-----|------------------|
| 4 | **Vertex AI Oracle** | Gemini 1.5 Pro / Vertex | Massive dataset reasoning, deep sentiment analysis |
| 5 | **Video Intelligence** | Video Intelligence API | Auto-tagging footage, shot detection, brand safety |
| 6 | **Global Translator** | Cloud Translation API | One-click title/description translation to 100+ languages |
| 7 | **Smart Transcription** | Speech-to-Text (Chirp v2) | Automated captions and script generation from audio |
| 8 | **BigQuery Analytics** | BigQuery | Niche-wide benchmarking and historical deep dives |

---

## 💡 BRAINSTORMED IDEAS (No Plans Written Yet)
Pure concepts from the "50 Advanced Tools" brainstorming sessions.

### Monetization & Business
- Sponsorship CRM (brand deal tracker + invoicing)
- Revenue Forecaster (predictive AdSense AI)
- Merch & Product Sales Tracker (Shopify integration)

### Community & Social
- Automated Comment Responder (AI inbox)
- Community Tab Generator (AI polls/posts)

### Competitor & Market Research
- Viral Trend Detector (live niche scraper)
- Competitor Benchmarking (rival channel tracker)
- Competitor Video Autopsy (reverse-engineering tool)

### Content Repurposing
- Shorts / Clipping Engine (auto-highlight extraction)
- Scriptwriter & Outliner (dedicated script editor with AI)
- Silence & Filler Word Cutter (auto-cleanup)

### Team & Workflow
- Editor Handoff Portal (raw footage + notes for editors)
- Automation Command Center (macro chains: Upload→SEO→Post)
- Title A/B/C Tester Predictor (pre-launch CTR prediction)

### AI Power Combos
- **"The Editing Ghost"**: Silence Cutter + Auto-Zoom + SFX Mixer → instant rough cuts
- **"Viral Launchpad"**: Trend Radar + Hook Generator → auto-generate first 30s from live demand
- **Emotion Arc Mapper**: AI script pacing visualizer to prevent mid-video drop-off
- **Predictive Trend Radar**: AI scraper for niche waves before they peak

---

## 🏗️ SIDEBAR ORGANIZATION (Proposed)
From `tool_organization_proposals.md` — the recommended **"Creator Lifecycle" Model**:

```
1. OVERVIEW         → Dashboard
2. STRATEGY         → Projects, Ideas Vault, Keyword Research, Research Lab, Strategy Chat
3. STUDIO           → Thumbnail Studio, SEO Generator, Hook Generator, Studio Hub
4. PERFORMANCE      → Video Manager, Channelytics, Algorithm Architect, Report Archive
5. SYSTEM           → Settings, Help Guide
```

This uses an **accordion sidebar** to keep the interface clean while housing 15+ tools.

---

## 📋 RECOMMENDED EXECUTION ORDER

### Wave 1: Core Power Tools (Port from Legacy)
1. Projects (Kanban) — *the backbone of production planning*
2. Research Lab — *the deepest analytics tool*
3. Simple Analytics (Pulse) — *the at-a-glance command center*

### Wave 2: AI Creation Suite
4. Hook Generator
5. Strategy Chat
6. Keyword Research
7. Full SEO Generator upgrade

### Wave 3: GCP Expansion
8. Mobile Bridge (Photos + Keep)
9. Global SEO (Search Console)
10. Video Intelligence API

### Wave 4: Advanced Analytics
11. Analytics Lab (CSV)
12. Algorithm Architect
13. Planned-but-unbuilt chart types (Displacement, ROI, RPM, etc.)

### Wave 5: Ecosystem
14. Sidebar Reorganization (Accordion Model)
15. Automation Command Center
16. Shorts/Clipping Engine
