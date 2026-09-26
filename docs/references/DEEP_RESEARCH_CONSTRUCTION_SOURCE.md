# ViewTube Deep Research & Construction Source

**Production Date:** 2026-09-26  
**Last Edited:** 2026-09-26  
**Class:** REFERENCE  
**Status:** ACTIVE  
**Concern:** product research, capability ideation, master-tool consolidation, API feasibility, creator workflow, AI/agent architecture, analytics, infrastructure, economics, governance, and product-roadmap source material  
**Owner:** Product Architecture  
**Registry ID:** DOC-REF-DEEP-RESEARCH-CONSTRUCTION  
**Source Tier:** MASTER_SOURCE  
**Original Source:** ViewTube Master Plan.md  
**Original SHA-256:** 24a048e54a068eb6a6e48996466a0c94247e19ca25543661fbdd3b852593f1f6  
**Last Audited Main SHA:** N/A — source document; individual claims require current verification before adoption  
**Related Authorities:** docs/architecture/PRODUCT_ARCHITECTURE.md; docs/programs/INTEGRATED_APPLICATION.md; docs/governance/DOCUMENTATION.md

> **MASTER SOURCE ROLE:** This document is privileged strategic prior art. Agents working on ViewTube product architecture, feature/tool ideation, deep research, AI/agent systems, video-generation systems, analytics, UI/workstation design, integrations, infrastructure, monetization, or major simplification/consolidation should consult it before proposing a new system. It does not override current code, Product Architecture, Domain Authorities, Task Index state, or verified API/runtime evidence. Its best ideas are promoted into those authorities through governed review rather than treated as automatically implemented truth.

---

## Preserved source content

# Research and Master-Document Plan for the ViewTube Integrated Creator Workstation

## Mandate and intended end state

The new master document should not simply merge the two supplied reports or preserve the existing “50 tools” structure. Its purpose should be to **audit, correct, de-duplicate, consolidate, and architect** the entire concept into a coherent product specification for **ViewTube**: a unified YouTube creator operating system spanning research, ideation, planning, production, publishing, analytics, experimentation, monetization, and long-term channel intelligence.

The central design principle should be:

> **Many underlying capabilities, few user-facing master tools.**

The existing material contains dozens of valuable ideas, but many are variations of the same underlying workflow. For example, “Trend Outlier Monitor,” “Virality Outlier Alert,” “Low-Competition Keyword Explorer,” “Semantic Keyword Gap Analyzer,” “Historical Search Volume Estimator,” and “Topic Validation Scorecard” should probably not exist as six unrelated products. They are better treated as specialized widgets or analytical modes inside a larger **Opportunity Intelligence** master tool.

Likewise, “Hook Analyzer,” “Script Stress Tester,” “Retention Predictor,” “Dialogue Quality Assessor,” and “Production Logic Check” can become modes of a single **Script & Retention Studio** rather than five disconnected tools.

The research process should therefore produce six tightly connected deliverables:

| Deliverable | Purpose |
|---|---|
| **Source & Claim Audit** | Establish what in the supplied material is true, outdated, speculative, duplicated, commercially biased, or technically impossible |
| **Feature Canon** | One normalized inventory of every distinct useful capability proposed across both documents |
| **Master Tool Taxonomy** | Consolidate hundreds of individual functions into a manageable set of coherent ViewTube tools |
| **API & Integration Capability Matrix** | Determine exactly what can be read, written, automated, inferred, or only performed manually |
| **System Architecture Blueprint** | Define data, agents, services, storage, orchestration, UX, permissions, costs, and workflows |
| **Product Roadmap** | Separate what belongs in MVP, later releases, experiments, and “future if API becomes available” categories |

The final master document should behave simultaneously as a **product requirements document, technical architecture reference, creator-workflow specification, API feasibility audit, AI-agent design document, and feature backlog**.

## Source audit and verification methodology

The most important work before designing the final tool catalog is a line-by-line **claim audit**. The supplied reports mix official documentation, third-party SaaS marketing pages, blogs, Reddit discussions, technical proposals, algorithm folklore, and hypothetical implementation ideas. These should not receive equal evidentiary weight.

