---
tags: [exam, domain, agentic-architecture]
weight: 27%
---

# Domain 1: Agentic Architecture & Orchestration (27%)

Heaviest-weighted domain. Combined with [[Domain 5 - Context Management and Reliability]] = 42% of the exam.

## Task 1.1 — Agentic loop lifecycle
- Loop: send request → inspect `stop_reason` → if `tool_use`, execute tool(s), append results to conversation, loop again → if `end_turn`, stop.
- Tool results get appended to conversation history so the model reasons over them next iteration.
- Model-driven decisions (Claude decides next tool) vs. pre-configured decision trees.
- **Anti-patterns**: parsing NL text for stop signals, arbitrary iteration caps as primary stop mechanism, checking for assistant text as "done."

## Task 1.2 — Coordinator–subagent orchestration
- Hub-and-spoke: coordinator owns all inter-subagent communication, error handling, routing.
- Subagents have **isolated context** — no automatic inheritance of coordinator history.
- Coordinator dynamically decides which subagents to invoke (not always the full pipeline).
- Risk: narrow decomposition → incomplete topic coverage (classic exam trap — see [[Sample Questions - Official]] Q7).
- Iterative refinement: coordinator evaluates synthesis for gaps → re-delegates targeted queries → re-invokes synthesis.

## Task 1.3 — Subagent invocation, context passing, spawning
- `Task` tool spawns subagents; coordinator's `allowedTools` **must include "Task."**
- Context must be explicitly included in the subagent prompt — pass complete prior findings directly.
- Use structured formats to separate **content from metadata** (source URL, doc name, page) to preserve attribution across handoffs.
- `AgentDefinition`: description, system prompt, tool restrictions per subagent type.
- `fork_session`: branch from a shared analysis baseline to explore divergent approaches.
- Parallel subagents = multiple `Task` calls **in a single coordinator response**, not spread across turns.
- Coordinator prompts should specify **goals and quality criteria**, not step-by-step procedures — preserves subagent adaptability.

## Task 1.4 — Multi-step workflow enforcement & handoff
- Programmatic enforcement (hooks, prerequisite gates) vs. prompt-based guidance — use programmatic when deterministic compliance is required (e.g., identity verification before financial ops).
- Structured handoff summaries for human escalation: customer details, root cause, recommended action (the human doesn't have the transcript).
- Multi-concern requests: decompose into distinct items, investigate each in parallel with shared context, synthesize a unified response.

## Task 1.5 — Agent SDK hooks
- `PostToolUse` hook: intercept + transform/normalize tool results before the model sees them (e.g., normalize timestamps: Unix vs ISO 8601 vs status codes).
- Tool-call interception hooks: block policy-violating calls (e.g., refund > $500) and redirect to escalation.
- Hooks = deterministic guarantee; prompt instructions = probabilistic compliance. Choose hooks when business rules require guarantees.

## Task 1.6 — Task decomposition strategy
- **Prompt chaining** (fixed sequential steps) for predictable, multi-aspect reviews (e.g., per-file pass → cross-file integration pass).
- **Dynamic/adaptive decomposition** for open-ended investigation (generate subtasks based on what's discovered).
- Splitting large reviews avoids "attention dilution" across many files in one pass.

## Task 1.7 — Session state, resumption, forking
- `--resume <session-name>`: continue a specific named prior conversation.
- `fork_session`: independent branches from a shared baseline for divergent approaches.
- When resuming after code changes, **explicitly tell the agent what files changed** — don't assume it knows.
- Starting a **new session with a structured summary** is more reliable than resuming a session full of stale tool results.

## High-yield exam instincts for this domain
1. If logs show subagents executed correctly but *coverage* is wrong → suspect the **coordinator's decomposition**, not the subagents.
2. If a business rule *must* hold (refund threshold, identity check) → answer is a **hook/programmatic gate**, not a prompt tweak.
3. "Give the synthesis agent a narrow scoped tool for the 85% common case, keep coordinator routing for the 15% complex case" beats both "give it everything" and "give it nothing."
4. Parallel Task calls in one response > sequential turns, when tasks are independent.
