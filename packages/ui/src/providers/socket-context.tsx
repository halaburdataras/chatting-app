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
  isConnected: boolean;
};

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  connect: () => {},
  isConnected: false,
});

const isProduction = process.env.NODE_ENV === "production";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080";

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(WS_URL, { autoConnect: false });

    if (!isProduction) {
      socket.onAny((event, ...args) => {
        console.log(event, args);
      });
    }

    setSocket(socket);
  }, []);

  const connect = useCallback(
    (authParams: { [key: string]: string }) => {
      if (socket) {
        socket.auth = authParams;
        socket.connect();
        setIsConnected(true);
      }
    },
    [socket],
  );

  const values = useMemo(
    () => ({
      socket,
      connect,
      isConnected,
    }),
    [socket, connect, isConnected],
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
