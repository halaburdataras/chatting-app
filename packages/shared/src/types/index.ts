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
  avatar: string | null;
}

export interface CreateUserModel {
  email: string;
  username: string;
  password: string;
  role: Role;
  color: string;
  avatar: File | null;
}

export interface UpdateUserModel {
  username: string;
  role: Role;
  color: string;
  avatar: File | null | undefined;
}

export type MessageModel = {
  id: string;
  content: string | null;
  attachments: string[];
  createdAt: Date;
  user: Pick<UserModel, "id" | "username" | "color" | "avatar">;
  roomId: string;
  userId: string;
};

export interface RoomModel {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  messages: MessageModel[];
  userId: string;
  user: Pick<UserModel, "id" | "username" | "color">;
  avatar: string | null;
}

export interface CreateRoomModel {
  name: string;
  avatar: File | null;
}

export interface UpdateRoomModel {
  name: string;
  avatar?: File | null;
}

export interface UpdateMessageModel {
  content: string;
  attachments: string[];
}

export interface CreateMessageModel {
  content: string;
  attachments: File[];
  roomId: string;
}
