import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createCourse, getCourses } from "../api/courseApi";

export default function DashboardPage() {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
      setNotice(`Đã tạo môn học "${createdCourse.name}".`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
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
        <button
          className="primary-button"
          onClick={() => {
            setShowForm((current) => !current);
            setError("");
            setNotice("");
          }}
          type="button"
        >
          {showForm ? "Đóng" : "+ Tạo môn học"}
        </button>
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={submitCourse}>
          <label htmlFor="course-name">Tên môn học</label>
          <input
            id="course-name"
            value={newCourse}
            onChange={(event) => setNewCourse(event.target.value)}
            placeholder="Ví dụ: Cơ sở dữ liệu"
            maxLength="160"
            disabled={submitting}
            autoFocus
          />
          <button className="primary-button" type="submit" disabled={!newCourse.trim() || submitting}>
            {submitting ? "Đang tạo…" : "Thêm môn học"}
          </button>
        </form>
      )}

      {error && (
        <div className="request-message request-error" role="alert">
          <span>{error}</span>
          <button className="text-button" onClick={() => loadCourses()} type="button">Thử lại</button>
        </div>
      )}
      {notice && <p className="request-message request-success" role="status">{notice}</p>}

      <section className="course-area" aria-labelledby="courses-title">
        <h2 id="courses-title">Môn học của bạn</h2>
        {loading ? (
          <p className="loading-state" role="status">Đang tải môn học…</p>
        ) : courses.length === 0 ? (
          <p className="empty-state">Bạn chưa có môn học. Hãy tạo môn học đầu tiên để tải tài liệu.</p>
        ) : (
          <div className="course-list">
            {courses.map((course) => (
              <Link className="course-card" to={`/documents?course=${course.id}`} key={course.id}>
                <h3>{course.name}</h3>
                <p>{course.code || "Chưa có mã môn học"}</p>
                <span>{course.description || "Mở thư viện tài liệu"}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
