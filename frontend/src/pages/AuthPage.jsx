import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { getUserErrorMessage } from "../api/apiError";
import { loginAccount, registerAccount } from "../api/authApi";

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!form.email.includes("@")) return setError("Nhập địa chỉ email hợp lệ.");
    if (form.password.length < 8) return setError("Mật khẩu cần có ít nhất 8 ký tự.");
    if (isRegister && form.password !== form.confirmPassword) return setError("Xác nhận mật khẩu chưa khớp.");
    setError("");
    setSubmitting(true);
    try {
      if (isRegister) await registerAccount({ email: form.email, password: form.password });
      else await loginAccount({ email: form.email, password: form.password });
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(getUserErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="auth-page"><section className="auth-card"><Link className="brand brand-dark" to="/">StudyMate</Link><p className="eyebrow">{isRegister ? "Bắt đầu học tập" : "Chào mừng quay lại"}</p><h1>{isRegister ? "Tạo tài khoản" : "Đăng nhập"}</h1><p className="page-intro">{isRegister ? "Lưu tài liệu, phiên học và kết quả quiz của bạn." : "Tiếp tục học từ tài liệu môn học của bạn."}</p><form className="auth-form" onSubmit={submit} noValidate><label>Email<input disabled={submitting} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" placeholder="ban@truong.edu.vn" /></label><label>Mật khẩu<input disabled={submitting} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} type="password" placeholder="Tối thiểu 8 ký tự" /></label>{isRegister && <label>Xác nhận mật khẩu<input disabled={submitting} value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} type="password" placeholder="Nhập lại mật khẩu" /></label>}{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button" disabled={submitting} type="submit">{submitting ? "Đang xử lý…" : isRegister ? "Tạo tài khoản" : "Đăng nhập"}</button></form><p className="auth-switch">{isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Đăng nhập" : "Tạo tài khoản"}</Link></p></section></main>;
}
