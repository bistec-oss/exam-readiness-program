"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UserActions({
  userId,
  role,
  status,
  isSelf,
}: {
  userId: string;
  role: "ADMIN" | "CANDIDATE";
  status: "ACTIVE" | "SUSPENDED";
  isSelf: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const patch = async (data: { role?: string; status?: string }) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d.error ?? "Update failed");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const suspended = status === "SUSPENDED";

  return (
    <div className="flex items-center justify-end gap-2">
      <select
        value={role}
        disabled={loading || isSelf}
        onChange={(e) => patch({ role: e.target.value })}
        data-testid={`role-select-${userId}`}
        className="px-2 py-1 border-2 border-gray-200 rounded-lg text-xs disabled:opacity-50"
      >
        <option value="CANDIDATE">Candidate</option>
        <option value="ADMIN">Admin</option>
      </select>
      <button
        onClick={() => patch({ status: suspended ? "ACTIVE" : "SUSPENDED" })}
        disabled={loading || isSelf}
        data-testid={`toggle-status-${userId}`}
        className={`text-xs font-semibold px-2 py-1 rounded-lg disabled:opacity-40 ${
          suspended
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : "bg-red-100 text-red-600 hover:bg-red-200"
        }`}
      >
        {suspended ? "Reactivate" : "Suspend"}
      </button>
    </div>
  );
}
