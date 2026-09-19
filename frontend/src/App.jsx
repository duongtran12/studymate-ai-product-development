import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import DocumentLibraryPage from "./pages/DocumentLibraryPage";
import StudySessionPage from "./pages/StudySessionPage";
import NotFoundPage from "./pages/NotFoundPage";
import PlaceholderPage from "./pages/PlaceholderPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="courses" element={<PlaceholderPage title="Mon hoc" description="Tao va mo khong gian hoc theo tung mon." />} />
          <Route path="documents" element={<DocumentLibraryPage />} />
          <Route path="study-sessions" element={<StudySessionPage />} />
          <Route path="quizzes" element={<PlaceholderPage title="Quiz" description="On tap voi cau hoi duoc tao tu tai lieu mon hoc." />} />
          <Route path="profile" element={<PlaceholderPage title="Ho so" description="Quan ly tai khoan va tuy chon hoc tap." />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
