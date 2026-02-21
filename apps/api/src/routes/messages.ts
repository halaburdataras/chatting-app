import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import prisma from "@repo/database";
import { ApiResponse, MessageModel, PaginatedResponse } from "@repo/shared";
import {
  calculatePagination,
  normalizePagination,
} from "../utils/pagination.js";
import { Role } from "@repo/database/generated/prisma/enums.js";

export const messagesRouter = Router();

messagesRouter.get("/", authMiddleware, async (req, res) => {
  try {
    const roomId = req.query.roomId;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        error: "Room ID is required",
      });
    }

    const { page, pageSize } = normalizePagination(
      Number(req.query.page),
      Number(req.query.pageSize),
    );

    const search = req.query.search as string | undefined;

    const where: any = { roomId: roomId as string };

    if (search) {
      where.content = { contains: search, mode: "insensitive" };
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
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
      }),
      prisma.message.count({ where }),
    ]);

    const pagination = calculatePagination(total, page, pageSize);

    const response: ApiResponse<PaginatedResponse<MessageModel>> = {
      success: true,
      data: {
        items: messages,
        ...pagination,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

messagesRouter.post("/", authMiddleware, async (req, res) => {
  try {
    const { content, attachments, roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        error: "Room ID is required",
      });
    }

    if (!content && !attachments) {
      return res.status(400).json({
        success: false,
        error: "Content or attachments are required",
      });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId as string },
      select: {
        id: true,
      },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        error: "Room not found",
      });
    }

    const currentUser = req.user;

    const message = await prisma.message.create({
      data: {
        content,
        attachments,
        user: { connect: { id: currentUser?.userId as string } },
        room: { connect: { id: room.id } },
      },
    });

    res.json({ success: true, data: message });
  } catch (error) {
    console.error("Create message error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

messagesRouter.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Message ID is required",
      });
    }

    const messageToDelete = await prisma.message.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        roomId: true,
        userId: true,
      },
    });

    if (!messageToDelete) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }

    const currentUser = req.user;

    if (
      currentUser?.role !== Role.SUPER_ADMIN &&
      messageToDelete?.userId !== currentUser?.userId
    ) {
      return res.status(403).json({
        success: false,
        error: "Permission denied",
      });
    }

    await prisma.message.delete({
      where: { id: id as string },
    });

    res.json({
      success: true,
      data: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

messagesRouter.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Message ID is required",
      });
    }

    const { content, attachments } = req.body;

    if (!content && !attachments) {
      return res.status(400).json({
        success: false,
        error: "Content or attachments are required",
      });
    }

    const messageToUpdate = await prisma.message.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!messageToUpdate) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }

    const currentUser = req.user;

    if (
      currentUser?.role !== Role.SUPER_ADMIN &&
      messageToUpdate?.userId !== currentUser?.userId
    ) {
      return res.status(403).json({
        success: false,
        error: "Permission denied",
      });
    }

    const message = await prisma.message.update({
      where: { id: id as string },
      data: { content, attachments },
    });

    res.json({ success: true, data: message });
  } catch (error) {
    console.error("Update message error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});
