import { useState } from "react";
import { Link } from "react-router-dom";
import { initialCourses, recentSession } from "../mocks/courses";

function slugify(value) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function DashboardPage() {
  const [courses, setCourses] = useState(initialCourses);
  const [isCreating, setIsCreating] = useState(false);
  const [courseName, setCourseName] = useState("");

  function createCourse(event) {
    event.preventDefault();
    const name = courseName.trim();
    if (!name) return;
    setCourses((current) => [{ id: `${slugify(name)}-${Date.now()}`, name, documentCount: 0, lastSession: "Chưa có phiên học", quizProgress: "Chưa làm quiz" }, ...current]);
    setCourseName("");
    setIsCreating(false);
  }

  return (
    <section className="workspace" aria-labelledby="dashboard-title">
      <header className="page-header">
        <div><p className="eyebrow">Tổng quan học tập</p><h1 id="dashboard-title">Chào Minh, hôm nay học gì?</h1></div>
        <button className="button button-primary" type="button" onClick={() => setIsCreating(true)}>Tạo môn học</button>
      </header>

      <section aria-labelledby="continue-title">
        <h2 id="continue-title">Tiếp tục học</h2>
        <div className="continue-row">
          <div><strong>{recentSession.title}</strong><p>{recentSession.courseName} · {recentSession.detail}</p></div>
          <Link className="text-link" to={`/study/${recentSession.id}`}>Mở phiên học →</Link>
        </div>
      </section>

      <section aria-labelledby="courses-title">
        <div className="section-heading"><h2 id="courses-title">Môn học của bạn</h2><span>{courses.length} môn</span></div>
        {courses.length === 0 ? (
          <div className="empty-state"><strong>Chưa có môn học.</strong><p>Tạo môn học đầu tiên để tập hợp tài liệu và bắt đầu một phiên hỏi đáp.</p><button className="button button-primary" onClick={() => setIsCreating(true)}>Tạo môn học đầu tiên</button></div>
        ) : (
          <div className="course-list">{courses.map((course) => (
            <article className="course-row" key={course.id}>
              <div><h3>{course.name}</h3><p>{course.documentCount} tài liệu · Phiên gần nhất: {course.lastSession}</p><span>Quiz gần nhất: {course.quizProgress}</span></div>
              <Link className="button button-secondary" to={`/courses/${course.id}`}>Mở môn học</Link>
            </article>
          ))}</div>
        )}
      </section>

      {isCreating && <div className="modal-backdrop" role="presentation" onMouseDown={() => setIsCreating(false)}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="create-course-title" onMouseDown={(event) => event.stopPropagation()}><h2 id="create-course-title">Tạo môn học</h2><p>Đặt tên ngắn, dễ nhận biết trong danh sách.</p><form onSubmit={createCourse}><label htmlFor="course-name">Tên môn học</label><input id="course-name" autoFocus value={courseName} onChange={(event) => setCourseName(event.target.value)} placeholder="Ví dụ: Mạng máy tính" /><div className="action-row"><button className="button button-secondary" type="button" onClick={() => setIsCreating(false)}>Hủy</button><button className="button button-primary" type="submit">Tạo môn học</button></div></form></div></div>}
    </section>
  );
}
