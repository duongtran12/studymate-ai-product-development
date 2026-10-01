import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  deleteDocument,
  getCourses,
  getDocuments,
  uploadDocument,
} from "../api/documentLibraryApi";
import { useAsyncRequest } from "../hooks/useAsyncRequest";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
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

function validateFile(file) {
  const extension = file.name.toLowerCase().split(".").pop();
  if (!["pdf", "docx"].includes(extension)) return "Chỉ hỗ trợ tệp PDF hoặc DOCX.";
  if (file.size > MAX_FILE_SIZE) return "Tệp không được lớn hơn 10 MB.";
  return "";
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
  const [mutationError, setMutationError] = useState("");
  const [notice, setNotice] = useState("");
  const fileInput = useRef(null);

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

  async function upload(file) {
    if (!file || !selectedCourseId) return;
    const validationError = validateFile(file);
    if (validationError) {
      setNotice("");
      setMutationError(validationError);
      return;
    }

    setUploading(true);
    setMutationError("");
    setCoursesError("");
    setDocumentsError("");
    setNotice("");
    try {
      const document = await uploadDocument(selectedCourseId, file);
      setDocuments((current) => [document, ...current]);
      setNotice(`Đã tải lên “${document.fileName}”.`);
      if (fileInput.current) fileInput.current.value = "";
    } catch (requestError) {
      setMutationError(requestError.message);
    } finally {
      setUploading(false);
    }
  }

  async function removeDocument(document) {
    if (!window.confirm(`Xóa “${document.fileName}” khỏi thư viện?`)) return;
    setDeletingId(document.id);
    setMutationError("");
    setCoursesError("");
    setDocumentsError("");
    try {
      await deleteDocument(selectedCourseId, document.id);
      setDocuments((current) => current.filter((item) => item.id !== document.id));
      setNotice(`Đã xóa “${document.fileName}”.`);
    } catch (requestError) {
      setMutationError(requestError.message);
    } finally {
      setDeletingId(null);
    }
  }

  const selectedCourse = courses.find((course) => String(course.id) === selectedCourseId);
  const busy = loadingCourses || loadingDocuments;
  const error = mutationError || documentsError || coursesError;
  const retry = coursesError ? retryCourses : documentsError ? retryDocuments : () => {
    setMutationError("");
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
            setMutationError("");
          }}
          disabled={loadingCourses || courses.length === 0}
        >
          {courses.length === 0 && <option value="">Chưa có môn học</option>}
          {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
        </select>
      </label>

      <label className={`upload-zone ${!selectedCourseId || uploading ? "upload-zone-disabled" : ""}`} htmlFor="document-upload">
        <strong>{uploading ? "Đang tải lên…" : "Chọn tệp PDF hoặc DOCX"}</strong>
        <span>Tối đa 10 MB. Tệp được lưu trong môn học đang chọn.</span>
        <input
          ref={fileInput}
          id="document-upload"
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          disabled={!selectedCourseId || uploading}
          onChange={(event) => upload(event.target.files?.[0])}
        />
      </label>

      {error && <div className="request-message request-error" role="alert"><span>{error}</span><button className="text-button" onClick={retry}>Thử lại</button></div>}
      {notice && <p className="request-message request-success" role="status">{notice}</p>}

      {busy ? (
        <p className="loading-state" role="status">Đang tải dữ liệu…</p>
      ) : courses.length === 0 ? (
        <p className="empty-state">Bạn chưa có môn học. Hãy tạo môn học trước khi tải tài liệu.</p>
      ) : documents.length === 0 ? (
        <p className="empty-state">Môn học này chưa có tài liệu. Hãy tải lên tệp đầu tiên.</p>
      ) : (
        <div className="document-list">
          {documents.map((document) => {
            const status = document.processingStatus.toLowerCase();
            return <article className="document-row" key={document.id}>
              <div><h2>{document.fileName}</h2><p>{formatFileSize(document.fileSizeBytes)} · {new Date(document.createdAt).toLocaleDateString("vi-VN")}</p></div>
              <div className="document-actions">
                <span className={`status-badge status-${status}`}>{statusLabels[status] ?? document.processingStatus}</span>
                <button className="text-button danger" disabled={deletingId === document.id} onClick={() => removeDocument(document)}>{deletingId === document.id ? "Đang xóa…" : "Xóa"}</button>
              </div>
            </article>;
          })}
        </div>
      )}
    </section>
  );
}
