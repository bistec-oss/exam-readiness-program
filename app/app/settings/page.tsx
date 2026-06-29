import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PreferenceToggle } from "@/components/PreferenceToggle";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [user, emails] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { leaderboardOptIn: true, weeklyEmailOptIn: true },
    }),
    prisma.emailLog.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, subject: true, body: true, createdAt: true },
      take: 10,
    }),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-yellow-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-white rounded-3xl shadow-xl p-6 border-4 border-violet-300">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-violet-700">⚙️ Settings</h1>
            <Link href="/dashboard" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl text-xs">
              ← Dashboard
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-3xl border-4 border-violet-100 shadow-lg p-5 space-y-3">
          <h2 className="text-sm font-bold text-gray-500">Notifications</h2>
          <PreferenceToggle
            field="weeklyEmailOptIn"
            initial={user?.weeklyEmailOptIn ?? true}
            label="Email me a weekly readiness summary"
            testId="weekly-email-toggle"
          />
          <PreferenceToggle
            field="leaderboardOptIn"
            initial={user?.leaderboardOptIn ?? false}
            label="Show me on the cohort leaderboard"
            testId="settings-leaderboard-toggle"
          />
        </div>

        <div className="bg-white rounded-3xl border-4 border-pink-100 shadow-lg p-5">
          <h2 className="text-sm font-bold text-gray-500 mb-3">Your Weekly Summaries</h2>
          <div data-testid="notifications-inbox" className="space-y-3">
            {emails.length === 0 ? (
              <p className="text-center text-gray-400 text-sm">No summaries yet.</p>
            ) : (
              emails.map((e) => (
                <details key={e.id} className="border-2 border-pink-50 rounded-2xl p-3" data-testid="notification-item">
                  <summary className="text-sm font-semibold text-gray-700 cursor-pointer">{e.subject}</summary>
                  <pre className="mt-2 text-xs text-gray-500 whitespace-pre-wrap font-sans">{e.body}</pre>
                </details>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
