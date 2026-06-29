import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      challengeSets: {
        include: { _count: { select: { questions: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!exam) redirect("/exams");

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-yellow-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/exams" className="text-violet-600 hover:text-violet-800 font-semibold text-sm">
            ← Exams
          </Link>
        </div>

        <div className="bg-white rounded-3xl border-4 border-violet-300 shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-extrabold text-violet-700">{exam.name}</h1>
          <p className="text-gray-600 mt-2">{exam.description}</p>
          <div className="flex flex-wrap gap-3 mt-4 text-sm font-semibold">
            <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full">
              ✅ Pass: {exam.passingScore}%
            </span>
            <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full">
              ⏱ {exam.durationMinutes} min
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-violet-700">Challenge Sets</h2>
          <Link
            href={`/mock-exam/${exam.id}`}
            className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl text-sm transition-colors"
          >
            🎯 Full Mock Exam
          </Link>
        </div>

        <div className="grid gap-4">
          {exam.challengeSets.map((cs) => (
            <Link
              key={cs.id}
              href={`/challenges/${cs.id}/play`}
              className="bg-white rounded-3xl border-4 border-yellow-200 hover:border-yellow-400 shadow-lg p-6 block transition-all hover:shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-violet-700">{cs.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">Topic: {cs.topic}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {cs._count.questions} questions
                  </p>
                </div>
                <span className="bg-yellow-100 text-yellow-700 font-bold px-3 py-1 rounded-full text-sm whitespace-nowrap">
                  +{cs.xpReward} XP
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
