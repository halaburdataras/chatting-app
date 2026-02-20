import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import prisma from "@repo/database";

export const usersRouter = Router();

usersRouter.get("/current-user", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        color: true,
      },
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});
