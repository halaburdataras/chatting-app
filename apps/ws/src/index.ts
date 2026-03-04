import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 8080;

const isProduction = process.env.NODE_ENV === "production";

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

io.on("connection", (socket: Socket) => {
  console.log("A user connected", socket.id, socket.data);

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
  });

  socket.on("joinRoom", (roomId) => {
    console.log("A user joined room", socket.id, roomId);
    socket.join(roomId);
  });

  socket.on("leaveRoom", (roomId) => {
    console.log("A user left room", socket.id, roomId);
    socket.leave(roomId);
  });

  socket.on("message", ({ roomId, message }) => {
    console.log("A message received", socket.id, roomId, message);

    socket.broadcast.to(roomId).emit("message", message);
  });
});

io.use(async (socket: Socket, next) => {
  const authData = socket.handshake.auth;
  if (!authData?.userId) {
    return next(new Error("invalid userId"));
  }

  socket.data = authData;

  next();
});

httpServer.listen(PORT);
