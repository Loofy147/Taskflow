import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import { PasswordResetPage } from "./pages/PasswordResetPage";
import { DashboardPage } from "./pages/DashboardPage";
import { MainLayout } from "./layouts/MainLayout";
import { ProtectedRoute } from "./router/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/reset-password" element={<PasswordResetPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
