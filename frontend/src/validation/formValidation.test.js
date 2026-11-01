import { describe, expect, it } from "vitest";
import {
  COURSE_FIELD_LIMITS,
  DOCUMENT_LIMITS,
  STUDY_QUESTION_MAX_LENGTH,
  firstValidationError,
  validateCourse,
  validateDocumentFile,
  validateStudyQuestion,
} from "./formValidation";

describe("course form validation", () => {
  it("accepts valid values at their boundaries", () => {
    const errors = validateCourse({
      name: "N".repeat(COURSE_FIELD_LIMITS.name),
      code: "C".repeat(COURSE_FIELD_LIMITS.code),
      description: "D".repeat(COURSE_FIELD_LIMITS.description),
    });

    expect(errors).toEqual({ name: "", code: "", description: "" });
    expect(firstValidationError(errors)).toBe("");
  });

  it("rejects a missing course name", () => {
    const errors = validateCourse({ name: "   ", code: "", description: "" });

    expect(errors.name).toBe("Tên môn học không được để trống.");
    expect(firstValidationError(errors)).toBe(errors.name);
  });

  it("reports every course field that exceeds its limit", () => {
    const errors = validateCourse({
      name: "N".repeat(COURSE_FIELD_LIMITS.name + 1),
      code: "C".repeat(COURSE_FIELD_LIMITS.code + 1),
      description: "D".repeat(COURSE_FIELD_LIMITS.description + 1),
    });

    expect(errors.name).toContain(String(COURSE_FIELD_LIMITS.name));
    expect(errors.code).toContain(String(COURSE_FIELD_LIMITS.code));
    expect(errors.description).toContain(String(COURSE_FIELD_LIMITS.description));
  });
});

describe("document upload validation", () => {
  it.each([
    ["lecture.pdf", "application/pdf"],
    ["notes.DOCX", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ])("accepts supported document %s", (name, type) => {
    const file = new File(["content"], name, { type });

    expect(validateDocumentFile(file)).toBe("");
  });

  it("requires a selected file with a usable name", () => {
    expect(validateDocumentFile(null)).toBe("Hãy chọn một tệp để tải lên.");
    expect(validateDocumentFile({ name: "   ", size: 1 })).toBe("Tên tệp không hợp lệ.");
  });

  it("rejects unsupported extensions", () => {
    const file = new File(["content"], "notes.txt", { type: "text/plain" });

    expect(validateDocumentFile(file)).toBe("Chỉ hỗ trợ tệp PDF hoặc DOCX.");
  });

  it("accepts exactly 10 MB and rejects a larger document", () => {
    const atLimit = { name: "limit.pdf", size: DOCUMENT_LIMITS.fileSizeBytes };
    const overLimit = { name: "large.pdf", size: DOCUMENT_LIMITS.fileSizeBytes + 1 };

    expect(validateDocumentFile(atLimit)).toBe("");
    expect(validateDocumentFile(overLimit)).toBe("Tệp không được lớn hơn 10 MB.");
  });

  it("rejects a filename longer than 255 characters", () => {
    const file = { name: `${"a".repeat(DOCUMENT_LIMITS.fileName - 3)}.pdf`, size: 1 };

    expect(file.name).toHaveLength(DOCUMENT_LIMITS.fileName + 1);
    expect(validateDocumentFile(file)).toContain(String(DOCUMENT_LIMITS.fileName));
  });
});

describe("study question validation", () => {
  it("requires a non-blank question", () => {
    expect(validateStudyQuestion("  ")).toBe("Câu hỏi không được để trống.");
  });

  it("accepts the maximum length and rejects one character more", () => {
    expect(validateStudyQuestion("q".repeat(STUDY_QUESTION_MAX_LENGTH))).toBe("");
    expect(validateStudyQuestion("q".repeat(STUDY_QUESTION_MAX_LENGTH + 1)))
      .toContain(String(STUDY_QUESTION_MAX_LENGTH));
  });
});
