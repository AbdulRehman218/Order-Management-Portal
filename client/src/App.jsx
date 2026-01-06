import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Trash from "./pages/Trash";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Queries from "./pages/Queries";
import Analytics from "./pages/Analytics";
import AiAssistant from "./pages/AiAssistant";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import MainLayout from "./components/layout/MainLayout";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/trash" element={<Trash />} />
                <Route path="/queries" element={<Queries />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/ai-assistant" element={<AiAssistant />} />
                
                <Route element={<AdminRoute />}>
                  <Route path="/users" element={<Users />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
