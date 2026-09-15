import { NavLink } from "react-router-dom";

const items = [{ to: "/", label: "Tong quan", end: true }, { to: "/courses", label: "Mon hoc" }, { to: "/documents", label: "Tai lieu" }, { to: "/study-sessions", label: "Phien hoc" }, { to: "/quizzes", label: "Quiz" }];

export default function MobileNavigation() {
  return <nav className="mobile-navigation" aria-label="Dieu huong di dong">{items.map((item) => <NavLink key={item.to} to={item.to} end={item.end}>{item.label}</NavLink>)}</nav>;
}
