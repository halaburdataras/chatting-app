import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import prisma from "@repo/database";
import {
  ApiResponse,
  MessageModel,
  PaginatedResponse,
  RoomModel,
} from "@repo/shared";
import {
  calculatePagination,
  normalizePagination,
} from "../utils/pagination.js";
import { adminRoleMiddleware } from "../middleware/role.js";
import { uploadAvatar } from "../middleware/upload.js";
import { Role } from "@repo/database/generated/prisma/enums.js";
import cloudinary from "../lib/cloudinary/client.js";

export const roomsRouter = Router();

async function uploadRoomAvatarToCloudinary(avatar: Express.Multer.File) {
  return await new Promise<{ secure_url: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "rooms",
        public_id: `${avatar.originalname.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
        resource_type: "image",
        transformation: [
          { width: 200, height: 200, crop: "limit" },
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
      }
    );

    // Write file buffer to upload stream
    uploadStream.end(avatar.buffer);
  });
}

roomsRouter.get("/", authMiddleware, async (req, res) => {
  try {
    const { page, pageSize } = normalizePagination(
      Number(req.query.page),
      Number(req.query.pageSize || 10)
    );

    const search = req.query.search as string | undefined;

    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          avatar: true,
          user: {
            select: {
              id: true,
              username: true,
              color: true,
            },
          },
          messages: {
            take: 1,
            select: {
              attachments: true,
              content: true,
              createdAt: true,
              id: true,
              userId: true,
              user: {
                select: {
                  id: true,
                  username: true,
                  color: true,
                  avatar: true,
                },
              },
            },
          },
        },
      }),
      prisma.room.count({ where }),
    ]);

    const pagination = calculatePagination(total, page, pageSize);

    const response: ApiResponse<
      PaginatedResponse<
        Pick<RoomModel, "id" | "name" | "createdAt" | "updatedAt">
      >
    > = {
      success: true,
      data: {
        items: rooms,
        ...pagination,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Get rooms error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

const EXPORT_MESSAGES_LIMIT = 10_000;

roomsRouter.get(
  "/:id/export-messages",
  adminRoleMiddleware,
  async (req, res) => {
    try {
      const roomId = req.params.id as string;

      if (!roomId) {
        return res
          .status(400)
          .json({ success: false, error: "Room ID is required" });
      }

      const messages = await prisma.message.findMany({
        where: { roomId: roomId as string },
        orderBy: { createdAt: "asc" },
        take: EXPORT_MESSAGES_LIMIT,
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

      const response: ApiResponse<{ messages: MessageModel[] }> = {
        success: true,
        data: {
          messages: messages as MessageModel[],
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Export room messages error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
);

roomsRouter.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "Room ID is required" });
    }

    const room = await prisma.room.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        avatar: true,
        user: {
          select: {
            id: true,
            username: true,
            color: true,
          },
        },
        messages: {
          take: 1,
          select: {
            attachments: true,
            content: true,
            createdAt: true,
            id: true,
            userId: true,
            user: {
              select: {
                id: true,
                username: true,
                color: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    res.json({ success: true, data: { room } });
  } catch (error) {
    console.error("Get room error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

roomsRouter.post("/", adminRoleMiddleware, uploadAvatar, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, error: "Name is required" });
    }

    const avatar = req.file as Express.Multer.File | undefined;

    let uploadResult: { secure_url: string } | null = null;

    if (avatar) {
      uploadResult = await uploadRoomAvatarToCloudinary(avatar);
    }

    const currentUser = req.user;

    const room = await prisma.room.create({
      data: {
        name,
        user: { connect: { id: currentUser?.userId as string } },
        avatar: uploadResult?.secure_url ?? null,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        avatar: true,
        user: {
          select: {
            id: true,
            username: true,
            color: true,
          },
        },
      },
    });

    res.json({ success: true, data: { room } });
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

roomsRouter.put("/:id", adminRoleMiddleware, uploadAvatar, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "Room ID is required" });
    }

    const { name, avatar: avatarFromBody } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, error: "Name is required" });
    }

    const roomToUpdate = await prisma.room.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        userId: true,
      },
    });

    const currentUser = req.user;

    if (
      currentUser?.role !== Role.SUPER_ADMIN &&
      roomToUpdate?.userId !== currentUser?.userId
    ) {
      return res
        .status(403)
        .json({ success: false, error: "Permission denied" });
    }

    const avatar = req.file as Express.Multer.File | undefined;

    let uploadResult: { secure_url: string } | null = null;

    if (avatar) {
      uploadResult = await uploadRoomAvatarToCloudinary(avatar);
    }

    const room = await prisma.room.update({
      where: { id: id as string },
      data: {
        name,
        avatar:
          avatar || avatarFromBody === null || avatarFromBody === "null"
            ? uploadResult?.secure_url || null
            : undefined,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        avatar: true,
        user: {
          select: {
            id: true,
            username: true,
            color: true,
          },
        },
      },
    });

    res.json({ success: true, data: { room } });
  } catch (error) {
    console.error("Update room error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

roomsRouter.delete("/:id", adminRoleMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "Room ID is required" });
    }

    const roomToDelete = await prisma.room.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        userId: true,
      },
    });

    const currentUser = req.user;

    if (
      currentUser?.role !== Role.SUPER_ADMIN &&
      roomToDelete?.userId !== currentUser?.userId
    ) {
      return res
        .status(403)
        .json({ success: false, error: "Permission denied" });
    }

    const deleteRoom = prisma.room.delete({
      where: { id: id as string },
    });

    const deleteMessages = prisma.message.deleteMany({
      where: {
        roomId: id as string,
      },
    });

    const transaction = await prisma.$transaction([deleteMessages, deleteRoom]);

    res.json({
      success: true,
      data: { message: "Room deleted successfully", transaction },
    });
  } catch (error) {
    console.error("Delete room error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});
