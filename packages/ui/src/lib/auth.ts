// Authentication utilities for cookie management
"use client";

import { AUTH_TOKEN_COOKIE_KEY } from "../constants/login";

/**
 * Get auth token from cookies
 */
export function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  const tokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${AUTH_TOKEN_COOKIE_KEY}=`),
  );

  if (!tokenCookie) return null;

  return tokenCookie.split("=")[1] || null;
}

/**
 * Set auth token in cookies
 */
export function setAuthToken(token: string): void {
  if (typeof document === "undefined") return;

  // Set cookie with 7 days expiration
  const expires = new Date();
  expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);

  document.cookie = `${AUTH_TOKEN_COOKIE_KEY}=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
}

/**
 * Remove auth token from cookies
 */
export function removeAuthToken(): void {
  if (typeof document === "undefined") return;

  document.cookie = `${AUTH_TOKEN_COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}
