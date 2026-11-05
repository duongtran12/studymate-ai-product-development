import { NavLink } from "react-router-dom";

const navigationItems = [
  { to: "/", label: "Tổng quan", icon: "⌂", end: true }, { to: "/courses", label: "Môn học", icon: "◈" },
  { to: "/documents", label: "Tài liệu", icon: "▤" }, { to: "/study-sessions", label: "Phiên học", icon: "✦" }, { to: "/quizzes", label: "Quiz", icon: "◌" },
];

export default function AppSidebar() {
  return <aside className="app-sidebar" aria-label="Điều hướng chính">
    <NavLink className="brand" to="/" end><span className="brand-mark">S</span><span>StudyMate</span></NavLink>
    <p className="sidebar-context">Không gian học tập từ tài liệu môn học.</p>
    <nav><ul className="navigation-list">{navigationItems.map((item) => <li key={item.to}><NavLink className="navigation-link" to={item.to} end={item.end}><span aria-hidden="true" className="nav-icon">{item.icon}</span>{item.label}</NavLink></li>)}</ul></nav>
    <div className="sidebar-footer"><span className="presence-dot" aria-hidden="true" />Sẵn sàng học tập</div>
    <NavLink className="profile-link" to="/profile">◉ Hồ sơ</NavLink>
  </aside>;
}
