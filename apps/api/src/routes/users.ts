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
import { uploadAvatar } from "../middleware/upload.js";
import cloudinary from "../lib/cloudinary/client.js";

export const usersRouter = Router();

async function uploadAvatarToCloudinary(avatar: Express.Multer.File) {
  return await new Promise<{ secure_url: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "users",
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
        avatar: true,
        createdAt: true,
        updatedAt: true,
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
      Number(req.query.pageSize)
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
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          color: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
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

usersRouter.get("/:id", adminRoleMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        color: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

usersRouter.post("/", adminRoleMiddleware, uploadAvatar, async (req, res) => {
  try {
    const { email, username, password, role, color } = req.body;

    const avatar = req.file as Express.Multer.File;

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

    const possibleUserByEmailOrUsername = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (possibleUserByEmailOrUsername) {
      return res.status(400).json({
        success: false,
        error: "User with this email or username already exists",
      });
    }

    let uploadResult: { secure_url: string } | null = null;

    if (avatar) {
      uploadResult = await uploadAvatarToCloudinary(avatar);
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
        avatar: uploadResult?.secure_url || null,
      },
      select: {
        id: true,
      },
    });

    res.json({ success: true, data: { user } });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

usersRouter.put("/:id", adminRoleMiddleware, uploadAvatar, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, username, avatar: avatarFromBody, role, color } = req.body;

    const avatar = req.file as Express.Multer.File;

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

    let uploadResult: { secure_url: string } | null = null;
    if (avatar) {
      uploadResult = await uploadAvatarToCloudinary(avatar);
    }

    const user = await prisma.user.update({
      where: { id: id as string },
      data: {
        email,
        username,
        role: role || currentUser?.role || Role.USER,
        color,
        avatar:
          avatar || avatarFromBody === null || avatarFromBody === "null"
            ? uploadResult?.secure_url || null
            : undefined,
      },
      select: {
        id: true,
      },
    });

    res.json({ success: true, data: { user } });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

usersRouter.put("/:id/block", adminRoleMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const userToBlock = await prisma.user.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        isBlocked: true,
        role: true,
      },
    });

    if (!userToBlock) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (userToBlock.isBlocked) {
      return res.status(400).json({
        success: false,
        error: "User is already blocked",
      });
    }

    const currentUser = req.user;

    if (userToBlock.id === currentUser?.userId) {
      return res.status(400).json({
        success: false,
        error: "You cannot block yourself",
      });
    }

    if (
      userToBlock.role === Role.SUPER_ADMIN &&
      currentUser?.role !== Role.SUPER_ADMIN
    ) {
      return res.status(403).json({
        success: false,
        error: "Permission denied",
      });
    }

    const user = await prisma.user.update({
      where: { id: id as string },
      data: {
        isBlocked: true,
      },
      select: {
        id: true,
        isBlocked: true,
      },
    });

    res.json({ success: true, data: { user } });
  } catch (error) {
    console.error("Block user error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

usersRouter.put("/:id/unblock", adminRoleMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const userToUnblock = await prisma.user.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        isBlocked: true,
        role: true,
      },
    });

    if (!userToUnblock) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (!userToUnblock.isBlocked) {
      return res.status(400).json({
        success: false,
        error: "User is not blocked",
      });
    }

    const currentUser = req.user;

    if (userToUnblock.id === currentUser?.userId) {
      return res.status(400).json({
        success: false,
        error: "You cannot unblock yourself",
      });
    }

    if (
      userToUnblock.role === Role.SUPER_ADMIN &&
      currentUser?.role !== Role.SUPER_ADMIN
    ) {
      return res.status(403).json({
        success: false,
        error: "Permission denied",
      });
    }

    const user = await prisma.user.update({
      where: { id: id as string },
      data: {
        isBlocked: false,
      },
      select: {
        id: true,
        isBlocked: true,
      },
    });

    res.json({ success: true, data: { user } });
  } catch (error) {
    console.error("Unblock user error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

usersRouter.put("/:id/suspend", adminRoleMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const suspendUntilRaw = req.body?.suspendUntilDate;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "User ID is required" });
    }

    if (typeof suspendUntilRaw !== "string") {
      return res.status(400).json({
        success: false,
        error: "suspendUntilDate must be an ISO string",
      });
    }

    const suspendUntil = new Date(suspendUntilRaw);
    if (Number.isNaN(suspendUntil.getTime())) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid suspend date" });
    }

    const now = Date.now();
    if (suspendUntil.getTime() <= now) {
      return res
        .status(400)
        .json({ success: false, error: "Suspend date must be in the future" });
    }

    const userToSuspend = await prisma.user.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        isSuspended: true,
        role: true,
      },
    });

    if (!userToSuspend) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (userToSuspend.isSuspended) {
      return res.status(400).json({
        success: false,
        error: "User is already suspended",
      });
    }

    const currentUser = req.user;

    if (userToSuspend.id === currentUser?.userId) {
      return res.status(400).json({
        success: false,
        error: "You cannot suspend yourself",
      });
    }

    if (
      userToSuspend.role === Role.SUPER_ADMIN &&
      currentUser?.role !== Role.SUPER_ADMIN
    ) {
      return res.status(403).json({
        success: false,
        error: "Permission denied",
      });
    }

    const user = await prisma.user.update({
      where: { id: id as string },
      data: {
        isSuspended: true,
        suspendedUntil: suspendUntil,
      },
      select: { id: true, isSuspended: true, suspendedUntil: true },
    });

    res.json({
      success: true,
      data: {
        user: { ...user, suspendedUntil: user.suspendedUntil?.toISOString() },
      },
    });
  } catch (error) {
    console.error("Suspend user error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

usersRouter.put("/:id/unsuspend", adminRoleMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const userToUnsuspend = await prisma.user.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        isSuspended: true,
        role: true,
      },
    });

    if (!userToUnsuspend) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (!userToUnsuspend.isSuspended) {
      return res.status(400).json({
        success: false,
        error: "User is not suspended",
      });
    }

    const currentUser = req.user;

    if (userToUnsuspend.id === currentUser?.userId) {
      return res.status(400).json({
        success: false,
        error: "You cannot unsuspend yourself",
      });
    }

    if (
      userToUnsuspend.role === Role.SUPER_ADMIN &&
      currentUser?.role !== Role.SUPER_ADMIN
    ) {
      return res.status(403).json({
        success: false,
        error: "Permission denied",
      });
    }

    const user = await prisma.user.update({
      where: { id: id as string },
      data: {
        isSuspended: false,
        suspendedUntil: null,
      },
      select: {
        id: true,
        isSuspended: true,
        suspendedUntil: true,
      },
    });

    res.json({ success: true, data: { user } });
  } catch (error) {
    console.error("Unsuspend user error:", error);
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
