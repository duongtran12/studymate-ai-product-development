import { useState } from "react";

const initialDocuments = [
  { id: 1, name: "Bai giang 01.pdf", size: "2.4 MB", status: "ready" },
  { id: 2, name: "Chu de microservice.docx", size: "860 KB", status: "processing" },
  { id: 3, name: "Tai lieu cu.pdf", size: "1.1 MB", status: "failed" },
];
const statusLabels = { pending: "Cho xu ly", processing: "Dang xu ly", ready: "San sang", failed: "That bai" };

export default function DocumentLibraryPage() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [notice, setNotice] = useState("");
  function upload(file) {
    if (!file) return;
    const valid = file.name.toLowerCase().endsWith(".pdf") || file.name.toLowerCase().endsWith(".docx");
    if (!valid) return setNotice("Chi ho tro tep PDF hoac DOCX. Hay chon mot tep khac.");
    setDocuments([{ id: Date.now(), name: file.name, size: `${Math.max(1, Math.round(file.size / 1024))} KB`, status: "pending" }, ...documents]);
    setNotice("Tep da duoc them vao hang doi. Prototype khong trich xuat noi dung that.");
  }
  function removeDocument(id) { if (window.confirm("Xoa tai lieu nay khoi thu vien?")) setDocuments(documents.filter((document) => document.id !== id)); }
  return <section className="page-section" aria-labelledby="documents-title"><p className="eyebrow">Kien truc phan mem</p><h1 id="documents-title">Tai lieu mon hoc</h1><p className="page-intro">Tai lieu san sang co the duoc chon lam ngu canh cho hoi dap va quiz.</p><label className="upload-zone" htmlFor="document-upload"><strong>Chon tep PDF hoac DOCX</strong><span>Keo tep vao day hoac bam de chon. Tinh trang xu ly se hien thi ro rang.</span><input id="document-upload" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => upload(event.target.files?.[0])} /></label>{notice && <p className="upload-notice" role="status">{notice}</p>}<div className="document-list">{documents.map((document) => <article className="document-row" key={document.id}><div><h2>{document.name}</h2><p>{document.size}</p></div><div className="document-actions"><span className={`status-badge status-${document.status}`}>{statusLabels[document.status]}</span>{document.status === "processing" && <span className="status-help">Dang trich xuat noi dung de chuan bi hoi dap.</span>}{document.status === "failed" && <span className="status-help">Thu lai voi tep PDF/DOCX hop le.</span>}<button className="text-button danger" onClick={() => removeDocument(document.id)}>Xoa</button></div></article>)}</div></section>;
}
