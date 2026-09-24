# Capability Map — ViewTube Brain Quality & Learning

Date: 2026-09-24

## Objective
Improve prompt quality, evidence grounding, channel knowledge, outcome evaluation and governed learning without creating parallel Brain, analytics, profile, project, Vault, generation or outcome owners.

| Module id | Responsibility | Depends on |
|---|---|---|
| evidence-contract | Shared epistemic/provenance vocabulary over existing canonical evidence | analytics-canon, existing evidence producers |
| channel-knowledge | Typed durable knowledge and learning states within Channel Profile ownership | evidence-contract |
| context-resolution | Task-specific evidence/knowledge retrieval and budgeting | evidence-contract, channel-knowledge |
| prompt-system | Versioned composable prompt families and schemas | context-resolution |
| ai-quality-loop | Strategy/generation/critique/validation/revision policy | prompt-system |
| outcome-evaluation | Trace recommendations/generations to measured outcomes | evidence-contract |
| learning-governance | Candidate → contradiction → review → promotion/supersession | outcome-evaluation, channel-knowledge |
| assistant-continuity | Shared channel/project/tool continuity through BrainRuntime | all above |

Build order: evidence-contract → channel-knowledge → context-resolution → prompt-system → ai-quality-loop → outcome-evaluation → learning-governance → assistant-continuity.

## Non-negotiable ownership
- BrainRuntime remains orchestration/reasoning owner.
- analytics-canon remains normalized analytics owner.
- Channel Profile remains durable channel-knowledge owner.
- Projects/ContentBuild remain project/work identity owner.
- Vault remains durable artifact owner.
- Generation Store remains generation provenance owner.
- Outcome/Evaluation remains measured-result owner.
- Learning governance may promote into Channel Profile; models may not write durable learning directly.
