import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { readyDocuments } from "../mocks/chat";
import { multipleChoiceQuestions, shortAnswerQuestions } from "../mocks/quiz";

export default function QuizPage() {
  const [stage, setStage] = useState("setup");
  const [documentId, setDocumentId] = useState(readyDocuments[0].id);
  const [questionType, setQuestionType] = useState("multiple-choice");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const results = useMemo(() => questions.map((question) => {
    const value = (answers[question.id] || "").trim();
    const correct = question.type === "multiple-choice" ? value === question.answer : question.keywords.every((keyword) => value.toLowerCase().includes(keyword));
    return { ...question, userAnswer: value, correct };
  }), [answers, questions]);
  const score = results.filter((item) => item.correct).length;

  function generateQuiz() {
    setQuestions(questionType === "multiple-choice" ? multipleChoiceQuestions : shortAnswerQuestions);
    setAnswers({});
    setCurrentIndex(0);
    setStage("taking");
  }

  function submitQuiz() {
    const attempt = { completedAt: new Date().toISOString(), score, total: questions.length, documentId, questionType };
    localStorage.setItem("studymate-latest-quiz-attempt", JSON.stringify(attempt));
    setShowSubmitDialog(false);
    setStage("result");
  }

  if (stage === "setup") {
    return <section className="workspace quiz-setup" aria-labelledby="quiz-title"><header><p className="eyebrow">Ôn tập có nguồn</p><h1 id="quiz-title">Tạo quiz từ tài liệu</h1><p className="page-intro">Chọn một tài liệu Sẵn sàng và kiểu câu hỏi. Quiz này dùng dữ liệu mẫu, chưa gọi AI hoặc backend.</p></header><div className="setup-form"><fieldset><legend>Tài liệu nguồn</legend>{readyDocuments.map((document) => <label className="choice-row" key={document.id}><input type="radio" name="document" checked={documentId === document.id} onChange={() => setDocumentId(document.id)} /><span><strong>{document.name}</strong><small>{document.detail} · Sẵn sàng</small></span></label>)}</fieldset><fieldset><legend>Loại câu hỏi</legend><label className="choice-row"><input type="radio" name="type" checked={questionType === "multiple-choice"} onChange={() => setQuestionType("multiple-choice")} /><span><strong>Trắc nghiệm</strong><small>Chọn một đáp án đúng cho mỗi câu.</small></span></label><label className="choice-row"><input type="radio" name="type" checked={questionType === "short-answer"} onChange={() => setQuestionType("short-answer")} /><span><strong>Trả lời ngắn</strong><small>Viết câu trả lời dựa trên nội dung đã học.</small></span></label></fieldset><button className="button button-primary" onClick={generateQuiz}>Tạo quiz mẫu</button></div></section>;
  }

  if (stage === "result") {
    return <section className="workspace" aria-labelledby="result-title"><header><p className="eyebrow">Kết quả quiz</p><h1 id="result-title">Bạn trả lời đúng {score}/{questions.length} câu</h1><p className="page-intro">Xem lại giải thích và nguồn trước khi làm lại.</p></header><div className="result-list">{results.map((item, index) => <article className={`result-item ${item.correct ? "correct" : "incorrect"}`} key={item.id}><div className="result-heading"><h2>Câu {index + 1}: {item.correct ? "Đúng" : "Cần xem lại"}</h2><span>{item.correct ? "✓" : "!"}</span></div><p><strong>{item.prompt}</strong></p><p>Câu trả lời của bạn: {item.userAnswer || "Chưa trả lời"}</p>{!item.correct && <p>Đáp án gợi ý: {item.answer}</p>}<p className="explanation">{item.explanation}</p><div className="result-citation">Nguồn: {item.citation}</div></article>)}</div><div className="action-row action-row-start"><button className="button button-primary" onClick={() => setStage("taking")}>Làm lại</button><Link className="button button-secondary" to="/courses/lap-trinh-web">Về môn học</Link></div></section>;
  }

  const question = questions[currentIndex];
  const answeredCount = Object.values(answers).filter((value) => value.trim()).length;
  return <section className="workspace" aria-labelledby="question-title"><header className="quiz-progress-header"><div><p className="eyebrow">Quiz · Lập trình Web</p><h1 id="question-title">Câu {currentIndex + 1}/{questions.length}</h1></div><div className="progress-copy">Đã trả lời {answeredCount}/{questions.length}</div></header><div className="progress-track" aria-label={`Tiến độ ${currentIndex + 1} trên ${questions.length}`}><span style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} /></div><article className="question-panel"><h2>{question.prompt}</h2>{question.type === "multiple-choice" ? <div className="answer-options">{question.options.map((option) => <label className="answer-option" key={option}><input type="radio" name={question.id} checked={answers[question.id] === option} onChange={() => setAnswers((current) => ({ ...current, [question.id]: option }))} /><span>{option}</span></label>)}</div> : <label className="short-answer"><span>Câu trả lời của bạn</span><textarea rows="5" value={answers[question.id] || ""} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))} placeholder="Viết ngắn gọn theo nội dung tài liệu..." /></label>}</article><div className="quiz-actions"><button className="button button-secondary" disabled={currentIndex === 0} onClick={() => setCurrentIndex((value) => value - 1)}>Câu trước</button>{currentIndex < questions.length - 1 ? <button className="button button-primary" onClick={() => setCurrentIndex((value) => value + 1)}>Câu tiếp theo</button> : <button className="button button-primary" onClick={() => setShowSubmitDialog(true)}>Nộp bài</button>}</div>{answeredCount < questions.length && <p className="unanswered-note">Bạn còn {questions.length - answeredCount} câu chưa trả lời. Bạn vẫn có thể nộp bài để xem phần cần ôn lại.</p>}{showSubmitDialog && <div className="modal-backdrop" onMouseDown={() => setShowSubmitDialog(false)}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="submit-title" onMouseDown={(event) => event.stopPropagation()}><h2 id="submit-title">Nộp bài quiz?</h2><p>Bạn đã trả lời {answeredCount}/{questions.length} câu. Sau khi nộp, StudyMate sẽ hiển thị đáp án, giải thích và nguồn.</p><div className="action-row"><button className="button button-secondary" onClick={() => setShowSubmitDialog(false)}>Kiểm tra lại</button><button className="button button-primary" onClick={submitQuiz}>Nộp và xem kết quả</button></div></div></div>}</section>;
}
