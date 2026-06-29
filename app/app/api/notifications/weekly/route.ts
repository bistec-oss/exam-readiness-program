import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { buildWeeklySummary } from "@/lib/email";
import { NextResponse } from "next/server";

function readiness(
  attempts: { score: number; total: number }[],
  mocks: { score: number; total: number }[]
) {
  const avg =
    attempts.length === 0
      ? 0
      : attempts.reduce((s, a) => s + (a.score / a.total) * 100, 0) / attempts.length;
  const best = mocks.length === 0 ? 0 : Math.max(...mocks.map((m) => (m.score / m.total) * 100));
  return { value: Math.round(avg * 0.5 + best * 0.5), bestMock: Math.round(best) };
}

/**
 * Admin-triggered weekly summary run. Generates a readiness email for every
 * candidate who opted in and persists it to EmailLog (stands in for SMTP).
 */
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    where: { weeklyEmailOptIn: true },
    select: {
      id: true,
      name: true,
      xp: true,
      attempts: {
        select: { score: true, total: true, challengeSet: { select: { topic: true } } },
      },
      mockAttempts: { select: { score: true, total: true } },
    },
  });

  const logs = users.map((u) => {
    const { value, bestMock } = readiness(u.attempts, u.mockAttempts);

    const topicMap: Record<string, { sum: number; count: number }> = {};
    for (const a of u.attempts) {
      const t = a.challengeSet.topic;
      if (!topicMap[t]) topicMap[t] = { sum: 0, count: 0 };
      topicMap[t].sum += (a.score / a.total) * 100;
      topicMap[t].count++;
    }
    const weakTopics = Object.entries(topicMap)
      .map(([topic, { sum, count }]) => ({ topic, avgScore: Math.round(sum / count) }))
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 3);

    const { subject, body } = buildWeeklySummary({
      name: u.name,
      readiness: value,
      xp: u.xp,
      challengesCompleted: u.attempts.length,
      bestMockScore: bestMock,
      weakTopics,
    });

    return { userId: u.id, type: "WEEKLY_SUMMARY", subject, body };
  });

  if (logs.length > 0) {
    await prisma.emailLog.createMany({ data: logs });
  }

  return NextResponse.json({ sent: logs.length }, { status: 201 });
}
