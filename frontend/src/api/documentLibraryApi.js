const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const USER_ID = import.meta.env.VITE_API_USER_ID ?? "1";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { "X-User-Id": USER_ID, ...options.headers },
  });

  if (!response.ok) {
    let message = `Yêu cầu thất bại (${response.status}).`;
    try {
      const problem = await response.json();
      message = problem.detail ?? problem.message ?? message;
    } catch {
      // Keep the status-based fallback for an empty or non-JSON response.
    }
    throw new Error(message);
  }

  return response.status === 204 ? null : response.json();
}

export function getCourses(signal) {
  return request("/api/v1/courses", { signal });
}

export function getDocuments(courseId, signal) {
  return request(`/api/v1/courses/${courseId}/documents`, { signal });
}

export function uploadDocument(courseId, file) {
  const body = new FormData();
  body.append("file", file);
  return request(`/api/v1/courses/${courseId}/documents`, { method: "POST", body });
}

export function deleteDocument(courseId, documentId) {
  return request(`/api/v1/courses/${courseId}/documents/${documentId}`, { method: "DELETE" });
}
