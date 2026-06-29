import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

function computeReadiness(attempts: { score: number; total: number }[], mocks: { score: number; total: number }[]) {
  const avgChallenge =
    attempts.length === 0
      ? 0
      : attempts.reduce((sum, a) => sum + (a.score / a.total) * 100, 0) / attempts.length;

  const bestMock =
    mocks.length === 0
      ? 0
      : Math.max(...mocks.map((m) => (m.score / m.total) * 100));

  return Math.round(avgChallenge * 0.5 + bestMock * 0.5);
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user, attempts, mockAttempts, allChallengeSets] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId }, select: { xp: true } }),
    prisma.attempt.findMany({
      where: { userId: session.userId },
      include: { challengeSet: { select: { id: true, title: true, topic: true } } },
      orderBy: { completedAt: "desc" },
    }),
    prisma.mockAttempt.findMany({
      where: { userId: session.userId },
      include: { exam: { select: { name: true } } },
      orderBy: { completedAt: "desc" },
    }),
    prisma.challengeSet.findMany({ select: { id: true } }),
  ]);

  const readiness = computeReadiness(attempts, mockAttempts);

  const avgChallengeScore =
    attempts.length === 0
      ? 0
      : Math.round(attempts.reduce((s, a) => s + (a.score / a.total) * 100, 0) / attempts.length);

  const bestMockScore =
    mockAttempts.length === 0
      ? 0
      : Math.round(Math.max(...mockAttempts.map((m) => (m.score / m.total) * 100)));

  // Weak topics: group attempts by topic, compute avg score
  const topicMap: Record<string, { sum: number; count: number }> = {};
  for (const a of attempts) {
    const topic = a.challengeSet.topic;
    if (!topicMap[topic]) topicMap[topic] = { sum: 0, count: 0 };
    topicMap[topic].sum += (a.score / a.total) * 100;
    topicMap[topic].count++;
  }
  const weakTopics = Object.entries(topicMap)
    .map(([topic, { sum, count }]) => ({ topic, avgScore: Math.round(sum / count) }))
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 3);

  const completedSetIds = new Set(attempts.map((a) => a.challengeSet.id));
  const allChallengesDone = allChallengeSets.length > 0 && allChallengeSets.every((cs) => completedSetIds.has(cs.id));

  const badges = [
    { id: "first-attempt", label: "First Step", emoji: "🌱", earned: attempts.length > 0 },
    { id: "half-ready", label: "Halfway There", emoji: "⚡", earned: readiness >= 50 },
    { id: "all-challenges", label: "Challenge Master", emoji: "🏆", earned: allChallengesDone },
  ];

  return NextResponse.json({
    xp: user?.xp ?? 0,
    readiness,
    avgChallengeScore,
    bestMockScore,
    weakTopics,
    allChallengesDone,
    badges,
    attempts: attempts.map((a) => ({
      id: a.id,
      challengeSetId: a.challengeSet.id,
      challengeSetTitle: a.challengeSet.title,
      topic: a.challengeSet.topic,
      score: a.score,
      total: a.total,
      xpEarned: a.xpEarned,
      completedAt: a.completedAt,
    })),
    mockAttempts: mockAttempts.map((m) => ({
      id: m.id,
      examName: m.exam.name,
      score: m.score,
      total: m.total,
      timeUsed: m.timeUsed,
      completedAt: m.completedAt,
    })),
  });
}
