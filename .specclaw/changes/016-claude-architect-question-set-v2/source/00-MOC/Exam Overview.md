---
tags: [exam, moc, claude-architect]
exam_date_target: "2026-08-31"
today: "2026-08-26"
---

# Claude Certified Architect – Foundations (CCA-F / CCAR-F) — Master Note

> Exam in **5 days**. Study window: **2 focused days**, then light review + 2 timed mocks before test day.

## Quick Facts

| Item | Value |
|---|---|
| Format | 60 questions, scenario-based, multiple choice (1 correct + 3 distractors) |
| Time | 120 minutes (~2 min/question) |
| Passing score | 720 / 1000 (scaled score, not raw %) |
| Scenarios | 4 of 6 possible scenarios shown, picked at random |
| Proctoring | Online-proctored (ProctorFree via Skilljar/Anthropic Academy) — **closed book**: no Claude, no docs, no external tools |
| Cost | Reported as $99–$125 (varies by source/date); first 5,000 Claude Partner Network employees get it waived/discounted — **verify current price at registration** |
| Validity | Reported as 6–12 months depending on source — **verify at registration**, don't assume permanent |
| Access | Must belong to an org in the Claude Partner Network (claude.com/partners) |
| Scoring | Unanswered = incorrect. No penalty for guessing → **always answer, never leave blank** |
| Retakes | Not consistently documented publicly — check official policy PDF at registration |

## The 5 Domains (weighting = where your study hours should go)

| # | Domain | Weight | Note |
|---|---|---|---|
| 1 | [[Domain 1 - Agentic Architecture and Orchestration]] | **27%** | Heaviest domain. Agentic loop, coordinator/subagent patterns, hooks, task decomposition, sessions |
| 2 | [[Domain 2 - Tool Design and MCP Integration]] | 18% | Tool descriptions, structured errors, tool distribution, MCP config, built-in tools |
| 3 | [[Domain 3 - Claude Code Configuration and Workflows]] | 20% | CLAUDE.md hierarchy, slash commands/skills, path rules, plan mode, CI/CD |
| 4 | [[Domain 4 - Prompt Engineering and Structured Output]] | 20% | Explicit criteria, few-shot, tool_use/JSON schema, validation-retry, batch API, multi-pass review |
| 5 | [[Domain 5 - Context Management and Reliability]] | 15% | Context budget, escalation, error propagation, large codebase context, human review, provenance |

**Domains 1 + 5 = 42% of the exam** — multiple community sources flag this as the combined center of gravity (orchestration + reliability judgment), even though Domain 1 alone is the single biggest line item.

## The 6 Exam Scenarios (4 of these appear, randomly)

1. [[Scenario 1 - Customer Support Resolution Agent]]
2. [[Scenario 2 - Code Generation with Claude Code]]
3. [[Scenario 3 - Multi-Agent Research System]]
4. [[Scenario 4 - Developer Productivity with Claude]]
5. [[Scenario 5 - Claude Code for CI-CD]]
6. [[Scenario 6 - Structured Data Extraction]]

## Core Mental Model (the exam's "correct answer" instinct)

Nearly every community write-up converges on the same underlying test-taking heuristic:

> **The exam always rewards the answer that gives PRODUCTION-GRADE, DETERMINISTIC guarantees over the answer that merely sounds reasonable or relies on the model "trying hard."**

Concretely:
- Prompt instructions ("please always verify identity first") = **probabilistic**, non-zero failure rate → wrong answer when money/compliance is at stake.
- Hooks, programmatic prerequisites, tool_choice forcing, JSON-schema tool_use = **deterministic** → usually the right answer when the scenario has financial/compliance/safety stakes.
- Self-reported LLM confidence and sentiment analysis = **unreliable proxies**, almost always a trap distractor for escalation-routing questions.
- "Give the agent more tools / bigger context / a bigger model" = **almost always the wrong fix** when the real problem is a design/description/decomposition problem.
- The "first, lowest-effort, root-cause fix" beats "add more infrastructure" when both are offered.

See [[Anti-Patterns Cheatsheet]] for the full trap list distilled from the official guide + community sources.

## Navigation

- [[Anti-Patterns Cheatsheet]]
- [[Sample Questions - Official]]
- [[Community Pass Reports]]
- [[Sources]]
- [[2-Day Study Plan]]
- [[5-Day Countdown Schedule]]