### Source hierarchy

The research should apply the following hierarchy:

| Authority tier | Source type | Intended use |
|---|---|---|
| **Primary** | YouTube/Google developer documentation, YouTube Help, official YouTube Blog, OpenAI documentation, Google Cloud documentation, ElevenLabs documentation, other provider API references | Technical capabilities, product rules, API availability, quotas, supported operations |
| **Strong secondary** | Academic research, established technical publications, reputable analyst firms | UX research, statistical methods, market context |
| **Vendor documentation** | TubeBuddy, VidIQ, OpusClip, OutlierKit, Subscribr, etc. | Competitor capabilities and implementation inspiration |
| **Vendor marketing/blog content** | Product comparison and “best tools” articles | Feature discovery only |
| **Community evidence** | Reddit, YouTube creator discussions, forums | Workflow pain points and qualitative creator behavior |
| **Hypothesis** | Unverified algorithm claims, proposed thresholds, assumed API capabilities | Product experiments, never presented as platform facts |

Every substantive claim in the source documents should receive a status:

**Verified · Verified with constraints · Outdated · Unsupported by public API · Partner/restricted API · Third-party only · Hypothesis · Duplicate · Misleading · Needs empirical validation.**

### Claim-level audit record

The working research database should use a schema similar to:

```text
claim_id
source_document
source_section
original_claim
original_citation
claim_category
current_status
authoritative_source
verified_date
technical_constraints
api_or_product
authentication_required
oauth_scope
read_or_write
quota_or_rate_limit
data_latency
geographic_or_account_restrictions
terms_of_service_risk
recommended_correction
feature_mapping
master_tool_mapping
implementation_priority
notes
```

This turns the final master document into a product specification backed by a traceable evidence layer rather than a collection of attractive ideas.

### High-priority corrections already surfaced

A preliminary review of current first-party documentation shows why this audit is essential.

The YouTube Analytics API is capable of sophisticated targeted queries across metrics and dimensions, but the underlying analytics data can lag by roughly **48–72 hours**. Consequently, proposals in the source material that describe Analytics API-driven systems as genuinely “real-time” alerting systems need to distinguish between near-live Data API/event inputs and delayed Analytics data. citeturn0search5turn1search1

YouTube now provides native **A/B testing for up to three titles and/or thumbnails**, with the winning variant determined using watch-time performance rather than merely CTR. The master document therefore should not assume that manually rotating titles or thumbnails every 24 hours is the preferred testing architecture. Native testing should be treated as the baseline where available, with external experimentation systems used for other variables or deeper analysis. citeturn0search2turn0search6

The public YouTube Data API exposes resources for videos, captions, comments, playlists, thumbnails, channels, live streams and related objects, but the current public resource catalog does **not** expose a Community Posts publishing resource. That makes proposals such as “automatically post Community polls through the YouTube Data API” a high-priority correction candidate; based on the current public API catalog, this appears to require a native/manual workflow or a future API rather than a supported public Data API call. This is an inference from the current official API surface. citeturn0search0turn1search0

Similarly, YouTube exposes analytics for cards and end screens, but the public Data API resource catalog does not present corresponding public write resources for programmatically placing cards or end screens. The existing document's references to changing card/end-screen placement “via the Data API” should therefore be separately investigated and, unless another official endpoint exists, reclassified as unsupported automation rather than a core promise. citeturn1search2turn1search6

The proposed Google Trends integrations also need revision. Google now has an official **Google Trends API**, but as of the current documentation it remains an **alpha with controlled early access**, rather than an unrestricted production dependency available to every ViewTube customer. The architecture should therefore include a provider abstraction and fallback strategy rather than treating Google Trends API access as guaranteed. citeturn1search3

The supplied documents also underestimate the importance of current API quota architecture. YouTube's present quota documentation separates limits for `search.list` and `videos.insert` while maintaining an additional default daily pool for other endpoints. Research-heavy competitor scanning therefore requires a dedicated quota scheduler, cache, deduplication layer, and potentially user-level quota budgeting rather than unconstrained repeated searches. citeturn2search3

