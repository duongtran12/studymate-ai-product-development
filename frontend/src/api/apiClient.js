import { apiErrorFromResponse, networkApiError } from "./apiError";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const USER_ID = import.meta.env.VITE_API_USER_ID ?? "1";

export async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { "X-User-Id": USER_ID, ...options.headers },
    });
  } catch (error) {
    throw networkApiError(error);
  }

  if (!response.ok) throw await apiErrorFromResponse(response);

  return response.status === 204 ? null : response.json();
}
