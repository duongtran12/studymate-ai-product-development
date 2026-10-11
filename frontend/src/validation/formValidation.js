export const COURSE_FIELD_LIMITS = {
  name: 160,
  code: 50,
  description: 1000,
};

export const DOCUMENT_LIMITS = {
  fileName: 255,
  fileSizeBytes: 10 * 1024 * 1024,
};

export const STUDY_QUESTION_MAX_LENGTH = 4000;

function textError(value, { label, required = false, maxLength }) {
  const normalized = value?.trim() ?? "";
  if (required && !normalized) return `${label} không được để trống.`;
  if (maxLength && normalized.length > maxLength) return `${label} không được vượt quá ${maxLength} ký tự.`;
  return "";
}

export function validateCourse(values) {
  return {
    name: textError(values.name, {
      label: "Tên môn học",
      required: true,
      maxLength: COURSE_FIELD_LIMITS.name,
    }),
    code: textError(values.code, {
      label: "Mã môn học",
      maxLength: COURSE_FIELD_LIMITS.code,
    }),
    description: textError(values.description, {
      label: "Mô tả",
      maxLength: COURSE_FIELD_LIMITS.description,
    }),
  };
}

export function validateDocumentFile(file) {
  if (!file) return "Hãy chọn một tệp để tải lên.";
  if (!file.name?.trim()) return "Tên tệp không hợp lệ.";
  if (file.name.trim().length > DOCUMENT_LIMITS.fileName) {
    return `Tên tệp không được vượt quá ${DOCUMENT_LIMITS.fileName} ký tự.`;
  }
  const extension = file.name.toLowerCase().split(".").pop();
  if (!["pdf", "docx"].includes(extension)) return "Chỉ hỗ trợ tệp PDF hoặc DOCX.";
  if (file.size > DOCUMENT_LIMITS.fileSizeBytes) return "Tệp không được lớn hơn 10 MB.";
  return "";
}

export function validateStudyQuestion(question) {
  return textError(question, {
    label: "Câu hỏi",
    required: true,
    maxLength: STUDY_QUESTION_MAX_LENGTH,
  });
}

export function firstValidationError(errors) {
  return Object.values(errors).find(Boolean) ?? "";
}
