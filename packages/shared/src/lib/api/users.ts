import { Role } from "@repo/database/generated/prisma/enums.js";
import {
  ApiResponse,
  CreateUserModel,
  PaginatedResponse,
  PaginationParams,
  UpdateUserModel,
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
    `/api/v1/users?${queryParams.toString()}`
  );
}

export async function createUser({
  data,
}: {
  data: CreateUserModel;
}): Promise<ApiResponse<{ user: UserModel }>> {
  const formData = new FormData();
  formData.append("email", data.email);
  formData.append("username", data.username);
  formData.append("password", data.password);
  formData.append("role", data.role);
  formData.append("color", data.color);
  if (data.avatar) {
    formData.append("avatar", data.avatar);
  }

  return apiClient.post<{ user: UserModel }>(`/api/v1/users`, formData);
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
  data: UpdateUserModel;
}): Promise<ApiResponse<{ user: UserModel }>> {
  const formData = new FormData();
  formData.append("username", data.username);
  formData.append("role", data.role || Role.USER);
  formData.append("color", data.color);
  if (data.avatar || data.avatar === null) {
    formData.append("avatar", data.avatar as File);
  }
  return apiClient.put<{ user: UserModel }>(`/api/v1/users/${id}`, formData);
}

export async function getUser({
  id,
}: {
  id: string;
}): Promise<ApiResponse<{ user: UserModel }>> {
  return apiClient.get<{ user: UserModel }>(`/api/v1/users/${id}`);
}
