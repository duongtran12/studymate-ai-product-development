import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: "", password: "", confirmPassword: "" });
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
    if (values.confirmPassword !== values.password) nextErrors.confirmPassword = "Mật khẩu xác nhận chưa khớp.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setIsSubmitting(true);
    window.setTimeout(() => navigate("/"), 650);
  }

  return (
    <main className="auth-layout">
      <section className="auth-context" aria-labelledby="register-heading">
        <Link className="auth-brand" to="/">StudyMate</Link>
        <p className="eyebrow">Bắt đầu có kiểm chứng</p>
        <h1 id="register-heading">Tạo không gian học từ tài liệu của bạn</h1>
        <p className="page-intro">Tài khoản mẫu chỉ mô phỏng luồng giao diện và chưa gửi dữ liệu tới máy chủ.</p>
      </section>
      <section className="auth-panel" aria-label="Biểu mẫu đăng ký">
        <form className="auth-form" onSubmit={submit} noValidate>
          <label htmlFor="register-email">Email</label>
          <input id="register-email" name="email" type="email" autoComplete="email" value={values.email} onChange={updateField} />
          {errors.email && <p className="field-error">{errors.email}</p>}
          <label htmlFor="register-password">Mật khẩu</label>
          <input id="register-password" name="password" type="password" autoComplete="new-password" value={values.password} onChange={updateField} />
          {errors.password && <p className="field-error">{errors.password}</p>}
          <label htmlFor="register-confirm-password">Xác nhận mật khẩu</label>
          <input id="register-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" value={values.confirmPassword} onChange={updateField} />
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
          <button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký"}</button>
          <p className="auth-switch">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
        </form>
      </section>
    </main>
  );
}
