---
tags: [exam, scenario]
domains: ["Domain 3 - Claude Code Configuration and Workflows", "Domain 5 - Context Management and Reliability"]
---

# Scenario 2: Code Generation with Claude Code

Team uses Claude Code for generation, refactoring, debugging, documentation. Needs custom slash commands, CLAUDE.md configs, and judgment on plan mode vs direct execution.

**Primary domains:** [[Domain 3 - Claude Code Configuration and Workflows]], [[Domain 5 - Context Management and Reliability]]

## What this scenario tests
- Where to put a team-wide slash command (`.claude/commands/` vs `~/.claude/commands/`) — see official Q4
- Plan mode vs direct execution for a monolith→microservices restructuring — see official Q5
- `.claude/rules/` glob-scoped conventions for conventions spread across a codebase (e.g., all test files) — see official Q6
- CLAUDE.md hierarchy diagnostics

## Key facts to lock in
- Team-shared slash command → `.claude/commands/` (version-controlled, in-repo).
- Personal slash command → `~/.claude/commands/`.
- Architecturally ambiguous, multi-file, multiple valid approaches → **plan mode**.
- Convention tied to file *type* regardless of directory → `.claude/rules/` YAML frontmatter glob, not per-directory CLAUDE.md.
