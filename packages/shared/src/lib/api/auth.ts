// Authentication API client functions
import { apiClient } from "./client";
import type { ApiResponse, UserModel } from "../../types/index";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
}

export interface CurrentUserResponse {
  user: UserModel;
}

/**
 * Get current user (for frontend auth check). Returns 401 when not logged in.
 */
export async function getCurrentUser(): Promise<
  ApiResponse<CurrentUserResponse>
> {
  return apiClient.get<CurrentUserResponse>("/api/v1/users/current-user");
}

/**
 * Login user
 */
export async function login(
  credentials: LoginRequest,
): Promise<ApiResponse<LoginResponse>> {
  return apiClient.post<LoginResponse>("/api/v1/auth/login", credentials);
}
