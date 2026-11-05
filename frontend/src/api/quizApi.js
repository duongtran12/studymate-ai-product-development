import { apiRequest } from "./apiClient";

export function getCourseQuizzes(courseId, signal) {
  return apiRequest(`/api/v1/courses/${courseId}/quizzes`, { signal });
}

export function getQuiz(quizId, signal) {
  return apiRequest(`/api/v1/quizzes/${quizId}`, { signal });
}

export function createQuiz(courseId, quiz) {
  return apiRequest(`/api/v1/courses/${courseId}/quizzes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quiz),
  });
}

export function submitQuizAttempt(quizId, answers) {
  return apiRequest(`/api/v1/quizzes/${quizId}/attempts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
}
