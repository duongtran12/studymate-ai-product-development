import { apiErrorFromResponse, networkApiError } from "./apiError";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const USER_ID = import.meta.env.VITE_API_USER_ID ?? "1";
const SESSION_KEY = "studymate.session-token";

export function saveSessionToken(token) {
  localStorage.setItem(SESSION_KEY, token);
}

export function clearSessionToken() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSessionToken() {
  return localStorage.getItem(SESSION_KEY);
}

export async function apiRequest(path, options = {}) {
  let response;
  const token = getSessionToken();
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : { "X-User-Id": USER_ID }), ...options.headers },
    });
  } catch (error) {
    throw networkApiError(error);
  }

  if (!response.ok) throw await apiErrorFromResponse(response);

  return response.status === 204 ? null : response.json();
}
