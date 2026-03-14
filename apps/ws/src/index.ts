import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 8080;

const isProduction = process.env.RAILWAY_ENVIRONMENT_NAME === "production";

const whitelist = !isProduction
  ? "*"
  : ([
      process.env.API_URL,
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL,
    ].filter(Boolean) as string[]);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: whitelist,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type"],
  },
});

// Auth middleware must run before connection is established
io.use(async (socket: Socket, next) => {
  const authData = socket.handshake.auth;
  if (!authData?.userId) {
    return next(new Error("invalid userId"));
  }
  socket.data = authData;
  next();
});

// Typed event payloads for better validation and DX
type MessagePayload = {
  roomId: string;
  message: { id: string; content: string | null; roomId: string; [key: string]: unknown };
};

function isValidRoomId(roomId: unknown): roomId is string {
  return typeof roomId === "string" && roomId.length > 0;
}

function isValidMessagePayload(payload: unknown): payload is MessagePayload {
  if (!payload || typeof payload !== "object") return false;
  const p = payload as Record<string, unknown>;
  return (
    isValidRoomId(p.roomId) &&
    p.message != null &&
    typeof p.message === "object" &&
    typeof (p.message as Record<string, unknown>).id === "string"
  );
}

io.on("connection", (socket: Socket) => {
  console.log("User connected", socket.id, socket.data);

  socket.on("disconnect", (reason) => {
    console.log("User disconnected", socket.id, reason);
  });

  const PREVIEW_PREFIX = "preview:";

  socket.on("joinRoom", (roomId: unknown) => {
    if (!isValidRoomId(roomId)) {
      return;
    }
    socket.join(roomId);
  });

  socket.on("leaveRoom", (roomId: unknown) => {
    if (!isValidRoomId(roomId)) {
      return;
    }
    socket.leave(roomId);
  });

  // Subscribe to latest-message updates for room list (all rooms user can see)
  socket.on("joinRoomPreview", (roomId: unknown) => {
    if (!isValidRoomId(roomId)) {
      return;
    }
    socket.join(PREVIEW_PREFIX + roomId);
  });

  socket.on("joinRoomPreviews", (roomIds: unknown) => {
    if (!Array.isArray(roomIds)) {
      return;
    }
    roomIds.filter(isValidRoomId).forEach((id) => socket.join(PREVIEW_PREFIX + id));
  });

  socket.on("leaveRoomPreview", (roomId: unknown) => {
    if (!isValidRoomId(roomId)) {
      return;
    }
    socket.leave(PREVIEW_PREFIX + roomId);
  });

  socket.on("message", (payload: unknown) => {
    if (!isValidMessagePayload(payload)) {
      return;
    }
    const { roomId, message } = payload;
    // In-room: only others in this chat room
    socket.broadcast.to(roomId).emit("message", message);
    // Room list: everyone subscribed to this room's preview (including sender)
    io.to(PREVIEW_PREFIX + roomId).emit("roomLatestMessage", message);
  });
});

httpServer.listen(PORT, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
});
