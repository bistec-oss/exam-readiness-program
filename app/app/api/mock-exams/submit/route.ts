import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { examId, answers, startedAt } = await request.json();

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { durationMinutes: true },
  });
  if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

  const started = new Date(startedAt).getTime();
  const now = Date.now();
  const timeUsed = Math.floor((now - started) / 1000);
  const maxSeconds = exam.durationMinutes * 60 + 30;

  if (timeUsed > maxSeconds) {
    return NextResponse.json({ error: "Time limit exceeded" }, { status: 400 });
  }

  const questionIds = Object.keys(answers);
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds }, examId },
    select: {
      id: true,
      correctOptionId: true,
      text: true,
      options: true,
      explanation: true,
      type: true,
      preamble: true,
    },
  });

  let score = 0;
  const scored = questions.map((q) => {
    const chosen = answers[q.id] ?? null;
    const isCorrect = chosen === q.correctOptionId;
    if (isCorrect) score++;
    return { ...q, chosen, isCorrect };
  });

  const attempt = await prisma.mockAttempt.create({
    data: {
      userId: session.userId,
      examId,
      answers,
      score,
      total: questions.length,
      timeUsed,
      startedAt: new Date(startedAt),
    },
  });

  return NextResponse.json({
    attemptId: attempt.id,
    score,
    total: questions.length,
    timeUsed,
    scored,
  });
}
