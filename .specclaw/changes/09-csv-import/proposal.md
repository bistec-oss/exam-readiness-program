# Proposal: CSV Bulk Question Import

## Problem
Admins must create questions one-by-one via the web UI. Loading a full exam bank (50+ questions) is slow and error-prone.

## Solution
Add a CSV upload page in the admin panel. Admin uploads a CSV file; server parses it and upserts questions into the DB.

## CSV Format
```
text,preamble,type,option_a,option_b,option_c,option_d,correct_option,explanation,exam_name,challenge_set_title
"What is X?","Context","MCQ","A","B","C","D","A","Because A","Claude Architect","Basics"
```
- `type`: MCQ or TRUE_FALSE
- `correct_option`: a/b/c/d for MCQ, true/false for TRUE_FALSE
- `exam_name`: must match existing exam
- `challenge_set_title`: optional, must match existing challenge set for that exam

## Scope
- Admin page `/admin/questions/import`
- API `POST /api/admin/questions/import` (multipart)
- Upsert by (examId + text) to allow re-imports
- Returns summary: created/updated/errors
