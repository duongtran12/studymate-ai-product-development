import { useEffect, useState } from "react";
import { getCourses } from "../api/courseApi";
import { getDocuments } from "../api/documentLibraryApi";
import {
  createStudySession,
  getStudySession,
  getStudySessionMessages,
  getStudySessions,
  sendStudySessionQuestion,
} from "../api/studySessionApi";
import "../studySession.css";

const newSessionValue = "";

export default function StudySessionPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(newSessionValue);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getCourses(controller.signal)
      .then((data) => {
        setCourses(data);
        setSelectedCourseId(data[0]?.id ? String(data[0].id) : "");
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) {
      setDocuments([]);
      setSessions([]);
      setActiveSessionId(newSessionValue);
      setMessages([]);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");
    Promise.all([
      getDocuments(selectedCourseId, controller.signal),
      getStudySessions(selectedCourseId, controller.signal),
    ])
      .then(async ([documentData, sessionData]) => {
        setDocuments(documentData);
        setSessions(sessionData);
        if (sessionData.length === 0) {
          setActiveSessionId(newSessionValue);
          setSelectedDocumentIds([]);
          setMessages([]);
          return;
        }
        const firstSession = sessionData[0];
        const [session, history] = await Promise.all([
          getStudySession(firstSession.id, controller.signal),
          getStudySessionMessages(firstSession.id, controller.signal),
        ]);
        setActiveSessionId(String(firstSession.id));
        setSelectedDocumentIds(session.documentIds.map(String));
        setMessages(history);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [selectedCourseId]);

  async function selectSession(sessionId) {
    setActiveSessionId(sessionId);
    setError("");
    if (!sessionId) {
      setSelectedDocumentIds([]);
      setMessages([]);
      return;
    }
    setLoading(true);
    try {
      const [session, history] = await Promise.all([
        getStudySession(sessionId),
        getStudySessionMessages(sessionId),
      ]);
      setSelectedDocumentIds(session.documentIds.map(String));
      setMessages(history);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleDocument(documentId) {
    if (activeSessionId) return;
    const value = String(documentId);
    setSelectedDocumentIds((current) =>
      current.includes(value) ? current.filter((id) => id !== value) : [...current, value],
    );
  }

  async function send(event) {
    event.preventDefault();
    const asked = question.trim();
    if (!asked || !selectedCourseId || sending) return;

    setSending(true);
    setError("");
    try {
      let sessionId = activeSessionId;
      if (!sessionId) {
        const session = await createStudySession({
          courseId: Number(selectedCourseId),
          title: asked.slice(0, 200),
          documentIds: selectedDocumentIds.map(Number),
        });
        sessionId = String(session.id);
        setActiveSessionId(sessionId);
        setSessions((current) => [session, ...current]);
      }
      const turn = await sendStudySessionQuestion(sessionId, asked);
      setMessages((current) => [...current, turn.userMessage, turn.assistantMessage]);
      setQuestion("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="study-layout" aria-labelledby="session-title">
      <aside className="context-panel">
        <p className="eyebrow">Phiên học</p>
        <h1 id="session-title">Hỏi đáp có nguồn</h1>
        <p>Chọn môn học và tài liệu làm phạm vi trả lời cho phiên mới.</p>

        <label className="context-control" htmlFor="session-course">Môn học</label>
        <select id="session-course" value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)}>
          {courses.length === 0 && <option value="">Chưa có môn học</option>}
          {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
        </select>

        <label className="context-control" htmlFor="saved-session">Phiên học</label>
        <select id="saved-session" value={activeSessionId} onChange={(event) => selectSession(event.target.value)} disabled={!selectedCourseId}>
          <option value="">+ Tạo phiên học mới</option>
          {sessions.map((session) => <option key={session.id} value={session.id}>{session.title}</option>)}
        </select>

        <fieldset disabled={Boolean(activeSessionId) || !selectedCourseId}>
          <legend>Tài liệu làm nguồn</legend>
          {documents.length === 0 && <p className="context-help">Môn học này chưa có tài liệu.</p>}
          {documents.map((document) => (
            <label className="document-choice" key={document.id}>
              <input checked={selectedDocumentIds.includes(String(document.id))} onChange={() => toggleDocument(document.id)} type="checkbox" />
              <span>{document.fileName}<small>{document.processingStatus}</small></span>
            </label>
          ))}
        </fieldset>
        <p className="context-help">Phạm vi tài liệu được cố định sau khi phiên học được tạo. Nếu không chọn nguồn, StudyMate sẽ báo chưa đủ căn cứ.</p>
      </aside>

      <div className="chat-panel">
        {error && <div className="request-error" role="alert">{error}</div>}
        <div className="chat-history" aria-live="polite">
          {loading && <p className="loading-state">Đang tải dữ liệu phiên học...</p>}
          {!loading && messages.length === 0 && (
            <div className="chat-empty">Đặt câu hỏi để bắt đầu. Câu trả lời sẽ kèm nguồn, hoặc nói rõ khi tài liệu chưa đủ căn cứ.</div>
          )}
          {messages.map((message) => (
            <article className={`message message-${message.role.toLowerCase()}`} key={message.id}>
              <p>{message.role === "USER" ? "Bạn" : "StudyMate"}</p>
              <div>{message.content}</div>
              {message.role === "ASSISTANT" && <small className="grounding-status">{message.groundingStatus === "SUPPORTED" ? "Có căn cứ từ tài liệu" : "Chưa đủ căn cứ"}</small>}
              {message.citations.map((citation) => (
                <div className="citation" key={`${message.id}-${citation.documentId}-${citation.locator}`}>
                  <strong>Nguồn: {citation.documentName}</strong>
                  <span>{citation.locator}</span>
                  {citation.excerpt && <span>“{citation.excerpt}”</span>}
                </div>
              ))}
            </article>
          ))}
          {sending && <p className="loading-state">StudyMate đang tạo câu trả lời...</p>}
        </div>
        <form className="chat-form" onSubmit={send}>
          <label htmlFor="question">Đặt câu hỏi từ tài liệu đã chọn</label>
          <textarea id="question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ví dụ: Dependency injection là gì?" rows="3" disabled={!selectedCourseId || sending} />
          <button className="primary-button" type="submit" disabled={!question.trim() || !selectedCourseId || sending}>{sending ? "Đang gửi..." : "Gửi câu hỏi"}</button>
        </form>
      </div>
    </section>
  );
}
