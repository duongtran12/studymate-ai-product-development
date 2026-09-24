import { apiRequest } from "./apiClient";

export function getStudySessions(courseId, signal) {
  const query = courseId ? `?courseId=${encodeURIComponent(courseId)}` : "";
  return apiRequest(`/api/v1/study-sessions${query}`, { signal });
}

export function getStudySession(sessionId, signal) {
  return apiRequest(`/api/v1/study-sessions/${sessionId}`, { signal });
}

export function createStudySession(payload) {
  return apiRequest("/api/v1/study-sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function getStudySessionMessages(sessionId, signal) {
  return apiRequest(`/api/v1/study-sessions/${sessionId}/messages`, { signal });
}

export function sendStudySessionQuestion(sessionId, question) {
  return apiRequest(`/api/v1/study-sessions/${sessionId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
}
