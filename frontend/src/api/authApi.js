import { apiRequest, saveSessionToken } from "./apiClient";

export async function registerAccount(account) {
  const response = await apiRequest("/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(account),
  });
  saveSessionToken(response.token);
  return response;
}

export async function loginAccount(credentials) {
  const response = await apiRequest("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  saveSessionToken(response.token);
  return response;
}
