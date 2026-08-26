---
tags: [exam, scenario]
domains: ["Domain 3 - Claude Code Configuration and Workflows", "Domain 4 - Prompt Engineering and Structured Output"]
---

# Scenario 5: Claude Code for Continuous Integration

Claude Code runs automated code review, generates test cases, gives PR feedback inside CI/CD. Needs prompts that give actionable feedback and minimize false positives.

**Primary domains:** [[Domain 3 - Claude Code Configuration and Workflows]], [[Domain 4 - Prompt Engineering and Structured Output]]

## What this scenario tests
- Non-interactive mode flag when a pipeline hangs — see official Q10 (`-p` / `--print`)
- Batch API vs real-time API for blocking pre-merge checks vs overnight reports — see official Q11
- Splitting a large multi-file PR review into per-file + cross-file integration passes — see official Q12
- Reducing false positives with explicit criteria instead of vague "be conservative" instructions
- `--output-format json` + `--json-schema` for machine-parseable PR comments
- Avoiding duplicate comments across re-runs by including prior findings in context

## Key facts to lock in
- Pipeline hangs waiting on input → missing `-p`/`--print` flag. (Not an invented env var, not a `--batch` flag — those don't exist.)
- Blocking pre-merge check → stay on real-time/synchronous API. Overnight/weekly report → Message Batches API (50% cheaper, up to 24h, no SLA).
- 14-file PR review giving inconsistent depth/contradictory findings → split into per-file local passes + a separate cross-file integration pass (not a bigger model/context window, not smaller PRs as policy, not majority-vote across 3 full-PR runs).
