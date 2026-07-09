import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Home from "./pages/Home";
import AuthPage from "./pages/auth/AuthPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import useCurrentUser from "./hooks/useCurrentUser";

function AuthRedirect() {
  const { userData } = useSelector((state) => state.user);
  if (userData) return <Navigate to="/dashboard" replace />;
  return <AuthPage />;
}

function App() {
  useCurrentUser();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthRedirect />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
