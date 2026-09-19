import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
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
          <Route path="documents" element={<PlaceholderPage title="Tai lieu" description="Quan ly tai lieu dang xu ly va san sang de hoc." />} />
          <Route path="study-sessions" element={<PlaceholderPage title="Phien hoc" description="Hoi dap theo tai lieu va kiem tra nguon trich dan." />} />
          <Route path="quizzes" element={<PlaceholderPage title="Quiz" description="On tap voi cau hoi duoc tao tu tai lieu mon hoc." />} />
          <Route path="profile" element={<PlaceholderPage title="Ho so" description="Quan ly tai khoan va tuy chon hoc tap." />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
