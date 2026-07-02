// SERVER COMPONENT — study plan catalog for the current candidate.
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { deriveProgress } from "@/lib/studyPlan";
import { redirect } from "next/navigation";
import Link from "next/link";
import { EnrollButton } from "@/components/EnrollButton";

export default async function StudyPlansPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [plans, enrollments, attempts, mocks] = await Promise.all([
    prisma.studyPlan.findMany({
      include: { exam: { select: { id: true, name: true, passingScore: true } }, steps: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.studyPlanEnrollment.findMany({ where: { userId: session.userId }, select: { planId: true } }),
    prisma.attempt.findMany({ where: { userId: session.userId }, select: { challengeSetId: true, score: true, total: true } }),
    prisma.mockAttempt.findMany({ where: { userId: session.userId }, select: { examId: true, score: true, total: true } }),
  ]);

  const enrolledIds = new Set(enrollments.map((e) => e.planId));

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">🗺️ Study Plans</h1>
            <p className="text-sm text-gray-500">Guided, paced paths to exam readiness.</p>
          </div>
          <Link href="/dashboard" className="text-xs font-semibold text-violet-600 hover:underline">
            ← Dashboard
          </Link>
        </div>

        <div className="space-y-4">
          {plans.map((plan) => {
            const enrolled = enrolledIds.has(plan.id);
            const examMocks = mocks.filter((m) => m.examId === plan.exam.id);
            const pct = enrolled
              ? deriveProgress(plan.steps, attempts, examMocks, plan.exam.id, plan.exam.passingScore).completionPct
              : null;

            return (
              <div key={plan.id} className="rounded-3xl border-4 border-violet-100 bg-white p-5 shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-bold text-violet-700">{plan.title}</h2>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {plan.exam.name} · {plan.steps.length} steps
                    </p>
                    <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
                  </div>
                  <div className="shrink-0">
                    {enrolled ? (
                      <Link
                        href={`/study-plans/${plan.id}`}
                        className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-violet-700"
                      >
                        Continue
                      </Link>
                    ) : (
                      <EnrollButton planId={plan.id} />
                    )}
                  </div>
                </div>
                {enrolled && pct !== null && (
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs font-semibold text-gray-500">
                      <span>Progress</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-violet-100">
                      <div className="h-full rounded-full bg-violet-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {plans.length === 0 && (
            <div className="rounded-3xl border-4 border-dashed border-gray-200 p-10 text-center text-gray-400">
              No study plans available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
