import { prisma } from "@/lib/prisma";
import { updateExam } from "@/app/actions/admin";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function EditExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam) redirect("/admin/exams");

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/exams" className="text-xs text-violet-600 hover:underline">← Exams</Link>
        <h1 className="text-2xl font-extrabold text-gray-800">Edit Exam</h1>
      </div>
      <div className="bg-white rounded-2xl border-2 border-violet-100 shadow p-6 max-w-xl">
        <form action={updateExam} className="grid grid-cols-2 gap-4">
          <input type="hidden" name="id" value={exam.id} />
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-1">Name</label>
            <input name="name" defaultValue={exam.name} required className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
            <textarea name="description" defaultValue={exam.description} required rows={3} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Passing Score (%)</label>
            <input name="passingScore" type="number" defaultValue={exam.passingScore} required className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Duration (minutes)</label>
            <input name="durationMinutes" type="number" defaultValue={exam.durationMinutes} required className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-violet-400 outline-none" />
          </div>
          <div className="col-span-2 flex gap-3">
            <button type="submit" className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm transition-colors">
              Save Changes
            </button>
            <Link href="/admin/exams" className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
