---
tags: [exam, practice, official]
---

# Official Sample Questions (from the Anthropic Exam Guide)

12 official sample questions with explanations, straight from the exam guide PDF. Use these to calibrate the exam's difficulty and "correct answer" style — don't just memorize the answers, extract the **reasoning pattern**.

## Scenario: Customer Support Resolution Agent

**Q1.** Production data shows 12% of cases skip `get_customer` and call `lookup_order` on name alone → misidentified accounts, wrong refunds. Best fix?
- A) Programmatic prerequisite blocking `lookup_order`/`process_refund` until `get_customer` returns a verified ID ✅
- B) Enhance system prompt to say verification is mandatory
- C) Few-shot examples showing agent always calling get_customer first
- D) Routing classifier that enables only the tool subset appropriate to request type

**Answer: A.** Deterministic enforcement beats probabilistic prompt compliance when errors have financial consequences. D solves tool *availability*, not tool *ordering*.

---

**Q2.** Agent frequently calls `get_customer` when users ask about orders ("check my order #12345") instead of `lookup_order`. Both tools have minimal, near-identical descriptions. Best first step?
- A) Add 5-8 few-shot examples showing order queries routing to lookup_order
- B) Expand each tool's description with input formats, example queries, edge cases, and boundaries vs. similar tools ✅
- C) Routing layer parsing input pre-turn to pre-select tools
- D) Consolidate both into one `lookup_entity` tool

**Answer: B.** Tool descriptions are the primary LLM tool-selection signal. Fix the root cause with the lowest-effort, highest-leverage change first.

---

**Q3.** Agent at 55% first-contact resolution (target 80%). Escalates easy cases (standard damage replacement w/ photo evidence) while attempting complex ones (policy exceptions) autonomously. Best fix?
- A) Explicit escalation criteria + few-shot examples in system prompt ✅
- B) Self-reported confidence score (1-10), auto-route below threshold
- C) Separate classifier model trained on historical tickets
- D) Sentiment analysis auto-escalating on negative sentiment

**Answer: A.** LLM self-confidence is poorly calibrated exactly on hard cases (B). C is over-engineered before prompt optimization is tried. D solves the wrong problem — sentiment ≠ complexity.

## Scenario: Code Generation with Claude Code

**Q4.** Want a `/review` slash command available to every developer on clone/pull. Where to create it?
- A) `.claude/commands/` in the project repo ✅
- B) `~/.claude/commands/` per developer
- C) `CLAUDE.md` at project root
- D) `.claude/config.json` with a commands array

**Answer: A.** Project-scoped, version-controlled, auto-available on clone/pull. D doesn't exist.

---

**Q5.** Restructuring a monolith into microservices — dozens of files, service-boundary and dependency decisions needed. Approach?
- A) Plan mode: explore, understand dependencies, design before changing ✅
- B) Direct execution incrementally, let boundaries emerge
- C) Direct execution with comprehensive upfront instructions
- D) Direct execution, switch to plan mode only if unexpected complexity appears

**Answer: A.** Architecturally ambiguous + multi-file + multiple valid approaches = textbook plan-mode case. B risks costly rework; D ignores that complexity is already known upfront.

---

**Q6.** Codebase has distinct conventions per area (React hooks, API async/await, DB repository pattern); test files (`Button.test.tsx`) sit next to source files throughout the repo, and you want consistent test conventions regardless of location. Most maintainable approach?
- A) `.claude/rules/` files with YAML frontmatter glob patterns (path-conditional) ✅
- B) One root CLAUDE.md with headers per area, relying on inference
- C) Skills per code type with conventions in SKILL.md
- D) Separate CLAUDE.md per subdirectory

**Answer: A.** Glob patterns (e.g., `**/*.test.tsx`) apply by file type regardless of directory. B relies on unreliable inference. C requires manual/uncertain invocation. D can't handle files spread across many directories.

## Scenario: Multi-Agent Research System

