import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import prisma from "@repo/database";
import { ApiResponse, MessageModel } from "@repo/shared";

export const messagesRouter = Router();

messagesRouter.get("/", authMiddleware, async (req, res, next) => {
  try {
    const roomId = req.query.roomId;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        error: "Room ID is required",
      });
    }

    const limit = Number(req.query.limit) || 20;
    const offset = Number(req.query.offset) || 0;

    const messages = await prisma.message.findMany({
      where: {
        roomId: roomId as string,
      },
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        content: true,
        attachments: true,
        createdAt: true,
        roomId: true,
        user: {
          select: {
            id: true,
            username: true,
            color: true,
          },
        },
      },
    });

    const response: ApiResponse<MessageModel[]> = {
      success: true,
      data: messages,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});
