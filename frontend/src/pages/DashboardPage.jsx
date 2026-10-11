import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, ErrorState, LoadingState } from "../components/ContentState";
import CourseEditor from "../components/CourseEditor";
import { createCourse, deleteCourse, getCourses, updateCourse } from "../api/courseApi";
import { getUserErrorMessage } from "../api/apiError";
import { useAsyncRequest } from "../hooks/useAsyncRequest";

export default function DashboardPage() {
  const {
    data: courses,
    setData: setCourses,
    loading,
    error: loadError,
    setError: setLoadError,
    run: loadCourses,
    retry: retryCourses,
    cancel: cancelCourses,
  } = useAsyncRequest(getCourses, { initialData: [], initialLoading: true });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [mutationError, setMutationError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    loadCourses();
    return cancelCourses;
  }, [cancelCourses, loadCourses]);

  async function submitCourse(payload) {
    if (submitting) return false;
    setSubmitting(true);
    setLoadError("");
    setMutationError("");
    setNotice("");
    try {
      const createdCourse = await createCourse(payload);
      setCourses((current) => [createdCourse, ...current]);
      setShowForm(false);
      setNotice(`Đã tạo môn học “${createdCourse.name}”.`);
      return true;
    } catch (requestError) {
      setMutationError(getUserErrorMessage(requestError));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  function startEditing(course) {
    setEditingId(course.id);
    setLoadError("");
    setMutationError("");
    setNotice("");
  }

  function cancelEditing() {
    setEditingId(null);
    setMutationError("");
  }

  async function submitEdit(courseId, payload) {
    if (submitting) return false;
    setSubmitting(true);
    setLoadError("");
    setMutationError("");
    setNotice("");
    try {
      const updatedCourse = await updateCourse(courseId, payload);
      setCourses((current) => current.map((course) => course.id === courseId ? updatedCourse : course));
      setEditingId(null);
      setNotice(`Đã cập nhật môn học “${updatedCourse.name}”.`);
      return true;
    } catch (requestError) {
      setMutationError(getUserErrorMessage(requestError));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function removeCourse(course) {
    if (!window.confirm(`Xóa môn học “${course.name}” và toàn bộ tài liệu liên quan?`)) return;

    setDeletingId(course.id);
    setLoadError("");
    setMutationError("");
    setNotice("");
    try {
      await deleteCourse(course.id);
      setCourses((current) => current.filter((item) => item.id !== course.id));
      if (editingId === course.id) cancelEditing();
      setNotice(`Đã xóa môn học “${course.name}”.`);
    } catch (requestError) {
      setMutationError(getUserErrorMessage(requestError));
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
        <button className="primary-button" disabled={loading || submitting || deletingId !== null} onClick={() => { setShowForm((current) => !current); setMutationError(""); setNotice(""); }} type="button">
          {showForm ? "Đóng" : "+ Tạo môn học"}
        </button>
      </div>

      {showForm && (
        <CourseEditor
          idPrefix="new-course"
          className="course-create-form"
          busy={submitting}
          submitLabel="Thêm môn học"
          pendingLabel="Đang tạo…"
          onSubmit={submitCourse}
          onCancel={() => setShowForm(false)}
          resetOnSuccess
        />
      )}

      {mutationError && <div className="request-message request-error" role="alert"><span>{mutationError}</span></div>}
      {loadError && courses.length > 0 && <div className="request-message request-error" role="alert"><span>{loadError}</span><button className="text-button" onClick={retryCourses} type="button">Tải lại</button></div>}
      {notice && <p className="request-message request-success" role="status">{notice}</p>}

      <section className="course-area" aria-labelledby="courses-title">
        <h2 id="courses-title">Môn học của bạn</h2>
        {loading ? (
          <LoadingState message="Đang tải danh sách môn học…" />
        ) : loadError && courses.length === 0 ? (
          <ErrorState message={loadError} onRetry={retryCourses} />
        ) : courses.length === 0 ? (
          <EmptyState
            title="Bạn chưa có môn học"
            description="Tạo môn học đầu tiên để bắt đầu tải tài liệu và mở phiên học."
            action={<button className="secondary-button" type="button" onClick={() => setShowForm(true)}>Tạo môn học</button>}
          />
        ) : (
          <div className="course-list">
            {courses.map((course) => editingId === course.id ? (
              <CourseEditor
                key={course.id}
                idPrefix={`edit-course-${course.id}`}
                className="course-card"
                initialValues={course}
                busy={submitting}
                submitLabel="Lưu"
                onSubmit={(payload) => submitEdit(course.id, payload)}
                onCancel={cancelEditing}
              />
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
