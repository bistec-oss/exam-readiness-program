import { prisma } from "@/lib/prisma";
import { createExam, deleteExam } from "@/app/actions/admin";
import Link from "next/link";

export default async function AdminExamsPage() {
  const exams = await prisma.exam.findMany({
    include: { _count: { select: { challengeSets: true, questions: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-800 mb-6">Exams</h1>

      {/* Exam list */}
      <div className="bg-white rounded-2xl border-2 border-gray-100 shadow mb-8 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["Name", "Pass %", "Duration", "Sets", "Qs", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {exams.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-800">{e.name}</td>
                <td className="px-4 py-3 text-gray-600">{e.passingScore}%</td>
                <td className="px-4 py-3 text-gray-600">{e.durationMinutes}m</td>
                <td className="px-4 py-3 text-gray-600">{e._count.challengeSets}</td>
                <td className="px-4 py-3 text-gray-600">{e._count.questions}</td>
                <td className="px-4 py-3 flex gap-2">
                  <Link href={`/admin/exams/${e.id}/edit`} className="text-xs text-violet-600 hover:underline font-semibold">Edit</Link>
                  <form action={deleteExam}>
                    <input type="hidden" name="id" value={e.id} />
                    <button className="text-xs text-red-500 hover:underline font-semibold" type="submit">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {exams.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No exams yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create form */}
      <div className="bg-white rounded-2xl border-2 border-violet-100 shadow p-6">
        <h2 className="text-lg font-bold text-gray-700 mb-4">Create New Exam</h2>
        <form action={createExam} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-1">Name</label>
            <input name="name" required className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
            <textarea name="description" required rows={2} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Passing Score (%)</label>
            <input name="passingScore" type="number" min="1" max="100" defaultValue="70" required className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Duration (minutes)</label>
            <input name="durationMinutes" type="number" min="1" defaultValue="90" required className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none" />
          </div>
          <div className="col-span-2">
            <button type="submit" className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm transition-colors">
              Create Exam
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
