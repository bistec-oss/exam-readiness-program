"use client";

import { dequeueAll, removeAttempt } from "./offlineQueue";

export async function syncQueuedAttempts(): Promise<number> {
  const queued = await dequeueAll();
  if (queued.length === 0) return 0;

  let synced = 0;
  for (const attempt of queued) {
    try {
      const res = await fetch("/api/attempts/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attempt),
      });
      if (res.ok) {
        await removeAttempt(attempt.id);
        synced++;
      }
    } catch {
      // Network still unavailable for this one — leave in queue
    }
  }
  return synced;
}

export function registerOnlineSync(): () => void {
  const handler = () => {
    syncQueuedAttempts().catch(() => {});
  };
  window.addEventListener("online", handler);
  return () => window.removeEventListener("online", handler);
}
