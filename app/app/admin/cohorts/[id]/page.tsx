import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { AddMemberForm } from "./AddMemberForm";
import { RemoveMemberButton } from "./RemoveMemberButton";

async function getCohortStats(cohortId: string) {
  const cohort = await prisma.cohort.findUnique({
    where: { id: cohortId },
    include: { members: { include: { user: { select: { id: true, name: true, email: true, xp: true } } } } },
  });
  if (!cohort) return null;

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
  return { cohort, memberStats, readyCount };
}

export default async function CohortDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;
  const data = await getCohortStats(id);
  if (!data) notFound();

  const { cohort, memberStats, readyCount } = data;
  const total = memberStats.length;
  const pct = total === 0 ? 0 : Math.round((readyCount / total) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-yellow-50 p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border-4 border-violet-300">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-extrabold text-violet-700">{cohort.name}</h1>
            <Link href="/admin/cohorts" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl text-xs">
              ← Cohorts
            </Link>
          </div>
          <p className="text-xs text-gray-400">
            Join code: <span className="font-mono font-bold text-violet-500">{cohort.code}</span>
          </p>
        </div>

        {/* Readiness summary */}
        <div
          className="bg-white rounded-3xl border-4 border-violet-200 shadow-lg p-5"
          data-testid="cohort-readiness-summary"
        >
          <h2 className="text-sm font-bold text-gray-500 mb-3">Team Readiness</h2>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-extrabold text-violet-700">
              {readyCount}/{total}
            </div>
            <div>
              <p className="font-semibold text-gray-700">
                members ≥ 80% ready
              </p>
              <p className="text-xs text-gray-400">{pct}% of team on track</p>
            </div>
          </div>
          {total > 0 && (
            <div className="mt-3 bg-violet-100 rounded-full h-3">
              <div
                className="bg-violet-500 h-3 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
        </div>

        {/* Add member */}
        <div className="bg-white rounded-3xl border-4 border-green-100 shadow-lg p-5">
          <h2 className="text-sm font-bold text-gray-500 mb-3">Add Member</h2>
          <AddMemberForm cohortId={cohort.id} />
        </div>

        {/* Member table */}
        {memberStats.length > 0 ? (
          <div className="bg-white rounded-3xl border-4 border-violet-100 shadow-lg p-5">
            <h2 className="text-sm font-bold text-gray-500 mb-3">Members ({total})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="cohort-members-table">
                <thead>
                  <tr className="text-xs text-gray-400 border-b">
                    <th className="text-left pb-2">Name</th>
                    <th className="text-left pb-2">Email</th>
                    <th className="text-right pb-2">Readiness</th>
                    <th className="text-right pb-2">XP</th>
                    <th className="text-right pb-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {memberStats.map((m) => (
                    <tr key={m.id}>
                      <td className="py-2 text-gray-700 font-semibold">{m.name}</td>
                      <td className="py-2 text-gray-400 text-xs">{m.email}</td>
                      <td className="py-2 text-right">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            m.readiness >= 80
                              ? "bg-green-100 text-green-700"
                              : m.readiness >= 50
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {m.readiness}%
                        </span>
                      </td>
                      <td className="py-2 text-right text-yellow-600 font-semibold">{m.xp}</td>
                      <td className="py-2 text-right">
                        <RemoveMemberButton cohortId={cohort.id} userId={m.id} userName={m.name} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border-4 border-gray-100 shadow p-6 text-center text-gray-400 text-sm">
            No members yet. Add members above.
          </div>
        )}
      </div>
    </div>
  );
}
