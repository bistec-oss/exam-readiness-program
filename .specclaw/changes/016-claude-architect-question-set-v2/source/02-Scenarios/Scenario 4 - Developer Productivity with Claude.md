---
tags: [exam, scenario]
domains: ["Domain 2 - Tool Design and MCP Integration", "Domain 3 - Claude Code Configuration and Workflows", "Domain 1 - Agentic Architecture and Orchestration"]
---

# Scenario 4: Developer Productivity with Claude

Agent SDK agent helping engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate, automate repetitive tasks. Uses built-in tools (Read, Write, Bash, Grep, Glob) + MCP servers.

**Primary domains:** [[Domain 2 - Tool Design and MCP Integration]], [[Domain 3 - Claude Code Configuration and Workflows]], [[Domain 1 - Agentic Architecture and Orchestration]]

## What this scenario tests
- Correct built-in tool for the job: Grep (content) vs Glob (path pattern) vs Read/Write vs Edit (with Read+Write fallback on non-unique match)
- Incremental codebase understanding strategy (Grep entry points → Read to trace imports) vs. reading everything upfront
- Context degradation in long exploration sessions → scratchpad files, subagent delegation, `/compact`
- MCP resources vs. tools distinction (content catalogs to cut exploratory calls)

## Key facts to lock in
- Searching code content → Grep. Finding files by name/extension pattern → Glob.
- Edit fails on non-unique anchor text → fall back to Read + Write.
- Long exploration session giving generic "typical pattern" answers → context degradation; fix with scratchpad files / subagent delegation / `/compact`.
- MCP resources expose a catalog so the agent doesn't need many exploratory tool calls just to see what's available.
