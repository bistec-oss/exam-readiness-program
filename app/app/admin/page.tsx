import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const [examCount, challengeCount, questionCount, userCount] = await Promise.all([
    prisma.exam.count(),
    prisma.challengeSet.count(),
    prisma.question.count(),
    prisma.user.count(),
  ]);

  const stats = [
    { label: "Exams", count: examCount, href: "/admin/exams", emoji: "📋" },
    { label: "Challenge Sets", count: challengeCount, href: "/admin/challenges", emoji: "🎯" },
    { label: "Questions", count: questionCount, href: "/admin/questions", emoji: "❓" },
    { label: "Users", count: userCount, href: "/admin", emoji: "👥" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-800 mb-6">Admin Overview</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="bg-white rounded-2xl border-2 border-gray-100 hover:border-violet-300 shadow p-5 block transition-all">
            <div className="text-3xl mb-2">{s.emoji}</div>
            <p className="text-3xl font-extrabold text-violet-700">{s.count}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
