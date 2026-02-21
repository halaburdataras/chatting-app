import { Router } from "express";
import { usersRouter } from "./users.js";
import { authRouter } from "./auth.js";
import { messagesRouter } from "./messages.js";
import { roomsRouter } from "./rooms.js";

export const apiRouter = Router();

apiRouter.use("/users", usersRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/messages", messagesRouter);
apiRouter.use("/rooms", roomsRouter);

// API info endpoint
apiRouter.get("/", (req, res) => {
  res.json({
    message: "Chatting App API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      users: "/users",
      auth: "/auth",
      messages: "/messages",
      rooms: "/rooms",
    },
  });
});
