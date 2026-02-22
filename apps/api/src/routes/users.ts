import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import prisma from "@repo/database";
import {
  adminRoleMiddleware,
  superAdminRoleMiddleware,
} from "../middleware/role.js";
import {
  calculatePagination,
  normalizePagination,
} from "../utils/pagination.js";
import { Role } from "@repo/database/generated/prisma/enums.js";
import { ApiResponse, PaginatedResponse, UserModel } from "@repo/shared";
import bcrypt from "bcryptjs";

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
      data: { user },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

usersRouter.get("/", adminRoleMiddleware, async (req, res, next) => {
  try {
    const { page, pageSize } = normalizePagination(
      Number(req.query.page),
      Number(req.query.pageSize),
    );
    const search = req.query.search as string | undefined;
    const role = req.query.role as string | undefined;

    const where: any = {};

    if (role) {
      where.role = role as Role;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count({ where }),
    ]);

    const pagination = calculatePagination(total, page, pageSize);

    const response: ApiResponse<PaginatedResponse<UserModel>> = {
      success: true,
      data: {
        items: users,
        ...pagination,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

usersRouter.post("/", adminRoleMiddleware, async (req, res) => {
  try {
    const { email, username, password, role, color } = req.body;

    if (!email || !username || !password || !role || !color) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    const currentUser = req.user;

    if (role === Role.SUPER_ADMIN && currentUser?.role !== Role.SUPER_ADMIN) {
      return res.status(403).json({
        success: false,
        error: "Permission denied",
      });
    }

    async function encryptPassword(password: string) {
      return await bcrypt.hash(password, 10);
    }

    const encryptedPassword = await encryptPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: encryptedPassword,
        role,
        color,
      },
    });

    res.json({ success: true, data: { user } });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

usersRouter.put("/:id", adminRoleMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, username, role, color } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const currentUser = req.user;

    if (role === Role.SUPER_ADMIN && currentUser?.role !== Role.SUPER_ADMIN) {
      return res.status(403).json({
        success: false,
        error: "Permission denied",
      });
    }

    const userToUpdate = await prisma.user.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        role: true,
      },
    });

    if (!userToUpdate) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (
      userToUpdate.role === Role.SUPER_ADMIN &&
      currentUser?.role !== Role.SUPER_ADMIN
    ) {
      return res.status(403).json({
        success: false,
        error: "Permission denied",
      });
    }

    const user = await prisma.user.update({
      where: { id: id as string },
      data: { email, username, role, color },
    });

    res.json({ success: true, data: { user } });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

usersRouter.delete("/:id", superAdminRoleMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const deleteUser = prisma.user.delete({
      where: { id: id as string },
    });

    const deleteMessages = prisma.message.deleteMany({
      where: {
        userId: id as string,
      },
    });

    const deleteRooms = prisma.room.deleteMany({
      where: { userId: id as string },
    });

    const transaction = await prisma.$transaction([
      deleteMessages,
      deleteRooms,
      deleteUser,
    ]);

    res.json({
      success: true,
      data: { message: "User deleted successfully", transaction },
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});
