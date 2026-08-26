---
tags: [exam, cheatsheet, anti-patterns]
---

# Anti-Patterns Cheatsheet (memorize this page)

Compiled from the official exam guide's "Skills in / Knowledge of" sections plus the 7 anti-patterns FlashGenius's write-up called out. These are the wrong-answer patterns the exam distractors keep reusing.

## 1. Agentic loop
- ❌ Parsing natural-language text to decide when to stop looping
- ❌ Using an arbitrary iteration cap as the *primary* stop mechanism
- ❌ Checking "assistant produced text" as a completion signal
- ✅ Check `stop_reason`: continue on `tool_use`, stop on `end_turn`

## 2. Enforcement of business rules
- ❌ Prompt instructions alone for anything with financial/compliance/safety consequences
- ✅ Programmatic prerequisites / hooks that **block** downstream tool calls until a condition is met (e.g., block `process_refund` until `get_customer` returns a verified ID)

## 3. Tool selection failures
- ❌ "Add few-shot examples" as the *first* fix when the real problem is a bad/minimal tool description
- ❌ Building a custom keyword-routing layer to pre-select tools (over-engineered)
- ❌ Merging tools into one mega-tool as a "quick fix" (usually a valid *later* option, not the first step)
- ✅ First fix minimal/overlapping tool descriptions → expand with input formats, examples, edge cases, boundaries vs. similar tools

## 4. Too many tools on one agent
- ❌ Giving every subagent every tool "just in case"
- ✅ Scope each agent to only the tools its role needs (~4-5, not 18); give narrow high-frequency cross-role tools (e.g., a `verify_fact` tool) instead of full access

## 5. Escalation / routing decisions
- ❌ Self-reported LLM confidence score as an escalation trigger (poorly calibrated on exactly the hard cases)
- ❌ Sentiment analysis as an escalation trigger (doesn't correlate with case complexity)
- ❌ A separate ML classifier as a "first" fix (over-engineered before you've tried explicit criteria)
- ✅ Explicit escalation criteria + few-shot examples in the system prompt; honor explicit customer requests for a human immediately; ask for more identifiers on ambiguous matches rather than guessing

## 6. Error handling / propagation
- ❌ Generic "operation failed" / "search unavailable" messages
- ❌ Silently swallowing an error and returning an empty result marked "success"
- ❌ Killing the entire multi-agent workflow on one subagent's failure
- ✅ Structured error metadata: `errorCategory` (transient/validation/permission/business), `isRetryable`, human-readable description; local recovery in the subagent first, escalate only unresolved errors with partial results + what was tried

## 7. Context management
- ❌ Progressive summarization that quietly drops numbers, dates, percentages, customer commitments
- ❌ Assuming a bigger context window fixes "lost in the middle" — it doesn't fix attention quality
- ✅ Pull hard facts into a persistent "case facts" block outside the summarized history; trim verbose tool outputs to only relevant fields; put key findings at the start of long aggregated inputs

## 8. Structured output
- ❌ Free-text JSON in the prompt ("please respond in this JSON format") as the *reliable* mechanism
- ✅ `tool_use` + JSON schema is the reliable mechanism — eliminates syntax errors (not semantic errors)
- ❌ Required fields for information that may not exist in the source (causes fabrication) 
- ✅ Nullable/optional fields + `enum` with an `"other"` + detail-string escape hatch

## 9. Retry logic
- ❌ Retrying when the information is simply **absent from the source document** (retry can't fix missing data)
- ✅ Retry-with-error-feedback works for **format/structural** validation failures, not semantic absence

## 10. Batch API
- ❌ Using Message Batches API for a **blocking** workflow (pre-merge checks, anything a human is waiting on)
- ✅ Batch API for latency-tolerant, non-blocking work (overnight reports, weekly audits) — 50% cheaper, up to 24h window, no multi-turn tool calling inside a single batched request, correlate via `custom_id`

## 11. Multi-agent task decomposition
- ❌ Blaming a downstream subagent when logs show the **coordinator's decomposition** was too narrow (classic root-cause trap — read the coordinator's logs first)
- ✅ Coordinator dynamically selects which subagents to invoke; partitions scope to avoid duplication; iteratively re-delegates when synthesis reveals coverage gaps

## 12. Session / context handoff between subagents
- ❌ Assuming subagents automatically inherit the coordinator's conversation history — **they don't**
- ✅ Explicitly pass complete findings into each subagent's prompt; separate content from metadata (source/URL/date) to preserve attribution

## 13. Review architecture
- ❌ Self-review by the same session/context that generated the code (it won't second-guess its own reasoning)
- ❌ Bigger model / bigger context window as the fix for inconsistent multi-file review quality
- ✅ Independent second review instance without the generator's reasoning context; split large reviews into per-file passes + a separate cross-file integration pass

## 14. Claude Code configuration
- ❌ Team-wide conventions placed in `~/.claude/CLAUDE.md` (user-level, NOT shared via git)
- ✅ Team-wide → project-level `CLAUDE.md` or `.claude/commands/` (version-controlled)
- ✅ Conventions that follow a **file pattern** across many directories (e.g., all `*.test.tsx`) → `.claude/rules/` with YAML frontmatter globs, not per-directory CLAUDE.md files
- ✅ Skills for **on-demand** task-specific workflows; CLAUDE.md for **always-loaded** universal standards; `context: fork` to keep verbose skill output out of the main conversation

## 15. Plan mode vs direct execution
- ✅ Plan mode → architecturally ambiguous, multi-file, multiple valid approaches
- ✅ Direct execution → single-file, well-scoped, clear stack trace/spec
- ❌ "Start direct, switch to plan mode only if it gets complicated" when the complexity is already known upfront

## 16. CI/CD
- ✅ `-p` / `--print` flag for non-interactive runs (a hanging pipeline waiting on stdin is *always* a missing `-p` flag question)
- ✅ `--output-format json` + `--json-schema` for machine-parseable CI output
- ❌ Reviewing a PR with the **same session** that wrote the code

## The meta-pattern
When two options both "could work," the exam wants the one that:
1. Gives a **deterministic guarantee** over a probabilistic one (when stakes are high)
2. Fixes the **root cause** with the **least infrastructure**, not the most
3. Matches the **narrowest scope** needed (tool access, decomposition, context) rather than the broadest
4. Preserves **information** (attribution, dates, partial results, coverage gaps) rather than compressing it away
