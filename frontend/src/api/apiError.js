const codeMessages = {
  INVALID_REQUEST: "Dữ liệu gửi lên chưa hợp lệ. Vui lòng kiểm tra và thử lại.",
  REQUEST_REJECTED: "Yêu cầu chưa hợp lệ. Vui lòng kiểm tra dữ liệu và thử lại.",
  UPLOAD_TOO_LARGE: "Tệp tải lên vượt quá dung lượng cho phép.",
  RESOURCE_NOT_FOUND: "Không tìm thấy dữ liệu hoặc bạn không có quyền truy cập.",
  INTERNAL_ERROR: "Máy chủ gặp sự cố. Vui lòng thử lại sau.",
};

const statusMessages = {
  400: "Dữ liệu gửi lên chưa hợp lệ.",
  401: "Phiên đăng nhập không còn hợp lệ.",
  403: "Bạn không có quyền thực hiện thao tác này.",
  404: "Không tìm thấy dữ liệu được yêu cầu.",
  409: "Dữ liệu đã thay đổi. Vui lòng tải lại và thử lại.",
  413: "Tệp tải lên vượt quá dung lượng cho phép.",
  500: "Máy chủ gặp sự cố. Vui lòng thử lại sau.",
};

export class ApiError extends Error {
  constructor(message, { status = 0, code = "", details = [] } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function validationDetails(problem) {
  if (Array.isArray(problem?.errors)) {
    return problem.errors.map((error) => error.message ?? error.defaultMessage ?? String(error)).filter(Boolean);
  }
  if (problem?.errors && typeof problem.errors === "object") {
    return Object.values(problem.errors).flat().map(String).filter(Boolean);
  }
  if (Array.isArray(problem?.violations)) {
    return problem.violations.map((violation) => violation.message ?? String(violation)).filter(Boolean);
  }
  return [];
}

export async function apiErrorFromResponse(response) {
  let problem = null;
  try {
    problem = await response.json();
  } catch {
    // Some proxy and server failures do not return a JSON body.
  }

  const details = validationDetails(problem);
  const message = details.length > 0
    ? details.join(" ")
    : codeMessages[problem?.code]
      ?? problem?.detail
      ?? problem?.message
      ?? statusMessages[response.status]
      ?? `Yêu cầu thất bại (${response.status}).`;

  return new ApiError(message, {
    status: response.status,
    code: problem?.code ?? "",
    details,
  });
}

export function networkApiError(error) {
  if (error?.name === "AbortError" || error instanceof ApiError) return error;
  return new ApiError("Không thể kết nối tới StudyMate. Hãy kiểm tra mạng và thử lại.", {
    code: "NETWORK_ERROR",
  });
}

export function getUserErrorMessage(error) {
  if (error?.name === "AbortError") return "";
  return error instanceof ApiError
    ? error.message
    : "Đã xảy ra lỗi ngoài dự kiến. Vui lòng thử lại.";
}
