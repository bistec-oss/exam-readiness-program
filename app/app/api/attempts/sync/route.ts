import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id, challengeSetId, answers } = body;

  if (!id || !challengeSetId || !answers) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Idempotent: skip if already synced (id used as idempotency key)
  const existing = await prisma.attempt.findUnique({ where: { idempotencyKey: id } });
  if (existing) return NextResponse.json({ synced: true, attempt: existing });

  const challengeSet = await prisma.challengeSet.findUnique({
    where: { id: challengeSetId },
    include: { questions: { select: { id: true, correctOptionId: true } } },
  });
  if (!challengeSet) return NextResponse.json({ error: "Challenge set not found" }, { status: 404 });

  const total = challengeSet.questions.length;
  const score = challengeSet.questions.filter(
    (q) => answers[q.id] === q.correctOptionId
  ).length;

  const xpEarned = Math.round((score / total) * challengeSet.xpReward);

  const attempt = await prisma.attempt.create({
    data: {
      userId: session.userId,
      challengeSetId,
      answers,
      score,
      total,
      xpEarned,
      idempotencyKey: id,
    },
  });

  await prisma.user.update({
    where: { id: session.userId },
    data: { xp: { increment: xpEarned } },
  });

  return NextResponse.json({ synced: true, attempt }, { status: 201 });
}
