import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const cohort = await prisma.cohort.findUnique({
    where: { id },
    include: { members: { include: { user: { select: { id: true, name: true, email: true, xp: true } } } } },
  });
  if (!cohort) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Compute readiness for each member
  const memberIds = cohort.members.map((m) => m.userId);

  const [allAttempts, allMocks] = await Promise.all([
    prisma.attempt.findMany({
      where: { userId: { in: memberIds } },
      select: { userId: true, score: true, total: true },
    }),
    prisma.mockAttempt.findMany({
      where: { userId: { in: memberIds } },
      select: { userId: true, score: true, total: true },
    }),
  ]);

  const memberStats = cohort.members.map((m) => {
    const attempts = allAttempts.filter((a) => a.userId === m.userId);
    const mocks = allMocks.filter((a) => a.userId === m.userId);
    const avgChallenge = attempts.length === 0 ? 0
      : attempts.reduce((s, a) => s + (a.score / a.total) * 100, 0) / attempts.length;
    const bestMock = mocks.length === 0 ? 0
      : Math.max(...mocks.map((a) => (a.score / a.total) * 100));
    const readiness = Math.round(avgChallenge * 0.5 + bestMock * 0.5);
    return { ...m.user, joinedAt: m.joinedAt, readiness };
  });

  const readyCount = memberStats.filter((m) => m.readiness >= 80).length;

  return NextResponse.json({
    ...cohort,
    memberStats,
    readyCount,
    totalCount: memberStats.length,
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.cohort.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
