import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyState, ErrorState, LoadingState } from "../components/ContentState";
import DocumentUploadPanel from "../components/DocumentUploadPanel";
import {
  deleteDocument,
  getCourses,
  getDocumentPreview,
  getDocuments,
  reprocessDocument,
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
  const [initialCourseId] = useState(() => searchParams.get("course") ?? "");
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
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [reprocessingId, setReprocessingId] = useState(null);
  const [loadingPreviewId, setLoadingPreviewId] = useState(null);
  const [previews, setPreviews] = useState({});
  const [deleteError, setDeleteError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    loadCourses();
    return cancelCourses;
  }, [cancelCourses, loadCourses]);

  useEffect(() => {
    setSelectedCourseId((current) => {
      const preferred = current || initialCourseId;
      if (courses.some((course) => String(course.id) === preferred)) return preferred;
      return courses[0]?.id ? String(courses[0].id) : "";
    });
  }, [courses, initialCourseId]);

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

  async function reprocess(document) {
    if (reprocessingId !== null || deletingId !== null) return;
    setReprocessingId(document.id);
    setDeleteError("");
    setNotice("");
    try {
      const updated = await reprocessDocument(selectedCourseId, document.id);
      setDocuments((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotice(updated.processingStatus === "READY"
        ? `Đã xử lý xong “${updated.fileName}”.`
        : `Không thể đọc nội dung “${updated.fileName}”. Bạn có thể tải lại một tệp khác.`);
    } catch (requestError) {
      setDeleteError(getUserErrorMessage(requestError));
    } finally {
      setReprocessingId(null);
    }
  }

  async function togglePreview(document) {
    if (previews[document.id]) {
      setPreviews((current) => {
        const next = { ...current };
        delete next[document.id];
        return next;
      });
      return;
    }
    setLoadingPreviewId(document.id);
    setDeleteError("");
    try {
      const preview = await getDocumentPreview(selectedCourseId, document.id);
      setPreviews((current) => ({ ...current, [document.id]: preview }));
    } catch (requestError) {
      setDeleteError(getUserErrorMessage(requestError));
    } finally {
      setLoadingPreviewId(null);
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
        key={selectedCourseId}
        courseId={selectedCourseId}
        disabled={busy || deletingId !== null || reprocessingId !== null}
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
            const preview = previews[document.id];
            return <article className="document-row" key={document.id}>
              <div><h2>{document.fileName}</h2><p>{formatFileSize(document.fileSizeBytes)} · {new Date(document.createdAt).toLocaleDateString("vi-VN")}</p></div>
              <div className="document-actions">
                <span className={`status-badge status-${status}`}>{statusLabels[status] ?? document.processingStatus}</span>
                {status === "ready" && <button className="text-button" disabled={loadingPreviewId !== null} onClick={() => togglePreview(document)}>{loadingPreviewId === document.id ? "Đang mở…" : preview ? "Ẩn nội dung" : "Xem nội dung"}</button>}
                {status !== "ready" && <button className="text-button" disabled={deletingId !== null || reprocessingId !== null || uploading} onClick={() => reprocess(document)}>{reprocessingId === document.id ? "Đang xử lý…" : "Thử xử lý lại"}</button>}
                <button className="text-button danger" disabled={deletingId !== null || reprocessingId !== null || uploading} onClick={() => removeDocument(document)}>{deletingId === document.id ? "Đang xóa…" : "Xóa"}</button>
              </div>
              {preview && <div className="document-preview"><strong>StudyMate đã trích xuất {preview.chunkCount} đoạn</strong>{preview.excerpts.length > 0 ? preview.excerpts.map((excerpt, index) => <p key={index}>{excerpt}</p>) : <p>Chưa có nội dung để xem trước.</p>}</div>}
            </article>;
          })}
        </div>
      )}
    </section>
  );
}