Google Cloud Video Intelligence currently documents capabilities including label detection, object tracking, shot change detection, face detection, person detection, text recognition, logo recognition, speech transcription, and explicit-content detection. The source documents should therefore separate those documented capabilities from stronger claims such as generalized “expression recognition” or psychological “hook strength,” which would require additional models and inference layers rather than being direct Video Intelligence outputs. citeturn2search2turn2search6

Finally, AI-provider terminology should be versioned rather than frozen to 2025-era model names. For example, OpenAI's current API documentation supports image generation through both the Image API and the Responses API, including newer GPT Image capabilities alongside DALL·E models. The master architecture should define **capability interfaces** such as `image.generate`, `image.edit`, `reason`, `transcribe`, and `vision.analyze` instead of tightly coupling ViewTube's architecture to a model brand that may later be superseded. citeturn2search0

These are not minor editorial issues; they determine what ViewTube can responsibly promise as an automated product.

## Consolidation model for the ViewTube tool ecosystem

The working hypothesis should be to collapse the existing 50-tool planner plus the broader workstation concepts into roughly **fifteen to twenty master tools**, supported by reusable widgets and platform services.

This is the candidate consolidation map to test during research.

| Proposed ViewTube master tool | Consolidates major ideas from the supplied documents | Principal purpose |
|---|---|---|
| **Creator Command Center** | Mission Control, channel-health widgets, project heatmap, task dashboard, calendar, alerts | Daily operating surface for the entire creator business |
| **Opportunity Intelligence** | Trend monitor, low-competition explorer, keyword gaps, outlier discovery, historical demand, topic validation | Decide what to make next |
| **Niche & Topic Graph** | Brain Maps, semantic clustering, content pillars, niche finder, topical authority | Understand the conceptual structure and whitespace of a niche |
| **Competitive Intelligence Lab** | Outlier monitoring, competitor benchmarking, title/thumbnail patterns, channel comparisons | Reverse-engineer market opportunities without copying |
| **Audience Intelligence Lab** | Comment sentiment, audience questions, psychographics, loyalty analysis, geography, cohort behavior | Understand who watches, why they watch, and what they want |
| **Idea & Brief Studio** | Topic scorecard, AI content brief, ROI validation, project initialization | Convert research into an approved content proposition |
| **Script & Retention Studio** | Three-act structurer, hook analyzer, stress tester, dialogue assessor, production logic, B-roll cues | Design scripts for clarity, narrative momentum, and retention |
| **Visual Pre-Production Studio** | Storyboards, shot lists, character/prop consistency, location planning, B-roll planning | Translate the script into a visual production plan |
| **Production Operations Hub** | Scheduler, budgeting, crew, locations, releases, equipment, batching, buffer manager | Manage physical and organizational production |
| **Asset & Brand Library** | Cloud structure, DAM, visual seeds, brand assets, sponsor files, historical project material | Maintain reusable creator memory and assets |
| **Video Intelligence & QC Lab** | Video analyzer, shot detection, transcript generation, compliance checks, pacing analysis, QC robot | Analyze finished or raw footage computationally |
| **Packaging Lab** | Titles, thumbnails, saliency, competitive preview, title-thumbnail pairing, native testing preparation | Maximize qualified clicks without harming satisfaction |
| **Localization & Voice Studio** | Captions, translation, dubbing, voice generation, audio correction | Scale content across languages and fix audio efficiently |
| **Publishing & Compliance Console** | Upload, metadata, disclosures, captions, scheduling, checklist, policy flags | Safely move approved content onto YouTube |
| **Launch & Distribution Orchestrator** | Cross-posting, social scheduling, teaser plan, launch workflows, notification planning | Coordinate distribution around publication |
| **Performance & Experiment Lab** | Correlation charts, retention maps, experiment analysis, outliers, post-mortems | Explain why content succeeded or failed |
| **Revenue & Partnership Hub** | RPM modeling, sponsor tracker, BrandConnect concepts, affiliate/storefront logic, media kit | Connect creative decisions to business outcomes |
| **Channel Brain / Creator Copilot** | RAG chatbot, agents, historical memory, recommendations, cross-tool reasoning | Natural-language intelligence spanning all other tools |

