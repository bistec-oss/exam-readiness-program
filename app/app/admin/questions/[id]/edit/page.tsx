import { prisma } from "@/lib/prisma";
import { updateQuestion } from "@/app/actions/admin";
import { redirect } from "next/navigation";
import Link from "next/link";

type Option = { id: string; text: string };

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [q, exams, challengeSets] = await Promise.all([
    prisma.question.findUnique({ where: { id } }),
    prisma.exam.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.challengeSet.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);
  if (!q) redirect("/admin/questions");

  const options = q.options as Option[];
  const optionMap = Object.fromEntries(options.map((o) => [o.id, o.text]));

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/questions" className="text-xs text-violet-600 hover:underline">← Questions</Link>
        <h1 className="text-2xl font-extrabold text-gray-800">Edit Question</h1>
      </div>
      <div className="bg-white rounded-2xl border-2 border-violet-100 shadow p-6 max-w-2xl">
        <form action={updateQuestion} className="grid grid-cols-2 gap-4">
          <input type="hidden" name="id" value={q.id} />
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-1">Question Text</label>
            <textarea name="text" defaultValue={q.text} required rows={2} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-1">Preamble (optional)</label>
            <textarea name="preamble" defaultValue={q.preamble ?? ""} rows={2} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:border-violet-400 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Type</label>
            <select name="type" defaultValue={q.type} required className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none">
              <option value="MCQ">MCQ</option>
              <option value="TRUE_FALSE">True / False</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Correct Answer ID</label>
            <input name="correctOptionId" defaultValue={q.correctOptionId} required className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none" />
          </div>
          {["a", "b", "c", "d"].map((optId) => (
            <div key={optId}>
              <label className="block text-xs font-bold text-gray-500 mb-1">Option {optId.toUpperCase()}</label>
              <input name={`option_${optId}`} defaultValue={optionMap[optId] ?? ""} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none" />
            </div>
          ))}
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-1">Explanation</label>
            <textarea name="explanation" defaultValue={q.explanation} required rows={2} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Exam</label>
            <select name="examId" defaultValue={q.examId} required className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none">
              {exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Challenge Set</label>
            <select name="challengeSetId" defaultValue={q.challengeSetId ?? ""} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none">
              <option value="">None</option>
              {challengeSets.map((cs) => <option key={cs.id} value={cs.id}>{cs.title}</option>)}
            </select>
          </div>
          <div className="col-span-2 flex gap-3">
            <button type="submit" className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm transition-colors">Save Changes</button>
            <Link href="/admin/questions" className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
