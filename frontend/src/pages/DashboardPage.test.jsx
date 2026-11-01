import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCourse, deleteCourse, getCourses, updateCourse } from "../api/courseApi";
import DashboardPage from "./DashboardPage";

vi.mock("../api/courseApi", () => ({
  createCourse: vi.fn(),
  deleteCourse: vi.fn(),
  getCourses: vi.fn(),
  updateCourse: vi.fn(),
}));

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
});
