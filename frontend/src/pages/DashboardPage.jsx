import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createCourse, deleteCourse, getCourses, updateCourse } from "../api/courseApi";

const emptyEditValues = { name: "", code: "", description: "" };

function coursePayload(values) {
  return {
    name: values.name.trim(),
    code: values.code.trim() || null,
    description: values.description.trim() || null,
  };
}

export default function DashboardPage() {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState(emptyEditValues);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadCourses = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      setCourses(await getCourses(signal));
    } catch (requestError) {
      if (requestError.name !== "AbortError") setError(requestError.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadCourses(controller.signal);
    return () => controller.abort();
  }, [loadCourses]);

  async function submitCourse(event) {
    event.preventDefault();
    const name = newCourse.trim();
    if (!name || submitting) return;

    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      const createdCourse = await createCourse({ name, code: null, description: null });
      setCourses((current) => [createdCourse, ...current]);
      setNewCourse("");
      setShowForm(false);
      setNotice(`Đã tạo môn học “${createdCourse.name}”.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function startEditing(course) {
    setEditingId(course.id);
    setEditValues({ name: course.name, code: course.code ?? "", description: course.description ?? "" });
    setError("");
    setNotice("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditValues(emptyEditValues);
    setError("");
  }

  async function submitEdit(event, courseId) {
    event.preventDefault();
    const payload = coursePayload(editValues);
    if (!payload.name || submitting) return;

    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      const updatedCourse = await updateCourse(courseId, payload);
      setCourses((current) => current.map((course) => course.id === courseId ? updatedCourse : course));
      setEditingId(null);
      setEditValues(emptyEditValues);
      setNotice(`Đã cập nhật môn học “${updatedCourse.name}”.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function removeCourse(course) {
    if (!window.confirm(`Xóa môn học “${course.name}” và toàn bộ tài liệu liên quan?`)) return;

    setDeletingId(course.id);
    setError("");
    setNotice("");
    try {
      await deleteCourse(course.id);
      setCourses((current) => current.filter((item) => item.id !== course.id));
      if (editingId === course.id) cancelEditing();
      setNotice(`Đã xóa môn học “${course.name}”.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="page-section" aria-labelledby="dashboard-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Tổng quan học tập</p>
          <h1 id="dashboard-title">Không gian học tập</h1>
          <p className="page-intro">Chọn một môn học để mở tài liệu và tiếp tục học.</p>
        </div>
        <button className="primary-button" onClick={() => { setShowForm((current) => !current); setError(""); setNotice(""); }} type="button">
          {showForm ? "Đóng" : "+ Tạo môn học"}
        </button>
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={submitCourse}>
          <label htmlFor="course-name">Tên môn học</label>
          <input id="course-name" value={newCourse} onChange={(event) => setNewCourse(event.target.value)} placeholder="Ví dụ: Cơ sở dữ liệu" maxLength="160" disabled={submitting} autoFocus />
          <button className="primary-button" type="submit" disabled={!newCourse.trim() || submitting}>{submitting ? "Đang tạo…" : "Thêm môn học"}</button>
        </form>
      )}

      {error && <div className="request-message request-error" role="alert"><span>{error}</span><button className="text-button" onClick={() => loadCourses()} type="button">Thử lại</button></div>}
      {notice && <p className="request-message request-success" role="status">{notice}</p>}

      <section className="course-area" aria-labelledby="courses-title">
        <h2 id="courses-title">Môn học của bạn</h2>
        {loading ? (
          <p className="loading-state" role="status">Đang tải môn học…</p>
        ) : courses.length === 0 ? (
          <p className="empty-state">Bạn chưa có môn học. Hãy tạo môn học đầu tiên để tải tài liệu.</p>
        ) : (
          <div className="course-list">
            {courses.map((course) => editingId === course.id ? (
              <form className="course-card course-edit-form" key={course.id} onSubmit={(event) => submitEdit(event, course.id)}>
                <label htmlFor={`edit-course-name-${course.id}`}>Tên môn học</label>
                <input id={`edit-course-name-${course.id}`} maxLength="160" value={editValues.name} onChange={(event) => setEditValues((current) => ({ ...current, name: event.target.value }))} disabled={submitting} autoFocus />
                <label htmlFor={`edit-course-code-${course.id}`}>Mã môn học</label>
                <input id={`edit-course-code-${course.id}`} maxLength="50" value={editValues.code} onChange={(event) => setEditValues((current) => ({ ...current, code: event.target.value }))} disabled={submitting} />
                <label htmlFor={`edit-course-description-${course.id}`}>Mô tả</label>
                <textarea id={`edit-course-description-${course.id}`} maxLength="1000" rows="3" value={editValues.description} onChange={(event) => setEditValues((current) => ({ ...current, description: event.target.value }))} disabled={submitting} />
                <div className="course-card-actions">
                  <button className="primary-button" type="submit" disabled={!editValues.name.trim() || submitting}>{submitting ? "Đang lưu…" : "Lưu"}</button>
                  <button className="secondary-button" type="button" onClick={cancelEditing} disabled={submitting}>Hủy</button>
                </div>
              </form>
            ) : (
              <article className="course-card" key={course.id}>
                <Link className="course-card-link" to={`/documents?course=${course.id}`}>
                  <h3>{course.name}</h3>
                  <p>{course.code || "Chưa có mã môn học"}</p>
                  <span>{course.description || "Mở thư viện tài liệu"}</span>
                </Link>
                <div className="course-card-actions">
                  <button className="text-button" type="button" onClick={() => startEditing(course)} disabled={deletingId !== null || submitting}>Sửa</button>
                  <button className="text-button danger" type="button" onClick={() => removeCourse(course)} disabled={deletingId !== null || submitting}>{deletingId === course.id ? "Đang xóa…" : "Xóa"}</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
