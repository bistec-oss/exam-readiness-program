"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RemoveMemberButton({
  cohortId,
  userId,
  userName,
}: {
  cohortId: string;
  userId: string;
  userName: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    if (!confirm(`Remove ${userName} from this cohort?`)) return;
    setLoading(true);
    try {
      await fetch(`/api/cohorts/${cohortId}/members?userId=${userId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      data-testid={`remove-member-${userId}`}
      className="text-xs text-red-400 hover:text-red-600 font-semibold disabled:opacity-50"
    >
      {loading ? "…" : "Remove"}
    </button>
  );
}
