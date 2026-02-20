import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import prisma from "@repo/database";
import { adminRoleMiddleware } from "../middleware/role.js";
import {
  calculatePagination,
  normalizePagination,
} from "../utils/pagination.js";
import { Role } from "@repo/database/generated/prisma/enums.js";
import { ApiResponse, PaginatedResponse, UserModel } from "@repo/shared";

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
        { name: { contains: search, mode: "insensitive" } },
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
    next(error);
  }
});
