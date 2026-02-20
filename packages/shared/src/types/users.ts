import { Role } from "@repo/database/generated/prisma/enums.js";

export interface UserModel {
  id: string;
  username: string;
  email: string;
  role: Role;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}
