import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    if (!form.email.includes("@")) return setError("Nhập địa chỉ email hợp lệ.");
    if (form.password.length < 8) return setError("Mật khẩu cần có ít nhất 8 ký tự.");
    if (isRegister && form.password !== form.confirmPassword) return setError("Xác nhận mật khẩu chưa khớp.");
    setError("");
    navigate("/");
  }

  return <main className="auth-page"><section className="auth-card"><Link className="brand brand-dark" to="/">StudyMate</Link><p className="eyebrow">{isRegister ? "Bắt đầu học tập" : "Chào mừng quay lại"}</p><h1>{isRegister ? "Tạo tài khoản" : "Đăng nhập"}</h1><p className="page-intro">{isRegister ? "Lưu tài liệu, phiên học và kết quả quiz của bạn." : "Tiếp tục học từ tài liệu môn học của bạn."}</p><form className="auth-form" onSubmit={submit} noValidate><label>Email<input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" placeholder="ban@truong.edu.vn" /></label><label>Mật khẩu<input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} type="password" placeholder="Tối thiểu 8 ký tự" /></label>{isRegister && <label>Xác nhận mật khẩu<input value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} type="password" placeholder="Nhập lại mật khẩu" /></label>}{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button" type="submit">{isRegister ? "Tạo tài khoản" : "Đăng nhập"}</button></form><p className="auth-switch">{isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Đăng nhập" : "Tạo tài khoản"}</Link></p><p className="prototype-copy">Prototype: chưa kết nối API xác thực.</p></section></main>;
}
