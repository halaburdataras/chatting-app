export * from "./pagination";
export * from "./users";
export * from "./messages";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
