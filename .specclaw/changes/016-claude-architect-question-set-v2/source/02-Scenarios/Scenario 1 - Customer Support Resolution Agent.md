---
tags: [exam, scenario]
domains: ["Domain 1 - Agentic Architecture and Orchestration", "Domain 2 - Tool Design and MCP Integration", "Domain 5 - Context Management and Reliability"]
---

# Scenario 1: Customer Support Resolution Agent

Claude Agent SDK agent handling high-ambiguity requests (returns, billing disputes, account issues) via custom MCP tools: `get_customer`, `lookup_order`, `process_refund`, `escalate_to_human`. Target: 80%+ first-contact resolution while knowing when to escalate.

**Primary domains:** [[Domain 1 - Agentic Architecture and Orchestration]], [[Domain 2 - Tool Design and MCP Integration]], [[Domain 5 - Context Management and Reliability]]

## What this scenario tests
- Programmatic prerequisite gating (verify identity before refund) — see official Q1
- Tool description quality to prevent `get_customer` vs `lookup_order` misrouting — see official Q2
- Escalation calibration (too much escalation on easy cases, too little on hard ones) — see official Q3
- Multi-concern request decomposition
- Structured handoff summaries to humans
- Case-facts persistence across a long support conversation

## Key facts to lock in
- Block `process_refund`/`lookup_order` until `get_customer` returns a **verified customer ID** → programmatic prerequisite, not a prompt instruction.
- Ambiguous tool names/descriptions → fix descriptions first (inputs, examples, edge cases, boundaries).
- Escalation miscalibration → explicit criteria + few-shot examples in system prompt, not confidence scores or sentiment analysis.
- Multiple customer matches → ask for more identifying info, don't guess.
- Escalation packet to a human needs: customer ID, root cause, refund amount/details, recommended action (human has no transcript access).

See [[Sample Questions - Official]] for the three official questions built on this scenario.
