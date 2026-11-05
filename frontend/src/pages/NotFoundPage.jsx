import { Link } from "react-router-dom";
export default function NotFoundPage() {
  return <section className="page-section" aria-labelledby="not-found-title"><p className="eyebrow">404</p><h1 id="not-found-title">Không tìm thấy trang</h1><p className="page-intro">Liên kết này không thuộc prototype StudyMate.</p><Link className="primary-action" to="/">Về tổng quan</Link></section>;
}
