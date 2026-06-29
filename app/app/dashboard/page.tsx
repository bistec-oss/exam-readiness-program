import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import Link from "next/link";

function ReadinessGauge({ pct }: { pct: number }) {
  const r = 48;
  const circumference = 2 * Math.PI * r;
  const dash = Math.min(pct / 100, 1) * circumference;
  const color = pct >= 70 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#8b5cf6";
  return (
    <svg width="130" height="130" viewBox="0 0 120 120" aria-label={`${pct}% readiness`}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="#ede9fe" strokeWidth="12" />
      <circle
        cx="60" cy="60" r={r} fill="none"
        stroke={color} strokeWidth="12"
        strokeDasharray={`${dash} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="56" textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize="22" fontWeight="800">{pct}%</text>
      <text x="60" y="76" textAnchor="middle" fill="#9ca3af" fontSize="9">Readiness</text>
    </svg>
  );
}

function computeReadiness(
  attempts: { score: number; total: number }[],
  mocks: { score: number; total: number }[]
) {
  const avg = attempts.length === 0 ? 0
    : attempts.reduce((s, a) => s + (a.score / a.total) * 100, 0) / attempts.length;
  const best = mocks.length === 0 ? 0
    : Math.max(...mocks.map((m) => (m.score / m.total) * 100));
  return Math.round(avg * 0.5 + best * 0.5);
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [user, attempts, mockAttempts, allChallengeSets] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId }, select: { xp: true } }),
    prisma.attempt.findMany({
      where: { userId: session.userId },
      include: { challengeSet: { select: { id: true, title: true, topic: true } } },
      orderBy: { completedAt: "desc" },
    }),
    prisma.mockAttempt.findMany({
      where: { userId: session.userId },
      include: { exam: { select: { name: true, passingScore: true } } },
      orderBy: { completedAt: "desc" },
    }),
    prisma.challengeSet.findMany({ select: { id: true } }),
  ]);

  const xp = user?.xp ?? 0;
  const readiness = computeReadiness(attempts, mockAttempts);
  const completedSetIds = new Set(attempts.map((a) => a.challengeSet.id));
  const allChallengesDone =
    allChallengeSets.length > 0 && allChallengeSets.every((cs) => completedSetIds.has(cs.id));

  const badges = [
    { id: "first-attempt", label: "First Step", emoji: "🌱", earned: attempts.length > 0 },
    { id: "half-ready", label: "Halfway There", emoji: "⚡", earned: readiness >= 50 },
    { id: "all-challenges", label: "Challenge Master", emoji: "🏆", earned: allChallengesDone },
  ];

  // Weak topics
  const topicMap: Record<string, { sum: number; count: number }> = {};
  for (const a of attempts) {
    const t = a.challengeSet.topic;
    if (!topicMap[t]) topicMap[t] = { sum: 0, count: 0 };
    topicMap[t].sum += (a.score / a.total) * 100;
    topicMap[t].count++;
  }
  const weakTopics = Object.entries(topicMap)
    .map(([topic, { sum, count }]) => ({ topic, avg: Math.round(sum / count) }))
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-yellow-50 p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border-4 border-violet-300">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-violet-700">Hey, {session.name}! 👋</h1>
              <p className="text-gray-400 text-sm mt-0.5">{session.role}</p>
            </div>
            <form action={logout}>
              <button type="submit" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl text-xs transition-colors">
                Sign out
              </button>
            </form>
          </div>

          {/* XP bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs font-semibold text-violet-600 mb-1">
              <span>⭐ XP</span>
              <span>{xp.toLocaleString()} XP</span>
            </div>
            <div className="bg-violet-100 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-violet-400 to-pink-400 h-4 rounded-full transition-all"
                style={{ width: `${Math.min((xp / 500) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-0.5 text-right">{xp}/500 to next level</p>
          </div>
        </div>

        {/* Readiness + badges */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl border-4 border-violet-200 shadow-lg p-4 flex flex-col items-center justify-center">
            <ReadinessGauge pct={readiness} />
          </div>
          <div className="bg-white rounded-3xl border-4 border-yellow-200 shadow-lg p-4">
            <h2 className="text-sm font-bold text-gray-500 mb-3">Badges</h2>
            <div className="space-y-2">
              {badges.map((b) => (
                <div key={b.id} className={`flex items-center gap-2 p-2 rounded-xl text-sm font-semibold ${b.earned ? "bg-yellow-50 text-yellow-700" : "bg-gray-50 text-gray-300"}`}>
                  <span className="text-lg">{b.emoji}</span>
                  <span>{b.label}</span>
                  {b.earned && <span className="ml-auto text-xs text-yellow-500">✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weak topics */}
        {weakTopics.length > 0 && (
          <div className="bg-white rounded-3xl border-4 border-red-100 shadow-lg p-5">
            <h2 className="text-sm font-bold text-gray-500 mb-3">Weak Topics</h2>
            <div className="space-y-2">
              {weakTopics.map((t) => (
                <div key={t.topic} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 flex-1">{t.topic}</span>
                  <div className="w-24 bg-gray-100 rounded-full h-2">
                    <div className="bg-red-400 h-2 rounded-full" style={{ width: `${t.avg}%` }} />
                  </div>
                  <span className="text-xs font-bold text-red-500 w-9 text-right">{t.avg}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/exams" className="bg-white rounded-3xl border-4 border-violet-200 hover:border-violet-400 shadow-lg p-5 block transition-all">
            <div className="text-3xl mb-1">🎯</div>
            <h2 className="font-bold text-violet-700">Exam Catalog</h2>
            <p className="text-xs text-gray-500 mt-0.5">Challenge sets & mock exams</p>
          </Link>
          {session.role === "ADMIN" && (
            <Link href="/admin" className="bg-white rounded-3xl border-4 border-yellow-200 hover:border-yellow-400 shadow-lg p-5 block transition-all">
              <div className="text-3xl mb-1">⚙️</div>
              <h2 className="font-bold text-yellow-700">Admin Panel</h2>
              <p className="text-xs text-gray-500 mt-0.5">Manage exams & questions</p>
            </Link>
          )}
        </div>

        {/* Download report */}
        <a
          href="/api/report/pdf"
          download
          className="flex items-center gap-3 bg-white rounded-3xl border-4 border-green-200 hover:border-green-400 shadow-lg p-5 transition-all"
          data-testid="download-report-btn"
        >
          <div className="text-3xl">📄</div>
          <div>
            <h2 className="font-bold text-green-700">Download Score Report</h2>
            <p className="text-xs text-gray-500 mt-0.5">Download PDF score report</p>
          </div>
        </a>

        {/* Challenge history */}
        {attempts.length > 0 && (
          <div className="bg-white rounded-3xl border-4 border-violet-100 shadow-lg p-5">
            <h2 className="text-sm font-bold text-gray-500 mb-3">Challenge History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b">
                    <th className="text-left pb-2">Challenge</th>
                    <th className="text-right pb-2">Score</th>
                    <th className="text-right pb-2">XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {attempts.slice(0, 5).map((a) => (
                    <tr key={a.id}>
                      <td className="py-2 text-gray-700">{a.challengeSet.title}</td>
                      <td className="py-2 text-right font-semibold text-violet-600">
                        {a.score}/{a.total} ({Math.round((a.score / a.total) * 100)}%)
                      </td>
                      <td className="py-2 text-right text-yellow-600 font-semibold">+{a.xpEarned}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mock exam history */}
        {mockAttempts.length > 0 && (
          <div className="bg-white rounded-3xl border-4 border-pink-100 shadow-lg p-5">
            <h2 className="text-sm font-bold text-gray-500 mb-3">Mock Exam History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b">
                    <th className="text-left pb-2">Exam</th>
                    <th className="text-right pb-2">Score</th>
                    <th className="text-right pb-2">Time</th>
                    <th className="text-right pb-2">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {mockAttempts.slice(0, 5).map((m) => {
                    const pct = Math.round((m.score / m.total) * 100);
                    const mins = Math.floor(m.timeUsed / 60);
                    const secs = m.timeUsed % 60;
                    const passed = pct >= m.exam.passingScore;
                    return (
                      <tr key={m.id}>
                        <td className="py-2 text-gray-700">{m.exam.name}</td>
                        <td className="py-2 text-right font-semibold text-pink-600">
                          {m.score}/{m.total} ({pct}%)
                        </td>
                        <td className="py-2 text-right text-gray-500">
                          {mins}:{secs.toString().padStart(2, "0")}
                        </td>
                        <td className="py-2 text-right">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                            {passed ? "Pass" : "Fail"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {attempts.length === 0 && mockAttempts.length === 0 && (
          <div className="bg-white rounded-3xl border-4 border-gray-100 shadow p-6 text-center text-gray-400">
            No activity yet. Start with a challenge set!
          </div>
        )}
      </div>
    </div>
  );
}
