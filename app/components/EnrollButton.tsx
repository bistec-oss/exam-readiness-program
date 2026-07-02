"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Enrolls the current user in a plan, then navigates to its detail page.
export function EnrollButton({ planId, label = "Start plan" }: { planId: string; label?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function enroll() {
    setLoading(true);
    const res = await fetch(`/api/study-plans/${planId}/enroll`, { method: "POST" });
    if (res.ok) {
      router.push(`/study-plans/${planId}`);
      router.refresh();
    } else {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={enroll}
      disabled={loading}
      className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
    >
      {loading ? "Starting…" : label}
    </button>
  );
}
