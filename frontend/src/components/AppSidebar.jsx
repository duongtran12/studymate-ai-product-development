import { NavLink } from "react-router-dom";

const navigationItems = [
  { to: "/", label: "Tong quan", end: true }, { to: "/courses", label: "Mon hoc" },
  { to: "/documents", label: "Tai lieu" }, { to: "/study-sessions", label: "Phien hoc" }, { to: "/quizzes", label: "Quiz" },
];

export default function AppSidebar() {
  return <aside className="app-sidebar" aria-label="Dieu huong chinh"><NavLink className="brand" to="/" end>StudyMate</NavLink><p className="sidebar-context">Khong gian hoc tu tai lieu mon hoc</p><nav><ul className="navigation-list">{navigationItems.map((item) => <li key={item.to}><NavLink className="navigation-link" to={item.to} end={item.end}>{item.label}</NavLink></li>)}</ul></nav><NavLink className="profile-link" to="/profile">Ho so</NavLink></aside>;
}
