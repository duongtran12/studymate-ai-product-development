import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import CourseOverviewPage from "./pages/CourseOverviewPage";
import DashboardPage from "./pages/DashboardPage";
import DocumentLibraryPage from "./pages/DocumentLibraryPage";
import StudySessionPage from "./pages/StudySessionPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import QuizPage from "./pages/QuizPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="courses" element={<DashboardPage />} />
          <Route path="courses/:courseId" element={<CourseOverviewPage />} />
          <Route path="documents" element={<DocumentLibraryPage />} />
          <Route path="courses/:courseId/documents" element={<DocumentLibraryPage />} />
          <Route path="study-sessions" element={<StudySessionPage />} />
          <Route path="study/:sessionId" element={<StudySessionPage />} />
          <Route path="quizzes" element={<QuizPage />} />
          <Route path="quizzes/new" element={<QuizPage />} />
          <Route path="profile" element={<PlaceholderPage title="Ho so" description="Quan ly tai khoan va tuy chon hoc tap." />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
