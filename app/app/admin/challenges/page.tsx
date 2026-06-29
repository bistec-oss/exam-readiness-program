import { prisma } from "@/lib/prisma";
import { createChallengeSet, deleteChallengeSet } from "@/app/actions/admin";
import Link from "next/link";

export default async function AdminChallengesPage() {
  const [challenges, exams] = await Promise.all([
    prisma.challengeSet.findMany({
      include: { exam: { select: { name: true } }, _count: { select: { questions: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.exam.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-800 mb-6">Challenge Sets</h1>

      <div className="bg-white rounded-2xl border-2 border-gray-100 shadow mb-8 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["Title", "Topic", "Exam", "XP", "Qs", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {challenges.map((cs) => (
              <tr key={cs.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-800">{cs.title}</td>
                <td className="px-4 py-3 text-gray-600">{cs.topic}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{cs.exam.name}</td>
                <td className="px-4 py-3 text-yellow-600 font-semibold">{cs.xpReward}</td>
                <td className="px-4 py-3 text-gray-600">{cs._count.questions}</td>
                <td className="px-4 py-3 flex gap-2">
                  <Link href={`/admin/challenges/${cs.id}/edit`} className="text-xs text-violet-600 hover:underline font-semibold">Edit</Link>
                  <form action={deleteChallengeSet}>
                    <input type="hidden" name="id" value={cs.id} />
                    <button type="submit" className="text-xs text-red-500 hover:underline font-semibold">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
            {challenges.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No challenge sets yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-2xl border-2 border-violet-100 shadow p-6">
        <h2 className="text-lg font-bold text-gray-700 mb-4">Create Challenge Set</h2>
        <form action={createChallengeSet} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-1">Title</label>
            <input name="title" required className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Topic</label>
            <input name="topic" required className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">XP Reward</label>
            <input name="xpReward" type="number" min="1" defaultValue="50" required className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-1">Exam</label>
            <select name="examId" required className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none">
              <option value="">Select exam…</option>
              {exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <button type="submit" className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm transition-colors">
              Create Challenge Set
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
