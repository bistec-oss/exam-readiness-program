# Design: Landing Page — Browse Exam Catalog

**Change:** 14-landing-page-browse-catalog
**Phase:** Design
**Created:** 2026-06-29

## Architecture

Extract the existing `/exams` page body into a **shared Server Component** that takes the exam list + an optional auth context (anonymous / logged-in) and renders the catalog with the appropriate header. Both `/` and `/exams` import it. This is the minimum-surface-area refactor that keeps the catalog DRY across two pages.

```
/                   (anonymous + logged-in)
└── components/ExamCatalog.tsx       ← shared UI
                                 ↑
                                 │
/exams              (logged-in only, redirects anon to /login)
└── components/ExamCatalog.tsx       ← shared UI
```

The query (`prisma.exam.findMany(...)`) stays in each page component (not pushed into the shared component). This:
- Mirrors the existing pattern (`/exams` and `/exams/[id]` both do their own queries)
- Lets each page add its own optional data later (e.g. `/` could later pull `totalAttempts` for social proof; `/exams` could later add user's recent attempts)
- Keeps the shared component pure UI, no async I/O

`components/ExamCatalog` becomes a **Server Component** (no `"use client"` directive) because:
- Tailwind classes, no interactivity needed
- Renders on the server, ships zero JS for the catalog body
- Matches Next.js App Router best practice for static-rendered catalog pages

## Files Touched

| Path | Action | LOC delta |
|---|---|---|
| `app/components/ExamCatalog.tsx` | **Create** | +65 |
| `app/app/page.tsx` | **Rewrite** (boilerplate → catalog) | +55, −63 |
| `app/app/exams/page.tsx` | **Modify** (use shared component) | −10, +5 |
| `BACKLOG.md` | **Add row 14** | +3 |
| `e2e/landing.spec.ts` | **Create** | +50 |

Net: ~+105 lines, −73 lines.

## Component Shape

```ts
// app/components/ExamCatalog.tsx
// SERVER COMPONENT — no "use client"
import Link from "next/link";

type Exam = {
  id: string;
  name: string;
  description: string;
  passingScore: number;
  durationMinutes: number;
  _count: { challengeSets: number; questions: number };
};

type AuthMode =
  | { kind: "anonymous" }
  | { kind: "loggedIn"; userName: string };

export function ExamCatalog({
  exams,
  auth,
}: {
  exams: Exam[];
  auth: AuthMode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-yellow-50 p-6">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-extrabold text-violet-700">
            Exam Catalog 🎯
          </h1>
          {auth.kind === "anonymous" ? (
            <div className="flex gap-3 text-sm font-semibold">
              <Link
                href="/login"
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-white text-violet-600 border-2 border-violet-300 hover:border-violet-500 rounded-xl transition-colors"
              >
                Register
              </Link>
            </div>
          ) : (
            <Link
              href="/dashboard"
              className="text-violet-600 hover:text-violet-800 font-semibold text-sm"
            >
              ← Dashboard
            </Link>
          )}
        </header>

        {exams.length === 0 ? (
          <div className="bg-white rounded-3xl border-4 border-violet-200 shadow-xl p-8 text-center text-gray-500">
            No exams available yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {exams.map((exam) => (
              <Link
                key={exam.id}
                href={`/exams/${exam.id}`}
                data-testid="exam-card"
                className="bg-white rounded-3xl border-4 border-violet-200 hover:border-violet-400 shadow-lg p-6 block transition-all hover:shadow-xl"
              >
                <h2 className="text-xl font-bold text-violet-700">{exam.name}</h2>
                <p className="text-gray-600 text-sm mt-2">{exam.description}</p>
                <div className="flex flex-wrap gap-3 mt-4 text-sm font-semibold">
                  <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full">
                    ✅ Pass: {exam.passingScore}%
                  </span>
                  <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full">
                    ⏱ {exam.durationMinutes} min
                  </span>
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                    📚 {exam._count.challengeSets} challenge sets
                  </span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    ❓ {exam._count.questions} questions
                  </span>
                </div>
                {auth.kind === "anonymous" && (
                  <p className="text-xs text-gray-400 mt-3">
                    Sign in to start practicing →
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

## Page Refactors

### `app/app/page.tsx` (was: boilerplate)

```ts
// SERVER COMPONENT — no "use client"
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ExamCatalog } from "@/components/ExamCatalog";

export default async function HomePage() {
  const [session, exams] = await Promise.all([
    getSession(),
    prisma.exam.findMany({
      include: { _count: { select: { challengeSets: true, questions: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <ExamCatalog
      exams={exams}
      auth={
        session
          ? { kind: "loggedIn", userName: session.name }
          : { kind: "anonymous" }
      }
    />
  );
}
```

### `app/app/exams/page.tsx` (modified)

```ts
// SERVER COMPONENT — no "use client"
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ExamCatalog } from "@/components/ExamCatalog";

export default async function ExamsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const exams = await prisma.exam.findMany({
    include: { _count: { select: { challengeSets: true, questions: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <ExamCatalog
      exams={exams}
      auth={{ kind: "loggedIn", userName: session.name }}
    />
  );
}
```

## Auth Flow After Change

```
GET /
  ├── anonymous → ExamCatalog renders + "Sign in" / "Register" buttons
  │   └── click exam card → /exams/[id] → redirect to /login (existing behavior)
  └── loggedIn → ExamCatalog renders + "← Dashboard" link
      └── click exam card → /exams/[id] → renders exam detail

GET /exams
  ├── anonymous → redirect to /login (existing behavior, unchanged)
  └── loggedIn → ExamCatalog renders with "← Dashboard" (same as before, just using shared component)

GET /login → /login form (existing, unchanged)
GET /register → /register form (existing, unchanged)
```

## Tailwind Notes

- Reuses ALL classes from existing `/exams` — no new design language
- Adds `header` flex layout for the title + auth controls (was previously inline with the title)
- Adds `data-testid="exam-card"` preserved from existing `/exams` (Playwright selectors keep working)
- "Sign in" button uses `bg-violet-600` primary color to match login form CTA; "Register" is the outline variant for hierarchy

## Risks

- **`@/components/ExamCatalog` path resolution** — `tsconfig.json` has `"@/*": ["./*"]`, so `@/components/ExamCatalog` resolves to `app/components/ExamCatalog.tsx`. Verified by re-reading tsconfig.
- **`getSession()` returns `null` for anonymous** — `SessionPayload | null` per `app/lib/session.ts`. My ternary `session ? … : { kind: "anonymous" }` handles both.
- **Existing Playwright tests that select `[data-testid="exam-card"]`** — preserved verbatim on both pages.
- **Anonymous flow on root**: possible for a logged-in user to see "Sign in" briefly on `/` during logout flicker; acceptable per proposal (no auth-gating, by design).

## Decision Log

- **Q1 resolved:** Root `/` is catalog, `/exams` stays separate (operator decision).
- **Q2 resolved:** Extract `components/ExamCatalog.tsx` for DRY (extraction default; safe revert if operator prefers inline).
- **Q3 resolved:** Anonymous sees ALL exams (no per-exam flag), action buttons redirect (gate-by-action not gate-by-row).
