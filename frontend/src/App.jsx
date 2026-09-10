const milestones = ["Tải tài liệu", "Hỏi đáp có nguồn", "Ôn tập với quiz"];

export default function App() {
  return (
    <main className="app-shell">
      <header>
        <p className="brand">StudyMate</p>
        <h1>Trợ lý học tập từ chính tài liệu môn học</h1>
        <p className="intro">
          Ứng dụng sẽ giúp sinh viên tìm hiểu, hỏi đáp và ôn tập dựa trên các
          tài liệu đã tải lên.
        </p>
      </header>
      <section aria-labelledby="mvp-title">
        <h2 id="mvp-title">MVP đang được xây dựng</h2>
        <ul>
          {milestones.map((milestone) => (
            <li key={milestone}>{milestone}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
