# ViewTube Prompt System Authority — 2026-09-24

**Status:** current prompt-system reference and modernization authority.  
**Scope:** text/reasoning prompts, task instructions, Oracle prompt templates, governed creator-asset prompts, legacy Gemini generation prompts, channel/project customization, validation and evaluation.  
**Related:** `tasks/viewtube-finish-program/`, `tasks/ai-brain-quality/`, `UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md`.

## Executive summary

ViewTube currently contains several generations of prompt architecture:

1. **Legacy mega-prompts** in `src/services/prompts.ts` — broad personas/instructions shared by many `gemini.ts` functions.
2. **Legacy inline generator prompts** in `src/services/gemini.ts` — function-specific interpolation and direct provider compatibility behavior.
3. **Oracle/editor prompt templates** in `src/services/oracle/prompts.ts` — structured system/domain/channel/task/output packs.
4. **Brain task instructions** in `BrainTaskProfileRegistry.ts` — compact task classification/instruction logic.
5. **Governed creator-asset strategies** in `AssetGenerator.ts` and `assetStrategies/*` — typed schema + evidence classes + rubric + repair.
6. **In-flight shared Prompt Constitution/family versioning** from the current Brain-quality program — intended to become the shared behavioral layer for all canonical creator reasoning.

The target is **not one enormous master prompt**. The target is a composable, versioned system:

```
Shared Prompt Constitution
  + task/prompt family
  + task-specific Context Resolver recipe
  + Channel Profile / Channel Knowledge
  + Project / ContentBuild context
  + current evidence / research
  + creator request and constraints
  + typed output schema
  + deterministic validators
  + bounded critique/repair when justified
```

## Canonical precedence

When prompt/context instructions conflict, use this order:

1. safety/product/system rules;
2. evidence and epistemic rules;
3. explicit creator instruction for this task;
4. explicit current creator preferences / confirmed Channel Knowledge;
5. current Project/ContentBuild intention and constraints;
6. current measured channel/audience/analytics evidence;
7. accepted/published style patterns;
8. inferred historical patterns;
9. generic family defaults.

A model-inferred preference must never override a creator-confirmed preference. Stale performance learning must never override fresh measured evidence.

## Channel personalization contract

Prompts may customize from:

### Creator / Channel Profile
- declared voice and tone;
- preferred title/description structure;
- formatting conventions;
- CTA preferences;
- workflow preferences;
- prohibited/avoided approaches;
- brand/visual identity;
- explicit goals.

### Channel Knowledge
- validated learnings;
- current performance patterns;
- repeated audience observations;
- packaging/content patterns;
- contradictions;
- expiry/staleness.

### Style Profile
- measurable accepted/published writing patterns;
- creator edits to generated work;
- punctuation/case/emoji tendencies;
- sentence/paragraph structure;
- vocabulary;
- pacing/hook patterns where supported.

### Project / ContentBuild
- subject;
- intent;
- audience;
- script/research;
- existing assets/variants;
- selected/final assets;
- publication target;
- project-specific constraints.

### Evidence / Intelligence
- canonical analytics;
- traffic/retention/audience evidence;
- comparable cohorts;
- Anomaly/Opportunity/Algorithm signals;
- comments/search/transcript evidence;
- current research when required.

The prompt should receive **bounded selected context**, not a raw dump of every profile/data store.

## Explicit prompt-constant inventory

`src/services/prompts.ts` currently exports 49 prompt/instruction/version constants.

### Packaging / SEO
- `SCULPTING_ENGINE_SYSTEM_PROMPT`
- `SEO_OVERHAUL_INSTRUCTIONS`
- `KEYWORD_ANALYSIS_SYSTEM_PROMPT`
- `KEYWORD_LAB_SYSTEM_PROMPT`
- `KEYWORD_LAB_INSTRUCTIONS`
- `TITLE_REWRITE_SYSTEM_PROMPT`
- `TITLE_REWRITE_INSTRUCTIONS`
- `THUMBNAIL_ANALYSIS_SYSTEM_PROMPT`
- `END_SCREEN_CONCEPT_PROMPT`
- `END_SCREEN_CONCEPT_INSTRUCTIONS`

### Hook / script / retention
- `HOOK_GENERATION_SYSTEM_PROMPT`
- `HOOK_GENERATION_INSTRUCTIONS`
- `RETENTION_ANALYSIS_SYSTEM_PROMPT`
- `SCRIPT_ARCHITECT_SYSTEM_PROMPT`
- `SCRIPT_ARCHITECT_INSTRUCTIONS`

