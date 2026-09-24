import { apiRequest } from "./apiClient";
export { getCourses } from "./courseApi";

export function getDocuments(courseId, signal) {
  return apiRequest(`/api/v1/courses/${courseId}/documents`, { signal });
}

export function uploadDocument(courseId, file) {
  const body = new FormData();
  body.append("file", file);
  return apiRequest(`/api/v1/courses/${courseId}/documents`, { method: "POST", body });
}

export function deleteDocument(courseId, documentId) {
  return apiRequest(`/api/v1/courses/${courseId}/documents/${documentId}`, { method: "DELETE" });
}
