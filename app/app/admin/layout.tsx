import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r-2 border-gray-100 flex flex-col p-4 gap-1">
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Admin</p>
          <Link href="/dashboard" className="text-xs text-violet-600 hover:underline mt-0.5 block">
            ← Dashboard
          </Link>
        </div>
        {[
          { href: "/admin", label: "⚙️ Overview" },
          { href: "/admin/exams", label: "📋 Exams" },
          { href: "/admin/challenges", label: "🎯 Challenges" },
          { href: "/admin/questions", label: "❓ Questions" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
