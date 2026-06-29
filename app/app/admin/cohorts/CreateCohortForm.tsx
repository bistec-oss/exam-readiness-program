"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateCohortForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cohorts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to create cohort");
        return;
      }
      setName("");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Cohort name (e.g. Q3 Cloud Engineers)"
        data-testid="cohort-name-input"
        className="flex-1 px-4 py-2 border-2 border-violet-200 rounded-xl text-sm focus:outline-none focus:border-violet-400"
      />
      <button
        type="submit"
        disabled={loading || !name.trim()}
        data-testid="create-cohort-btn"
        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white font-bold rounded-xl text-sm transition-colors"
      >
        {loading ? "Creating…" : "Create"}
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </form>
  );
}
