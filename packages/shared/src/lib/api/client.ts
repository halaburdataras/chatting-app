import { ApiResponse } from "../../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make a GET request
   */
  async get<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "GET",
    });
  }

  /**
   * Make a POST request
   * Supports both JSON and FormData
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit,
  ): Promise<ApiResponse<T>> {
    const isFormData = data instanceof FormData;

    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options?.headers,
      },
      body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
    });
  }

  /**
   * Make a PUT request
   * Supports both JSON and FormData
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit,
  ): Promise<ApiResponse<T>> {
    const isFormData = data instanceof FormData;

    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options?.headers,
      },
      body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
    });
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  }

  /**
   * Get auth token from cookies (browser only)
   */
  public getAuthTokenFromCookie(): string | null {
    if (typeof document === "undefined") return null;

    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("auth_token="),
    );

    if (!tokenCookie) return null;

    return tokenCookie.split("=")[1] || null;
  }

  public setAuthToken(token: string): void {
    document.cookie = `auth_token=${token}; path=/; httpOnly; secure; max-age=604800`;
  }

  public removeAuthToken(): void {
    document.cookie = `auth_token=; path=/; httpOnly; secure; max-age=0`;
  }

  public isAuthenticated(): boolean {
    return this.getAuthTokenFromCookie() !== null;
  }

  /**
   * Base request method
   * Protected to allow extension in subclasses
   */
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const token = this.getAuthTokenFromCookie();

    const headers: HeadersInit = {
      ...options.headers,
    };

    if (token && !("Authorization" in headers)) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP error! status: ${response.status}`,
        };
      }

      return data as ApiResponse<T>;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  }
}

export const apiClient = new ApiClient();

export { ApiClient };
