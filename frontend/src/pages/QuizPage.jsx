import { useCallback, useEffect, useState } from "react";
import { getUserErrorMessage } from "../api/apiError";
import { getCourses } from "../api/courseApi";
import { getCourseQuizzes, submitQuizAttempt } from "../api/quizApi";
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
  const { data: courses, loading: loadingCourses, error: coursesError, run: loadCourses, retry: retryCourses, cancel: cancelCourses } = useAsyncRequest(getCourses, { initialData: [], initialLoading: !suppliedQuiz });
  const requestQuizzes = useCallback((signal, selectedCourseId) => getCourseQuizzes(selectedCourseId, signal), []);
  const { data: quizzes, loading: loadingQuizzes, error: quizzesError, setData: setQuizzes, run: loadQuizzes, retry: retryQuizzes, cancel: cancelQuizzes } = useAsyncRequest(requestQuizzes, { initialData: [] });

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
    if (suppliedQuiz) return;
    setQuizId((current) => quizzes.some((item) => String(item.id) === current) ? current : (quizzes[0]?.id ? String(quizzes[0].id) : ""));
  }, [quizzes, suppliedQuiz]);

  const activeQuiz = suppliedQuiz ?? quizzes.find((item) => String(item.id) === quizId);
  const questions = activeQuiz?.questions ?? [];
  const selectedCourse = courses.find((course) => String(course.id) === courseId);
  const busy = loading || (!suppliedQuiz && (loadingCourses || loadingQuizzes));
  const requestError = error || coursesError || quizzesError || submitError;

  function resetAttempt() { setAnswers({}); setAttempt(null); setSubmitError(""); }
  function chooseAnswer(questionId, option) { setAnswers((current) => ({ ...current, [questionId]: option })); setAttempt(null); }
  async function submit() {
    if (questions.some((question) => !answers[question.id])) return;
    setSubmitError("");
    if (suppliedQuiz) {
      const correctCount = questions.filter((question) => answers[question.id] === question.correctAnswer).length;
      setAttempt({ correctCount, questionCount: questions.length, score: Math.round(correctCount * 100 / questions.length), local: true });
      return;
    }
    setSubmitting(true);
    try {
      setAttempt(await submitQuizAttempt(activeQuiz.id, questions.map((question) => ({ questionId: question.id, answerText: answers[question.id] }))));
    } catch (requestFailure) { setSubmitError(getUserErrorMessage(requestFailure)); }
    finally { setSubmitting(false); }
  }

  if (busy) return <section className="page-section"><LoadingState message="Đang chuẩn bị quiz…" /></section>;
  if (requestError) return <section className="page-section"><ErrorState message={requestError} onRetry={error || coursesError ? (onRetry ?? retryCourses) : retryQuizzes} /></section>;
  if (!suppliedQuiz && courses.length === 0) return <section className="page-section"><EmptyState title="Chưa có môn học" description="Hãy tạo một môn học trước khi làm quiz." /></section>;
  if (!activeQuiz || questions.length === 0) return <section className="page-section"><p className="eyebrow">Ôn tập từ tài liệu</p><h1>Quiz môn học</h1>{!suppliedQuiz && <CoursePicker courses={courses} value={courseId} onChange={(value) => { setCourseId(value); resetAttempt(); }} />}<EmptyState title="Chưa có quiz" description="Tạo bộ câu hỏi cho môn học này để bắt đầu ôn tập." /></section>;

  const complete = questions.every((question) => answers[question.id]);
  return <section className="page-section" aria-labelledby="quiz-title">
    <p className="eyebrow">{selectedCourse?.name ?? "Ôn tập từ tài liệu"}</p>
    <h1 id="quiz-title">{activeQuiz.title}</h1>
    <p className="page-intro">Chọn đáp án cho từng câu hỏi, sau đó nộp một lần để hệ thống chấm điểm.</p>
    {!suppliedQuiz && <>
      <CoursePicker courses={courses} value={courseId} onChange={(value) => { setCourseId(value); resetAttempt(); }} />
      {quizzes.length > 1 && <label className="course-filter"><span>Chọn bộ quiz</span><select value={quizId} onChange={(event) => { setQuizId(event.target.value); resetAttempt(); }}>{quizzes.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>}
    </>}
    <div className="quiz-context"><strong>{suppliedQuiz ? "Nguồn đã chọn:" : "Bộ câu hỏi:"}</strong> {activeQuiz.source ?? `${questions.length} câu hỏi`}</div>
    <article className="quiz-card">
      {questions.map((question, index) => <div className="quiz-question" key={question.id}>
        <p className="question-number">Câu {index + 1} / {questions.length}</p><h2>{question.questionText}</h2>
        <div className="answer-options">{question.options.map((option) => <label className={`answer-option ${attempt?.local && option === question.correctAnswer ? "answer-correct" : ""}`} key={option}><input type="radio" name={`quiz-answer-${question.id}`} disabled={Boolean(attempt)} checked={answers[question.id] === option} onChange={() => chooseAnswer(question.id, option)} />{option}</label>)}</div>
        {attempt?.local && question.explanation && <p className="quiz-explanation">{question.explanation}</p>}
      </div>)}
      {attempt && <div className="quiz-feedback"><strong>{attempt.correctCount === attempt.questionCount ? "Chính xác." : "Đã nộp bài."}</strong><p>Bạn đúng {attempt.correctCount}/{attempt.questionCount} câu, đạt {attempt.score}%.</p>{suppliedQuiz?.source && <span>Nguồn: {suppliedQuiz.source}</span>}</div>}
      <div className="quiz-actions"><button className="secondary-button" disabled={submitting} onClick={resetAttempt} type="button">Làm lại</button><button className="primary-button" disabled={!complete || Boolean(attempt) || submitting} onClick={submit} type="button">{submitting ? "Đang nộp…" : "Nộp câu trả lời"}</button></div>
    </article>
  </section>;
}

function CoursePicker({ courses, value, onChange }) {
  return <label className="course-filter"><span>Chọn môn học</span><select value={value} onChange={(event) => onChange(event.target.value)}>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label>;
}
