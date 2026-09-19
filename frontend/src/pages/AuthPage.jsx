import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    if (!form.email.includes("@")) return setError("Nhap dia chi email hop le.");
    if (form.password.length < 8) return setError("Mat khau can co it nhat 8 ky tu.");
    if (isRegister && form.password !== form.confirmPassword) return setError("Xac nhan mat khau chua khop.");
    setError("");
    navigate("/");
  }

  return <main className="auth-page"><section className="auth-card"><Link className="brand brand-dark" to="/">StudyMate</Link><p className="eyebrow">{isRegister ? "Bat dau hoc tap" : "Chao mung quay lai"}</p><h1>{isRegister ? "Tao tai khoan" : "Dang nhap"}</h1><p className="page-intro">{isRegister ? "Luu tai lieu, phien hoc va ket qua quiz cua ban." : "Tiep tuc hoc tu tai lieu mon hoc cua ban."}</p><form className="auth-form" onSubmit={submit} noValidate><label>Email<input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" placeholder="ban@truong.edu.vn" /></label><label>Mat khau<input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} type="password" placeholder="Toi thieu 8 ky tu" /></label>{isRegister && <label>Xac nhan mat khau<input value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} type="password" placeholder="Nhap lai mat khau" /></label>}{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button" type="submit">{isRegister ? "Tao tai khoan" : "Dang nhap"}</button></form><p className="auth-switch">{isRegister ? "Da co tai khoan?" : "Chua co tai khoan?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Dang nhap" : "Tao tai khoan"}</Link></p><p className="prototype-copy">Prototype: chua ket noi API xac thuc.</p></section></main>;
}
