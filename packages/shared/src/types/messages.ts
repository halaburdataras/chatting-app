import { UserModel } from "./users";

export type MessageModel = {
  id: string;
  content: string | null;
  attachments: string[];
  createdAt: Date;
  user: Partial<UserModel>;
  roomId: string;
};
