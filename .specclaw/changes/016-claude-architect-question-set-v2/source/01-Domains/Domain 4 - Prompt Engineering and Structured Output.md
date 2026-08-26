---
tags: [exam, domain, prompt-engineering, structured-output]
weight: 20%
---

# Domain 4: Prompt Engineering & Structured Output (20%)

## Task 4.1 — Explicit criteria to reduce false positives
- Specific categorical criteria ("flag only when claimed behavior contradicts actual code behavior") beats vague instructions ("check comments are accurate").
- "Be conservative" / "only report high-confidence findings" does **not** reliably improve precision — it's a trap answer.
- High false-positive categories erode trust in the *accurate* categories too — sometimes the right move is to temporarily disable a noisy category while you fix its prompt.
- Define explicit severity levels with concrete code examples per level for consistent classification.

## Task 4.2 — Few-shot prompting
- Most effective technique when detailed instructions alone still produce inconsistent formatting.
- Use few-shot to demonstrate **ambiguous-case handling** (not just format) — shows reasoning for choosing one action over plausible alternatives.
- 2-4 targeted examples for ambiguous scenarios is the typical right-sized answer (not "add one example," not "add 20").
- Reduces hallucination in extraction (varied document structures, informal measurements).

## Task 4.3 — Structured output via tool_use + JSON schema
- `tool_use` + JSON schema = most reliable path to guaranteed schema-compliant output — **eliminates syntax errors**, not semantic errors.
- `tool_choice`: `"auto"` / `"any"` / forced named tool — know all three.
- Semantic errors (line items don't sum to total, values in wrong field) still need separate validation logic even with strict schemas.
- Design fields as **optional/nullable** when the source document may not contain the info — prevents the model fabricating values to satisfy a "required" field.
- `enum` fields: include an `"other"` + free-text detail field for extensibility; include `"unclear"` for ambiguous cases.
- Include format-normalization rules in the prompt for inconsistent source formatting.

## Task 4.4 — Validation, retry, feedback loops
- Retry-with-error-feedback: append the **specific validation error** to the retry prompt.
- Retry works for format/structural errors. Retry does **not** work when the info is simply absent from the source — that's a data problem, not a formatting problem.
- Track `detected_pattern` fields on findings to analyze why developers dismiss them (systematic false-positive analysis).
- Self-correction pattern: extract `calculated_total` alongside `stated_total`, flag mismatches; add `conflict_detected` booleans for inconsistent source data.

## Task 4.5 — Batch processing strategy
- Message Batches API: **50% cost savings**, up to **24h** processing window, **no guaranteed latency SLA**.
- Good fit: non-blocking, latency-tolerant (overnight reports, weekly audits, nightly test gen).
- Bad fit: blocking workflows (pre-merge checks) — the exam will offer this as a tempting "just switch everything to batch to save cost" trap.
- No multi-turn tool calling *within* a single batch request.
- `custom_id` correlates request/response pairs and lets you resubmit only the failed subset (e.g., chunk oversized docs and resend just those).
- Refine your prompt on a small sample **before** batch-processing a large volume — cuts iterative resubmission cost.

## Task 4.6 — Multi-instance / multi-pass review
- Self-review (same session, same reasoning context) is weaker than an **independent** review instance without that prior reasoning baggage.
- Split large multi-file reviews: per-file local pass + separate cross-file integration pass — avoids attention dilution and contradictory findings across files.
- Verification passes can have the model self-report confidence per finding, to route review effort.

## High-yield exam instincts for this domain
1. "Vague conservative instruction" is always the wrong answer when "explicit criteria + few-shot" is on offer.
2. tool_use/JSON schema fixes syntax, not semantics — don't conflate the two failure types.
3. Batch API question almost always hinges on **blocking vs non-blocking** — identify which workflow is which before picking an answer.
4. Nullable/optional fields prevent fabrication — a required field for possibly-absent data is a design smell the exam tests directly.
