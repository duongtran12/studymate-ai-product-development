import { useRef, useState } from "react";
import { getUserErrorMessage } from "../api/apiError";
import { uploadDocument } from "../api/documentLibraryApi";
import { validateDocumentFile } from "../validation/formValidation";

export default function DocumentUploadPanel({ courseId, disabled = false, onUploaded, onBusyChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const fileInput = useRef(null);

  async function upload(file) {
    if (!file || !courseId || uploading) return;

    const validationError = validateDocumentFile(file);
    if (validationError) {
      setPendingFile(null);
      setNotice("");
      setError(validationError);
      return;
    }

    setPendingFile(file);
    setUploading(true);
    onBusyChange?.(true);
    setError("");
    setNotice("");
    try {
      const document = await uploadDocument(courseId, file);
      onUploaded(document);
      setNotice(`Đã tải lên “${document.fileName}”.`);
      setPendingFile(null);
      if (fileInput.current) fileInput.current.value = "";
    } catch (requestError) {
      setError(getUserErrorMessage(requestError));
    } finally {
      setUploading(false);
      onBusyChange?.(false);
    }
  }

  const unavailable = disabled || uploading || !courseId;

  return (
    <>
      <label className={`upload-zone ${unavailable ? "upload-zone-disabled" : ""}`} htmlFor="document-upload">
        <strong>{uploading ? "Đang tải lên…" : "Chọn tệp PDF hoặc DOCX"}</strong>
        <span>Tối đa 10 MB. Tệp được lưu trong môn học đang chọn.</span>
        <input
          ref={fileInput}
          id="document-upload"
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          disabled={unavailable}
          onChange={(event) => upload(event.target.files?.[0])}
        />
      </label>

      {error && (
        <div className="request-message request-error" role="alert">
          <span>{error}</span>
          {pendingFile && (
            <button className="text-button" type="button" onClick={() => upload(pendingFile)} disabled={uploading}>
              Thử lại
            </button>
          )}
        </div>
      )}
      {notice && <p className="request-message request-success" role="status">{notice}</p>}
    </>
  );
}
