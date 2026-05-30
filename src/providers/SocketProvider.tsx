"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import type { Socket } from "socket.io-client";
import type { ConnectionStatus } from "@/types";

interface SocketContextValue {
  socket: Socket | null;
  connectionStatus: ConnectionStatus;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connectionStatus: "disconnected",
});

export function useSocketContext() {
  return useContext(SocketContext);
}

interface SocketProviderProps {
  children: React.ReactNode;
  token: string;
}

export function SocketProvider({ children, token }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Lazy import to avoid SSR issues
    import("socket.io-client").then(({ io }) => {
      const s = io(window.location.origin, {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 3000,
        reconnectionAttempts: Infinity,
        transports: ["websocket", "polling"],
      });

      socketRef.current = s;
      setSocket(s);

      s.on("connect", () => setConnectionStatus("connected"));
      s.on("disconnect", () => setConnectionStatus("disconnected"));
      s.on("connect_error", () => setConnectionStatus("reconnecting"));
      s.io.on("reconnect_attempt", () => setConnectionStatus("reconnecting"));
      s.io.on("reconnect", () => setConnectionStatus("connected"));
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, connectionStatus }}>
      {children}
    </SocketContext.Provider>
  );
}
