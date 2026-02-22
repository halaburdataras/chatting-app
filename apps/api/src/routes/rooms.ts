import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import prisma from "@repo/database";
import { ApiResponse, PaginatedResponse, RoomModel } from "@repo/shared";
import {
  calculatePagination,
  normalizePagination,
} from "../utils/pagination.js";
import {
  adminRoleMiddleware,
  superAdminRoleMiddleware,
} from "../middleware/role.js";
import { Role } from "@repo/database/generated/prisma/enums.js";

export const roomsRouter = Router();

roomsRouter.get("/", authMiddleware, async (req, res) => {
  try {
    const { page, pageSize } = normalizePagination(
      Number(req.query.page),
      Number(req.query.pageSize || 10),
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

roomsRouter.post("/", adminRoleMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, error: "Name is required" });
    }

    const currentUser = req.user;

    const room = await prisma.room.create({
      data: { name, user: { connect: { id: currentUser?.userId as string } } },
    });

    res.json({ success: true, data: { room } });
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

roomsRouter.put("/:id", adminRoleMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "Room ID is required" });
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

    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, error: "Name is required" });
    }

    const room = await prisma.room.update({
      where: { id: id as string },
      data: { name },
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