The final research should explicitly challenge this list. A master tool should survive only when it has a clear **decision job**, not merely because a feature sounds interesting.

### Widget versus tool versus service

A major source of complexity in the existing documents is that three different product concepts are called “tools.”

The final master document should define them separately:

**Master Tool** — a substantial workspace solving a creator problem end-to-end.  
Example: Packaging Lab.

**Widget** — a compact analytical or action surface embeddable in dashboards or master tools.  
Example: Thumbnail CTR Scatter Plot.

**Platform Service** — invisible infrastructure reused by many master tools.  
Example: transcription, embeddings, OAuth token management, scheduler, notifications, vector search.

A fourth category should exist for **Agents**, because an agent is neither a widget nor simply an API:

```text
Master Tool
   ├── Widgets
   ├── Workflows
   ├── Agents
   └── Platform Services
            ├── Provider APIs
            ├── Data Stores
            └── Event Infrastructure
```

That taxonomy will prevent ViewTube from becoming a dashboard containing hundreds of unrelated cards.

## Architecture of the future master document

The final document should be written as a layered reference rather than one long narrative. The recommended document architecture is below.

### Product thesis and creator operating model

Establish ViewTube as a creator operating system rather than another SEO browser extension.

This section should define:

- target creator personas;
- solo creator versus team/agency modes;
- the complete content lifecycle;
- the jobs ViewTube is designed to perform;
- product principles;
- the difference between insight, recommendation, automation, and autonomous execution;
- how ViewTube differentiates from YouTube Studio, VidIQ, TubeBuddy, project-management applications, clipping tools, and generic AI chat systems.

The final positioning question should be:

> **What important creator decision or workflow becomes materially easier, faster, or more reliable because ViewTube exists?**

### Information architecture and workspace system

This section should define the actual application.

Rather than copying the original F-pattern recommendation unquestioningly, research should test which navigation model is most appropriate for dense professional SaaS workflows.

The planned hierarchy should explore:

```text
ViewTube
│
├── Home / Mission Control
├── Research
│   ├── Opportunities
│   ├── Competitors
│   ├── Audience
│   └── Topic Graph
│
├── Projects
│   ├── Brief
│   ├── Script
│   ├── Visual Plan
│   ├── Production
│   ├── Assets
│   ├── Packaging
│   └── Publish
│
├── Analytics
│   ├── Overview
│   ├── Videos
│   ├── Experiments
│   ├── Audience
│   ├── Revenue
│   └── Advanced Lab
│
├── Distribution
├── Partnerships
├── Channel Brain
└── Settings / Integrations
```

Widgets should use progressive disclosure:

```text
Signal
↓
Explanation
↓
Evidence
↓
Recommendation
↓
Action
↓
Observed outcome
```

This is stronger than a dashboard that simply displays more metrics.

### Master-tool specifications

Every surviving master tool should receive exactly the same specification template so the final document is useful to designers and engineers.

A recommended template is:

| Specification field | Required content |
|---|---|
| **Purpose** | One sentence explaining why the tool exists |
| **Creator questions** | What decisions the user is trying to make |
| **Inputs** | Channel data, video data, text, uploads, competitor IDs, etc. |
| **Core widgets** | Individual functions exposed inside the workspace |
| **Derived metrics** | Calculations ViewTube creates |
| **AI capabilities** | Reasoning, generation, classification, forecasting, multimodal analysis |
| **Agents** | Autonomous or semi-autonomous workflows |
| **External APIs** | All providers required |
| **API status** | Public, restricted, partner-only, unofficial, unavailable |
| **Read actions** | Data the tool may retrieve |
| **Write actions** | Changes the tool may perform |
| **Latency** | Live, near-live, hours, 48–72 hours, batch |
| **Quota considerations** | API consumption and caching |
| **Outputs** | Reports, recommendations, assets, metadata, tasks |
| **Automations** | Trigger → workflow → result |
| **User controls** | Human approvals and overrides |
| **Privacy/security** | Sensitive data and scopes |
| **Compute profile** | Cheap / moderate / expensive |
| **Monetization class** | Included / credits / metered / premium |
| **MVP status** | Now / later / experimental |
| **Success metric** | How ViewTube knows the feature creates value |

