import prisma from "@repo/database";
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

authRouter.post("/login", async (req, res) => {
  try {
    if (!JWT_SECRET) {
      return res
        .status(500)
        .json({ success: false, error: "JWT secret is not set" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        role: true,
        password: true,
        username: true,
        color: true,
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || "");

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions,
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          username: user.username,
          color: user.color,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});
