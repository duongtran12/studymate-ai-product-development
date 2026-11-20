import { apiRequest } from "./apiClient";

export function getProfile(signal) {
  return apiRequest("/api/v1/profile", { signal });
}

export function updateProfile(profile) {
  return apiRequest("/api/v1/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
}
