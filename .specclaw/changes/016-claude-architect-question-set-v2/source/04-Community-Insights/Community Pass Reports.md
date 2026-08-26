---
tags: [exam, community, pass-reports]
---

# Community Pass Reports & Experiences

Synthesized from public write-ups by people who took the Claude Certified Architect – Foundations exam. Full source list in [[Sources]].

## John Weidner — "A 738 Story" (verygood.ventures)
- **Score: 738/1000** (pass line 720) — "one more wrong answer would have put me under." Raw: 44/60 correct (73%).
- **Prep time: 10 days**, ~1-2 hrs/night.
- Built his own practice-exam tool; took the official practice exam **3 times** (scored ~700s → ~850 → ~930).
- Used AI tutoring (Claude + another model) for nightly drills; screenshotted missed questions for targeted review.
- **Warning**: rising practice scores can be misleading — you can end up "studying the answers, not the underlying ideas." The real exam's scenarios are entirely new, nothing transfers verbatim.
- **Format confirmed**: 60 questions / 120 min, four blocks of 15 questions each tied to a random production scenario (~2 min/question, real pacing pressure).
- **His score breakdown by domain** (useful as a template for self-diagnosis):
  - Claude Code Configuration & Workflows: **69%** (his weakest, despite daily use — familiarity ≠ architectural understanding)
  - Tool Design & MCP Integration: 70%
  - Context Management & Reliability: 73%
  - Agentic Architecture & Orchestration: 78% (strongest)
- **Top tips**: build something to study (don't just read); treat AI tutors as sparring partners, not judges; flag hard questions and move on, don't grind; watch the clock from question 1; certification reportedly expires (~6 months per this source) — not a permanent credential, verify at registration.

## "Sofia" — Claude Certified Architect Exam Explained (Udacity blog)
- **Prep time: ~6 weeks** while already hands-on with Claude; recommends a few months for newcomers.
- Resources: official exam guide (revisited repeatedly), Anthropic docs/blogs/code samples, official sample exam (taken **twice**), video walkthroughs.
- Used Claude itself to generate practice questions, but deliberately pushed them toward **diagnosis and tradeoffs**, not recall.
- Built a real project (a question-generator tool, using Claude Code) specifically to build production judgment, not just theory.
- Experimented hands-on with batch requests and prompt caching to internalize the cost tradeoffs.
- **Weakest areas**: team Claude Code repos/CI-CD workflows, large-scale unit testing — not central to her daily work, "shakiest on the exam."
- **Heaviest domain**: agentic architecture & orchestration — biggest weight, core difficulty.
- **Two cross-cutting mental models she found most valuable**:
  1. "Context as budget" — treat token allocation as a resource-allocation decision.
  2. Match reliability mechanism (hooks, human approval, verification) to actual business risk, not to "how complex the task feels."
- Multiple answers are often technically functional — "the exam wants the one that should ship to production."
- **Format confirmed**: 120-minute online-proctored exam, scenario-based MC, questions are reviewable/revisitable within the session. She finished in ~90 minutes.
- **Retrospective advice**: take the sample exam earlier to focus direction sooner; start small hands-on projects immediately rather than waiting for an ambitious one; honestly audit weak domains and target them specifically rather than re-studying strengths.

## Kamal Dhungana — Medium "How I Passed the CCA-F"
- Recommends **starting with 2 practice exams first** to baseline what you already know and what needs work, before deep study.
- Found the real exam "easier than initially expected" and noted it followed a pattern similar to the sample/practice materials.
- Notes the exam uses **partial grading on some questions** (useful to know — don't leave multi-part questions half-answered).

## Cross-source recurring themes
1. **Practice > passive reading.** Every source independently converged on: build something small, use official + community practice exams, review your misses.
2. **The real exam scenarios are novel**, even though the *reasoning patterns* match the official guide's samples — study the "why," not the letter answers.
3. **Domain 3 (Claude Code Config) is a common blind spot** for people who use Claude Code daily — familiarity with the tool doesn't mean familiarity with the *configuration architecture* (hierarchy, rules globs, skills frontmatter) tested on the exam.
4. **Pacing matters** — ~2 min/question is tight; flag-and-move is the recommended strategy over grinding a hard question.
5. **Take at least one full timed mock** before exam day; multiple sources recommend 2+.
6. **Watch for logistics drift** — reported price ($99 vs $125), validity (6 vs 12 months) and even launch-date details vary across community sources; **confirm current terms on the official registration page before exam day**, don't trust secondary sources for logistics.
