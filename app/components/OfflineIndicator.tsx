"use client";

import { useEffect, useState } from "react";
import { registerOnlineSync } from "@/lib/syncAttempts";

export default function OfflineIndicator() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    const unregisterSync = registerOnlineSync();
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      unregisterSync();
    };
  }, []);

  if (online) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-gray-800 text-white text-sm font-semibold rounded-full shadow-lg">
      <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
      Offline — answers saved locally
    </div>
  );
}