This creates a master catalog that can become both documentation and an engineering backlog.

### API and capability atlas

The final report should contain a first-class API atlas instead of scattering provider names through prose.

Each integration should be classified using a standard actionability ladder:

| Class | Meaning |
|---|---|
| **Native read** | Official API can retrieve the information |
| **Native write** | Official API can safely execute the action |
| **Native restricted** | Available only to qualified partners/accounts |
| **Native UI only** | YouTube offers it, but public API automation is unavailable |
| **Derived** | ViewTube can compute the information from accessible data |
| **AI inferred** | Model-generated inference rather than platform-provided fact |
| **Third-party API** | Supported through another commercial provider |
| **Unofficial** | Scraping/reverse-engineered method; generally unsuitable for core architecture |
| **Unavailable** | Cannot presently be implemented reliably |
| **Future watchlist** | Valuable feature awaiting API/product changes |

For YouTube specifically, the research should separately map the Data API, Analytics API, Reporting API, Live Streaming functionality, restricted Content ID features, YouTube Studio-native functionality, and emerging native creator features. Google's current documentation confirms that these API families expose materially different categories of data and operations; the final architecture should not treat “the YouTube API” as one homogeneous service. citeturn1search2turn1search5

The atlas should capture exact authentication scopes as well. Analytics access, for example, uses OAuth scopes including `yt-analytics.readonly` and a separate monetary-read scope for revenue information. citeturn1search5

### Intelligence, analytics, and visualization framework

The visualization material in the supplied reports should be rebuilt around **questions**, rather than around chart types.

For every candidate chart, the audit should ask:

> What decision does this visualization enable that YouTube Studio does not already make obvious?

Candidate analytical families should include:

**Reach and packaging intelligence**  
Impressions, qualified click behavior, titles, thumbnail tests, traffic source interactions.

**Retention intelligence**  
Audience retention curves, relative performance, rewatch spikes, segment analysis, hook survival, chapter effects.

YouTube's Analytics documentation exposes audience retention through the `elapsedVideoTimeRatio` dimension and returns a standardized sequence of retention points for video analysis, making this an especially strong foundation for ViewTube-derived retention intelligence. citeturn0search9

**Audience intelligence**  
Geography, device, demographic, subscriber and non-subscriber behavior where permitted.

**Discovery intelligence**  
Search, suggested, browse, Shorts, external traffic and their interactions.

**Business intelligence**  
Revenue, monetized playbacks, CPM-related metrics, sponsor economics, production ROI.

The official Analytics API exposes estimated revenue and advertising metrics in addition to engagement and watch-time data, supporting a more serious economic-analysis layer than basic creator dashboards. citeturn0search1

**Portfolio intelligence**  
Which clusters of videos build subscribers, revenue, authority, repeat viewing, or evergreen traffic.

**Experimental intelligence**  
Native YouTube A/B results plus ViewTube's own observational and causal-analysis tooling.

The master document should distinguish **correlation**, **prediction**, and **causation**. A scatter plot showing CTR versus retention can reveal relationships; it cannot by itself prove that changing one caused the other.

### Agentic architecture and Channel Brain

The “AI chatbot who knows everything about your channel” should become the central intelligence layer rather than a decorative chat widget.

The research should design a Channel Brain with several memory classes:

```text
Channel Brain
│
├── Semantic Memory
│   ├── scripts
│   ├── transcripts
│   ├── research
│   └── strategy documents
│
├── Analytical Memory
│   ├── historical metrics
│   ├── retention curves
│   ├── experiments
│   └── revenue history
│
├── Project Memory
│   ├── briefs
│   ├── tasks
│   ├── assets
│   └── decisions
│
├── Audience Memory
│   ├── comment themes
│   ├── FAQs
│   ├── sentiment
│   └── viewer personas
│
└── Operational Memory
    ├── brand rules
    ├── sponsor requirements
    ├── workflows
    └── creator preferences
```

The research should then define specialized agents such as:

