---
tags: [exam, scenario]
domains: ["Domain 1 - Agentic Architecture and Orchestration", "Domain 2 - Tool Design and MCP Integration", "Domain 5 - Context Management and Reliability"]
---

# Scenario 3: Multi-Agent Research System

Coordinator delegates to: web-search subagent, document-analysis subagent, synthesis subagent, report-generation subagent. Produces comprehensive, cited reports.

**Primary domains:** [[Domain 1 - Agentic Architecture and Orchestration]], [[Domain 2 - Tool Design and MCP Integration]], [[Domain 5 - Context Management and Reliability]]

## What this scenario tests
- Diagnosing whether a coverage gap is a coordinator-decomposition problem vs. a subagent-execution problem — see official Q7 (classic trap: subagents all "succeeded" but coordinator scoped them too narrowly)
- Error propagation format on subagent timeout — see official Q8
- Giving the synthesis agent a narrow `verify_fact` tool for the 85% common case vs. full round-trips through the coordinator — see official Q9
- Provenance/claim-source mapping preservation through synthesis
- Conflicting-source handling (annotate, don't pick one)

## Key facts to lock in
- If subagents ran fine but coverage is missing whole subtopics → look at the **coordinator's decomposition**, not the subagents.
- Subagent timeout → return structured error context (failure type, attempted query, partial results, alternatives) to the coordinator.
- High-frequency simple need (fact verification) → scoped tool on the subagent itself; complex/rare need → keep routing through coordinator.
- Conflicting statistics from two credible sources → preserve both with attribution, annotate the conflict.
