import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { deriveProgress } from "@/lib/studyPlan";
import { NextResponse } from "next/server";

// GET /api/study-plans — list all plans with enrolled flag + completion% for enrolled ones.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [plans, enrollments, attempts, mocks] = await Promise.all([
    prisma.studyPlan.findMany({
      include: {
        exam: { select: { id: true, name: true, passingScore: true } },
        steps: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.studyPlanEnrollment.findMany({ where: { userId: session.userId }, select: { planId: true } }),
    prisma.attempt.findMany({ where: { userId: session.userId }, select: { challengeSetId: true, score: true, total: true } }),
    prisma.mockAttempt.findMany({ where: { userId: session.userId }, select: { examId: true, score: true, total: true } }),
  ]);

  const enrolledIds = new Set(enrollments.map((e) => e.planId));

  const result = plans.map((plan) => {
    const enrolled = enrolledIds.has(plan.id);
    let completionPct: number | null = null;
    if (enrolled) {
      const examMocks = mocks.filter((m) => m.examId === plan.exam.id);
      completionPct = deriveProgress(plan.steps, attempts, examMocks, plan.exam.id, plan.exam.passingScore).completionPct;
    }
    return {
      id: plan.id,
      title: plan.title,
      description: plan.description,
      examId: plan.exam.id,
      examName: plan.exam.name,
      stepCount: plan.steps.length,
      enrolled,
      completionPct,
    };
  });

  return NextResponse.json(result);
}
