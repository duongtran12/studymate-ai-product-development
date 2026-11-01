import { describe, expect, it } from "vitest";
import {
  ApiError,
  apiErrorFromResponse,
  getUserErrorMessage,
  networkApiError,
} from "./apiError";

function response(status, body, { invalidJson = false } = {}) {
  return {
    status,
    json: invalidJson
      ? async () => { throw new SyntaxError("Invalid JSON"); }
      : async () => body,
  };
}

describe("backend API error conversion", () => {
  it("uses field validation details when the backend provides them", async () => {
    const error = await apiErrorFromResponse(response(400, {
      code: "INVALID_REQUEST",
      errors: [
        { message: "Tên môn học không hợp lệ." },
        { defaultMessage: "Mã môn học quá dài." },
      ],
    }));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.code).toBe("INVALID_REQUEST");
    expect(error.details).toEqual(["Tên môn học không hợp lệ.", "Mã môn học quá dài."]);
    expect(error.message).toBe("Tên môn học không hợp lệ. Mã môn học quá dài.");
  });

  it("maps StudyMate problem codes to a clear user message", async () => {
    const error = await apiErrorFromResponse(response(404, { code: "RESOURCE_NOT_FOUND" }));

    expect(error.message).toBe("Không tìm thấy dữ liệu hoặc bạn không có quyền truy cập.");
  });

  it("falls back to backend detail, HTTP status, then a generic status message", async () => {
    const detailed = await apiErrorFromResponse(response(409, { detail: "Môn học đã thay đổi." }));
    const statusOnly = await apiErrorFromResponse(response(403, null, { invalidJson: true }));
    const unknown = await apiErrorFromResponse(response(418, {}));

    expect(detailed.message).toBe("Môn học đã thay đổi.");
    expect(statusOnly.message).toBe("Bạn không có quyền thực hiện thao tác này.");
    expect(unknown.message).toBe("Yêu cầu thất bại (418).");
  });
});

describe("network and display errors", () => {
  it("converts a network failure without exposing its internal message", () => {
    const error = networkApiError(new Error("ECONNREFUSED at internal-host"));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("NETWORK_ERROR");
    expect(getUserErrorMessage(error)).toBe("Không thể kết nối tới StudyMate. Hãy kiểm tra mạng và thử lại.");
    expect(error.message).not.toContain("internal-host");
  });

  it("preserves an ApiError and ignores request cancellation", () => {
    const apiError = new ApiError("Tệp quá lớn.", { status: 413, code: "UPLOAD_TOO_LARGE" });
    const abortError = new Error("aborted");
    abortError.name = "AbortError";

    expect(networkApiError(apiError)).toBe(apiError);
    expect(networkApiError(abortError)).toBe(abortError);
    expect(getUserErrorMessage(abortError)).toBe("");
  });

  it("hides unexpected internal errors from the user", () => {
    expect(getUserErrorMessage(new Error("database password leaked")))
      .toBe("Đã xảy ra lỗi ngoài dự kiến. Vui lòng thử lại.");
  });
});
