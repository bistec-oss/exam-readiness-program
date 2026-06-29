"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PreferenceToggle({
  field,
  initial,
  label,
  testId,
}: {
  field: "leaderboardOptIn" | "weeklyEmailOptIn";
  initial: boolean;
  label: string;
  testId: string;
}) {
  const [on, setOn] = useState(initial);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const toggle = async () => {
    const next = !on;
    setOn(next);
    setSaving(true);
    try {
      const res = await fetch("/api/me/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: next }),
      });
      if (!res.ok) {
        setOn(!next); // revert
        return;
      }
      router.refresh();
    } catch {
      setOn(!next);
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saving}
      data-testid={testId}
      data-state={on ? "on" : "off"}
      aria-pressed={on}
      className="flex items-center justify-between gap-4 w-full p-3 rounded-2xl border-2 border-violet-100 hover:border-violet-300 transition-colors text-left"
    >
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
          on ? "bg-violet-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 mt-0.5 rounded-full bg-white transition-transform ${
            on ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}
