import { useState } from "react";
import {
  COURSE_FIELD_LIMITS,
  firstValidationError,
  validateCourse,
} from "../validation/formValidation";

const emptyValues = { name: "", code: "", description: "" };

function normalizeValues(values) {
  return {
    name: values?.name ?? "",
    code: values?.code ?? "",
    description: values?.description ?? "",
  };
}

function coursePayload(values) {
  return {
    name: values.name.trim(),
    code: values.code.trim() || null,
    description: values.description.trim() || null,
  };
}

export default function CourseEditor({
  idPrefix,
  initialValues = emptyValues,
  busy = false,
  submitLabel = "Lưu môn học",
  pendingLabel = "Đang lưu…",
  onSubmit,
  onCancel,
  resetOnSuccess = false,
  className = "",
}) {
  const [values, setValues] = useState(() => normalizeValues(initialValues));
  const [validationError, setValidationError] = useState("");

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setValidationError("");
  }

  async function submit(event) {
    event.preventDefault();
    if (busy) return;

    const error = firstValidationError(validateCourse(values));
    if (error) {
      setValidationError(error);
      return;
    }

    const submitted = await onSubmit(coursePayload(values));
    if (submitted && resetOnSuccess) setValues(emptyValues);
  }

  return (
    <form className={`course-editor ${className}`.trim()} onSubmit={submit} noValidate>
      <label htmlFor={`${idPrefix}-name`}>Tên môn học</label>
      <input
        id={`${idPrefix}-name`}
        maxLength={COURSE_FIELD_LIMITS.name}
        value={values.name}
        onChange={(event) => updateField("name", event.target.value)}
        disabled={busy}
        autoFocus
        required
      />

      <label htmlFor={`${idPrefix}-code`}>Mã môn học</label>
      <input
        id={`${idPrefix}-code`}
        maxLength={COURSE_FIELD_LIMITS.code}
        value={values.code}
        onChange={(event) => updateField("code", event.target.value)}
        disabled={busy}
      />

      <label htmlFor={`${idPrefix}-description`}>Mô tả</label>
      <textarea
        id={`${idPrefix}-description`}
        maxLength={COURSE_FIELD_LIMITS.description}
        rows="3"
        value={values.description}
        onChange={(event) => updateField("description", event.target.value)}
        disabled={busy}
      />

      {validationError && <p className="form-error" role="alert">{validationError}</p>}

      <div className="course-card-actions">
        <button className="primary-button" type="submit" disabled={!values.name.trim() || busy}>
          {busy ? pendingLabel : submitLabel}
        </button>
        {onCancel && (
          <button className="secondary-button" type="button" onClick={onCancel} disabled={busy}>
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}
