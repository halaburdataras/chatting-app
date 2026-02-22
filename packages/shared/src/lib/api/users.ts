import { Role } from "@repo/database/generated/prisma/enums.js";
import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  UserModel,
} from "../../types";
import { apiClient } from "./client";

interface GetPaginatedUsersParams extends PaginationParams {
  search?: string;
  role?: Role;
}

/**
 * Get paginated users list.
 */
export async function getPaginatedUsers({
  page,
  pageSize,
  search,
  role,
}: GetPaginatedUsersParams): Promise<
  ApiResponse<PaginatedResponse<UserModel>>
> {
  const queryParams = new URLSearchParams();
  if (search) {
    queryParams.append("search", search);
  }
  if (role) {
    queryParams.append("role", role);
  }
  queryParams.append("page", page?.toString() || "1");
  queryParams.append("pageSize", pageSize?.toString() || "10");

  return apiClient.get<PaginatedResponse<UserModel>>(
    `/api/v1/users?${queryParams.toString()}`,
  );
}

export async function deleteUser({
  id,
}: {
  id: string;
}): Promise<ApiResponse<{ message: string }>> {
  return apiClient.delete<{ message: string }>(`/api/v1/users/${id}`);
}

export async function updateUser({
  id,
  data,
}: {
  id: string;
  data: UserModel;
}): Promise<ApiResponse<{ user: UserModel }>> {
  return apiClient.put<{ user: UserModel }>(`/api/v1/users/${id}`, data);
}

export async function getUser({
  id,
}: {
  id: string;
}): Promise<ApiResponse<UserModel>> {
  return apiClient.get<UserModel>(`/api/v1/users/${id}`);
}
