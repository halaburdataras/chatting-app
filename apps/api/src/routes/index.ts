import { Router } from "express";
import { usersRouter } from "./users.js";
import { authRouter } from "./auth.js";

export const apiRouter = Router();

apiRouter.use("/users", usersRouter);
apiRouter.use("/auth", authRouter);

// API info endpoint
apiRouter.get("/", (req, res) => {
  res.json({
    message: "Chatting App API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      users: "/users",
      auth: "/auth",
    },
  });
});
