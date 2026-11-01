import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EmptyState, ErrorState, LoadingState } from "./ContentState";

afterEach(() => {
  cleanup();
});

describe("shared async content states", () => {
  it("announces a loading state", () => {
    render(<LoadingState message="Đang tải môn học…" />);

    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.textContent).toContain("Đang tải môn học…");
  });

  it("renders an empty-state explanation and recovery action", () => {
    const create = vi.fn();
    render(
      <EmptyState
        title="Bạn chưa có môn học"
        description="Tạo môn học đầu tiên để bắt đầu."
        action={<button type="button" onClick={create}>Tạo môn học</button>}
      />,
    );

    expect(screen.getByText("Bạn chưa có môn học")).toBeTruthy();
    expect(screen.getByText("Tạo môn học đầu tiên để bắt đầu.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Tạo môn học" }));
    expect(create).toHaveBeenCalledOnce();
  });

  it("renders a clear error and invokes retry once", () => {
    const retry = vi.fn();
    render(<ErrorState message="Không thể kết nối tới StudyMate." onRetry={retry} />);

    expect(screen.getByRole("alert").textContent).toContain("Không thể kết nối tới StudyMate.");
    fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
