import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserErrorMessage } from "../api/apiError";
import { clearSessionToken } from "../api/apiClient";
import { changePassword, getProfile, updateProfile } from "../api/profileApi";
import { ErrorState, LoadingState } from "../components/ContentState";
import { useAsyncRequest } from "../hooks/useAsyncRequest";

export default function ProfilePage() {
	const navigate = useNavigate();
  const { data: profile, setData: setProfile, loading, error, run: loadProfile, retry, cancel } = useAsyncRequest(getProfile, { initialData: null, initialLoading: true });
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmation: "" });
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => { loadProfile(); return cancel; }, [cancel, loadProfile]);
  useEffect(() => { if (profile) setDisplayName(profile.displayName); }, [profile]);

  async function save(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setSaveError("");
    setNotice("");
    try {
      const updated = await updateProfile({ displayName });
      setProfile(updated);
      setNotice("Đã cập nhật hồ sơ.");
    } catch (requestError) {
      setSaveError(getUserErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(event) {
    event.preventDefault();
    if (changingPassword) return;
    if (passwords.newPassword !== passwords.confirmation) {
      setPasswordError("Xác nhận mật khẩu mới chưa khớp.");
      return;
    }
    setChangingPassword(true);
    setPasswordError("");
    try {
      await changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      clearSessionToken();
      navigate("/login", { replace: true, state: { notice: "Đổi mật khẩu thành công. Hãy đăng nhập lại." } });
    } catch (requestError) {
      setPasswordError(getUserErrorMessage(requestError));
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading && !profile) return <section className="page-section"><LoadingState message="Đang tải hồ sơ…" /></section>;
  if (error && !profile) return <section className="page-section"><ErrorState message={error} onRetry={retry} /></section>;

  return <section className="page-section profile-page" aria-labelledby="profile-title"><p className="eyebrow">Tài khoản</p><h1 id="profile-title">Hồ sơ cá nhân</h1><p className="page-intro">Cập nhật tên hiển thị và giữ an toàn cho tài khoản học tập của bạn.</p><form className="profile-card" onSubmit={save}>{saveError && <p className="form-error" role="alert">{saveError}</p>}{notice && <p className="request-message request-success" role="status">{notice}</p>}<label><span>Email đăng nhập</span><input disabled value={profile?.email ?? ""} /></label><label><span>Tên hiển thị</span><input maxLength="120" required value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label><p className="profile-meta">Tham gia từ {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("vi-VN") : "—"}</p><button className="primary-button" disabled={saving} type="submit">{saving ? "Đang lưu…" : "Lưu thay đổi"}</button></form><form className="profile-card password-card" onSubmit={savePassword}><div><h2>Đổi mật khẩu</h2><p className="profile-meta">Sau khi đổi mật khẩu, bạn sẽ cần đăng nhập lại trên các thiết bị để bảo vệ tài khoản.</p></div>{passwordError && <p className="form-error" role="alert">{passwordError}</p>}<label><span>Mật khẩu hiện tại</span><input autoComplete="current-password" required type="password" value={passwords.currentPassword} onChange={(event) => setPasswords((current) => ({ ...current, currentPassword: event.target.value }))} /></label><label><span>Mật khẩu mới</span><input autoComplete="new-password" minLength="8" required type="password" value={passwords.newPassword} onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))} /></label><label><span>Xác nhận mật khẩu mới</span><input autoComplete="new-password" minLength="8" required type="password" value={passwords.confirmation} onChange={(event) => setPasswords((current) => ({ ...current, confirmation: event.target.value }))} /></label><button className="secondary-button" disabled={changingPassword} type="submit">{changingPassword ? "Đang đổi…" : "Đổi mật khẩu"}</button></form></section>;
}
