import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

/**
 * Opt-in XP leaderboard scoped to the cohorts the requester belongs to.
 * Only users who set leaderboardOptIn = true appear. Ranking is by XP desc.
 * Viewing is always allowed; appearing requires opting in.
 */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Cohorts the requester is a member of
  const memberships = await prisma.cohortMember.findMany({
    where: { userId: session.userId },
    select: { cohortId: true },
  });
  const cohortIds = memberships.map((m) => m.cohortId);

  const me = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { leaderboardOptIn: true },
  });

  if (cohortIds.length === 0) {
    return NextResponse.json({
      optedIn: me?.leaderboardOptIn ?? false,
      inCohort: false,
      entries: [],
    });
  }

  // Distinct opted-in users sharing at least one cohort with the requester
  const coMembers = await prisma.cohortMember.findMany({
    where: { cohortId: { in: cohortIds }, user: { leaderboardOptIn: true } },
    select: { user: { select: { id: true, name: true, xp: true } } },
  });

  const seen = new Map<string, { id: string; name: string; xp: number }>();
  for (const m of coMembers) seen.set(m.user.id, m.user);

  const entries = [...seen.values()]
    .sort((a, b) => b.xp - a.xp)
    .map((u, i) => ({
      rank: i + 1,
      name: u.name,
      xp: u.xp,
      isSelf: u.id === session.userId,
    }));

  return NextResponse.json({
    optedIn: me?.leaderboardOptIn ?? false,
    inCohort: true,
    entries,
  });
}
