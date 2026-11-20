import { useCallback, useEffect, useState } from "react";
import { getUserErrorMessage } from "../api/apiError";
import { getCourses } from "../api/courseApi";
import { getDocuments } from "../api/documentLibraryApi";
import { createQuiz, deleteQuiz, generateQuiz, getAiStatus, getCourseQuizzes, getQuizAttempts, submitQuizAttempt } from "../api/quizApi";
import { EmptyState, ErrorState, LoadingState } from "../components/ContentState";
import { useAsyncRequest } from "../hooks/useAsyncRequest";

function asPrototype(quiz) {
  if (quiz?.questions) return quiz;
  if (!quiz?.question || !quiz?.options) return null;
  return { ...quiz, questions: [{ id: "prototype-question", questionText: quiz.question, options: quiz.options, correctAnswer: quiz.correctAnswer }] };
}

export default function QuizPage({ quiz, loading = false, error = "", onRetry }) {
  const suppliedQuiz = asPrototype(quiz);
  const [courseId, setCourseId] = useState("");
  const [quizId, setQuizId] = useState("");
  const [answers, setAnswers] = useState({});
  const [attempt, setAttempt] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
	const [deletingQuiz, setDeletingQuiz] = useState(false);
	const [generating, setGenerating] = useState(false);
	const [generationError, setGenerationError] = useState("");
	const [generationOptions, setGenerationOptions] = useState({ questionCount: 3, difficulty: "MEDIUM" });
	const [generatedDraft, setGeneratedDraft] = useState(null);
	const [aiStatus, setAiStatus] = useState(null);
  const [showCreator, setShowCreator] = useState(false);
  const [draft, setDraft] = useState({ title: "", questionText: "", options: "", answerText: "", explanation: "" });
  const [creatorError, setCreatorError] = useState("");
  const [sourceDocumentIds, setSourceDocumentIds] = useState([]);
  const { data: courses, loading: loadingCourses, error: coursesError, run: loadCourses, retry: retryCourses, cancel: cancelCourses } = useAsyncRequest(getCourses, { initialData: [], initialLoading: !suppliedQuiz });
  const requestQuizzes = useCallback((signal, selectedCourseId) => getCourseQuizzes(selectedCourseId, signal), []);
  const { data: quizzes, loading: loadingQuizzes, error: quizzesError, setData: setQuizzes, run: loadQuizzes, retry: retryQuizzes, cancel: cancelQuizzes } = useAsyncRequest(requestQuizzes, { initialData: [] });
  const requestDocuments = useCallback((signal, selectedCourseId) => getDocuments(selectedCourseId, signal), []);
  const { data: documents, loading: loadingDocuments, run: loadDocuments, cancel: cancelDocuments } = useAsyncRequest(requestDocuments, { initialData: [] });
  const requestAttempts = useCallback((signal, selectedQuizId) => getQuizAttempts(selectedQuizId, signal), []);
  const { data: attempts, loading: loadingAttempts, error: attemptsError, setData: setAttempts, run: loadAttempts, retry: retryAttempts, cancel: cancelAttempts } = useAsyncRequest(requestAttempts, { initialData: [] });

  useEffect(() => {
    if (suppliedQuiz) return undefined;
    loadCourses();
    return cancelCourses;
  }, [cancelCourses, loadCourses, suppliedQuiz]);

  useEffect(() => {
    if (suppliedQuiz) return;
    setCourseId((current) => current || (courses[0]?.id ? String(courses[0].id) : ""));
  }, [courses, suppliedQuiz]);

  useEffect(() => {
    if (suppliedQuiz) return undefined;
    if (!courseId) { setQuizzes([]); return undefined; }
    loadQuizzes(courseId);
    return cancelQuizzes;
  }, [cancelQuizzes, courseId, loadQuizzes, setQuizzes, suppliedQuiz]);

  useEffect(() => {
    if (suppliedQuiz) return undefined;
    if (!courseId) return undefined;
    loadDocuments(courseId);
    return cancelDocuments;
  }, [cancelDocuments, courseId, loadDocuments, suppliedQuiz]);

  useEffect(() => {
    if (suppliedQuiz) return;
    setQuizId((current) => quizzes.some((item) => String(item.id) === current) ? current : (quizzes[0]?.id ? String(quizzes[0].id) : ""));
  }, [quizzes, suppliedQuiz]);

  useEffect(() => {
    if (suppliedQuiz) return undefined;
    if (!quizId) { setAttempts([]); return undefined; }
    loadAttempts(quizId);
    return cancelAttempts;
  }, [cancelAttempts, loadAttempts, quizId, setAttempts, suppliedQuiz]);

  useEffect(() => {
    if (suppliedQuiz) return undefined;
    const controller = new AbortController();
    getAiStatus(controller.signal).then(setAiStatus).catch(() => setAiStatus({ ready: false, message: "Không thể kiểm tra trạng thái AI." }));
    return () => controller.abort();
  }, [suppliedQuiz]);

  const activeQuiz = suppliedQuiz ?? quizzes.find((item) => String(item.id) === quizId);
  const questions = activeQuiz?.questions ?? [];
  const selectedCourse = courses.find((course) => String(course.id) === courseId);
  const sourceDocuments = documents.filter((document) => activeQuiz?.documentIds?.includes(document.id));
  const busy = loading || (!suppliedQuiz && (loadingCourses || loadingQuizzes));
  const requestError = error || coursesError || quizzesError || submitError;

  function resetAttempt() { setAnswers({}); setAttempt(null); setSubmitError(""); }
  function chooseAnswer(questionId, option) { setAnswers((current) => ({ ...current, [questionId]: option })); setAttempt(null); }
  function updateDraft(field, value) { setDraft((current) => ({ ...current, [field]: value })); }
  async function createManualQuiz(event) {
    event.preventDefault();
    const options = draft.options.split("\n").map((option) => option.trim()).filter(Boolean);
    if (options.length < 2 || !options.includes(draft.answerText.trim())) {
      setCreatorError("Cần ít nhất hai đáp án và đáp án đúng phải nằm trong danh sách.");
      return;
    }
    setSubmitting(true);
    setCreatorError("");
    try {
      const created = await createQuiz(courseId, { title: draft.title, questions: [{ questionText: draft.questionText, options, answerText: draft.answerText, explanation: draft.explanation }], documentIds: sourceDocumentIds });
      setQuizzes((current) => [created, ...current]);
      setQuizId(String(created.id));
      setDraft({ title: "", questionText: "", options: "", answerText: "", explanation: "" });
      setSourceDocumentIds([]);
      setShowCreator(false);
    } catch (requestFailure) { setCreatorError(getUserErrorMessage(requestFailure)); }
    finally { setSubmitting(false); }
  }
  async function createAiQuiz() {
    if (sourceDocumentIds.length === 0) { setGenerationError("Chọn ít nhất một tài liệu sẵn sàng trước."); return; }
    setGenerating(true); setGenerationError("");
    try {
      const draft = await generateQuiz(courseId, { documentIds: sourceDocumentIds, ...generationOptions });
      setGeneratedDraft(draft);
    } catch (requestFailure) { setGenerationError(getUserErrorMessage(requestFailure)); }
    finally { setGenerating(false); }
  }
  async function saveGeneratedDraft() {
    if (!generatedDraft || submitting) return;
    setSubmitting(true); setGenerationError("");
    try {
      const created = await createQuiz(courseId, generatedDraft);
      setQuizzes((current) => [created, ...current]); setQuizId(String(created.id)); setGeneratedDraft(null); setSourceDocumentIds([]);
    } catch (requestFailure) { setGenerationError(getUserErrorMessage(requestFailure)); }
    finally { setSubmitting(false); }
  }
  function updateGeneratedQuestion(index, field, value) {
    setGeneratedDraft((current) => ({ ...current, questions: current.questions.map((question, questionIndex) => questionIndex === index ? { ...question, [field]: value } : question) }));
  }
  function updateGeneratedOption(questionIndex, optionIndex, value) {
    setGeneratedDraft((current) => ({ ...current, questions: current.questions.map((question, index) => index === questionIndex ? { ...question, options: question.options.map((option, itemIndex) => itemIndex === optionIndex ? value : option) } : question) }));
  }
  async function submit() {
    if (questions.some((question) => !answers[question.id])) return;
    setSubmitError("");
    if (suppliedQuiz) {
      const correctCount = questions.filter((question) => answers[question.id] === question.correctAnswer).length;
      setAttempt({ correctCount, questionCount: questions.length, score: Math.round(correctCount * 100 / questions.length), local: true, feedback: questions.map((question) => ({ questionId: question.id, selectedAnswer: answers[question.id], correctAnswer: question.correctAnswer, correct: answers[question.id] === question.correctAnswer, explanation: question.explanation })) });
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitQuizAttempt(activeQuiz.id, questions.map((question) => ({ questionId: question.id, answerText: answers[question.id] })));
      setAttempt(result);
      await loadAttempts(activeQuiz.id);
    } catch (requestFailure) { setSubmitError(getUserErrorMessage(requestFailure)); }
    finally { setSubmitting(false); }
  }
  async function removeQuiz() {
    if (!activeQuiz || !window.confirm(`Xóa bộ quiz “${activeQuiz.title}” và lịch sử làm bài?`)) return;
    setDeletingQuiz(true);
    setSubmitError("");
    try {
      await deleteQuiz(activeQuiz.id);
      setQuizzes((current) => current.filter((item) => item.id !== activeQuiz.id));
      setQuizId("");
      resetAttempt();
    } catch (requestFailure) { setSubmitError(getUserErrorMessage(requestFailure)); }
    finally { setDeletingQuiz(false); }
  }

  if (busy) return <section className="page-section"><LoadingState message="Đang chuẩn bị quiz…" /></section>;
  if (requestError) return <section className="page-section"><ErrorState message={requestError} onRetry={error || coursesError ? (onRetry ?? retryCourses) : retryQuizzes} /></section>;
  if (!suppliedQuiz && courses.length === 0) return <section className="page-section"><EmptyState title="Chưa có môn học" description="Hãy tạo một môn học trước khi làm quiz." /></section>;
  if (!activeQuiz || questions.length === 0) return <section className="page-section"><p className="eyebrow">Ôn tập từ tài liệu</p><h1>Quiz môn học</h1>{!suppliedQuiz && <CoursePicker courses={courses} value={courseId} onChange={(value) => { setCourseId(value); setSourceDocumentIds([]); setGeneratedDraft(null); resetAttempt(); }} />}{generatedDraft ? <AiQuizPreview draft={generatedDraft} busy={submitting} error={generationError} onCancel={() => setGeneratedDraft(null)} onOptionChange={updateGeneratedOption} onQuestionChange={updateGeneratedQuestion} onSave={saveGeneratedDraft} /> : <><EmptyState title="Chưa có quiz" description="Tạo bộ câu hỏi cho môn học này để bắt đầu ôn tập." />{!suppliedQuiz && <><AiQuizGenerator aiStatus={aiStatus} documents={documents} documentsLoading={loadingDocuments} error={generationError} generating={generating} options={generationOptions} selectedDocumentIds={sourceDocumentIds} onGenerate={createAiQuiz} onOptionsChange={(field, value) => setGenerationOptions((current) => ({ ...current, [field]: field === "questionCount" ? Number(value) : value }))} onDocumentToggle={(documentId) => setSourceDocumentIds((current) => current.includes(documentId) ? current.filter((id) => id !== documentId) : [...current, documentId])} /><button className="primary-button" type="button" onClick={() => { setShowCreator((current) => !current); setCreatorError(""); }}>{showCreator ? "Đóng biểu mẫu" : "Tạo quiz thủ công"}</button>{showCreator && <QuizCreator draft={draft} disabled={submitting} error={creatorError} documents={documents} documentsLoading={loadingDocuments} selectedDocumentIds={sourceDocumentIds} onDocumentToggle={(documentId) => setSourceDocumentIds((current) => current.includes(documentId) ? current.filter((id) => id !== documentId) : [...current, documentId])} onChange={updateDraft} onSubmit={createManualQuiz} />}</>}</>}</section>;

  const complete = questions.every((question) => answers[question.id]);
  return <section className="page-section" aria-labelledby="quiz-title">
    <p className="eyebrow">{selectedCourse?.name ?? "Ôn tập từ tài liệu"}</p>
    <h1 id="quiz-title">{activeQuiz.title}</h1>
    <p className="page-intro">Chọn đáp án cho từng câu hỏi, sau đó nộp một lần để hệ thống chấm điểm.</p>
    {!suppliedQuiz && <>
      <CoursePicker courses={courses} value={courseId} onChange={(value) => { setCourseId(value); resetAttempt(); }} />
      {quizzes.length > 1 && <label className="course-filter"><span>Chọn bộ quiz</span><select value={quizId} onChange={(event) => { setQuizId(event.target.value); resetAttempt(); }}>{quizzes.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>}
    </>}
    <div className="quiz-context"><strong>{suppliedQuiz ? "Nguồn đã chọn:" : "Bộ câu hỏi:"}</strong> {activeQuiz.source ?? `${questions.length} câu hỏi`}{!suppliedQuiz && activeQuiz.documentIds?.length > 0 && ` · ${activeQuiz.documentIds.length} tài liệu nguồn`}</div>
    {!suppliedQuiz && sourceDocuments.length > 0 && <ul className="quiz-source-list" aria-label="Tài liệu nguồn của Quiz">{sourceDocuments.map((document) => <li key={document.id}>⌁ {document.fileName}</li>)}</ul>}
    <article className="quiz-card">
      {questions.map((question, index) => {
        const feedback = attempt?.feedback?.find((item) => item.questionId === question.id);
        return <div className="quiz-question" key={question.id}>
        <p className="question-number">Câu {index + 1} / {questions.length}</p><h2>{question.questionText}</h2>
        <div className="answer-options">{question.options.map((option) => <label className={`answer-option ${feedback?.correctAnswer === option ? "answer-correct" : ""} ${feedback && !feedback.correct && feedback.selectedAnswer === option ? "answer-incorrect" : ""}`} key={option}><input type="radio" name={`quiz-answer-${question.id}`} disabled={Boolean(attempt)} checked={answers[question.id] === option} onChange={() => chooseAnswer(question.id, option)} />{option}</label>)}</div>
        {feedback && <div className={`question-feedback ${feedback.correct ? "feedback-correct" : "feedback-incorrect"}`}><strong>{feedback.correct ? "Đúng rồi" : "Chưa chính xác"}</strong>{!feedback.correct && <span>Đáp án đúng: {feedback.correctAnswer}</span>}{feedback.explanation && <p>{feedback.explanation}</p>}</div>}
      </div>})}
      {attempt && <div className="quiz-feedback"><strong>{attempt.correctCount === attempt.questionCount ? "Chính xác." : "Đã nộp bài."}</strong><p>Bạn đúng {attempt.correctCount}/{attempt.questionCount} câu, đạt {attempt.score}%.</p>{suppliedQuiz?.source && <span>Nguồn: {suppliedQuiz.source}</span>}</div>}
      <div className="quiz-actions"><button className="text-button danger" disabled={submitting || deletingQuiz} onClick={removeQuiz} type="button">{deletingQuiz ? "Đang xóa…" : "Xóa quiz"}</button><button className="secondary-button" disabled={submitting || deletingQuiz} onClick={resetAttempt} type="button">Làm lại</button><button className="primary-button" disabled={!complete || Boolean(attempt) || submitting || deletingQuiz} onClick={submit} type="button">{submitting ? "Đang nộp…" : "Nộp câu trả lời"}</button></div>
    </article>
    {!suppliedQuiz && <QuizHistory attempts={attempts} loading={loadingAttempts} error={attemptsError} onRetry={retryAttempts} />}
  </section>;
}

function CoursePicker({ courses, value, onChange }) {
  return <label className="course-filter"><span>Chọn môn học</span><select value={value} onChange={(event) => onChange(event.target.value)}>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label>;
}

function QuizCreator({ draft, disabled, error, documents, documentsLoading, selectedDocumentIds, onDocumentToggle, onChange, onSubmit }) {
  return <form className="course-create-form course-editor" onSubmit={onSubmit}>
    <h2>Tạo quiz thủ công</h2>
    {error && <p className="form-error" role="alert">{error}</p>}
    <label>Tên bộ quiz<input required value={draft.title} onChange={(event) => onChange("title", event.target.value)} placeholder="Ví dụ: Ôn tập chương 1" /></label>
    <label>Câu hỏi<input required value={draft.questionText} onChange={(event) => onChange("questionText", event.target.value)} placeholder="Nhập câu hỏi trắc nghiệm" /></label>
    <label>Các lựa chọn (mỗi dòng một lựa chọn)<textarea required value={draft.options} onChange={(event) => onChange("options", event.target.value)} placeholder={"Lựa chọn A\nLựa chọn B"} rows="4" /></label>
    <label>Đáp án đúng<input required value={draft.answerText} onChange={(event) => onChange("answerText", event.target.value)} placeholder="Phải trùng với một lựa chọn ở trên" /></label>
    <label>Giải thích (không bắt buộc)<textarea value={draft.explanation} onChange={(event) => onChange("explanation", event.target.value)} rows="3" /></label>
    <fieldset className="quiz-source-picker"><legend>Tài liệu nguồn (không bắt buộc)</legend>{documentsLoading && <span>Đang tải tài liệu…</span>}{!documentsLoading && documents.length === 0 && <span>Môn học này chưa có tài liệu.</span>}{documents.map((document) => <label className={document.processingStatus !== "READY" ? "source-document-unavailable" : ""} key={document.id}><input type="checkbox" checked={selectedDocumentIds.includes(document.id)} disabled={document.processingStatus !== "READY"} onChange={() => onDocumentToggle(document.id)} />{document.fileName}{document.processingStatus !== "READY" && <small> · Chưa sẵn sàng</small>}</label>)}</fieldset>
    <button className="primary-button" disabled={disabled} type="submit">{disabled ? "Đang tạo…" : "Tạo quiz"}</button>
  </form>;
}

function AiQuizGenerator({ aiStatus, documents, documentsLoading, options, selectedDocumentIds, onDocumentToggle, onGenerate, onOptionsChange, generating, error }) {
  const readyDocuments = documents.filter((document) => document.processingStatus === "READY");
  return <section className="quiz-context"><strong>Tạo quiz bằng AI</strong><p>Chọn tài liệu đã sẵn sàng, số câu và mức độ khó trước khi tạo.</p>{aiStatus && <p className={aiStatus.ready ? "ai-ready" : "ai-unavailable"}>{aiStatus.message}</p>}{error && <p className="form-error">{error}</p>}<div className="ai-quiz-options"><label>Số câu<select value={options.questionCount} onChange={(event) => onOptionsChange("questionCount", event.target.value)}>{[1, 2, 3, 4, 5].map((count) => <option key={count} value={count}>{count} câu</option>)}</select></label><label>Mức độ<select value={options.difficulty} onChange={(event) => onOptionsChange("difficulty", event.target.value)}><option value="EASY">Dễ</option><option value="MEDIUM">Trung bình</option><option value="HARD">Khó</option></select></label></div>{documentsLoading ? <span>Đang tải tài liệu…</span> : readyDocuments.length === 0 ? <span>Chưa có tài liệu sẵn sàng.</span> : <fieldset className="quiz-source-picker"><legend>Nguồn cho AI</legend>{readyDocuments.map((document) => <label key={document.id}><input type="checkbox" checked={selectedDocumentIds.includes(document.id)} onChange={() => onDocumentToggle(document.id)} />{document.fileName}</label>)}</fieldset>}<button className="primary-button" type="button" disabled={generating || !aiStatus?.ready || selectedDocumentIds.length === 0} onClick={onGenerate}>{generating ? "AI đang tạo…" : "Tạo quiz từ tài liệu"}</button></section>;
}

function AiQuizPreview({ draft, busy, error, onCancel, onOptionChange, onQuestionChange, onSave }) {
  return <section className="ai-quiz-preview"><p className="eyebrow">Bản nháp AI</p><h2>Xem và chỉnh sửa trước khi lưu</h2>{error && <p className="form-error">{error}</p>}{draft.questions.map((question, questionIndex) => <article key={questionIndex}><label>Câu {questionIndex + 1}<textarea value={question.questionText} onChange={(event) => onQuestionChange(questionIndex, "questionText", event.target.value)} rows="2" /></label>{question.options.map((option, optionIndex) => <label key={optionIndex}>Lựa chọn {optionIndex + 1}<input value={option} onChange={(event) => onOptionChange(questionIndex, optionIndex, event.target.value)} /></label>)}<label>Đáp án đúng<input value={question.answerText} onChange={(event) => onQuestionChange(questionIndex, "answerText", event.target.value)} /></label><label>Giải thích<textarea value={question.explanation ?? ""} onChange={(event) => onQuestionChange(questionIndex, "explanation", event.target.value)} rows="2" /></label></article>)}<div className="quiz-actions"><button className="secondary-button" type="button" disabled={busy} onClick={onCancel}>Hủy bản nháp</button><button className="primary-button" type="button" disabled={busy} onClick={onSave}>{busy ? "Đang lưu…" : "Lưu Quiz"}</button></div></section>;
}

function QuizHistory({ attempts, loading, error, onRetry }) {
  return <section className="quiz-history" aria-live="polite">
    <h2>Lịch sử làm bài</h2>
    {loading && <p>Đang tải lịch sử…</p>}
    {!loading && error && <p className="form-error">{error} <button className="secondary-button" type="button" onClick={onRetry}>Thử lại</button></p>}
    {!loading && !error && attempts.length === 0 && <p>Chưa có lần làm bài nào.</p>}
    {!loading && !error && attempts.length > 0 && <ol>{attempts.map((item) => <li key={item.id}><strong>{item.score}%</strong> · {item.status === "SUBMITTED" ? "Đã nộp" : item.status} · {new Date(item.submittedAt).toLocaleString("vi-VN")}</li>)}</ol>}
  </section>;
}
