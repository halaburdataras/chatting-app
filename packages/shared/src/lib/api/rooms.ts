import {
  ApiResponse,
  CreateRoomModel,
  PaginatedResponse,
  PaginationParams,
  RoomModel,
  UpdateRoomModel,
} from "../../types";
import { apiClient } from "./client";

interface GetPaginatedRoomsParams extends PaginationParams {
  search?: string;
}

/**
 * Get paginated rooms list.
 */
export async function getPaginatedRooms({
  page,
  pageSize,
  search,
}: GetPaginatedRoomsParams): Promise<
  ApiResponse<PaginatedResponse<RoomModel>>
> {
  const queryParams = new URLSearchParams();
  if (search) {
    queryParams.append("search", search);
  }
  queryParams.append("page", page?.toString() || "1");
  queryParams.append("pageSize", pageSize?.toString() || "10");

  return apiClient.get<PaginatedResponse<RoomModel>>(
    `/api/v1/rooms?${queryParams.toString()}`,
  );
}

export async function createRoom({
  data,
}: {
  data: CreateRoomModel;
}): Promise<ApiResponse<{ room: RoomModel }>> {
  return apiClient.post<{ room: RoomModel }>(`/api/v1/rooms`, {
    name: data.name,
  });
}

export async function deleteRoom({
  id,
}: {
  id: string;
}): Promise<ApiResponse<{ message: string }>> {
  return apiClient.delete<{ message: string }>(`/api/v1/rooms/${id}`);
}

export async function updateRoom({
  id,
  data,
}: {
  id: string;
  data: UpdateRoomModel;
}): Promise<ApiResponse<{ room: RoomModel }>> {
  return apiClient.put<{ room: RoomModel }>(`/api/v1/rooms/${id}`, data);
}

export async function getRoom({
  id,
}: {
  id: string;
}): Promise<ApiResponse<{ room: RoomModel }>> {
  return apiClient.get<{ room: RoomModel }>(`/api/v1/rooms/${id}`);
}
