import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { attemptId } = await params;

  const attempt = await prisma.mockAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        include: { questions: { select: { id: true, text: true, preamble: true, type: true, options: true, correctOptionId: true, explanation: true } } },
      },
    },
  });

  if (!attempt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (attempt.userId !== session.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const answers = attempt.answers as Record<string, string>;
  const scored = attempt.exam.questions.map((q) => {
    const chosen = answers[q.id] ?? null;
    return { ...q, chosen, isCorrect: chosen === q.correctOptionId };
  });

  return NextResponse.json({
    id: attempt.id,
    score: attempt.score,
    total: attempt.total,
    timeUsed: attempt.timeUsed,
    startedAt: attempt.startedAt,
    completedAt: attempt.completedAt,
    examName: attempt.exam.name,
    scored,
  });
}
