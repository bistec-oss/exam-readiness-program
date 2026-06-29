import Link from "next/link";

type Exam = {
  id: string;
  name: string;
  description: string;
  passingScore: number;
  durationMinutes: number;
  _count: { challengeSets: number; questions: number };
};

type AuthMode =
  | { kind: "anonymous" }
  | { kind: "loggedIn"; userName: string };

export function ExamCatalog({
  exams,
  auth,
}: {
  exams: Exam[];
  auth: AuthMode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-yellow-50 p-6">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-extrabold text-violet-700">
            Exam Catalog 🎯
          </h1>
          {auth.kind === "anonymous" ? (
            <div className="flex gap-3 text-sm font-semibold">
              <Link
                href="/login"
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-white text-violet-600 border-2 border-violet-300 hover:border-violet-500 rounded-xl transition-colors"
              >
                Register
              </Link>
            </div>
          ) : (
            <Link
              href="/dashboard"
              className="text-violet-600 hover:text-violet-800 font-semibold text-sm"
            >
              ← Dashboard
            </Link>
          )}
        </header>

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
                data-testid="exam-card"
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
                {auth.kind === "anonymous" && (
                  <p className="text-xs text-gray-400 mt-3">
                    Sign in to start practicing →
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}