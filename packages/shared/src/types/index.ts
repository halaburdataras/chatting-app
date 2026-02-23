export * from "./pagination";
import { Role } from "@repo/database/generated/prisma/enums.js";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UserModel {
  id: string;
  username: string;
  email: string;
  role: Role;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserModel {
  email: string;
  username: string;
  password: string;
  role: Role;
  color: string;
}

export interface UpdateUserModel {
  username: string;
  role: Role;
  color: string;
}

export type MessageModel = {
  id: string;
  content: string | null;
  attachments: string[];
  createdAt: Date;
  user: Pick<UserModel, "id" | "username" | "color">;
  roomId: string;
};

export interface RoomModel {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  messages: MessageModel[];
  userId: string;
  user: Pick<UserModel, "id" | "username" | "color">;
}

export interface CreateRoomModel {
  name: string;
}

export interface UpdateRoomModel {
  name: string;
}
