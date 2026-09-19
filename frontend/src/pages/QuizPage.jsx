import { useState } from "react";

const options = ["Tang phu thuoc giua cac lop", "Cung cap phu thuoc tu ben ngoai", "Loai bo interface", "Luu phu thuoc vao database"];

export default function QuizPage() {
  const [selected, setSelected] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const correct = "Cung cap phu thuoc tu ben ngoai";
  return <section className="page-section" aria-labelledby="quiz-title"><p className="eyebrow">On tap tu tai lieu</p><h1 id="quiz-title">Quiz: Kien truc phan mem</h1><p className="page-intro">Quiz nay la prototype. Khi co AI backend, cau hoi se duoc sinh tu tai lieu da chon va luu kem nguon.</p><div className="quiz-context"><strong>Nguon da chon:</strong> Bai giang 01.pdf · 5 cau hoi · Cau 1 / 5</div><article className="quiz-card"><p className="question-number">Cau 1</p><h2>Muc dich cua dependency injection la gi?</h2><div className="answer-options">{options.map((option) => <label className={`answer-option ${submitted && option === correct ? "answer-correct" : ""}`} key={option}><input type="radio" name="quiz-answer" disabled={submitted} checked={selected === option} onChange={() => setSelected(option)} />{option}</label>)}</div>{submitted && <div className="quiz-feedback"><strong>{selected === correct ? "Chinh xac." : "Chua dung."}</strong><p>Dependency injection giup mot doi tuong nhan phu thuoc tu ben ngoai, de kiem thu va thay the thanh phan de hon.</p><span>Nguon: Bai giang 01.pdf · Trang 12 · Dependency injection</span></div>}<div className="quiz-actions"><button className="secondary-button" onClick={() => { setSelected(""); setSubmitted(false); }}>Lam lai</button><button className="primary-button" disabled={!selected || submitted} onClick={() => setSubmitted(true)}>Nop cau tra loi</button></div></article></section>;
}
