import { useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "../components/ContentState";

const prototypeQuiz = {
  title: "Quiz: Kiến trúc phần mềm",
  source: "Bài giảng 01.pdf",
  question: "Mục đích của dependency injection là gì?",
  options: [
    "Tăng phụ thuộc giữa các lớp",
    "Cung cấp phụ thuộc từ bên ngoài",
    "Loại bỏ interface",
    "Lưu phụ thuộc vào database",
  ],
  correctAnswer: "Cung cấp phụ thuộc từ bên ngoài",
};

export default function QuizPage({ quiz = prototypeQuiz, loading = false, error = "", onRetry }) {
  const [selected, setSelected] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (loading) {
    return <section className="page-section"><LoadingState message="Đang chuẩn bị quiz…" /></section>;
  }
  if (error) {
    return <section className="page-section"><ErrorState message={error} onRetry={onRetry} /></section>;
  }
  if (!quiz?.question || quiz.options?.length === 0) {
    return <section className="page-section"><EmptyState title="Chưa có quiz" description="Chọn tài liệu đã sẵn sàng để tạo bộ câu hỏi ôn tập." /></section>;
  }

  return (
    <section className="page-section" aria-labelledby="quiz-title">
      <p className="eyebrow">Ôn tập từ tài liệu</p>
      <h1 id="quiz-title">{quiz.title}</h1>
      <p className="page-intro">Quiz này đang dùng dữ liệu prototype; trạng thái tải, lỗi và rỗng đã sẵn sàng cho API Quiz sau này.</p>
      <div className="quiz-context"><strong>Nguồn đã chọn:</strong> {quiz.source} · Câu 1 / 1</div>
      <article className="quiz-card">
        <p className="question-number">Câu 1</p>
        <h2>{quiz.question}</h2>
        <div className="answer-options">
          {quiz.options.map((option) => (
            <label className={`answer-option ${submitted && option === quiz.correctAnswer ? "answer-correct" : ""}`} key={option}>
              <input type="radio" name="quiz-answer" disabled={submitted} checked={selected === option} onChange={() => setSelected(option)} />
              {option}
            </label>
          ))}
        </div>
        {submitted && (
          <div className="quiz-feedback">
            <strong>{selected === quiz.correctAnswer ? "Chính xác." : "Chưa đúng."}</strong>
            <p>Dependency injection giúp một đối tượng nhận phụ thuộc từ bên ngoài, để kiểm thử và thay thế thành phần dễ hơn.</p>
            <span>Nguồn: {quiz.source} · Trang 12 · Dependency injection</span>
          </div>
        )}
        <div className="quiz-actions">
          <button className="secondary-button" disabled={!selected} onClick={() => { setSelected(""); setSubmitted(false); }} type="button">Làm lại</button>
          <button className="primary-button" disabled={!selected || submitted} onClick={() => setSubmitted(true)} type="button">Nộp câu trả lời</button>
        </div>
      </article>
    </section>
  );
}
