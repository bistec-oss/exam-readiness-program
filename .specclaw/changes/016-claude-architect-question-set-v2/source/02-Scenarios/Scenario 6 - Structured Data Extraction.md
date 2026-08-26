---
tags: [exam, scenario]
domains: ["Domain 4 - Prompt Engineering and Structured Output", "Domain 5 - Context Management and Reliability"]
---

# Scenario 6: Structured Data Extraction

Extracts information from unstructured documents, validates via JSON schemas, must handle edge cases and integrate downstream while keeping high accuracy.

**Primary domains:** [[Domain 4 - Prompt Engineering and Structured Output]], [[Domain 5 - Context Management and Reliability]]

## What this scenario tests
- `tool_use` + JSON schema for guaranteed structural compliance
- Nullable/optional fields to prevent fabrication when info is absent from source
- Validation-retry loops: when retry works (format errors) vs when it can't (info genuinely absent)
- Batch processing 100s of documents, handling failures by `custom_id`
- Human review routing via field-level confidence, validated by document type/field segment (not just aggregate accuracy)

## Key facts to lock in
- Required field for data that might not exist in the source → model fabricates to comply. Fix: make it nullable/optional.
- Retry with the specific validation error appended → fixes format/structural issues. Does **not** fix "the number just isn't in the document."
- 97% aggregate accuracy can hide a bad sub-segment — validate by document type and field before trusting it or before removing human review on any segment.
- Batch failures: resubmit only the failed `custom_id`s, with modifications (e.g., chunk oversized documents) — don't resubmit the whole batch.
