# Proposal: PDF Score Report Export

## Problem
Candidates have no way to share or save their readiness summary offline. Managers need printable evidence of exam readiness.

## Solution
Add a "Download Report" button on the dashboard. Clicking it fetches `/api/report/pdf` which streams a PDF containing:
- Candidate name, exam name, date
- Readiness % gauge value
- Mock exam scores (date, score, pass/fail)
- Challenge set completion table
- Weak topics list

## Scope
- API `GET /api/report/pdf?examId=<id>` — CANDIDATE-accessible, returns `application/pdf`
- Dashboard "Download Report" button (one per enrolled exam, or global)
- PDF generated server-side via pdfkit
- No new DB models required
