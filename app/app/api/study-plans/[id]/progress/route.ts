import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { deriveProgress } from "@/lib/studyPlan";
import { NextResponse } from "next/server";

// GET /api/study-plans/[id]/progress — plan + steps with auto-derived completion.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const plan = await prisma.studyPlan.findUnique({
    where: { id },
    include: {
      exam: { select: { id: true, name: true, passingScore: true } },
      steps: true,
      enrollments: { where: { userId: session.userId }, select: { id: true } },
    },
  });
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [attempts, mocks] = await Promise.all([
    prisma.attempt.findMany({ where: { userId: session.userId }, select: { challengeSetId: true, score: true, total: true } }),
    prisma.mockAttempt.findMany({ where: { userId: session.userId, examId: plan.exam.id }, select: { score: true, total: true } }),
  ]);

  const progress = deriveProgress(plan.steps, attempts, mocks, plan.exam.id, plan.exam.passingScore);

  return NextResponse.json({
    id: plan.id,
    title: plan.title,
    description: plan.description,
    examId: plan.exam.id,
    examName: plan.exam.name,
    enrolled: plan.enrollments.length > 0,
    completedCount: progress.completedCount,
    totalSteps: progress.totalSteps,
    completionPct: progress.completionPct,
    nextStep: progress.nextStep,
    steps: progress.steps,
  });
}
