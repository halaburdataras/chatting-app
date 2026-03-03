import {
  ApiResponse,
  CreateMessageModel,
  MessageModel,
  PaginatedResponse,
  PaginationParams,
  UpdateMessageModel,
} from "../../types";
import { apiClient } from "./client";

interface GetPaginatedMessagesParams extends PaginationParams {
  search?: string;
  roomId?: string;
}

/**
 * Get paginated messages list.
 */
export async function getPaginatedMessages({
  page,
  pageSize,
  search,
  roomId,
}: GetPaginatedMessagesParams): Promise<
  ApiResponse<PaginatedResponse<MessageModel>>
> {
  if (!roomId) {
    return {
      success: false,
      error: "Room ID is required",
    };
  }

  const queryParams = new URLSearchParams();
  if (search) {
    queryParams.append("search", search);
  }
  queryParams.append("page", page?.toString() || "1");
  queryParams.append("pageSize", pageSize?.toString() || "10");
  queryParams.append("roomId", roomId);

  return apiClient.get<PaginatedResponse<MessageModel>>(
    `/api/v1/messages?${queryParams.toString()}`,
  );
}

export async function createMessage({
  data,
}: {
  data: CreateMessageModel;
}): Promise<ApiResponse<{ message: MessageModel }>> {
  if (!data.content && !data.attachments) {
    return {
      success: false,
      error: "Content or attachments are required",
    };
  }

  if (!data.roomId) {
    return {
      success: false,
      error: "Room ID is required",
    };
  }

  return apiClient.post<{ message: MessageModel }>(`/api/v1/messages`, {
    content: data.content,
    attachments: data.attachments,
    roomId: data.roomId,
  });
}

export async function deleteMessage({
  id,
}: {
  id: string;
}): Promise<ApiResponse<{ message: string }>> {
  return apiClient.delete<{ message: string }>(`/api/v1/messages/${id}`);
}

export async function updateMessage({
  id,
  data,
}: {
  id: string;
  data: UpdateMessageModel;
}): Promise<ApiResponse<{ message: MessageModel }>> {
  return apiClient.put<{ message: MessageModel }>(
    `/api/v1/messages/${id}`,
    data,
  );
}

export async function getMessage({
  id,
}: {
  id: string;
}): Promise<ApiResponse<{ message: MessageModel }>> {
  return apiClient.get<{ message: MessageModel }>(`/api/v1/messages/${id}`);
}
