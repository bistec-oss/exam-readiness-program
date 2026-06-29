import { prisma } from "@/lib/prisma";
import { updateChallengeSet } from "@/app/actions/admin";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function EditChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [cs, exams] = await Promise.all([
    prisma.challengeSet.findUnique({ where: { id } }),
    prisma.exam.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!cs) redirect("/admin/challenges");

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/challenges" className="text-xs text-violet-600 hover:underline">← Challenges</Link>
        <h1 className="text-2xl font-extrabold text-gray-800">Edit Challenge Set</h1>
      </div>
      <div className="bg-white rounded-2xl border-2 border-violet-100 shadow p-6 max-w-xl">
        <form action={updateChallengeSet} className="grid grid-cols-2 gap-4">
          <input type="hidden" name="id" value={cs.id} />
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-1">Title</label>
            <input name="title" defaultValue={cs.title} required className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Topic</label>
            <input name="topic" defaultValue={cs.topic} required className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">XP Reward</label>
            <input name="xpReward" type="number" defaultValue={cs.xpReward} required className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-1">Exam</label>
            <select name="examId" defaultValue={cs.examId} required className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none">
              {exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="col-span-2 flex gap-3">
            <button type="submit" className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm transition-colors">Save Changes</button>
            <Link href="/admin/challenges" className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
