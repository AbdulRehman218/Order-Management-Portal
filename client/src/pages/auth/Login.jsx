import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useTheme } from "../../context/ThemeContext";
import { Mail, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { primaryColor } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate("/");
    } else {
      setError(result.message || "Invalid credentials");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: `linear-gradient(to bottom, ${primaryColor}, ${primaryColor}dd)` }}>
      <div className="absolute -left-24 -bottom-24 w-64 h-64 bg-white/20 rounded-full blur-xl opacity-60" />
      <div className="absolute -right-24 -top-24 w-64 h-64 bg-white/20 rounded-full blur-xl opacity-60" />
      
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 overflow-hidden mx-4">
        <div className="text-white p-12 relative flex flex-col items-center justify-center text-center" style={{ backgroundColor: primaryColor }}>
          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold tracking-tight mb-4">WELCOME BACK!</h1>
            <p className="text-lg opacity-90 font-light">
              Access your dashboard, manage orders, and stay on top of your business.
            </p>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
        </div>

        <form onSubmit={handleSubmit} className="p-10 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign in</h2>
            <p className="text-gray-500">Please enter your details to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                  style={{ '--tw-ring-color': primaryColor, borderColor: 'transparent' }} 
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                  style={{ '--tw-ring-color': primaryColor, borderColor: 'transparent' }}
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-800">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" style={{ accentColor: primaryColor }} />
                Remember me
              </label>
            <button 
              type="button" 
              className="font-semibold hover:underline cursor-pointer"
              style={{ color: primaryColor }}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:brightness-105 disabled:opacity-50 transition-all active:scale-[0.98] mt-4 cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? "Logging in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
