"use client";

import { useEffect } from "react";
import { useSocketContext } from "@/providers/SocketProvider";

export function useSocket<T>(event: string, handler: (data: T) => void): void {
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket) return;
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [socket, event, handler]);
}