### Analytics / Oracle / strategy
- `DATA_ANALYSIS_SYSTEM_PROMPT`
- `CHANNEL_ORACLE_PROMPT_VERSION`
- `DATA_HANDLING_INSTRUCTIONS`
- `STRATEGY_CHAT_SYSTEM_PROMPT`
- `ALGORITHM_DIAGNOSIS_SYSTEM_PROMPT`
- `ALGORITHM_DIAGNOSIS_INSTRUCTIONS`
- `DAILY_COMMAND_SYSTEM_PROMPT`
- `DAILY_COMMAND_INSTRUCTIONS`
- `ORACLE_SYSTEM_PROMPT`
- `ORACLE_INSTRUCTIONS`
- `STRATEGY_CONSULTANT_PROMPT`
- `STRATEGY_INSTRUCTIONS`
- `ORACLE_ANALYSIS_SYSTEM_PROMPT`
- `ORACLE_ANALYSIS_INSTRUCTIONS`
- `ALGORITHM_ARCHITECT_SYSTEM_PROMPT`
- `ALGORITHM_ARCHITECT_INSTRUCTIONS`
- `COMPETITOR_INTELLIGENCE_SYSTEM_PROMPT`

### Community / audience
- `COMMUNITY_POST_REFINEMENT_PROMPT`
- `COMMUNITY_POST_REFINEMENT_INSTRUCTIONS`
- `COMMENT_REPLY_SYSTEM_PROMPT`
- `COMMENT_REPLY_INSTRUCTIONS`
- `ENHANCED_COMMENT_REPLY_PROMPT`
- `ENHANCED_COMMENT_REPLY_INSTRUCTIONS`
- `REPLY_REFINEMENT_PROMPT`
- `REPLY_REFINEMENT_INSTRUCTIONS`
- `COMMUNITY_POST_SCHEDULER_PROMPT`
- `COMMUNITY_POST_SCHEDULER_INSTRUCTIONS`

### Discovery / promotion
- `INTEREST_SEEDING_SYSTEM_PROMPT`
- `INTEREST_SEEDING_INSTRUCTIONS`
- `FUNNEL_TEASER_SYSTEM_PROMPT`
- `VIDEO_RECOMMENDATION_PROMPT`
- `VIDEO_RECOMMENDATION_INSTRUCTIONS`
- `VIDEO_AUTOPSY_PROMPT`
- `VIDEO_AUTOPSY_INSTRUCTIONS`

Several `*_INSTRUCTIONS` constants are aliases rather than independent prompt logic. The registry must explicitly mark aliases so they are not counted as distinct systems.

## Legacy generator inventory

`src/services/gemini.ts` currently exposes these major generation/refinement/analysis functions:

### Creator packaging / metadata
`generateSeoData`, `generateKeywordAnalysis`, `generateThumbnailConcept`, `generateThumbnail`, `generateTagSuggestions`, `analyzeExistingTags`, `generateHook`, `generateEndScreen`, `generateEndScreenConcept`, `generateVideoAutopsy`.

### Script / project / storyboard
`generateIdeaSpark`, `generateProjectStrategy`, `generateStoryboard`, `generateScript`, `generateProjectSuggestions`, `generateTimelinePatch`.

### Strategy / intelligence
`generateActionableTactics`, `generateChatResponse`, `generateStructuredBrainResponse`, `generateStrategyResponse`, `analyzeChannelGoals`, `analyzeChannelData`, `generateAlgorithmDiagnosis`, `generateDailyBrief`, `generateInterestSeeding`, `generateOracleAdvice`, `generateChannelTaskSuggestions`, `generateFunnelTeaser`.

### Community / comments
`generateCommunityPosts`, `generateCommentResponses`, `generatePerfectReply`, `refineCommunityPost`, `generateEnhancedReply`, `refineUserReply`, `generateCommunityPostSchedule`.

### Media / multimodal
`generateSpeech`, `generateVideo`, `analyzeImage`, `generateImage`, `analyzeVideo`, `generateVisualImage`, `generateVisualVideo`, `analyzeMediaContent`, `generateEndScreenImage`.

### Other structured/provider helpers
`generateEducationalTimestampQuestions`, `generateJournalFollowUps`, `generateInfiniteMicroPolls`, `generateBrainJsonObject`, `generateSchemaJsonObject`.

Not every export is necessarily production-reachable. Migration/deletion requires reachability proof.

## Oracle prompt system

