import { Link, useParams } from "react-router-dom";
import { initialCourses } from "../mocks/courses";

export default function CourseOverviewPage() {
  const { courseId } = useParams();
  const course = initialCourses.find((item) => item.id === courseId);

  if (!course) {
    return <section className="page-section"><p className="eyebrow">Môn học</p><h1>Không tìm thấy môn học</h1><Link className="primary-action" to="/courses">Về danh sách môn học</Link></section>;
  }

  return (
    <section className="page-section">
      <p className="eyebrow">Không gian môn học</p>
      <h1>{course.name}</h1>
      <p className="page-intro">Mở thư viện tài liệu, tiếp tục phiên học hoặc tạo quiz từ nội dung đã sẵn sàng.</p>
      <div className="action-row">
        <Link className="button button-primary" to={`/courses/${course.id}/documents`}>Xem tài liệu</Link>
        <Link className="button button-secondary" to="/study/session-react-hooks">Tiếp tục học</Link>
      </div>
    </section>
  );
}
