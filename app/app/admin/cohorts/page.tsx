import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CreateCohortForm } from "./CreateCohortForm";

export default async function CohortsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const cohorts = await prisma.cohort.findMany({
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-yellow-50 p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="bg-white rounded-3xl shadow-xl p-6 border-4 border-violet-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-violet-700">Cohort Manager</h1>
              <p className="text-gray-400 text-sm mt-0.5">Create teams and track group readiness</p>
            </div>
            <Link href="/admin" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl text-xs">
              ← Admin
            </Link>
          </div>

          <CreateCohortForm />
        </div>

        {cohorts.length === 0 ? (
          <div className="bg-white rounded-3xl border-4 border-gray-100 shadow p-6 text-center text-gray-400">
            No cohorts yet. Create one above.
          </div>
        ) : (
          <div className="space-y-3" data-testid="cohort-list">
            {cohorts.map((c) => (
              <Link
                key={c.id}
                href={`/admin/cohorts/${c.id}`}
                className="flex items-center justify-between bg-white rounded-2xl border-4 border-violet-100 hover:border-violet-300 shadow p-4 transition-all"
              >
                <div>
                  <p className="font-bold text-violet-700">{c.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Code: <span className="font-mono font-semibold">{c.code}</span>
                    {" · "}
                    {c._count.members} member{c._count.members !== 1 ? "s" : ""}
                  </p>
                </div>
                <span className="text-violet-400 text-lg">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