```text
Research Agent
Strategy Agent
Audience Agent
Script Editor Agent
Packaging Agent
Production Planner Agent
Video Analyst Agent
Experiment Analyst Agent
Localization Agent
Publishing QA Agent
Revenue Analyst Agent
Project Manager Agent
```

They should share tools and memory but not independently mutate important channel settings without authorization.

Every agentic action should have one of three execution policies:

**Observe** → agent may research/analyze autonomously.  
**Prepare** → agent may create a proposed action but awaits approval.  
**Execute** → agent may perform explicitly authorized low-risk actions.

This is especially important for title changes, video metadata, publishing, comment replies, sponsor deliverables, financial actions, and account permissions.

The AI-provider layer should be abstracted from specific vendors:

```text
AI Gateway
├── reason()
├── research()
├── classify()
├── embed()
├── transcribe()
├── generate_image()
├── edit_image()
├── synthesize_voice()
├── translate()
├── analyze_video()
└── rerank()
```

Providers can then change without forcing the ViewTube application architecture to change.

ElevenLabs, for example, currently provides API-level text-to-speech with configurable voices and multilingual capabilities, making voice generation a valid provider integration, but ViewTube should still expose it through a generic voice-service interface rather than hard-coding business logic directly to one endpoint. citeturn2search1turn2search5

## Research workstreams and execution sequence

The actual deep-research phase should proceed in a controlled order so that architecture is not designed around false assumptions.

### YouTube platform capability audit

First, construct the definitive YouTube capability matrix.

Investigate:

- Data API resources and write operations;
- Analytics metrics and dimensions;
- valid metric/dimension combinations;
- Reporting API bulk datasets;
- channel versus content-owner differences;
- OAuth requirements;
- data latency;
- quota architecture;
- native Studio-only features;
- A/B testing;
- Hype;
- Ask Studio;
- auto-dubbing;
- likeness detection;
- title/thumbnail experimentation;
- Shorts-specific data;
- livestream data;
- memberships;
- cards/end screens;
- comments and moderation;
- captions;
- publishing and scheduling;
- sponsorship and shopping functionality.

Current official material confirms that Hype has expanded internationally and applies to videos from emerging creators below the stated subscriber ceiling, while creators receive Hype-related information through YouTube Studio. The research should investigate whether any developer-accessible counterpart exists before ViewTube promises automated Hype orchestration. citeturn0search3

### Competitive creator-software audit

Perform a feature-by-feature comparison of:

VidIQ, TubeBuddy, OutlierKit, Subscribr, OpusClip, Descript, Riverside, Canva, Adobe creator tooling, Katalist, Pictory, Runway, SocialPilot, Buffer, Hootsuite, Sprout Social, Creator Hero and adjacent platforms that remain relevant at research time.

Do not simply build a checklist.

For each competitor identify:

```text
Feature
User problem
Strength
Weakness
Data source
API dependence
Lock-in
Pricing model
ViewTube opportunity
Copy / improve / ignore
```

The objective is to discover **workflow gaps**, not to maximize checkbox parity.

### External API feasibility audit

Evaluate candidate providers by category.

**Search and intelligence:** Google Trends, search engines, approved trend providers, competitor-data providers.

**Generative intelligence:** OpenAI and other model providers as appropriate.

**Video analysis:** Google Cloud Video Intelligence and other multimodal providers.

**Voice/audio:** ElevenLabs and alternatives.

**Visual generation:** provider APIs with genuine developer support.

**Stock assets:** Pexels, Shutterstock, Adobe Stock and comparable APIs.

**Storage:** Google Drive, Dropbox, S3-compatible infrastructure.

**Automation:** n8n, Make, Zapier and direct event workflows.

**Commerce:** Shopify and affiliate tooling.

**Signatures/legal operations:** e-signature providers.

**Calendar/project operations:** Google Calendar and other supported PM integrations.

For each, score:

`API maturity × reliability × cost × latency × permissions × data rights × geographic coverage × substitution risk × user value`.

### Creator-workflow and UX research

Audit whether the proposed workstation reflects how serious creators actually work.

