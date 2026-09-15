import { useState } from "react";
import { initialMessages, readyDocuments } from "../mocks/chat";

export default function StudySessionPage() {
  const [selectedDocuments, setSelectedDocuments] = useState(["react-hooks"]);
  const [messages, setMessages] = useState(initialMessages);
  const [question, setQuestion] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("Ôn React Hooks từ slide tuần 5");
  const [source, setSource] = useState(null);

  function toggleDocument(id) {
    setSelectedDocuments((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function askQuestion(event) {
    event.preventDefault();
    const text = question.trim();
    if (!text || selectedDocuments.length === 0) return;
    setMessages((current) => [...current, { id: Date.now(), role: "user", text, time: "Bây giờ" }]);
    setQuestion("");
    setIsAnswering(true);
    const insufficient = /học phí|thời tiết|ngoài tài liệu/i.test(text);
    window.setTimeout(() => {
      const answer = insufficient
        ? { id: Date.now() + 1, role: "assistant", text: "Mình không tìm thấy thông tin này trong các tài liệu bạn đã chọn. Hãy chọn thêm tài liệu liên quan hoặc đặt câu hỏi bám sát nội dung môn học.", time: "Bây giờ", confidence: "Không đủ ngữ cảnh", citations: [] }
        : { id: Date.now() + 1, role: "assistant", text: "Từ tài liệu đã chọn, state nên được đặt ở component chung gần nhất khi nhiều component con cần đọc hoặc cập nhật cùng một dữ liệu. Cách này tạo một nguồn dữ liệu nhất quán cho giao diện.", time: "Bây giờ", confidence: "Dựa trên 1 nguồn", citations: [{ document: "Bài tập State Management.docx", location: "Phần 2, đoạn 3", excerpt: "Lift shared state up to the closest common parent component." }] };
      setMessages((current) => [...current, answer]);
      setIsAnswering(false);
    }, 900);
  }

  return (
    <section className="study-workspace" aria-labelledby="study-title">
      <header className="study-header"><div><p className="eyebrow">Lập trình Web · Phiên học</p><input id="study-title" className="session-title-input" value={sessionTitle} onChange={(event) => setSessionTitle(event.target.value)} aria-label="Tên phiên học" /></div><button className="button button-secondary" onClick={() => { setMessages([]); setSessionTitle("Phiên học mới"); }}>Tạo phiên mới</button></header>
      <div className="study-columns">
        <aside className="document-picker" aria-labelledby="selected-documents-title"><h2 id="selected-documents-title">Tài liệu dùng để hỏi</h2><p>Chọn ít nhất một tài liệu đã sẵn sàng.</p>{readyDocuments.map((document) => <label className="document-option" key={document.id}><input type="checkbox" checked={selectedDocuments.includes(document.id)} onChange={() => toggleDocument(document.id)} /><span><strong>{document.name}</strong><small>{document.detail} · Sẵn sàng</small></span></label>)}</aside>
        <div className="chat-panel">
          <div className="message-list" aria-live="polite">{messages.length === 0 && <div className="empty-chat"><h2>Bắt đầu từ tài liệu đã chọn</h2><p>Hỏi về khái niệm, ví dụ hoặc phần bạn chưa hiểu. StudyMate sẽ chỉ trả lời từ phạm vi tài liệu.</p></div>}{messages.map((message) => <article className={`message message-${message.role}`} key={message.id}><div className="message-meta"><strong>{message.role === "user" ? "Bạn" : "StudyMate"}</strong><span>{message.time}</span></div><p>{message.text}</p>{message.role === "assistant" && <div className={`answer-status ${message.citations.length === 0 ? "insufficient" : ""}`}>{message.confidence}</div>}{message.citations?.map((citation) => <div className="citation" key={`${message.id}-${citation.location}`}><div><strong>{citation.document}</strong><span>{citation.location}</span></div><button className="text-button" onClick={() => setSource(citation)}>Mở nguồn</button></div>)}</article>)}{isAnswering && <div className="answering-state">StudyMate đang đối chiếu nội dung trong tài liệu đã chọn...</div>}</div>
          {selectedDocuments.length === 0 && <p className="selection-warning">Chọn ít nhất một tài liệu Sẵn sàng trước khi đặt câu hỏi.</p>}
          <form className="question-form" onSubmit={askQuestion}><label className="visually-hidden" htmlFor="question">Câu hỏi</label><textarea id="question" rows="3" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Hỏi một điều từ tài liệu đã chọn..." /><button className="button button-primary" type="submit" disabled={!question.trim() || selectedDocuments.length === 0 || isAnswering}>Gửi câu hỏi</button></form>
        </div>
      </div>
      {source && <div className="modal-backdrop" onMouseDown={() => setSource(null)}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="source-title" onMouseDown={(event) => event.stopPropagation()}><p className="eyebrow">{source.location}</p><h2 id="source-title">{source.document}</h2><blockquote>{source.excerpt}</blockquote><div className="action-row"><button className="button button-primary" onClick={() => setSource(null)}>Đã xem nguồn</button></div></div></div>}
    </section>
  );
}
