import { prisma } from "@/lib/prisma";
import { createQuestion, deleteQuestion } from "@/app/actions/admin";
import Link from "next/link";

export default async function AdminQuestionsPage() {
  const [questions, exams, challengeSets] = await Promise.all([
    prisma.question.findMany({
      include: {
        exam: { select: { name: true } },
        challengeSet: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.exam.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.challengeSet.findMany({ select: { id: true, title: true, examId: true }, orderBy: { title: "asc" } }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-800">Questions</h1>
        <Link href="/admin/questions/import" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition-colors">
          Bulk Import CSV
        </Link>
      </div>

      <div className="bg-white rounded-2xl border-2 border-gray-100 shadow mb-8 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["Question", "Type", "Exam", "Challenge Set", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {questions.map((q) => (
              <tr key={q.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-800 max-w-xs truncate">{q.text}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${q.type === "MCQ" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>
                    {q.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{q.exam.name}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{q.challengeSet?.title ?? "—"}</td>
                <td className="px-4 py-3 flex gap-2">
                  <Link href={`/admin/questions/${q.id}/edit`} className="text-xs text-violet-600 hover:underline font-semibold">Edit</Link>
                  <form action={deleteQuestion}>
                    <input type="hidden" name="id" value={q.id} />
                    <button type="submit" className="text-xs text-red-500 hover:underline font-semibold">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
            {questions.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No questions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create form */}
      <div className="bg-white rounded-2xl border-2 border-violet-100 shadow p-6">
        <h2 className="text-lg font-bold text-gray-700 mb-4">Add Question</h2>
        <form action={createQuestion} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-1">Question Text</label>
            <textarea name="text" required rows={2} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-1">Preamble (optional code/context)</label>
            <textarea name="preamble" rows={2} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:border-violet-400 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Type</label>
            <select name="type" required className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none">
              <option value="MCQ">MCQ (4 options)</option>
              <option value="TRUE_FALSE">True / False</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Correct Answer ID</label>
            <input name="correctOptionId" required placeholder="a, b, c, d — or true/false" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none" />
          </div>
          {["a", "b", "c", "d"].map((id) => (
            <div key={id}>
              <label className="block text-xs font-bold text-gray-500 mb-1">Option {id.toUpperCase()}</label>
              <input name={`option_${id}`} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none" placeholder={id === "a" || id === "b" ? "required for MCQ" : "optional"} />
            </div>
          ))}
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-1">Explanation</label>
            <textarea name="explanation" required rows={2} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Exam</label>
            <select name="examId" required className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none">
              <option value="">Select exam…</option>
              {exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Challenge Set (optional)</label>
            <select name="challengeSetId" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none">
              <option value="">None (exam-level only)</option>
              {challengeSets.map((cs) => <option key={cs.id} value={cs.id}>{cs.title}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <button type="submit" className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm transition-colors">
              Add Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
