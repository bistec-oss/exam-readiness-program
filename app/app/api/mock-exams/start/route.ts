import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { examId } = await request.json();

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true, name: true, durationMinutes: true },
  });
  if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

  const questions = await prisma.question.findMany({
    where: { examId },
    select: { id: true, text: true, preamble: true, type: true, options: true },
  });

  const shuffled = shuffle(questions);
  const startedAt = new Date().toISOString();

  return NextResponse.json({
    examId,
    startedAt,
    durationMinutes: exam.durationMinutes,
    questions: shuffled,
  });
}
