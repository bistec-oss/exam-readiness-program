# Proposal 13 — CSV Bulk Question Import + PDF Score Report Export

## Problem
Two post-MVP backlog items remain that admins and candidates need:
- Admins can only add questions one at a time through a form — slow for seeding large banks.
- Candidates have an on-screen readiness dashboard but no shareable/offline artifact.

## Solution

### CSV bulk question import (admin)
- `POST /api/admin/questions/import` — admin-only. Accepts `{ csv: string }`.
- Header-driven, order-independent columns: `examId, challengeSetId, type, text, preamble, correctOptionId, explanation, optionA, optionB, optionC, optionD`.
- `type` ∈ `MCQ | TRUE_FALSE`. TRUE_FALSE options auto-built; correctOptionId must be `true`/`false`. MCQ builds options from non-empty `optionA-D`.
- Per-row validation (exam exists, challenge set belongs to exam, correctOptionId valid). Valid rows bulk-created via `createMany`; invalid rows reported with row number + message. Returns `{ imported, failed, errors[] }`.
- UI: `CsvImport` client component on `/admin/questions` — file picker or paste, sample loader, result/error display.
- Dependency-free CSV parser in `lib/csv.ts` (quoted fields, escaped quotes, embedded commas/newlines).

### PDF score report export (candidate)
- `GET /api/progress/report` — session required. Reuses the readiness computation (avg challenge ×0.5 + best mock ×0.5), XP, weak topics, badges.
- Dependency-free PDF generator in `lib/pdf.ts` — well-formed single-page PDF 1.4 with correct xref. Returns `application/pdf` as an attachment.
- UI: "⬇ PDF Report" link in the dashboard header.

## Scope
In: the two API routes, two `lib/` helpers, two UI touch-points, e2e spec 14.
Out: PDF charts/branding/styling beyond text, CSV column remapping UI, idempotent upsert by natural key (rows are created, not de-duped).

## Impact
No schema changes. Adds two routes + two libs + one client component. No new npm dependencies.

## Tests
e2e spec `14-bulk-import-pdf-report.spec.ts`: valid import (MCQ+TF), invalid-row reporting, 400 on missing body, 403 for candidate, import UI visible; PDF 200 + `%PDF`/`%%EOF` + headers, 401 unauth, dashboard link present.
