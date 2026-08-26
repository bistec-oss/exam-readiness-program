# Learnings: 016-claude-architect-question-set-v2

Build learnings, spec gaps, and patterns discovered.

**Categories:** spec_gap | design_gap | pattern | best_practice | agent_issue

---

## [L1] design_gap — CLAUDE.md modified in this branch's diff vs main (adds Qu...

**When:** 2026-08-26 17:59 UTC
**Category:** design_gap
**Priority:** low
**Status:** pending

### Detail
CLAUDE.md modified in this branch's diff vs main (adds Question Authoring Rules section) but not declared in any T1-T3 task file list

### Action
Expected: this was a prerequisite commit made directly by the user before /specclaw:propose kicked off this change, not build agent scope creep. No action needed — verify/pr should note CLAUDE.md is intentionally part of this PR's diff.

---

## [L2] agent_issue — The build's git.strategy branch-per-change setup created ...

**When:** 2026-08-26 17:59 UTC
**Category:** agent_issue
**Priority:** medium
**Status:** pending

### Detail
The build's git.strategy branch-per-change setup created the feature branch from origin/main instead of stacking on the local branch that held uncommitted propose/plan output (spec.md/design.md/tasks.md/proposal.md/source/), causing those files to disappear from the working tree on branch switch

### Action
Files were recovered via git checkout <old-branch> -- <paths> since they were committed on the old branch. Future builds on this project should verify propose/plan output is committed before running /specclaw:build, or the build setup should stack the new branch on the current branch rather than origin/main when the current branch holds the plan commits.

---
