import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { challengeSetId, answers, score, total, xpEarned, idempotencyKey } = body;

  if (idempotencyKey) {
    const existing = await prisma.attempt.findUnique({ where: { idempotencyKey } });
    if (existing) return NextResponse.json(existing);
  }

  const attempt = await prisma.attempt.create({
    data: {
      userId: session.userId,
      challengeSetId,
      answers,
      score,
      total,
      xpEarned,
      idempotencyKey,
    },
  });

  await prisma.user.update({
    where: { id: session.userId },
    data: { xp: { increment: xpEarned } },
  });

  return NextResponse.json(attempt, { status: 201 });
}
