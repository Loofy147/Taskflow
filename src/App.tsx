import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import { PasswordResetPage } from "./pages/PasswordResetPage";
import { DashboardPage } from "./pages/DashboardPage";
import { MainLayout } from "./layouts/MainLayout";
import { ProtectedRoute } from "./router/ProtectedRoute";
import { CreateTeamPage } from "./pages/CreateTeamPage";
import { TeamPage } from "./pages/TeamPage";
import { CreateProjectPage } from "./pages/CreateProjectPage";
import { ProjectPage } from "./pages/ProjectPage";
import { SearchPage } from "./pages/SearchPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/reset-password" element={<PasswordResetPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/create-team" element={<CreateTeamPage />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/create-project" element={<CreateProjectPage />} />
            <Route path="/project/:projectId" element={<ProjectPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
