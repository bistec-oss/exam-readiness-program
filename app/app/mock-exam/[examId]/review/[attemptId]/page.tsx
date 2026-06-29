import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

type Option = { id: string; text: string };

export default async function MockExamReviewPage({
  params,
}: {
  params: Promise<{ examId: string; attemptId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { examId, attemptId } = await params;

  const attempt = await prisma.mockAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        include: {
          questions: {
            select: {
              id: true,
              text: true,
              preamble: true,
              type: true,
              options: true,
              correctOptionId: true,
              explanation: true,
            },
          },
        },
      },
    },
  });

  if (!attempt || attempt.userId !== session.userId) redirect("/exams");

  const answers = attempt.answers as Record<string, string>;
  const pct = Math.round((attempt.score / attempt.total) * 100);
  const passed = pct >= attempt.exam.passingScore;

  const minutes = Math.floor(attempt.timeUsed / 60);
  const seconds = attempt.timeUsed % 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-yellow-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Score card */}
        <div className="bg-white rounded-3xl border-4 border-violet-300 shadow-xl p-8 mb-6 text-center">
          <div className="text-6xl mb-3">{passed ? "🏆" : "💪"}</div>
          <h1 className="text-2xl font-extrabold text-violet-700 mb-1">
            {attempt.exam.name}
          </h1>
          <p className="text-gray-500 mb-4">Mock Exam Review</p>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-violet-50 rounded-2xl p-3">
              <p className="text-3xl font-extrabold text-violet-700">{pct}%</p>
              <p className="text-xs text-gray-500 mt-1">Score</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-3">
              <p className="text-3xl font-extrabold text-green-700">
                {attempt.score}/{attempt.total}
              </p>
              <p className="text-xs text-gray-500 mt-1">Correct</p>
            </div>
            <div className="bg-pink-50 rounded-2xl p-3">
              <p className="text-2xl font-extrabold text-pink-700">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </p>
              <p className="text-xs text-gray-500 mt-1">Time Used</p>
            </div>
          </div>
          <div
            className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${
              passed
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {passed ? "✅ Passed" : `❌ Did not pass (need ${attempt.exam.passingScore}%)`}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <Link
            href={`/exams/${examId}`}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm text-center"
          >
            ← Back to Exam
          </Link>
          <Link
            href={`/mock-exam/${examId}`}
            className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors text-sm text-center"
          >
            Retake Mock
          </Link>
        </div>

        {/* Question review */}
        <h2 className="text-xl font-bold text-violet-700 mb-4">
          Question Review
        </h2>
        <div className="space-y-4">
          {attempt.exam.questions.map((q, idx) => {
            const chosen = answers[q.id] ?? null;
            const isCorrect = chosen === q.correctOptionId;
            const options = q.options as Option[];

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border-4 p-5 ${
                  isCorrect ? "border-green-300" : "border-red-300"
                }`}
              >
                <div className="flex items-start gap-2 mb-3">
                  <span className="text-sm font-bold text-gray-400 min-w-6">
                    {idx + 1}.
                  </span>
                  <p className="font-semibold text-gray-800">{q.text}</p>
                </div>
                <div className="space-y-2 ml-6">
                  {options.map((opt) => {
                    let cls = "text-gray-500";
                    let prefix = "";
                    if (opt.id === q.correctOptionId) {
                      cls = "text-green-700 font-bold";
                      prefix = "✅ ";
                    } else if (opt.id === chosen) {
                      cls = "text-red-700 font-semibold";
                      prefix = "❌ ";
                    }
                    return (
                      <p key={opt.id} className={`text-sm ${cls}`}>
                        {prefix}
                        <span className="font-bold uppercase mr-1">
                          {opt.id}.
                        </span>
                        {opt.text}
                      </p>
                    );
                  })}
                  {!chosen && (
                    <p className="text-sm text-gray-400 italic">
                      Not answered
                    </p>
                  )}
                </div>
                <div className="mt-3 ml-6 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-600">{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
