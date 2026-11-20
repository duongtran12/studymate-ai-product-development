import { useEffect, useState } from "react";
import { getUserErrorMessage } from "../api/apiError";
import { getProfile, updateProfile } from "../api/profileApi";
import { ErrorState, LoadingState } from "../components/ContentState";
import { useAsyncRequest } from "../hooks/useAsyncRequest";

export default function ProfilePage() {
  const { data: profile, setData: setProfile, loading, error, run: loadProfile, retry, cancel } = useAsyncRequest(getProfile, { initialData: null, initialLoading: true });
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");

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

  if (loading && !profile) return <section className="page-section"><LoadingState message="Đang tải hồ sơ…" /></section>;
  if (error && !profile) return <section className="page-section"><ErrorState message={error} onRetry={retry} /></section>;

  return <section className="page-section profile-page" aria-labelledby="profile-title"><p className="eyebrow">Tài khoản</p><h1 id="profile-title">Hồ sơ cá nhân</h1><p className="page-intro">Cập nhật tên hiển thị để StudyMate cá nhân hóa không gian học tập của bạn.</p><form className="profile-card" onSubmit={save}>{saveError && <p className="form-error" role="alert">{saveError}</p>}{notice && <p className="request-message request-success" role="status">{notice}</p>}<label><span>Email đăng nhập</span><input disabled value={profile?.email ?? ""} /></label><label><span>Tên hiển thị</span><input maxLength="120" required value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label><p className="profile-meta">Tham gia từ {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("vi-VN") : "—"}</p><button className="primary-button" disabled={saving} type="submit">{saving ? "Đang lưu…" : "Lưu thay đổi"}</button></form></section>;
}
