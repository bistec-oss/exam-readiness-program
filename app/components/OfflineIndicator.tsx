"use client";

import { useEffect, useSyncExternalStore } from "react";
import { registerOnlineSync } from "@/lib/syncAttempts";

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export default function OfflineIndicator() {
  // useSyncExternalStore reads browser online state without a setState-in-effect,
  // and returns true during SSR so first paint matches the server.
  const online = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );

  useEffect(() => registerOnlineSync(), []);

  if (online) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-gray-800 text-white text-sm font-semibold rounded-full shadow-lg">
      <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
      Offline — answers saved locally
    </div>
  );
}
