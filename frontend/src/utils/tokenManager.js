// src/utils/tokenManager.js
// Centralized token management for access/refresh tokens

export function getAccessToken() {
  return localStorage.getItem("access");
}

export function getRefreshToken() {
  return localStorage.getItem("refresh");
}

export function setAccessToken(token) {
  localStorage.setItem("access", token);
}

export function setRefreshToken(token) {
  localStorage.setItem("refresh", token);
}

export function clearTokens() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token found. Please log in again.");
  const res = await fetch("http://localhost:8000/api/token/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });
  if (!res.ok) throw new Error("Failed to refresh token. Please log in again.");
  const data = await res.json();
  setAccessToken(data.access);
  return data.access;
}
