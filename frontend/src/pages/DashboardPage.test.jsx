import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCourse, deleteCourse, getCourseLearningGoal, getCourses, saveCourseLearningGoal, updateCourse } from "../api/courseApi";
import { getDocuments } from "../api/documentLibraryApi";
import { getCourseQuizzes, getQuizAttempts } from "../api/quizApi";
import { getStudySessions } from "../api/studySessionApi";
import DashboardPage from "./DashboardPage";

vi.mock("../api/courseApi", () => ({
  createCourse: vi.fn(),
  deleteCourse: vi.fn(),
  getCourseLearningGoal: vi.fn(),
  getCourses: vi.fn(),
  saveCourseLearningGoal: vi.fn(),
  updateCourse: vi.fn(),
}));
vi.mock("../api/documentLibraryApi", () => ({ getDocuments: vi.fn() }));
vi.mock("../api/quizApi", () => ({ getCourseQuizzes: vi.fn(), getQuizAttempts: vi.fn() }));
vi.mock("../api/studySessionApi", () => ({ getStudySessions: vi.fn() }));

const course = {
  id: 7,
  name: "Software Testing",
  code: "SWT301",
  description: "Test automation",
};

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  getCourses.mockResolvedValue([course]);
  getCourseLearningGoal.mockResolvedValue({ courseId: 7, configured: false });
  getDocuments.mockResolvedValue([]);
  getCourseQuizzes.mockResolvedValue([]);
  getStudySessions.mockResolvedValue([]);
  getQuizAttempts.mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Dashboard course UI", () => {
  it("loads and displays courses returned by the API", async () => {
    renderDashboard();

    expect(screen.getByRole("status").textContent).toContain("Đang tải danh sách môn học");
    expect(await screen.findByRole("heading", { name: course.name })).toBeTruthy();
    expect(screen.getByText(course.code)).toBeTruthy();
    expect(screen.getByText(course.description)).toBeTruthy();
  });

  it("creates a course from the reusable editor", async () => {
    getCourses.mockResolvedValue([]);
    const created = { id: 8, name: "Cơ sở dữ liệu", code: "DB101", description: "SQL cơ bản" };
    createCourse.mockResolvedValue(created);
    renderDashboard();

    await screen.findByText("Bạn chưa có môn học");
    fireEvent.click(screen.getByRole("button", { name: "+ Tạo môn học" }));
    fireEvent.change(screen.getByLabelText("Tên môn học"), { target: { value: "  Cơ sở dữ liệu  " } });
    fireEvent.change(screen.getByLabelText("Mã môn học"), { target: { value: " DB101 " } });
    fireEvent.change(screen.getByLabelText("Mô tả"), { target: { value: " SQL cơ bản " } });
    fireEvent.click(screen.getByRole("button", { name: "Thêm môn học" }));

    await waitFor(() => expect(createCourse).toHaveBeenCalledWith({
      name: "Cơ sở dữ liệu",
      code: "DB101",
      description: "SQL cơ bản",
    }));
    expect(await screen.findByRole("heading", { name: created.name })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("Đã tạo môn học");
  });

  it("edits an existing course and refreshes the card", async () => {
    const updated = { ...course, name: "Quality Engineering", code: "QE401", description: "Updated" };
    updateCourse.mockResolvedValue(updated);
    renderDashboard();

    await screen.findByRole("heading", { name: course.name });
    fireEvent.click(screen.getByRole("button", { name: "Sửa" }));
    fireEvent.change(screen.getByLabelText("Tên môn học"), { target: { value: updated.name } });
    fireEvent.change(screen.getByLabelText("Mã môn học"), { target: { value: updated.code } });
    fireEvent.change(screen.getByLabelText("Mô tả"), { target: { value: updated.description } });
    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));

    await waitFor(() => expect(updateCourse).toHaveBeenCalledWith(course.id, {
      name: updated.name,
      code: updated.code,
      description: updated.description,
    }));
    expect(await screen.findByRole("heading", { name: updated.name })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("Đã cập nhật môn học");
  });

  it("deletes a course only after confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    deleteCourse.mockResolvedValue(null);
    renderDashboard();

    await screen.findByRole("heading", { name: course.name });
    fireEvent.click(screen.getByRole("button", { name: "Xóa" }));

    await waitFor(() => expect(deleteCourse).toHaveBeenCalledWith(course.id));
    expect(screen.queryByRole("heading", { name: course.name })).toBeNull();
    expect(screen.getByRole("status").textContent).toContain("Đã xóa môn học");
  });

  it("shows per-quiz performance and flags a weak quiz for review", async () => {
    getCourseQuizzes.mockResolvedValue([{ id: 11, courseId: 7, title: "Kiểm thử đơn vị" }, { id: 12, courseId: 7, title: "Tích hợp API" }]);
    getQuizAttempts.mockImplementation((quizId) => Promise.resolve(quizId === 11
      ? [{ id: 1, score: 50, submittedAt: "2026-11-20T10:00:00Z" }, { id: 2, score: 60, submittedAt: "2026-11-20T11:00:00Z" }]
      : [{ id: 3, score: 90, submittedAt: "2026-11-20T12:00:00Z" }]));
    renderDashboard();

    expect(await screen.findByText("Kiểm thử đơn vị")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Ôn lại · TB 55%" }).getAttribute("href")).toBe("/quizzes?course=7&quiz=11");
    expect(screen.getByText("Ổn định · TB 90%")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Mở Quiz" }).getAttribute("href")).toBe("/quizzes?course=7&quiz=11");
  });

  it("suggests adding documents and a quiz when a course is empty", async () => {
    renderDashboard();

    expect(await screen.findByText(`Thêm tài liệu cho ${course.name}`)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Tải tài liệu" }).getAttribute("href")).toBe("/documents?course=7");
    expect(screen.getByText(`Tạo Quiz cho ${course.name}`)).toBeTruthy();
  });

  it("saves a learning goal for the selected course", async () => {
    saveCourseLearningGoal.mockResolvedValue({ courseId: 7, configured: true, targetAttemptCount: 4, targetAverageScore: 85 });
    renderDashboard();

    await screen.findByRole("heading", { name: course.name });
    fireEvent.change(screen.getByLabelText("Số lượt Quiz mục tiêu"), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText("Điểm trung bình mục tiêu (%)"), { target: { value: "85" } });
    fireEvent.click(screen.getByRole("button", { name: "Lưu mục tiêu" }));

    await waitFor(() => expect(saveCourseLearningGoal).toHaveBeenCalledWith(7, { targetAttemptCount: 4, targetAverageScore: 85 }));
  });
});
