import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PreferenceToggle } from "@/components/PreferenceToggle";

export default async function LeaderboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const memberships = await prisma.cohortMember.findMany({
    where: { userId: session.userId },
    select: { cohortId: true },
  });
  const cohortIds = memberships.map((m) => m.cohortId);

  const me = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { leaderboardOptIn: true },
  });

  let entries: { rank: number; name: string; xp: number; isSelf: boolean }[] = [];
  if (cohortIds.length > 0) {
    const coMembers = await prisma.cohortMember.findMany({
      where: { cohortId: { in: cohortIds }, user: { leaderboardOptIn: true } },
      select: { user: { select: { id: true, name: true, xp: true } } },
    });
    const seen = new Map<string, { id: string; name: string; xp: number }>();
    for (const m of coMembers) seen.set(m.user.id, m.user);
    entries = [...seen.values()]
      .sort((a, b) => b.xp - a.xp)
      .map((u, i) => ({ rank: i + 1, name: u.name, xp: u.xp, isSelf: u.id === session.userId }));
  }

  const medal = (rank: number) => (rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-yellow-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-white rounded-3xl shadow-xl p-6 border-4 border-violet-300">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-violet-700">🏅 Leaderboard</h1>
            <Link href="/dashboard" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl text-xs">
              ← Dashboard
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-1">XP ranking across your cohorts — opted-in members only.</p>
        </div>

        <div className="bg-white rounded-3xl border-4 border-yellow-200 shadow-lg p-5">
          <h2 className="text-sm font-bold text-gray-500 mb-2">Privacy</h2>
          <PreferenceToggle
            field="leaderboardOptIn"
            initial={me?.leaderboardOptIn ?? false}
            label="Show my name & XP on the cohort leaderboard"
            testId="leaderboard-optin-toggle"
          />
        </div>

        <div className="bg-white rounded-3xl border-4 border-violet-100 shadow-lg p-5">
          {cohortIds.length === 0 ? (
            <p className="text-center text-gray-400 text-sm" data-testid="leaderboard-empty">
              You&apos;re not in a cohort yet. Ask your manager to add you.
            </p>
          ) : entries.length === 0 ? (
            <p className="text-center text-gray-400 text-sm" data-testid="leaderboard-empty">
              No one in your cohort has opted in yet. Be the first!
            </p>
          ) : (
            <table className="w-full text-sm" data-testid="leaderboard-table">
              <thead>
                <tr className="text-xs text-gray-400 border-b">
                  <th className="text-left pb-2 w-12">Rank</th>
                  <th className="text-left pb-2">Name</th>
                  <th className="text-right pb-2">XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {entries.map((e) => (
                  <tr key={e.rank} className={e.isSelf ? "bg-violet-50" : ""}>
                    <td className="py-2 font-bold text-violet-600">{medal(e.rank)}</td>
                    <td className="py-2 text-gray-700 font-semibold">
                      {e.name}
                      {e.isSelf && <span className="ml-2 text-xs text-violet-400">(you)</span>}
                    </td>
                    <td className="py-2 text-right text-yellow-600 font-bold">{e.xp.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
