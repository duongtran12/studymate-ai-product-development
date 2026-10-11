import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyState, ErrorState, LoadingState } from "../components/ContentState";
import DocumentUploadPanel from "../components/DocumentUploadPanel";
import {
  deleteDocument,
  getCourses,
  getDocuments,
} from "../api/documentLibraryApi";
import { getUserErrorMessage } from "../api/apiError";
import { useAsyncRequest } from "../hooks/useAsyncRequest";

const statusLabels = {
  uploaded: "Đã tải lên",
  processing: "Đang xử lý",
  ready: "Sẵn sàng",
  failed: "Thất bại",
};

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentLibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCourseId = useRef(searchParams.get("course") ?? "");
  const {
    data: courses,
    loading: loadingCourses,
    error: coursesError,
    setError: setCoursesError,
    run: loadCourses,
    retry: retryCourses,
    cancel: cancelCourses,
  } = useAsyncRequest(getCourses, { initialData: [], initialLoading: true });
  const requestDocuments = useCallback((signal, courseId) => getDocuments(courseId, signal), []);
  const {
    data: documents,
    setData: setDocuments,
    loading: loadingDocuments,
    error: documentsError,
    setError: setDocumentsError,
    run: loadDocuments,
    retry: retryDocuments,
    cancel: cancelDocuments,
  } = useAsyncRequest(requestDocuments, { initialData: [] });
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId.current);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    loadCourses();
    return cancelCourses;
  }, [cancelCourses, loadCourses]);

  useEffect(() => {
    setSelectedCourseId((current) => {
      const preferred = current || initialCourseId.current;
      if (courses.some((course) => String(course.id) === preferred)) return preferred;
      return courses[0]?.id ? String(courses[0].id) : "";
    });
  }, [courses]);

  useEffect(() => {
    if (selectedCourseId) loadDocuments(selectedCourseId);
    else {
      cancelDocuments();
      setDocuments([]);
    }
    return cancelDocuments;
  }, [cancelDocuments, loadDocuments, selectedCourseId, setDocuments]);

  async function removeDocument(document) {
    if (!window.confirm(`Xóa “${document.fileName}” khỏi thư viện?`)) return;
    setDeletingId(document.id);
    setDeleteError("");
    setCoursesError("");
    setDocumentsError("");
    try {
      await deleteDocument(selectedCourseId, document.id);
      setDocuments((current) => current.filter((item) => item.id !== document.id));
      setNotice(`Đã xóa “${document.fileName}”.`);
    } catch (requestError) {
      setDeleteError(getUserErrorMessage(requestError));
    } finally {
      setDeletingId(null);
    }
  }

  function handleUploadBusyChange(isBusy) {
    setUploading(isBusy);
    if (isBusy) {
      setCoursesError("");
      setDocumentsError("");
      setDeleteError("");
      setNotice("");
    }
  }

  const selectedCourse = courses.find((course) => String(course.id) === selectedCourseId);
  const busy = loadingCourses || loadingDocuments;
  const error = deleteError || documentsError || coursesError;
  const retry = coursesError ? retryCourses : documentsError ? retryDocuments : () => {
    setDeleteError("");
    loadDocuments(selectedCourseId);
  };

  return (
    <section className="page-section" aria-labelledby="documents-title">
      <p className="eyebrow">{selectedCourse?.name ?? "Thư viện học tập"}</p>
      <h1 id="documents-title">Tài liệu môn học</h1>
      <p className="page-intro">Tải tài liệu theo từng môn học để chuẩn bị ngữ cảnh cho hỏi đáp và quiz.</p>

      <label className="course-filter">
        <span>Lọc theo môn học</span>
        <select
          value={selectedCourseId}
          onChange={(event) => {
            const courseId = event.target.value;
            setSelectedCourseId(courseId);
            setSearchParams(courseId ? { course: courseId } : {});
            setNotice("");
            setDeleteError("");
          }}
          disabled={busy || uploading || deletingId !== null || courses.length === 0}
        >
          {courses.length === 0 && <option value="">Chưa có môn học</option>}
          {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
        </select>
      </label>

      <DocumentUploadPanel
        courseId={selectedCourseId}
        disabled={busy || deletingId !== null}
        onBusyChange={handleUploadBusyChange}
        onUploaded={(document) => setDocuments((current) => [document, ...current])}
      />

      {deleteError && <div className="request-message request-error" role="alert"><span>{deleteError}</span><button className="text-button" onClick={retry}>Tải lại</button></div>}
      {notice && <p className="request-message request-success" role="status">{notice}</p>}

      {busy ? (
        <LoadingState message={loadingCourses ? "Đang tải môn học…" : "Đang tải tài liệu…"} />
      ) : (coursesError || documentsError) ? (
        <ErrorState message={error} onRetry={retry} />
      ) : courses.length === 0 ? (
        <EmptyState title="Chưa có môn học" description="Hãy tạo môn học trên Dashboard trước khi tải tài liệu." />
      ) : documents.length === 0 ? (
        <EmptyState title="Môn học chưa có tài liệu" description="Tải lên tệp PDF hoặc DOCX đầu tiên bằng khu vực phía trên." />
      ) : (
        <div className="document-list">
          {documents.map((document) => {
            const status = document.processingStatus.toLowerCase();
            return <article className="document-row" key={document.id}>
              <div><h2>{document.fileName}</h2><p>{formatFileSize(document.fileSizeBytes)} · {new Date(document.createdAt).toLocaleDateString("vi-VN")}</p></div>
              <div className="document-actions">
                <span className={`status-badge status-${status}`}>{statusLabels[status] ?? document.processingStatus}</span>
                <button className="text-button danger" disabled={deletingId !== null || uploading} onClick={() => removeDocument(document)}>{deletingId === document.id ? "Đang xóa…" : "Xóa"}</button>
              </div>
            </article>;
          })}
        </div>
      )}
    </section>
  );
}
