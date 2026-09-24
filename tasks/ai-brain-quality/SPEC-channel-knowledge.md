# Spec — channel-knowledge

## Objective
Evolve Channel Profile into the durable knowledge authority needed by the unified Brain while preserving existing ownership and governed learning infrastructure.

## Knowledge classes
FACT
CREATOR_PREFERENCE
CHANNEL_IDENTITY
CONTENT_PATTERN
AUDIENCE_OBSERVATION
PERFORMANCE_PATTERN
PACKAGING_PATTERN
WORKFLOW_PREFERENCE
HYPOTHESIS
LEARNING_CANDIDATE
VALIDATED_LEARNING
REJECTED_LEARNING
SUPERSEDED_LEARNING

## Required metadata
knowledgeId, channelId, statement/value, class, evidenceRefs, confidence, scope, createdAt, lastConfirmedAt, supportCount, contradictionCount, status, optional supersedes/supersededBy and validity window.

## Promotion rule
No model response may directly create VALIDATED_LEARNING. Promotion requires a learning candidate, traceable evidence/outcomes, contradiction review and the existing governance/approval path.

## Temporal behavior
Creator-declared preferences may be long-lived. Performance/audience/algorithm observations must retain observation windows and decay/review semantics. New evidence can reinforce, narrow, contradict, supersede or retire prior knowledge.

## Retrieval
Consumers request knowledge by task/channel/project/video scope. Retrieval ranks relevance × confidence × freshness × scope match and exposes contradictions rather than silently choosing one statement.

## Boundaries
Always: use Channel Profile as durable owner; preserve evidence references; distinguish creator preference from performance evidence.
Never: create a second knowledge database; promote from one successful video by default; infer private/sensitive viewer attributes; treat historical patterns as timeless rules.

## Success criteria
- Existing Channel Profile facts/preferences can be represented without loss.
- Learning candidates and validated learnings are distinct states.
- Contradictory evidence can reduce confidence or supersede knowledge.
- Retrieval returns provenance and validity information.
- Existing learning governance remains authoritative for promotion.
