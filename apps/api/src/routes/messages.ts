import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import prisma from "@repo/database";
import { ApiResponse, MessageModel, PaginatedResponse } from "@repo/shared";
import {
  calculatePagination,
  normalizePagination,
} from "../utils/pagination.js";
import { Role } from "@repo/database/generated/prisma/enums.js";
import { uploadImages } from "../middleware/upload.js";
import cloudinary from "../lib/cloudinary/client.js";

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
          userId: true,
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

messagesRouter.post("/", authMiddleware, uploadImages, async (req, res) => {
  try {
    const { content, roomId } = req.body;

    const attachments = req.files as Express.Multer.File[];

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

    const uploadPromises = attachments.map((file, index) => {
      return new Promise<{ secure_url: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "products",
            public_id: `${file.originalname.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}-${index}`,
            resource_type: "image",
            transformation: [
              { width: 800, height: 800, crop: "limit" },
              { quality: "auto" },
            ],
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve({ secure_url: result.secure_url });
            } else {
              reject(new Error("Upload failed: No result from Cloudinary"));
            }
          },
        );

        // Write file buffer to upload stream
        uploadStream.end(file.buffer);
      });
    });

    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map((result) => result.secure_url);

    const message = await prisma.message.create({
      data: {
        content,
        attachments: imageUrls,
        user: { connect: { id: currentUser?.userId as string } },
        room: { connect: { id: room.id } },
      },
      select: {
        id: true,
        content: true,
        attachments: true,
        createdAt: true,
        roomId: true,
        userId: true,
        user: {
          select: {
            id: true,
            username: true,
            color: true,
          },
        },
      },
    });

    res.json({ success: true, data: { message } });
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
      data: { message: "Message deleted successfully" },
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
      select: {
        id: true,
        content: true,
        attachments: true,
        createdAt: true,
        roomId: true,
        userId: true,
        user: {
          select: {
            id: true,
            username: true,
            color: true,
          },
        },
      },
    });

    res.json({ success: true, data: { message } });
  } catch (error) {
    console.error("Update message error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});
