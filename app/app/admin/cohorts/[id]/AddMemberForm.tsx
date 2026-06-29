"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddMemberForm({ cohortId }: { cohortId: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/cohorts/${cohortId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to add member");
        return;
      }
      setEmail("");
      setSuccess("Member added");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 flex-wrap">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="user@email.com"
        data-testid="add-member-email-input"
        className="flex-1 min-w-0 px-4 py-2 border-2 border-green-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
      />
      <button
        type="submit"
        disabled={loading || !email.trim()}
        data-testid="add-member-btn"
        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold rounded-xl text-sm transition-colors"
      >
        {loading ? "Adding…" : "Add"}
      </button>
      {error && <p className="w-full text-red-500 text-xs">{error}</p>}
      {success && <p className="w-full text-green-600 text-xs">{success}</p>}
    </form>
  );
}
