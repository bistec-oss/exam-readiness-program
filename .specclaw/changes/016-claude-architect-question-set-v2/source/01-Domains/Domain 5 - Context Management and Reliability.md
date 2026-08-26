---
tags: [exam, domain, context-management, reliability]
weight: 15%
---

# Domain 5: Context Management & Reliability (15%)

Lowest single weight, but combines with Domain 1 for **42%** of the exam, and the "context as budget" framing shows up as a recurring lens across *other* domains' questions too — don't under-study it just because it's the smallest number.

## Task 5.1 — Preserving context across long interactions
- Progressive summarization risk: numbers, percentages, dates, customer-stated expectations get quietly flattened into vague text.
- "Lost in the middle": models are reliable at the start/end of long inputs, unreliable in the middle.
- Tool results accumulate disproportionately (e.g., 40+ fields returned when only 5 matter) — eats context budget for no value.
- Fix pattern: pull hard transactional facts (amounts, dates, order #s, statuses) into a **persistent "case facts" block** that rides outside/alongside the summarized history.
- Trim verbose tool outputs to only the relevant fields **before** they accumulate.
- Put key findings summaries at the **start** of aggregated inputs; use explicit section headers.
- Require subagents to include metadata (dates, source, methodology) in structured output for accurate downstream synthesis.
- Prefer upstream agents returning structured facts/citations/relevance-scores over verbose prose+reasoning when the downstream agent has a tight context budget.

## Task 5.2 — Escalation & ambiguity resolution
- Legit escalation triggers: explicit customer request for a human, a genuine **policy gap/exception** (not just "this is complex"), inability to make progress.
- Honor an explicit "I want a human" request **immediately** — don't insist on investigating first.
- If the issue is straightforward, acknowledge frustration but offer resolution; escalate only if they reiterate.
- Sentiment analysis and self-reported LLM confidence are **unreliable proxies** for complexity — recurring wrong-answer bait.
- Multiple ambiguous customer matches → ask for **more identifiers**, don't guess with a heuristic.

## Task 5.3 — Error propagation in multi-agent systems
- Structured error context (failure type, what was attempted, partial results, alternatives) enables the coordinator to make a real recovery decision.
- Access failure (timeout, needs a retry decision) ≠ valid empty result (successful query, genuinely no matches) — keep these distinguishable in the response.
- Generic status strings hide context the coordinator needs.
- Anti-patterns: silently marking failure as success; killing the whole workflow over one subagent's failure.

## Task 5.4 — Context management in large codebase exploration
- Extended sessions degrade: model starts giving generic "typical pattern" answers instead of referencing the specific classes it found earlier.
- Scratchpad files persist key findings across context boundaries.
- Delegate verbose exploration to subagents; main/coordinator agent keeps high-level understanding.
- Crash recovery: each agent exports state to a known location (a manifest); coordinator loads the manifest on resume and re-injects into prompts.
- `/compact` reduces context usage mid-session when it's filled with verbose discovery output.

## Task 5.5 — Human review workflows & confidence calibration
- Aggregate accuracy (e.g., "97% overall") can hide bad performance on a specific doc type or field — always check segment-level accuracy before trusting an aggregate.
- Stratified random sampling of *high-confidence* extractions to catch novel error patterns you wouldn't otherwise see.
- Field-level confidence scores, calibrated against a labeled validation set, to route review attention.
- Validate accuracy **by document type and field** before reducing human review on any segment.

## Task 5.6 — Provenance & uncertainty in multi-source synthesis
- Source attribution gets lost when findings are compressed during summarization — preserve structured claim→source mappings end-to-end.
- Conflicting stats from credible sources → **annotate the conflict with both sources**, don't silently pick one.
- Require publication/collection dates in structured outputs so a *temporal* difference isn't misread as a *contradiction*.
- Report structure: separate well-established findings from contested ones explicitly.
- Render content in its natural form in synthesis (financial data as tables, news as prose, technical findings as lists) — don't force everything into one uniform format.

## High-yield exam instincts for this domain
1. "Confidence score" and "sentiment" as escalation/routing signals = near-automatic wrong answer.
2. Conflicting source data → annotate + preserve both, never silently choose one.
3. Aggregate accuracy metric alone is a trap — the "right" answer usually wants segment-level validation first.
4. Explicit customer request for a human = escalate now, no investigation gate.
