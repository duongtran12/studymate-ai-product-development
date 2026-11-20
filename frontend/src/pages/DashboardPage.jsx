import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, ErrorState, LoadingState } from "../components/ContentState";
import CourseEditor from "../components/CourseEditor";
import { createCourse, deleteCourse, getCourses, updateCourse } from "../api/courseApi";
import { getDocuments } from "../api/documentLibraryApi";
import { getCourseQuizzes, getQuizAttempts } from "../api/quizApi";
import { getStudySessions } from "../api/studySessionApi";
import { getUserErrorMessage } from "../api/apiError";
import { useAsyncRequest } from "../hooks/useAsyncRequest";

async function getStudyActivity(signal, courses) {
  const courseData = await Promise.all(courses.map(async (course) => {
    const [documents, quizzes, sessions] = await Promise.all([
      getDocuments(course.id, signal), getCourseQuizzes(course.id, signal), getStudySessions(course.id, signal),
    ]);
    return { course, documents, quizzes, sessions };
  }));
  const quizzes = courseData.flatMap((item) => item.quizzes);
  const attemptsByQuiz = await Promise.all(quizzes.map(async (quiz) => ({
    quizId: quiz.id,
    attempts: await getQuizAttempts(quiz.id, signal),
  })));
  const attempts = attemptsByQuiz.flatMap((item) => item.attempts);
  const quizPerformance = quizzes.map((quiz) => {
    const attemptsForQuiz = attemptsByQuiz.find((item) => item.quizId === quiz.id)?.attempts ?? [];
    const scores = attemptsForQuiz.map((attempt) => Number(attempt.score));
    const averageScore = scores.length ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length) : null;
    return {
      id: quiz.id,
      courseId: quiz.courseId,
      title: quiz.title,
      attemptCount: attemptsForQuiz.length,
      averageScore,
      bestScore: scores.length ? Math.max(...scores) : null,
      needsReview: averageScore !== null && averageScore < 70,
    };
  }).filter((quiz) => quiz.attemptCount > 0).sort((left, right) => left.averageScore - right.averageScore);
  return {
    readyDocuments: courseData.flatMap((item) => item.documents).filter((document) => document.processingStatus === "READY").length,
    quizCount: quizzes.length,
    sessionCount: courseData.flatMap((item) => item.sessions).length,
    recentAttempts: attempts.sort((left, right) => new Date(right.submittedAt) - new Date(left.submittedAt)).slice(0, 3),
    quizPerformance,
  };
}

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
  const [activityCourseId, setActivityCourseId] = useState("");
  const requestActivity = useCallback((signal) => getStudyActivity(signal,
    activityCourseId ? courses.filter((course) => String(course.id) === activityCourseId) : courses), [activityCourseId, courses]);
  const { data: activity, loading: loadingActivity, error: activityError, run: loadActivity, cancel: cancelActivity } = useAsyncRequest(requestActivity, {
    initialData: { readyDocuments: 0, quizCount: 0, sessionCount: 0, recentAttempts: [], quizPerformance: [] },
  });
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

  useEffect(() => {
    loadActivity();
    return cancelActivity;
  }, [cancelActivity, loadActivity]);

  useEffect(() => {
    if (activityCourseId && !courses.some((course) => String(course.id) === activityCourseId)) {
      setActivityCourseId("");
    }
  }, [activityCourseId, courses]);

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

      <section className="dashboard-activity" aria-labelledby="activity-title">
        <div className="activity-heading"><div><p className="eyebrow">Tiến độ</p><h2 id="activity-title">Hoạt động học tập</h2></div>{courses.length > 1 && <label className="activity-filter"><span>Phạm vi</span><select value={activityCourseId} onChange={(event) => setActivityCourseId(event.target.value)}><option value="">Tất cả môn học</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label>}</div>
        {activityError ? <p className="activity-message">Không thể tải tổng quan hoạt động lúc này.</p> : loadingActivity ? <p className="activity-message">Đang tổng hợp tiến độ…</p> : <><div className="course-overview-stats">
          <article><strong>{activity.readyDocuments}</strong><span>Tài liệu sẵn sàng</span></article>
          <article><strong>{activity.quizCount}</strong><span>Quiz đã tạo</span></article>
          <article><strong>{activity.sessionCount}</strong><span>Phiên học đã lưu</span></article>
        </div>
        <div className="recent-attempts"><h3>Kết quả Quiz gần nhất</h3>{activity.recentAttempts.length === 0 ? <p>Chưa có lần làm Quiz nào.</p> : <ol>{activity.recentAttempts.map((attempt) => <li key={attempt.id}><strong>{attempt.score}%</strong><span>{new Date(attempt.submittedAt).toLocaleString("vi-VN")}</span></li>)}</ol>}</div>
        <div className="quiz-performance"><div><h3>Tiến độ theo bộ Quiz</h3><p>Ưu tiên ôn lại những bộ có điểm trung bình dưới 70%.</p></div>{activity.quizPerformance.length === 0 ? <p className="activity-message">Hoàn thành một Quiz để xem điểm trung bình và điểm cao nhất.</p> : <ul>{activity.quizPerformance.map((quiz) => <li key={quiz.id}><div><strong>{quiz.title}</strong><span>{quiz.attemptCount} lần làm · Cao nhất {quiz.bestScore}%</span></div>{quiz.needsReview ? <Link className="review-needed review-link" to={`/quizzes?course=${quiz.courseId}&quiz=${quiz.id}`}>Ôn lại · TB {quiz.averageScore}%</Link> : <b className="review-ready">Ổn định · TB {quiz.averageScore}%</b>}</li>)}</ul>}</div></>}
      </section>

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
                <Link className="course-card-link" to={`/courses/${course.id}`}>
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
