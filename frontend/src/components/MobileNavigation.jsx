import { NavLink } from "react-router-dom";

const items = [{ to: "/", label: "Tổng quan", end: true }, { to: "/courses", label: "Môn học" }, { to: "/documents", label: "Tài liệu" }, { to: "/study-sessions", label: "Phiên học" }, { to: "/quizzes", label: "Quiz" }];

export default function MobileNavigation() {
  return <nav className="mobile-navigation" aria-label="Điều hướng di động">{items.map((item) => <NavLink key={item.to} to={item.to} end={item.end}>{item.label}</NavLink>)}</nav>;
}
