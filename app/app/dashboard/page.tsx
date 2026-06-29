import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-yellow-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 border-4 border-violet-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-violet-700">
                Hey, {session.name}! 👋
              </h1>
              <p className="text-gray-500 mt-1">
                Role: <span className="font-semibold text-violet-600">{session.role}</span>
              </p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm"
              >
                Sign out
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Link href="/exams" className="p-6 bg-violet-50 hover:bg-violet-100 rounded-2xl border-2 border-violet-200 block transition-colors">
              <div className="text-4xl mb-2">🎯</div>
              <h2 className="text-xl font-bold text-violet-700">Exam Catalog</h2>
              <p className="text-gray-600 text-sm mt-1">
                Browse exams, tackle challenge sets, and take mock exams.
              </p>
            </Link>
          </div>

          {session.role === "ADMIN" && (
            <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-2xl">
              <p className="text-yellow-800 font-semibold text-sm">⚡ Admin panel coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
