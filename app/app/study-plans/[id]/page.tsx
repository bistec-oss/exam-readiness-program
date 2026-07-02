// SERVER COMPONENT — study plan detail with auto-derived step completion.
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { deriveProgress } from "@/lib/studyPlan";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { StudyPlanTimeline } from "@/components/StudyPlanTimeline";
import { EnrollButton } from "@/components/EnrollButton";

export default async function StudyPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const plan = await prisma.studyPlan.findUnique({
    where: { id },
    include: {
      exam: { select: { id: true, name: true, passingScore: true } },
      steps: true,
      enrollments: { where: { userId: session.userId }, select: { id: true } },
    },
  });
  if (!plan) notFound();

  const enrolled = plan.enrollments.length > 0;

  const [attempts, mocks] = await Promise.all([
    prisma.attempt.findMany({ where: { userId: session.userId }, select: { challengeSetId: true, score: true, total: true } }),
    prisma.mockAttempt.findMany({ where: { userId: session.userId, examId: plan.exam.id }, select: { score: true, total: true } }),
  ]);

  const progress = deriveProgress(plan.steps, attempts, mocks, plan.exam.id, plan.exam.passingScore);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white p-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/study-plans" className="text-xs font-semibold text-violet-600 hover:underline">
          ← All study plans
        </Link>

        <div className="mt-3 rounded-3xl border-4 border-violet-100 bg-white p-6 shadow-lg">
          <h1 className="text-2xl font-extrabold text-gray-800">{plan.title}</h1>
          <p className="mt-1 text-sm text-gray-500">{plan.exam.name}</p>
          <p className="mt-3 text-sm text-gray-600">{plan.description}</p>

          {enrolled ? (
            <div className="mt-5">
              <div className="mb-1 flex justify-between text-sm font-bold text-gray-600">
                <span>
                  {progress.completedCount} / {progress.totalSteps} steps complete
                </span>
                <span>{progress.completionPct}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-violet-100">
                <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${progress.completionPct}%` }} />
              </div>
              {progress.nextStep ? (
                <p className="mt-3 text-sm text-violet-600">
                  Next up: <span className="font-semibold">{progress.nextStep.title}</span>
                </p>
              ) : (
                <p className="mt-3 text-sm font-semibold text-green-600">🎉 Plan complete — you&apos;re exam-ready!</p>
              )}
            </div>
          ) : (
            <div className="mt-5 flex items-center gap-3">
              <EnrollButton planId={plan.id} label="Start this plan" />
              <span className="text-xs text-gray-400">Enroll to track your progress through the steps below.</span>
            </div>
          )}
        </div>

        <div className="mt-6">
          <StudyPlanTimeline steps={progress.steps} nextStepId={enrolled ? (progress.nextStep?.id ?? null) : null} />
        </div>
      </div>
    </div>
  );
}
