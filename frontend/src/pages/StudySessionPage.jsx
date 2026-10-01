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
import { useAsyncRequest } from "../hooks/useAsyncRequest";
import "../studySession.css";

const newSessionValue = "";

async function getCourseStudyData(signal, courseId) {
  const [documents, sessions] = await Promise.all([
    getDocuments(courseId, signal),
    getStudySessions(courseId, signal),
  ]);
  if (sessions.length === 0) return { documents, sessions, session: null, messages: [] };

  const [session, messages] = await Promise.all([
    getStudySession(sessions[0].id, signal),
    getStudySessionMessages(sessions[0].id, signal),
  ]);
  return { documents, sessions, session, messages };
}

async function getSessionStudyData(signal, sessionId) {
  const [session, messages] = await Promise.all([
    getStudySession(sessionId, signal),
    getStudySessionMessages(sessionId, signal),
  ]);
  return { session, messages };
}

export default function StudySessionPage() {
  const {
    data: courses,
    loading: loadingCourses,
    error: coursesError,
    setError: setCoursesError,
    run: loadCourses,
    retry: retryCourses,
    cancel: cancelCourses,
  } = useAsyncRequest(getCourses, { initialData: [], initialLoading: true });
  const {
    data: courseStudyData,
    setData: setCourseStudyData,
    loading: loadingCourseData,
    error: courseDataError,
    setError: setCourseDataError,
    run: loadCourseData,
    retry: retryCourseData,
    cancel: cancelCourseData,
  } = useAsyncRequest(getCourseStudyData);
  const {
    data: sessionStudyData,
    setData: setSessionStudyData,
    loading: loadingSession,
    error: sessionError,
    setError: setSessionError,
    run: loadSessionData,
    retry: retrySessionData,
    cancel: cancelSessionData,
  } = useAsyncRequest(getSessionStudyData);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(newSessionValue);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [mutationError, setMutationError] = useState("");

  useEffect(() => {
    loadCourses();
    return cancelCourses;
  }, [cancelCourses, loadCourses]);

  useEffect(() => {
    setSelectedCourseId((current) => {
      if (courses.some((course) => String(course.id) === current)) return current;
      return courses[0]?.id ? String(courses[0].id) : "";
    });
  }, [courses]);

  useEffect(() => {
    cancelSessionData();
    setSessionStudyData(null);
    if (!selectedCourseId) {
      cancelCourseData();
      setCourseStudyData(null);
      setDocuments([]);
      setSessions([]);
      setActiveSessionId(newSessionValue);
      setMessages([]);
      return undefined;
    }

    setMutationError("");
    loadCourseData(selectedCourseId);
    return cancelCourseData;
  }, [cancelCourseData, cancelSessionData, loadCourseData, selectedCourseId, setCourseStudyData, setSessionStudyData]);

  useEffect(() => {
    if (!courseStudyData) return;
    setDocuments(courseStudyData.documents);
    setSessions(courseStudyData.sessions);
    setMessages(courseStudyData.messages);
    setActiveSessionId(courseStudyData.session ? String(courseStudyData.session.id) : newSessionValue);
    setSelectedDocumentIds(courseStudyData.session?.documentIds.map(String) ?? []);
  }, [courseStudyData]);

  useEffect(() => {
    if (!sessionStudyData) return;
    setSelectedDocumentIds(sessionStudyData.session.documentIds.map(String));
    setMessages(sessionStudyData.messages);
  }, [sessionStudyData]);

  function selectSession(sessionId) {
    setActiveSessionId(sessionId);
    setMutationError("");
    setSessionError("");
    setSessionStudyData(null);
    if (!sessionId) {
      cancelSessionData();
      setSelectedDocumentIds([]);
      setMessages([]);
      return;
    }
    loadSessionData(sessionId);
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
    setMutationError("");
    setCoursesError("");
    setCourseDataError("");
    setSessionError("");
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
      setMutationError(requestError.message);
    } finally {
      setSending(false);
    }
  }

  const loading = loadingCourses || loadingCourseData || loadingSession;
  const error = mutationError || sessionError || courseDataError || coursesError;
  const retry = coursesError ? retryCourses : courseDataError ? retryCourseData : sessionError ? retrySessionData : null;

  return (
    <section className="study-layout" aria-labelledby="session-title">
      <aside className="context-panel">
        <p className="eyebrow">Phiên học</p>
        <h1 id="session-title">Hỏi đáp có nguồn</h1>
        <p>Chọn môn học và tài liệu làm phạm vi trả lời cho phiên mới.</p>

        <label className="context-control" htmlFor="session-course">Môn học</label>
        <select id="session-course" value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)} disabled={loadingCourses}>
          {courses.length === 0 && <option value="">Chưa có môn học</option>}
          {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
        </select>

        <label className="context-control" htmlFor="saved-session">Phiên học</label>
        <select id="saved-session" value={activeSessionId} onChange={(event) => selectSession(event.target.value)} disabled={!selectedCourseId || loadingCourseData || loadingSession}>
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
        {error && <div className="request-message request-error" role="alert"><span>{error}</span>{retry && <button className="text-button" onClick={retry} type="button">Thử lại</button>}</div>}
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
