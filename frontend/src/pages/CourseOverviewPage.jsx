import { useCallback, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getCourse } from "../api/courseApi";
import { getDocuments } from "../api/documentLibraryApi";
import { EmptyState, ErrorState, LoadingState } from "../components/ContentState";
import { useAsyncRequest } from "../hooks/useAsyncRequest";

async function getCourseOverview(signal, courseId) {
  const [course, documents] = await Promise.all([getCourse(courseId, signal), getDocuments(courseId, signal)]);
  return { course, documents };
}

export default function CourseOverviewPage() {
  const { courseId } = useParams();
  const requestOverview = useCallback((signal) => getCourseOverview(signal, courseId), [courseId]);
  const { data, loading, error, run, retry, cancel } = useAsyncRequest(requestOverview, { initialData: null, initialLoading: true });

  useEffect(() => {
    run();
    return cancel;
  }, [cancel, run]);

  if (loading) return <section className="page-section"><LoadingState message="Đang tải môn học…" /></section>;
  if (error) return <section className="page-section"><ErrorState message={error} onRetry={retry} /></section>;
  if (!data?.course) return <section className="page-section"><EmptyState title="Không tìm thấy môn học" description="Môn học này không còn tồn tại hoặc bạn không có quyền truy cập." action={<Link className="primary-action" to="/courses">Về danh sách môn học</Link>} /></section>;

  const { course, documents } = data;
  const readyDocuments = documents.filter((document) => document.processingStatus === "ready").length;
  return <section className="page-section" aria-labelledby="course-title">
    <p className="eyebrow">Không gian môn học</p>
    <h1 id="course-title">{course.name}</h1>
    <p className="page-intro">{course.description || "Tổ chức tài liệu, phiên học có dẫn nguồn và quiz cho môn học này."}</p>
    <section className="course-overview-stats" aria-label="Tổng quan môn học">
      <article><strong>{course.code || "—"}</strong><span>Mã môn học</span></article>
      <article><strong>{documents.length}</strong><span>Tài liệu đã tải</span></article>
      <article><strong>{readyDocuments}</strong><span>Tài liệu sẵn sàng</span></article>
    </section>
    <section className="course-overview-actions" aria-label="Thao tác môn học">
      <Link className="primary-action" to={`/documents?course=${course.id}`}>Quản lý tài liệu</Link>
      <Link className="secondary-action" to="/study-sessions">Mở phiên học</Link>
      <Link className="secondary-action" to="/quizzes">Làm Quiz</Link>
    </section>
    {documents.length === 0 && <EmptyState title="Chưa có tài liệu" description="Tải PDF hoặc DOCX lên để dùng trong phiên học và làm nguồn cho Quiz." action={<Link className="secondary-button" to={`/documents?course=${course.id}`}>Tải tài liệu</Link>} />}
  </section>;
}
