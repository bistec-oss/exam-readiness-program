# Proposal: Additional Exam Catalogs

## Summary
Add 3 more exam catalogs to the platform: AWS SAA-C03, Azure AZ-900, and Scrum PSM-I.

## Problem
Only Claude Architect Certification exists. Platform should support multiple certifications.

## Solution
Extend `prisma/seed.ts` with:
- AWS Certified Solutions Architect — Associate (SAA-C03): 3 challenge sets, 15 questions
- Azure AZ-900: Microsoft Azure Fundamentals: 3 challenge sets, 15 questions  
- Scrum PSM-I: Professional Scrum Master I: 3 challenge sets, 15 questions

## Scope
- No schema changes needed
- Add seed data only
- E2E: verify exams appear in catalog, challenge sets are playable
