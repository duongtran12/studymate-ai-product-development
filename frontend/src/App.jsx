import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import CourseOverviewPage from "./pages/CourseOverviewPage";
import DocumentLibraryPage from "./pages/DocumentLibraryPage";
import StudySessionPage from "./pages/StudySessionPage";
import QuizPage from "./pages/QuizPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="courses" element={<DashboardPage />} />
          <Route path="courses/:courseId" element={<CourseOverviewPage />} />
          <Route path="documents" element={<DocumentLibraryPage />} />
          <Route path="study-sessions" element={<StudySessionPage />} />
          <Route path="quizzes" element={<QuizPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