`src/services/oracle/prompts.ts` contains seven versioned templates:

- `oracle-hook-v1`
- `oracle-story-v1`
- `oracle-visual-v1`
- `oracle-caption-v1`
- `oracle-audio-v1`
- `oracle-retention-v1`
- `oracle-render-opt-v1`

This system already demonstrates several target design principles:
- separate system/domain/channel/task/output packs;
- creator constraints;
- channel voice DNA;
- structured outputs;
- safe patch semantics.

Its main modernization need is to consume the same canonical Channel Knowledge/Context Resolver/provenance rules as BrainRuntime rather than remain a parallel prompt island.

## Brain task-profile prompt system

`BrainTaskProfileRegistry.ts` currently resolves task families such as:
- creator asset draft;
- Daily Oracle;
- first-week plan;
- best-video autopsy;
- channel revival;
- strategy;
- analytics;
- SEO/packaging;
- audience;
- revenue;
- publishing;
- content analysis;
- journal;
- goal coaching.

These compact instructions are closer to the desired architecture than mega-prompts, but they need versioned prompt-family ownership and a canonical context recipe.

## Governed AssetGenerator prompts

Current first-class strategy implementations include:
- multi-post Community Post Plan — `community-post-v1`;
- single Community Post — `community-single-post-v1`.

Each strategy defines:
- asset type;
- prompt version;
- evidence classes;
- typed response schema;
- task instruction builder;
- style-gradeable text;
- deterministic rubric.

This is the preferred migration shape for future creator assets.

## Known legacy prompt problems

The existing legacy prompt library contains several patterns that must not survive modernization as defaults:

- missing CSV values described as zero;
- `Views = Impressions × CTR` presented as a general validation identity;
- invented search-volume / CPC / competition / demographic estimates;
- deterministic-looking “Algorithmic Health Score” formulas without a canonical metric contract;
- exact predictive future views/days and expected impact percentages without calibrated forecasting;
- generic niche “CTR power word” claims;
- pseudo-precise competitor scores;
- prompts that imply one traffic/retention diagnosis has one guaranteed cause;
- “dominate,” “algorithm hack,” deception/manipulation-oriented language;
- persona inflation such as unverified “10+ years” / “100M+ views” credentials;
- giant prompts that mix calculation, evidence selection, strategy, generation and validation in one model call.

These prompts may remain temporarily for compatibility, but they should be marked **legacy / migration required** rather than treated as quality authority.

## Target prompt-family taxonomy

1. **Constitution** — universal grounding, uncertainty, privacy, controls and claim rules.
2. **Analytics** — interpret deterministic metrics/comparability; no invented calculations.
3. **Audience** — aggregate audience behavior/language only; no sensitive inference.
4. **Strategy** — evidence-backed priorities and alternatives.
5. **Packaging** — topic/promise/discovery surface/title/thumbnail/hook as one package.
6. **Content** — scripts/outlines/storyboards/captions.
7. **Community** — posts/comments/replies.
8. **Publishing** — checklist/routing/launch assets; no performance promises.
9. **Revenue** — measured revenue evidence vs explicit estimates.
10. **Editor/Oracle** — bounded typed edit suggestions/patches.
11. **Research** — sourced external/current facts with freshness/provenance.

## Prompt provenance requirement

Every consequential generation should expose:

- prompt family;
- prompt family version;
- Prompt Constitution version;
- Context Resolver version;
- output schema version;
- requested model;
- served model;
- evidence snapshot IDs;
- Channel Knowledge/Profile version/fingerprint;
- Project/ContentBuild revision;
- style profile version where used;
- creator constraints;
- repair count;
- final stable output/asset ID.

## Customization rules

Default prompts should be strong before personalization. Personalization should improve fit, not rescue a weak generic prompt.

The default layer must:
- understand the creator job;
- state exact output contract;
- define evidence limits;
- specify missing-data behavior;
- define deterministic constraints;
- name the primary evaluation rubric.

The personalized layer then adds:
- creator wording/style;
- channel identity;
- current project;
- validated channel learning;
- relevant evidence;
- accepted/published exemplars.

Do not paste the full Channel Profile into every prompt.

## Prompt editing governance

A prompt change is a product behavior change.

Every material change requires:
- prompt family/version bump;
- rationale;
- fixture coverage;
- comparison to current baseline;
- examples of improved and regressed outputs;
- no new fabricated-metric behavior;
- traceability of which outputs used the new version.

No silent in-place rewrite of an important prompt version.
