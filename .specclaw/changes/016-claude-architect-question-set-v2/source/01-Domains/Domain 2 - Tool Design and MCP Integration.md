---
tags: [exam, domain, tool-design, mcp]
weight: 18%
---

# Domain 2: Tool Design & MCP Integration (18%)

## Task 2.1 — Tool interface design
- Tool **descriptions** are the primary signal the LLM uses for tool selection. Minimal descriptions → unreliable selection among similar tools.
- Include: input formats, example queries, edge cases, boundary explanations vs. similar tools.
- Ambiguous/overlapping descriptions (e.g., `analyze_content` vs `analyze_document`) → misrouting.
- System prompt wording can create unintended keyword-based tool associations — audit for this.
- Fixes: rename + rewrite descriptions to remove overlap; split an overly generic tool into purpose-specific tools with clear I/O contracts.

## Task 2.2 — Structured error responses (MCP)
- MCP `isError` flag communicates tool failure back to the agent.
- Categorize: **transient** (timeout/unavailable), **validation** (bad input), **business** (policy violation), **permission**.
- Uniform "Operation failed" responses prevent the agent from choosing an appropriate recovery.
- Return: `errorCategory`, `isRetryable` boolean, human-readable description; `retriable: false` + customer-friendly text for business-rule violations.
- Local recovery within subagents for transient errors; propagate only unresolved errors + partial results + what was attempted.
- Distinguish **access failure** (needs a retry decision) from **valid empty result** (successful query, no matches).

## Task 2.3 — Tool distribution & tool_choice
- Too many tools per agent (e.g., 18 vs 4-5) degrades selection reliability.
- Agents given tools outside their specialization tend to misuse them (e.g., synthesis agent doing web search).
- Scoped access: each agent gets only its role's tools + narrow cross-role tools for high-frequency needs.
- `tool_choice`: `"auto"` (may return text instead), `"any"` (must call *a* tool, model picks), forced `{"type":"tool","name":"..."}` (must call this specific tool).
- Force a specific tool to guarantee ordering (e.g., force `extract_metadata` before enrichment steps, in a follow-up turn).
- `tool_choice: "any"` guarantees a tool call instead of conversational text.

## Task 2.4 — MCP server integration
- Scoping: **project-level** `.mcp.json` (shared team tooling, version-controlled) vs **user-level** `~/.claude.json` (personal/experimental).
- Env var expansion in `.mcp.json` (e.g., `${GITHUB_TOKEN}`) keeps secrets out of version control.
- All configured MCP servers' tools are discovered at connection time and available simultaneously.
- **MCP resources** expose content catalogs (issue summaries, doc hierarchies, DB schemas) to cut down exploratory tool calls.
- Enhance MCP tool descriptions so the agent doesn't default to a weaker built-in tool (e.g., Grep) over a more capable MCP tool.
- Prefer existing community MCP servers for standard integrations (e.g., Jira); build custom servers only for team-specific workflows.

## Task 2.5 — Built-in tools (Read, Write, Edit, Bash, Grep, Glob)
- **Grep**: content search (function names, error strings, imports).
- **Glob**: file *path pattern* matching (e.g., `**/*.test.tsx`).
- **Read/Write**: full file ops; **Edit**: targeted change via unique text match.
- When Edit fails on non-unique anchor text → fall back to Read + Write.
- Build codebase understanding incrementally: Grep for entry points → Read to follow imports → trace flow (don't read everything upfront).
- Trace a function's usage across wrapper modules: first find all exported names, then Grep each name codebase-wide.

## High-yield exam instincts for this domain
1. Minimal/overlapping tool descriptions causing misrouting → fix the **descriptions first**, not few-shot examples, not a routing layer.
2. Structured error metadata > generic error strings, every time.
3. Narrow, role-scoped tool sets beat "give the agent everything."
4. `.mcp.json` = shared/team; `~/.claude.json` = personal — this exact distinction shows up as a direct question.
