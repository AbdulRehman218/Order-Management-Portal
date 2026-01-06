import { createContext, useState } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (!token || !savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });
  const [loading] = useState(false);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      
      return { success: true };
    } catch (ERROR) {
      return {
        success: false,
        message: ERROR.response?.data?.message || "Login failed"
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const register = async (name, email, password, role, image) => {
    try {
      await api.post("/auth/register", { name, email, password, role, image });
      // Don't auto-login on register as it's an admin function
      return { success: true };
    } catch (ERROR) {
      return { 
        success: false, 
        message: ERROR.response?.data?.message || "Registration failed" 
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
