import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { buildPdf, type PdfLine } from "@/lib/pdf";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user, attempts, mockAttempts, allChallengeSets] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId }, select: { xp: true, name: true } }),
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

  const avgChallenge = attempts.length === 0
    ? 0
    : attempts.reduce((s, a) => s + (a.score / a.total) * 100, 0) / attempts.length;
  const bestMock = mockAttempts.length === 0
    ? 0
    : Math.max(...mockAttempts.map((m) => (m.score / m.total) * 100));
  const readiness = Math.round(avgChallenge * 0.5 + bestMock * 0.5);

  // Weak topics (lowest average score first).
  const topicMap: Record<string, { sum: number; count: number }> = {};
  for (const a of attempts) {
    const t = a.challengeSet.topic;
    (topicMap[t] ??= { sum: 0, count: 0 });
    topicMap[t].sum += (a.score / a.total) * 100;
    topicMap[t].count++;
  }
  const weakTopics = Object.entries(topicMap)
    .map(([topic, { sum, count }]) => ({ topic, avgScore: Math.round(sum / count) }))
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 3);

  const completedSetIds = new Set(attempts.map((a) => a.challengeSet.id));
  const allChallengesDone = allChallengeSets.length > 0 && allChallengeSets.every((cs) => completedSetIds.has(cs.id));
  const badges = [
    { label: "First Step", earned: attempts.length > 0 },
    { label: "Halfway There", earned: readiness >= 50 },
    { label: "Challenge Master", earned: allChallengesDone },
  ];

  const lines: PdfLine[] = [
    { text: "Exam Readiness Report", size: 22 },
    { text: "Bistec Global Exam Readiness Program", size: 11, gap: 26 },
    { text: `Candidate: ${user?.name ?? session.name}`, size: 12, gap: 30 },
    { text: `Email: ${session.email}`, size: 11 },
    { text: `Overall readiness: ${readiness}%`, size: 14, gap: 28 },
    { text: `Total XP: ${user?.xp ?? 0}`, size: 11, gap: 20 },
    { text: `Average challenge score: ${Math.round(avgChallenge)}%`, size: 11 },
    { text: `Best mock-exam score: ${Math.round(bestMock)}%`, size: 11 },
    { text: `Challenge attempts: ${attempts.length}   Mock attempts: ${mockAttempts.length}`, size: 11 },
    { text: "Weak topics:", size: 12, gap: 28 },
  ];
  if (weakTopics.length) {
    for (const w of weakTopics) lines.push({ text: `  - ${w.topic}: ${w.avgScore}%`, size: 11, gap: 16 });
  } else {
    lines.push({ text: "  - No attempts yet", size: 11, gap: 16 });
  }
  lines.push({ text: "Badges earned:", size: 12, gap: 28 });
  const earned = badges.filter((b) => b.earned).map((b) => b.label);
  lines.push({ text: earned.length ? `  ${earned.join(", ")}` : "  None yet", size: 11, gap: 16 });

  const pdf = buildPdf(lines);
  const filename = `readiness-report-${(user?.name ?? "candidate").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}.pdf`;

  // Convert Buffer to a fresh Uint8Array for the Web Response body.
  return new Response(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
