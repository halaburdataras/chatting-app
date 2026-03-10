import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import prisma from "@repo/database";
import { Role } from "@repo/database/generated/prisma/enums.js";

const JWT_SECRET = process.env.JWT_SECRET;

const ALLOWED_ROLES: Role[] = [Role.ADMIN, Role.SUPER_ADMIN];

export const adminRoleMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1] as string;

    const decoded = jwt.verify(token, JWT_SECRET!) as {
      userId: string;
      email: string;
      role: string;
    };

    // check if the user still exists in the database
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid token or user not found" });
    }

    if (!ALLOWED_ROLES.includes(user.role)) {
      return res
        .status(403)
        .json({ success: false, error: "Permission denied" });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid or expired token" });
  }
};

export const superAdminRoleMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1] as string;

    const decoded = jwt.verify(token, JWT_SECRET!) as {
      userId: string;
      email: string;
      role: string;
    };

    // check if the user still exists in the database
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid token or user not found" });
    }

    if (user.role !== Role.SUPER_ADMIN) {
      return res
        .status(403)
        .json({ success: false, error: "Permission denied" });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid or expired token" });
  }
};
