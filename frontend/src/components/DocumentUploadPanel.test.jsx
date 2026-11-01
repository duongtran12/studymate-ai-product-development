import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../api/apiError";
import { uploadDocument } from "../api/documentLibraryApi";
import DocumentUploadPanel from "./DocumentUploadPanel";

vi.mock("../api/documentLibraryApi", () => ({
  uploadDocument: vi.fn(),
}));

function deferred() {
  let resolve;
  const promise = new Promise((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function documentResponse(fileName, id = 11) {
  return {
    id,
    courseId: 7,
    fileName,
    processingStatus: "UPLOADED",
  };
}

function renderPanel(overrides = {}) {
  const props = {
    courseId: "7",
    onUploaded: vi.fn(),
    onBusyChange: vi.fn(),
    ...overrides,
  };
  render(<DocumentUploadPanel {...props} />);
  return { props, input: document.getElementById("document-upload") };
}

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("DocumentUploadPanel", () => {
  it.each([
    ["lecture.pdf", "application/pdf"],
    ["notes.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ])("uploads a valid %s document and reports success", async (fileName, type) => {
    const uploaded = documentResponse(fileName);
    uploadDocument.mockResolvedValue(uploaded);
    const { props, input } = renderPanel();
    const file = new File(["study content"], fileName, { type });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(uploadDocument).toHaveBeenCalledWith("7", file));
    expect(props.onUploaded).toHaveBeenCalledWith(uploaded);
    expect(props.onBusyChange).toHaveBeenNthCalledWith(1, true);
    expect(props.onBusyChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole("status").textContent).toContain(`Đã tải lên “${fileName}”`);
  });

  it("shows a client validation error without calling the API", () => {
    const { input } = renderPanel();
    const file = new File(["plain text"], "notes.txt", { type: "text/plain" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(uploadDocument).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toContain("Chỉ hỗ trợ tệp PDF hoặc DOCX");
  });

  it("disables file selection while upload is pending to prevent duplicate submissions", async () => {
    const pending = deferred();
    uploadDocument.mockReturnValue(pending.promise);
    const { input } = renderPanel();
    const file = new File(["study content"], "lecture.pdf", { type: "application/pdf" });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(input.disabled).toBe(true));
    expect(screen.getByText("Đang tải lên…")).toBeTruthy();
    expect(uploadDocument).toHaveBeenCalledTimes(1);

    pending.resolve(documentResponse(file.name));
    await waitFor(() => expect(input.disabled).toBe(false));
    expect(uploadDocument).toHaveBeenCalledTimes(1);
  });

  it("shows a backend upload error and retries the same file", async () => {
    const uploaded = documentResponse("lecture.pdf");
    uploadDocument
      .mockRejectedValueOnce(new ApiError("Tệp tải lên vượt quá dung lượng cho phép.", {
        status: 413,
        code: "UPLOAD_TOO_LARGE",
      }))
      .mockResolvedValueOnce(uploaded);
    const { props, input } = renderPanel();
    const file = new File(["study content"], "lecture.pdf", { type: "application/pdf" });

    fireEvent.change(input, { target: { files: [file] } });
    expect((await screen.findByRole("alert")).textContent).toContain("Tệp tải lên vượt quá dung lượng");
    fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));

    await waitFor(() => expect(uploadDocument).toHaveBeenCalledTimes(2));
    expect(props.onUploaded).toHaveBeenCalledWith(uploaded);
    expect(screen.getByRole("status").textContent).toContain("Đã tải lên");
  });
});