The analysis should model multiple archetypes:

- solo educational creator;
- entertainment creator;
- faceless channel operator;
- Shorts-first creator;
- podcast/video creator;
- professional production team;
- creator agency;
- multilingual channel;
- high-volume media business;
- sponsorship-heavy creator.

The goal is to identify a **common operating core** while allowing workspace composition by persona.

The dashboard should not become “everything visible simultaneously.” Widgets should appear according to project state and user role.

For example:

```text
Research stage → opportunity widgets dominate
Script stage → narrative + audience context dominate
Production stage → tasks + assets + shot plan dominate
Pre-publish stage → packaging + QC dominate
Post-launch stage → performance + experiment widgets dominate
```

This **contextual workstation** model should be compared against a permanently customizable dashboard model during product design.

### Data and infrastructure research

Build a production-grade reference architecture, but avoid prematurely adopting Spark, Airflow, or other heavyweight technologies simply because they appeared in the source reports.

The expected architectural shape to evaluate is:

```text
External APIs
      │
      ▼
Integration Gateway
      │
      ├── OAuth / Secrets
      ├── Rate Limits
      ├── Quota Manager
      └── Provider Adapters
      │
      ▼
Event + Job Layer
      │
      ├── Scheduled ingestion
      ├── Webhook/event processing
      ├── AI jobs
      └── Media-processing jobs
      │
      ▼
Data Platform
      ├── Operational DB
      ├── Analytics warehouse
      ├── Object storage
      ├── Vector/search index
      └── Cache
      │
      ▼
Intelligence Layer
      ├── Derived metrics
      ├── Recommendation engine
      ├── Agents
      ├── RAG
      └── Forecasting
      │
      ▼
Application Layer
      ├── Master tools
      ├── Widgets
      ├── Mobile views
      └── Channel Brain
```

The research should determine when PostgreSQL alone is sufficient, when columnar analytics storage becomes justified, and when orchestration infrastructure is actually necessary.

### Economics, governance, and platform-risk audit

Every high-compute capability needs a cost model:

```text
cost per channel per month
cost per 1,000 videos indexed
cost per hour of analyzed video
cost per transcript
cost per deep-research job
cost per generated image
cost per generated voice minute
cost per localization
cost per AI-agent workflow
```

This should feed the pricing architecture.

The supplied hybrid subscription-plus-usage-credit concept is a sensible hypothesis, but it should be validated against actual 2026 API costs and creator willingness to pay rather than accepted from the original report as settled strategy.

Governance research should separately cover:

- OAuth token security;
- least-privilege scopes;
- deletion and retention;
- user data portability;
- channel analytics confidentiality;
- creator voice/face permissions;
- AI disclosures;
- copyrighted input;
- generated media provenance;
- sponsor data;
- team roles;
- approval chains;
- audit logging;
- platform developer policies.

YouTube upload architecture deserves special attention because current Data API documentation notes account/project verification implications for API-uploaded videos, including restrictions affecting uploads from unverified projects. citeturn0search8

## Final master-document production plan

The final research output should be assembled in layers so that it remains readable despite its depth.

The proposed master document is:

### Executive product definition

What ViewTube is, who it serves, and the central design thesis.

### Creator lifecycle model

Research → Validate → Brief → Script → Plan → Produce → Edit → Package → Publish → Launch → Analyze → Learn → Monetize → Reuse.

### Unified feature canon

Every unique capability extracted from both supplied reports, de-duplicated and assigned a stable Feature ID.

Example:

```text
F-RESEARCH-001   Topic trend detection
F-RESEARCH-002   Competitor outlier scoring
F-AUDIENCE-003   Comment-question clustering
F-SCRIPT-004     Hook analysis
F-PACKAGE-005    Thumbnail saliency
F-ANALYTICS-006  Retention anomaly detection
```

### Master tool catalog

The final, consolidated ViewTube master-tool list with full specifications.

### Widget catalog

Reusable widgets independent of where they appear.

Example:

