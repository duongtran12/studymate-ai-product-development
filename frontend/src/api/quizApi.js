import { apiRequest } from "./apiClient";

export function getAiStatus(signal) {
  return apiRequest("/api/v1/ai/status", { signal });
}

export function getCourseQuizzes(courseId, signal) {
  return apiRequest(`/api/v1/courses/${courseId}/quizzes`, { signal });
}

export function getQuiz(quizId, signal) {
  return apiRequest(`/api/v1/quizzes/${quizId}`, { signal });
}

export function deleteQuiz(quizId) {
  return apiRequest(`/api/v1/quizzes/${quizId}`, { method: "DELETE" });
}

export function getQuizAttempts(quizId, signal) {
	return apiRequest(`/api/v1/quizzes/${quizId}/attempts`, { signal });
}

export function createQuiz(courseId, quiz) {
  return apiRequest(`/api/v1/courses/${courseId}/quizzes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quiz),
  });
}

export function generateQuiz(courseId, payload) {
  return apiRequest(`/api/v1/courses/${courseId}/quizzes/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function submitQuizAttempt(quizId, answers) {
  return apiRequest(`/api/v1/quizzes/${quizId}/attempts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
}
