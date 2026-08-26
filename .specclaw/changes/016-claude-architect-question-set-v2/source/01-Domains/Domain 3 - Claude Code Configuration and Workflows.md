---
tags: [exam, domain, claude-code]
weight: 20%
---

# Domain 3: Claude Code Configuration & Workflows (20%)

Community consensus (John Weidner's 738 writeup) flags this as the domain people **underestimate most** — daily tool familiarity ≠ architectural understanding of the config system. Study this domain deliberately even if you use Claude Code every day.

## Task 3.1 — CLAUDE.md hierarchy & modular organization
- Hierarchy: **user-level** `~/.claude/CLAUDE.md` (personal, NOT shared via git) → **project-level** `.claude/CLAUDE.md` or root `CLAUDE.md` (shared, version-controlled) → **directory-level** (subdirectory CLAUDE.md).
- Classic diagnostic question: "new team member isn't getting the standard instructions" → they were put in **user-level**, not **project-level**.
- `@import` syntax to pull in external files, keeping CLAUDE.md modular (e.g., import only the standards file relevant to a given package/maintainer).
- `.claude/rules/` directory: alternative to one monolithic CLAUDE.md — split into topic files.
- `/memory` command: verify which memory files are actually loaded (diagnostic tool for inconsistent behavior).

## Task 3.2 — Custom slash commands & skills
- Project-scoped commands: `.claude/commands/` (shared, version-controlled, available to whole team on clone/pull).
- User-scoped commands: `~/.claude/commands/` (personal only).
- Skills: `.claude/skills/` with `SKILL.md` + frontmatter: `context: fork`, `allowed-tools`, `argument-hint`.
- `context: fork` → runs the skill in an isolated sub-agent context so verbose/exploratory output doesn't pollute the main conversation.
- `allowed-tools` in skill frontmatter restricts tool access during execution (e.g., limit to file-write only, to prevent destructive actions).
- `argument-hint` prompts the developer for required params when they invoke without arguments.
- Personal variant of a shared skill → new name in `~/.claude/skills/` so you don't affect teammates.
- Skills = on-demand, task-specific. CLAUDE.md = always-loaded, universal.

## Task 3.3 — Path-specific rules
- `.claude/rules/*.md` with YAML frontmatter `paths: [...]` glob patterns for conditional loading.
- Loads only when editing matching files → less irrelevant context, fewer tokens.
- Wins over directory-level CLAUDE.md when a convention spans many directories by **file type** (e.g., all `*.test.tsx` files scattered throughout the repo) rather than by folder.

## Task 3.4 — Plan mode vs direct execution
- Plan mode: complex, large-scale, multiple valid approaches, architectural decisions, multi-file — explore & design safely before committing.
- Direct execution: simple, well-scoped (single function/file, clear stack trace).
- `Explore` subagent: isolates verbose discovery output, returns a summary — preserves main conversation context.
- Can combine: plan mode to investigate → direct execution to implement the planned approach.

## Task 3.5 — Iterative refinement
- Concrete input/output examples (2-3) beat prose descriptions when NL is interpreted inconsistently.
- Test-driven iteration: write tests first, then iterate by sharing test **failures**.
- Interview pattern: have Claude ask clarifying questions before implementing (surfaces considerations you hadn't thought of — cache invalidation, failure modes).
- Batch **interacting** issues into one detailed message; fix **independent** issues sequentially.

## Task 3.6 — CI/CD integration
- `-p` / `--print` flag: non-interactive mode — **the fix whenever a pipeline hangs waiting on stdin.**
- `--output-format json` + `--json-schema`: machine-parseable structured findings for automated PR comments.
- CLAUDE.md carries project context (testing standards, fixture conventions, review criteria) into CI-invoked runs.
- Independent review instance > same session reviewing its own generated code (self-review blind spot).
- Include prior review findings in context on re-runs → report only new/unaddressed issues (avoid duplicate comments).
- Provide existing test files in context so generation doesn't duplicate existing test scenarios.

## High-yield exam instincts for this domain
1. "Team member missing instructions" → always a **user-level vs project-level** CLAUDE.md question.
2. Convention scattered across many directories by file type → `.claude/rules/` glob, not per-directory CLAUDE.md.
3. Pipeline hangs → `-p` flag, not an invented env var or flag.
4. Complex multi-file/architectural task → plan mode; simple single-file fix → direct execution. Don't overthink it.
