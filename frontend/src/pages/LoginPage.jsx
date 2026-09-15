import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function submit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!emailPattern.test(values.email)) nextErrors.email = "Nhập email đúng định dạng, ví dụ ban@example.com.";
    if (values.password.length < 8) nextErrors.password = "Mật khẩu cần có ít nhất 8 ký tự.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setIsSubmitting(true);
    window.setTimeout(() => navigate("/"), 650);
  }

  return (
    <main className="auth-layout">
      <section className="auth-context" aria-labelledby="login-heading">
        <Link className="auth-brand" to="/">StudyMate</Link>
        <p className="eyebrow">Quay lại việc học</p>
        <h1 id="login-heading">Đăng nhập để tiếp tục phiên học</h1>
        <p className="page-intro">Mở lại tài liệu, câu hỏi và bài quiz bạn đang làm dở.</p>
      </section>
      <section className="auth-panel" aria-label="Biểu mẫu đăng nhập">
        <form className="auth-form" onSubmit={submit} noValidate>
          <label htmlFor="login-email">Email</label>
          <input id="login-email" name="email" type="email" autoComplete="email" value={values.email} onChange={updateField} aria-describedby={errors.email ? "login-email-error" : undefined} />
          {errors.email && <p className="field-error" id="login-email-error">{errors.email}</p>}
          <label htmlFor="login-password">Mật khẩu</label>
          <input id="login-password" name="password" type="password" autoComplete="current-password" value={values.password} onChange={updateField} aria-describedby={errors.password ? "login-password-error" : undefined} />
          {errors.password && <p className="field-error" id="login-password-error">{errors.password}</p>}
          <button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}</button>
          <p className="auth-switch">Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
        </form>
      </section>
    </main>
  );
}
