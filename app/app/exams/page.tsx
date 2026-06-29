import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ExamsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const exams = await prisma.exam.findMany({
    include: { _count: { select: { challengeSets: true, questions: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-yellow-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="text-violet-600 hover:text-violet-800 font-semibold text-sm">
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-violet-700">Exam Catalog 🎯</h1>
        </div>

        {exams.length === 0 ? (
          <div className="bg-white rounded-3xl border-4 border-violet-200 shadow-xl p-8 text-center text-gray-500">
            No exams available yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {exams.map((exam) => (
              <Link
                key={exam.id}
                href={`/exams/${exam.id}`}
                className="bg-white rounded-3xl border-4 border-violet-200 hover:border-violet-400 shadow-lg p-6 block transition-all hover:shadow-xl"
              >
                <h2 className="text-xl font-bold text-violet-700">{exam.name}</h2>
                <p className="text-gray-600 text-sm mt-2">{exam.description}</p>
                <div className="flex flex-wrap gap-3 mt-4 text-sm font-semibold">
                  <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full">
                    ✅ Pass: {exam.passingScore}%
                  </span>
                  <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full">
                    ⏱ {exam.durationMinutes} min
                  </span>
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                    📚 {exam._count.challengeSets} challenge sets
                  </span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    ❓ {exam._count.questions} questions
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
