import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCourses, getDocuments } from "../api/documentLibraryApi";
import DocumentLibraryPage from "./DocumentLibraryPage";

vi.mock("../api/documentLibraryApi", () => ({
  deleteDocument: vi.fn(),
  getCourses: vi.fn(),
  getDocuments: vi.fn(),
  uploadDocument: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("Document Library UI", () => {
  it("loads the selected course and displays its documents", async () => {
    getCourses.mockResolvedValue([{ id: 7, name: "Software Testing" }]);
    getDocuments.mockResolvedValue([{
      id: 11,
      courseId: 7,
      fileName: "chapter-08.pdf",
      fileSizeBytes: 2048,
      processingStatus: "UPLOADED",
      createdAt: "2026-11-01T08:00:00Z",
    }]);

    render(
      <MemoryRouter initialEntries={["/documents?course=7"]}>
        <DocumentLibraryPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("status").textContent).toContain("Đang tải môn học");
    expect(await screen.findByRole("heading", { name: "chapter-08.pdf" })).toBeTruthy();
    expect(screen.getByText("Đã tải lên")).toBeTruthy();
    expect(screen.getByText(/2 KB/)).toBeTruthy();
    expect(getDocuments).toHaveBeenCalledWith("7", expect.any(AbortSignal));
  });

  it("shows an empty state when the course has no documents", async () => {
    getCourses.mockResolvedValue([{ id: 7, name: "Software Testing" }]);
    getDocuments.mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={["/documents?course=7"]}>
        <DocumentLibraryPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Môn học chưa có tài liệu")).toBeTruthy();
  });
});
