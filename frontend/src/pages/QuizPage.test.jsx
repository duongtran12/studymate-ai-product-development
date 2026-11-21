import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import QuizPage from "./QuizPage";

import { getCourses } from "../api/courseApi";
import { getDocuments } from "../api/documentLibraryApi";
import { getAiStatus, getCourseQuizzes, getQuizAttempts } from "../api/quizApi";

vi.mock("../api/courseApi", () => ({ getCourses: vi.fn() }));
vi.mock("../api/documentLibraryApi", () => ({ getDocuments: vi.fn() }));
vi.mock("../api/quizApi", () => ({
  createQuiz: vi.fn(), deleteQuiz: vi.fn(), generateQuiz: vi.fn(), getAiStatus: vi.fn(), getCourseQuizzes: vi.fn(), getQuizAttempts: vi.fn(), submitQuizAttempt: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
  getCourses.mockResolvedValue([{ id: 7, name: "Software Testing" }]);
  getDocuments.mockResolvedValue([]);
  getCourseQuizzes.mockResolvedValue([]);
  getQuizAttempts.mockResolvedValue([]);
  getAiStatus.mockResolvedValue({ ready: false, message: "AI chưa sẵn sàng" });
});

function renderQuiz(page) {
  return render(<MemoryRouter>{page}</MemoryRouter>);
}

afterEach(() => {
  cleanup();
});

const validQuiz = {
  title: "Quiz: Software Architecture",
  source: "architecture.pdf",
  question: "Dependency injection cung cấp dependency từ đâu?",
  options: ["Bên ngoài", "Database", "CSS"],
  correctAnswer: "Bên ngoài",
};

describe("QuizPage regression states", () => {
  it("shows a loading state while a quiz is being prepared", () => {
    renderQuiz(<QuizPage loading />);

    expect(screen.getByRole("status").textContent).toContain("Đang chuẩn bị quiz");
  });

  it("shows an API error and allows retry", () => {
    const retry = vi.fn();
    renderQuiz(<QuizPage error="Không tải được quiz." onRetry={retry} />);

    expect(screen.getByRole("alert").textContent).toContain("Không tải được quiz.");
    fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("shows the empty state for invalid quiz input", () => {
    renderQuiz(<QuizPage quiz={{ ...validQuiz, options: [] }} />);

    expect(screen.getByText("Chưa có quiz")).toBeTruthy();
    expect(screen.queryByRole("radio")).toBeNull();
  });

  it("submits a valid answer with feedback and resets the attempt", () => {
    renderQuiz(<QuizPage quiz={validQuiz} />);
    const submit = screen.getByRole("button", { name: "Nộp câu trả lời" });

    expect(submit.disabled).toBe(true);
    fireEvent.click(screen.getByRole("radio", { name: "Bên ngoài" }));
    expect(submit.disabled).toBe(false);

    fireEvent.click(submit);
    expect(screen.getByText("Chính xác.")).toBeTruthy();
    expect(screen.getByText(/Nguồn: architecture\.pdf/)).toBeTruthy();
    expect(submit.disabled).toBe(true);

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Làm lại" }));
    });
    expect(screen.queryByText("Chính xác.")).toBeNull();
    expect(screen.getByRole("button", { name: "Nộp câu trả lời" }).disabled).toBe(true);
  });

  it("filters the available quiz selector by title", async () => {
    getCourseQuizzes.mockResolvedValue([
      { id: 11, title: "Kiểm thử đơn vị", questions: [{ id: 1, questionText: "Câu 1", options: ["A", "B"], correctAnswer: "A" }] },
      { id: 12, title: "Kiểm thử tích hợp", questions: [{ id: 2, questionText: "Câu 2", options: ["A", "B"], correctAnswer: "B" }] },
    ]);
    render(<MemoryRouter initialEntries={["/quizzes?course=7&quiz=11"]}><QuizPage /></MemoryRouter>);

    await screen.findByRole("heading", { name: "Kiểm thử đơn vị" });
    fireEvent.change(screen.getByLabelText("Tìm bộ Quiz"), { target: { value: "tích hợp" } });
    await waitFor(() => expect(screen.getByRole("option", { name: "Kiểm thử tích hợp" })).toBeTruthy());
    expect(screen.queryByRole("option", { name: "Kiểm thử đơn vị" })).toBeNull();
  });
});
