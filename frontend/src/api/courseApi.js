import { apiRequest } from "./apiClient";

export function getCourses(signal) {
  return apiRequest("/api/v1/courses", { signal });
}

export function createCourse(course) {
  return apiRequest("/api/v1/courses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(course),
  });
}
