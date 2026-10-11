import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import QuizPage from "./QuizPage";

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
    render(<QuizPage loading />);

    expect(screen.getByRole("status").textContent).toContain("Đang chuẩn bị quiz");
  });

  it("shows an API error and allows retry", () => {
    const retry = vi.fn();
    render(<QuizPage error="Không tải được quiz." onRetry={retry} />);

    expect(screen.getByRole("alert").textContent).toContain("Không tải được quiz.");
    fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("shows the empty state for invalid quiz input", () => {
    render(<QuizPage quiz={{ ...validQuiz, options: [] }} />);

    expect(screen.getByText("Chưa có quiz")).toBeTruthy();
    expect(screen.queryByRole("radio")).toBeNull();
  });

  it("submits a valid answer with feedback and resets the attempt", () => {
    render(<QuizPage quiz={validQuiz} />);
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
});
