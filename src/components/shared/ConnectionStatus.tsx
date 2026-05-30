"use client";

import { useSocketContext } from "@/providers/SocketProvider";

export function ConnectionStatus() {
  const { connectionStatus } = useSocketContext();

  const config = {
    connected: { dot: "bg-green-500", text: "Terhubung", textColor: "text-green-700" },
    disconnected: { dot: "bg-red-500", text: "Koneksi terputus", textColor: "text-red-700" },
    reconnecting: { dot: "bg-yellow-500 animate-pulse", text: "Menghubungkan...", textColor: "text-yellow-700" },
  }[connectionStatus];

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${config.textColor}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      <span className="hidden sm:inline">{config.text}</span>
    </div>
  );
}