```text
Channel Velocity
Video Outlier Score
Topic Opportunity Score
Retention Curve
Retention Anomaly Markers
Revenue Forecast
Audience Geography
Traffic Source Mix
Thumbnail Test Result
Competitor Outlier Feed
Sentiment Alert
Production Readiness
Sponsor Compliance
Content Buffer
Project Risk
```

### Derived metrics dictionary

Every ViewTube-specific score should receive a formal definition.

Examples:

```text
Opportunity Score
Competition Difficulty
View Multiplier
Hook Survival Score
Packaging Efficiency
Subscriber Conversion Efficiency
Evergreen Index
Revenue Efficiency
Production ROI
Audience Loyalty Score
Topic Authority Score
Content Portfolio Risk
Localization Opportunity Score
```

No opaque “AI score” should be allowed into production without describing inputs, methodology, confidence, and limitations.

### Analytics visualization catalog

For every chart:

```text
Business question
Dimensions
Metrics
Filters
Data source
Transformation
Chart type
Interpretation
Failure modes
Recommended actions
```

### API capability matrix

Every integration and every proposed action, verified.

### Agent architecture

Agents, allowed tools, memory, permissions, human approvals, triggers, outputs, and failure handling.

### Data architecture

Entities, event model, ingestion, caching, analytics storage, project storage, media storage, vector indexing, retention and deletion.

### Workflow automation library

Instead of fifty isolated “code prompts,” convert the original implementation concepts into reusable recipes.

For example:

```text
Workflow:
Idea → Research → Brief

Trigger:
Creator submits topic

Steps:
1. Fetch accessible niche/search evidence
2. Pull competitor videos
3. Calculate outlier features
4. Analyze relevant comments
5. Cluster audience questions
6. Retrieve creator's historical performance
7. Generate opportunity analysis
8. Create content brief
9. Request creator approval

Outputs:
Opportunity score
Evidence packet
Brief
Project record
```

### Implementation recipes and code appendix

The source documents' numerous Python/Node.js prompts should be rewritten into a smaller number of production-quality patterns:

```text
YouTube OAuth client
Analytics query client
YouTube ingestion service
Quota-aware request scheduler
Comment ingestion pipeline
Transcript processing worker
Video Intelligence job
Embedding/indexing pipeline
RAG retrieval service
Agent tool interface
Experiment analysis function
Derived-metric service
Webhook/event processor
Cross-platform provider adapter
```

These should use real endpoint contracts verified during the API audit rather than speculative prompt-generated pseudocode.

### UX specification

Navigation, progressive disclosure, widgets, role-based layouts, mobile surfaces, empty states, loading states, errors, explainability, and approval UI.

### Security and governance model

Permissions, audit logs, AI identity protection, OAuth architecture, data lifecycle, and compliance.

### Economics and pricing model

Infrastructure cost, AI cost, API cost, pricing tiers, credits, usage controls and gross-margin scenarios.

### Product roadmap

The roadmap should use four buckets:

| Bucket | Meaning |
|---|---|
| **Foundation** | Required to make ViewTube useful and trustworthy |
| **Differentiation** | Features competitors generally do not combine effectively |
| **Advanced intelligence** | Predictive and agentic capabilities requiring substantial data |
| **Future/API-dependent** | Excellent ideas currently blocked by unavailable or restricted platform interfaces |

A likely MVP should favor **read-heavy intelligence and creator decision support** before attempting broad autonomous write access.

The first release should therefore probably prioritize the combination:

```text
Creator Command Center
+
Opportunity Intelligence
+
Audience Intelligence
+
Idea & Brief Studio
+
Script & Retention Studio
+
Packaging Lab
+
Performance & Experiment Lab
+
Channel Brain
```

Production logistics, distribution automation, advanced monetization, broad external integrations, autonomous agents, and heavyweight media processing can follow once ViewTube has established the core data model and creator workflow.

The final success criterion for the master document should be straightforward:

> **Every ViewTube feature must be traceable from creator problem → evidence → data/API capability → master tool → widget/workflow → implementation path → measurable user outcome.**

That produces something much more useful than another list of creator features: it produces the canonical architectural and product specification from which ViewTube's UX, backend, AI agents, API integrations, pricing, roadmap, engineering tickets, and future research can all be derived.