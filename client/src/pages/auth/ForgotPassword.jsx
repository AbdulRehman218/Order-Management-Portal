import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { useTheme } from "../../context/ThemeContext";
import { Mail, Key, Lock, CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  const navigate = useNavigate();
  const { primaryColor } = useTheme();

  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setCode(""); // Clear previous code input if any
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot", { email });
      setStep(2);
      setTimeLeft(60); // 1 minute
      setSuccess("Verification code sent to your email.");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/verify-code", { email, code });
      setStep(3);
      setSuccess("Code verified successfully.");
    } catch (e) {
      setError(e.response?.data?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/reset", { email, code, password });
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: primaryColor }}>
      <div className="absolute inset-0 z-0 opacity-20" style={{ background: `radial-gradient(circle at center, #ffffff, transparent 70%)` }} />
      
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative z-10 mx-4">
        <Link to="/login" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to Login
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 border border-gray-100">
            {step === 1 && <Mail size={32} style={{ color: primaryColor }} />}
            {step === 2 && <Key size={32} style={{ color: primaryColor }} />}
            {step === 3 && <Lock size={32} style={{ color: primaryColor }} />}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {step === 1 && "Forgot Password?"}
            {step === 2 && "Verification Code"}
            {step === 3 && "Set New Password"}
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            {step === 1 && "Enter your email address to receive a verification code."}
            {step === 2 && `Enter the 6-digit code sent to ${email}`}
            {step === 3 && "Create a new strong password for your account."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle size={16} /> {success}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendCode} className="space-y-5">
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
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3.5 rounded-xl font-bold shadow-lg transition-all hover:brightness-105 disabled:opacity-50 active:scale-[0.98] cursor-pointer"
              style={{ backgroundColor: primaryColor, boxShadow: `0 10px 25px -5px ${primaryColor}40` }}
            >
              {loading ? "Sending Code..." : "Send Reset Code"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-5">
            <div className="text-center">
              <span className={`text-sm font-bold ${timeLeft < 30 ? "text-red-500" : "text-gray-600"}`}>
                Code expires in: {formatTime(timeLeft)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Code</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all text-center tracking-widest font-mono text-lg"
                  style={{ '--tw-ring-color': primaryColor, borderColor: 'transparent' }}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3.5 rounded-xl font-bold shadow-lg transition-all hover:brightness-105 disabled:opacity-50 active:scale-[0.98] cursor-pointer"
              style={{ backgroundColor: primaryColor, boxShadow: `0 10px 25px -5px ${primaryColor}40` }}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
            <div className="text-center mt-4">
               <button 
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
              >
                Wrong email? Try again
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                  style={{ '--tw-ring-color': primaryColor, borderColor: 'transparent' }}
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3.5 rounded-xl font-bold shadow-lg transition-all hover:brightness-105 disabled:opacity-50 active:scale-[0.98] cursor-pointer"
              style={{ backgroundColor: primaryColor, boxShadow: `0 10px 25px -5px ${primaryColor}40` }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