**Q7.** Topic "impact of AI on creative industries" — all subagents succeed individually (search finds articles, analysis summarizes correctly, synthesis is coherent) but the final report only covers visual arts, missing music/writing/film. Coordinator's logs show it decomposed into: "AI in digital art," "AI in graphic design," "AI in photography." Root cause?
- A) Synthesis agent lacks gap-identification instructions
- B) Coordinator's task decomposition is too narrow, missing whole domains ✅
- C) Web search queries aren't comprehensive enough
- D) Document analysis agent over-filters non-visual sources

**Answer: B.** The logs directly show the coordinator only ever assigned visual-arts subtasks. Subagents did their assigned jobs correctly — the assignment itself was the bug. Classic "don't blame the downstream agent" trap.

---

**Q8.** Web-search subagent times out on a complex topic. How should this failure info flow to the coordinator?
- A) Structured error context: failure type, attempted query, partial results, potential alternatives ✅
- B) Auto-retry w/ exponential backoff, return generic "search unavailable" after retries exhausted
- C) Catch timeout, return empty result marked successful
- D) Propagate exception to a top-level handler that kills the whole workflow

**Answer: A.** Gives the coordinator what it needs for an *intelligent* recovery decision. B hides context. C silently suppresses the failure. D is an overreaction that kills recoverable workflows.

---

**Q9.** Synthesis agent needs frequent simple fact-checks (dates, names, stats — 85% of cases) plus occasional deep verification (15%). Currently every check round-trips through the coordinator → web-search agent → back, adding 40% latency. Best fix?
- A) Give synthesis agent a scoped `verify_fact` tool for simple lookups; keep coordinator-routed delegation for complex cases ✅
- B) Batch all verification needs, send to coordinator at end of pass
- C) Give synthesis agent full web-search tool access
- D) Have web-search agent proactively over-cache context for anticipated needs

**Answer: A.** Least-privilege scoped tool for the common case, preserves existing pattern for the rare complex case. B creates blocking dependencies. C violates separation of concerns. D relies on unreliable speculative caching.

## Scenario: Claude Code for CI/CD

**Q10.** `claude "Analyze this pull request for security issues"` hangs indefinitely in a pipeline — Claude Code is waiting for interactive input. Fix?
- A) Add `-p` flag ✅
- B) Set `CLAUDE_HEADLESS=true` env var
- C) Redirect stdin from `/dev/null`
- D) Add `--batch` flag

**Answer: A.** `-p`/`--print` is the documented non-interactive mode flag. B and D reference features that don't exist; C is an unreliable Unix workaround, not the actual fix.

---

**Q11.** Team wants to cut API costs. Two workflows use real-time Claude calls: (1) blocking pre-merge check, (2) overnight technical-debt report. Manager proposes switching **both** to Message Batches API for the 50% savings. Evaluate.
- A) Batch only the overnight reports; keep real-time for pre-merge checks ✅
- B) Switch both to batch with status polling
- C) Keep both real-time to avoid batch ordering issues
- D) Switch both to batch with a real-time timeout fallback

**Answer: A.** Batch API has up to 24h processing with no SLA — unacceptable for a blocking developer-waiting workflow, ideal for an overnight job. B relies on "often faster" which isn't good enough for a blocking check. C is based on a misconception (`custom_id` solves ordering). D over-engineers a simple use-case match.

---

**Q12.** A PR touches 14 files in the stock-tracking module. A single-pass review of all 14 files together gives inconsistent depth and contradictory findings (same pattern flagged as a bug in one file, approved in another). Fix?
- A) Split into per-file local-analysis passes + a separate cross-file integration pass ✅
- B) Require developers to split PRs into 3-4 file chunks before review runs
- C) Switch to a higher-tier model with a larger context window
- D) Run 3 independent full-PR passes, only flag issues appearing in ≥2 of 3

**Answer: A.** Directly targets the root cause: attention dilution across many files in one pass. B shifts the burden without fixing the system. C misunderstands that context size ≠ attention quality. D would actually suppress real bugs caught only intermittently.

---

> **Study tip from community pass reports:** the real exam does **not** reuse these questions verbatim — new scenarios, same underlying reasoning patterns. Don't memorize "the answer is A for Q1" — internalize *why* A beats B/C/D in each case, because that reasoning transfers.
