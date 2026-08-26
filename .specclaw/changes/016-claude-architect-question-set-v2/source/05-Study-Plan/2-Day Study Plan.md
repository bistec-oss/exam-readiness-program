---
tags: [exam, study-plan]
---

# 2-Day Intensive Study Plan

Goal: go through everything in [[Exam Overview]] with active recall, not passive reading. ~6-7 focused hours/day. Adjust block lengths to your energy, but keep the **order** — it front-loads the heaviest-weighted domains and ends each day with retrieval practice, which is what every community pass report says actually works (not re-reading).

## Day 1 — Orchestration & Configuration (Domains 1–3, 65% of exam)

| Time | Block | What to do |
|---|---|---|
| 0:00–0:20 | Baseline check | Take the [Claude Certification Guide mock exam](https://claudecertificationguide.com/) cold, OR skim [[Sample Questions - Official]] and self-rate confidence per domain 1-5. This tells you where to lean extra time today/tomorrow. |
| 0:20–1:20 | [[Domain 1 - Agentic Architecture and Orchestration]] | Read once. Then close the note and write from memory: the agentic loop, hub-and-spoke pattern, hooks vs prompts, the 3 things a coordinator must do. Check against the note. |
| 1:20–1:30 | Break | — |
| 1:30–2:15 | [[Scenario 1 - Customer Support Resolution Agent]] + [[Scenario 3 - Multi-Agent Research System]] | Read both, then answer official Q1, Q2, Q3, Q7, Q8, Q9 from [[Sample Questions - Official]] **without looking at the answer first**. Grade yourself. |
| 2:15–3:00 | [[Domain 2 - Tool Design and MCP Integration]] | Read + active recall as above. Focus on: tool description quality, error categories, tool_choice modes, `.mcp.json` scoping. |
| 3:00–3:45 | Lunch / long break | — |
| 3:45–4:45 | [[Domain 3 - Claude Code Configuration and Workflows]] | This is the domain daily Claude Code users most often underestimate (see [[Community Pass Reports]] — John Weidner's weakest domain was this one despite daily use). Read carefully, especially CLAUDE.md hierarchy and `.claude/rules/` globs. |
| 4:45–5:30 | [[Scenario 2 - Code Generation with Claude Code]] + [[Scenario 5 - Claude Code for CI-CD]] | Answer official Q4, Q5, Q6, Q10, Q11, Q12 cold, then grade. |
| 5:30–6:15 | [[Anti-Patterns Cheatsheet]] pass 1 | Read the full cheatsheet once, slowly. This is the "trap answer" pattern library — internalize the *shape* of wrong answers, not just right ones. |
| 6:15–6:30 | Wrap-up | Write 5 bullet points in a new note: "things I got wrong today and why." This becomes your Day 3 targeted-review list. |

## Day 2 — Prompting, Reliability, and Full Mock (Domains 4–5, 35% of exam + integration)

| Time | Block | What to do |
|---|---|---|
| 0:00–1:00 | [[Domain 4 - Prompt Engineering and Structured Output]] | Read + active recall. Focus hard on: tool_use vs free-text JSON, retry-works-vs-doesn't, Batch API blocking/non-blocking distinction (this is a recurring trap). |
| 1:00–1:45 | [[Scenario 6 - Structured Data Extraction]] | Reinforce nullable fields, validation-retry limits, confidence-by-segment. |
| 1:45–1:55 | Break | — |
| 1:55–2:45 | [[Domain 5 - Context Management and Reliability]] | Read + active recall. Focus hard on: escalation triggers (and the confidence/sentiment traps), error propagation structure, provenance/conflict annotation. |
| 2:45–3:15 | [[Scenario 4 - Developer Productivity with Claude]] | Reinforce Grep vs Glob, context degradation fixes. |
| 3:15–4:00 | Lunch / long break | — |
| 4:00–4:30 | [[Anti-Patterns Cheatsheet]] pass 2 | Re-read. This time, for each anti-pattern, say out loud *why* the trap answer is tempting — that's the muscle the real exam tests. |
| 4:30–4:45 | Review yesterday's "got wrong" list | Re-answer those specific official questions from memory. |
| 4:45–6:45 | **Full timed mock exam** | Take a full 60-question, 120-minute timed mock (official practice exam via Anthropic Academy if you have access, otherwise [claudecertificationguide.com](https://claudecertificationguide.com/) or [claudecertifications.com](https://claudecertifications.com/)). Simulate real conditions: no notes, no Claude, phone away. |
| 6:45–7:15 | Score & diagnose | Break your score down by domain (see [[Community Pass Reports]] for John Weidner's breakdown as a template). Note the weakest 1-2 domains — this is tomorrow's focus. |

## After Day 2 — see [[5-Day Countdown Schedule]] for days 3-5 and exam day itself.

## Study principles baked into this plan (from [[Community Pass Reports]])
1. **Retrieval > re-reading.** Every block ends with "answer from memory, then check," not just reading notes.
2. **Practice-test scores can lie.** Don't chase a rising number — chase understanding of *why* an answer is right. If you're just recognizing questions you've seen, you're not actually learning.
3. **Domain 3 is the sneaky weak spot** for hands-on Claude Code users. Don't skim it just because you "use it every day."
4. **Simulate real pacing** at least once (~2 min/question) before exam day — the 120-minute full mock on Day 2 is non-negotiable.
