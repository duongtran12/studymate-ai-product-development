import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { documentStatuses, initialDocuments } from "../mocks/documents";

const maxFileSize = 10 * 1024 * 1024;
const acceptedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

function formatSize(bytes) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

export default function DocumentLibraryPage() {
  const { courseId = "lap-trinh-web" } = useParams();
  const inputRef = useRef(null);
  const [documents, setDocuments] = useState(initialDocuments);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  function addFile(file) {
    setUploadError("");
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!acceptedTypes.includes(file.type) && !["pdf", "docx"].includes(extension)) {
      setUploadError("Chỉ nhận file PDF hoặc DOCX. Hãy chọn lại đúng định dạng.");
      return;
    }
    if (file.size > maxFileSize) {
      setUploadError("File vượt quá 10 MB. Hãy nén file hoặc chọn tài liệu nhỏ hơn.");
      return;
    }
    const id = Date.now();
    const nextDocument = { id, name: file.name, type: extension?.toUpperCase(), size: formatSize(file.size), uploadedAt: "Hôm nay", status: "pending" };
    setDocuments((current) => [nextDocument, ...current]);
    window.setTimeout(() => setDocuments((current) => current.map((item) => item.id === id ? { ...item, status: "processing" } : item)), 550);
    window.setTimeout(() => setDocuments((current) => current.map((item) => item.id === id ? { ...item, status: "ready" } : item)), 1600);
  }

  function removeDocument(document) {
    if (window.confirm(`Xóa “${document.name}”? Tài liệu sẽ không còn dùng được trong các phiên học mới.`)) {
      setDocuments((current) => current.filter((item) => item.id !== document.id));
    }
  }

  function retryDocument(id) {
    setDocuments((current) => current.map((item) => item.id === id ? { ...item, status: "processing" } : item));
    window.setTimeout(() => setDocuments((current) => current.map((item) => item.id === id ? { ...item, status: "ready" } : item)), 1200);
  }

  return (
    <section className="workspace document-workspace" aria-labelledby="documents-title">
      <header><p className="eyebrow">Lập trình Web · Tài liệu</p><h1 id="documents-title">Thư viện tài liệu</h1><p className="page-intro">Tải PDF hoặc DOCX lên môn học. Chỉ tài liệu ở trạng thái Sẵn sàng mới có thể dùng trong chat và quiz.</p></header>

      <section className={`upload-zone ${isDragging ? "is-dragging" : ""}`} aria-labelledby="upload-title" onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(event) => { event.preventDefault(); setIsDragging(false); addFile(event.dataTransfer.files[0]); }}>
        <div><h2 id="upload-title">Thêm tài liệu</h2><p>Kéo thả vào đây hoặc chọn file từ máy. PDF, DOCX · tối đa 10 MB.</p></div>
        <button className="button button-secondary" type="button" onClick={() => inputRef.current?.click()}>Chọn file</button>
        <input ref={inputRef} className="visually-hidden" type="file" accept=".pdf,.docx" onChange={(event) => { addFile(event.target.files[0]); event.target.value = ""; }} />
      </section>
      {uploadError && <p className="inline-error" role="alert">{uploadError}</p>}

      <section aria-labelledby="library-title">
        <div className="section-heading"><h2 id="library-title">Tài liệu trong môn học</h2><span>{documents.length} file</span></div>
        <div className="document-list">{documents.map((document) => {
          const status = documentStatuses[document.status];
          return <article className="document-row" key={document.id}><div className="document-main"><div className={`status-marker status-${document.status}`} aria-hidden="true" /><div><h3>{document.name}</h3><p>{document.type} · {document.size} · tải lên {document.uploadedAt}</p><span className={`status-label status-${document.status}`}>{status.label}</span><small>{status.detail}</small></div></div><div className="row-actions">{document.status === "failed" && <button className="text-button" onClick={() => retryDocument(document.id)}>Thử lại</button>}<button className="text-button destructive" onClick={() => removeDocument(document)}>Xóa</button></div></article>;
        })}</div>
      </section>
      <p className="visually-hidden">Mã môn học hiện tại: {courseId}</p>
    </section>
  );
}
