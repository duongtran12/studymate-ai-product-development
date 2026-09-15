import { Link } from "react-router-dom";
export default function NotFoundPage() {
  return <section className="page-section" aria-labelledby="not-found-title"><p className="eyebrow">404</p><h1 id="not-found-title">Khong tim thay trang</h1><p className="page-intro">Lien ket nay khong thuoc prototype StudyMate.</p><Link className="primary-action" to="/">Ve tong quan</Link></section>;
}
