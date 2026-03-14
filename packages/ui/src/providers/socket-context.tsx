"use client";

import {
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { Socket, io } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
  connect: (authParams: { [key: string]: string }) => void;
  disconnect: () => void;
  isConnected: boolean;
};

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  connect: () => {},
  disconnect: () => {},
  isConnected: false,
});

const isProduction = process.env.NODE_ENV === "production";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080";

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(WS_URL, { autoConnect: false });

    if (!isProduction) {
      socketInstance.onAny((event, ...args) => {
        console.log("[Socket]", event, args);
      });
    }

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socketInstance.on("connect", onConnect);
    socketInstance.on("disconnect", onDisconnect);
    // Sync initial state in case socket reconnects after provider mount
    if (socketInstance.connected) setIsConnected(true);

    setSocket(socketInstance);

    return () => {
      socketInstance.off("connect", onConnect);
      socketInstance.off("disconnect", onDisconnect);
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, []);

  const connect = useCallback((authParams: { [key: string]: string }) => {
    setSocket((current) => {
      if (current) {
        current.auth = authParams;
        current.connect();
      }
      return current;
    });
  }, []);

  const disconnect = useCallback(() => {
    setSocket((current) => {
      if (current) {
        current.disconnect();
      }
      return current;
    });
    setIsConnected(false);
  }, []);

  const values = useMemo(
    () => ({
      socket,
      connect,
      disconnect,
      isConnected,
    }),
    [socket, connect, disconnect, isConnected]
  );

  return (
    <SocketContext.Provider value={values}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  return context;
};
