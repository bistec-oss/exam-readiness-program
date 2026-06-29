"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function InviteUserForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"CANDIDATE" | "ADMIN">("CANDIDATE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [temp, setTemp] = useState("");
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTemp("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to invite");
        return;
      }
      setTemp(data.tempPassword);
      setName("");
      setEmail("");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex gap-3 flex-wrap items-end">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full name"
        data-testid="invite-name-input"
        className="flex-1 min-w-32 px-4 py-2 border-2 border-violet-200 rounded-xl text-sm focus:outline-none focus:border-violet-400"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="user@email.com"
        data-testid="invite-email-input"
        className="flex-1 min-w-32 px-4 py-2 border-2 border-violet-200 rounded-xl text-sm focus:outline-none focus:border-violet-400"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as "CANDIDATE" | "ADMIN")}
        data-testid="invite-role-select"
        className="px-3 py-2 border-2 border-violet-200 rounded-xl text-sm focus:outline-none focus:border-violet-400"
      >
        <option value="CANDIDATE">Candidate</option>
        <option value="ADMIN">Admin</option>
      </select>
      <button
        type="submit"
        disabled={loading || !name.trim() || !email.trim()}
        data-testid="invite-btn"
        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white font-bold rounded-xl text-sm transition-colors"
      >
        {loading ? "Inviting…" : "Invite"}
      </button>
      {error && <p className="w-full text-red-500 text-xs">{error}</p>}
      {temp && (
        <p className="w-full text-green-600 text-xs" data-testid="invite-temp-password">
          Invited! Temp password: <span className="font-mono font-bold">{temp}</span> — share it securely.
        </p>
      )}
    </form>
  );
}
