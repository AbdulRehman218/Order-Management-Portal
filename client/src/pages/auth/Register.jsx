import { useState } from "react";
import { Shield, UserPlus, Upload, User, Mail, Lock, Check } from "lucide-react";
import { useAuth } from "../../context/useAuth";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [image, setImage] = useState("");
  const [imageSourceType, setImageSourceType] = useState("upload");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const result = await register(name, email, password, role, image);
    
    if (result.success) {
      setSuccess("User registered successfully!");
      setName("");
      setEmail("");
      setPassword("");
      setRole("user");
      setImage("");
      setImageSourceType("upload");
    } else {
      setError(result.message || "Registration failed");
    }
    
    setLoading(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Admin Notice */}
      <div className="bg-primary/10 border-l-4 border-primary p-4 rounded shadow-sm flex items-start gap-3">
        <Shield className="text-primary mt-1" size={20} />
        <div>
          <h3 className="font-bold text-primary mb-1">Admin Only Page</h3>
          <p className="text-gray-700 text-sm">
            You are viewing an administrator-only page. Only users with admin role can create new users.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-primary p-6 text-white flex items-center justify-between">
          <div>
             <h2 className="text-2xl font-bold flex items-center gap-2">
               <UserPlus size={28} /> Add New User
             </h2>
             <p className="opacity-90 mt-1 text-sm">Create a new account for your team member</p>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <Shield size={32} />
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
              <Check size={20} /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      placeholder="e.g. john@example.com"
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
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      placeholder="Set a secure password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-5">
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                      {["user", "admin"].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`flex-1 py-2 text-sm font-medium rounded-md capitalize transition-all ${
                            role === r 
                              ? "bg-white text-primary shadow-sm" 
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Image</label>
                    
                    <div className="flex gap-4 mb-3">
                      <label className={`flex-1 cursor-pointer border-2 rounded-lg p-3 flex items-center justify-center gap-2 transition-all ${imageSourceType === "upload" ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500"}`}>
                        <input type="radio" name="imgSrc" checked={imageSourceType === "upload"} onChange={() => setImageSourceType("upload")} className="hidden" />
                        <Upload size={18} /> Upload
                      </label>
                      <label className={`flex-1 cursor-pointer border-2 rounded-lg p-3 flex items-center justify-center gap-2 transition-all ${imageSourceType === "url" ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500"}`}>
                        <input type="radio" name="imgSrc" checked={imageSourceType === "url"} onChange={() => setImageSourceType("url")} className="hidden" />
                        <span>URL Link</span>
                      </label>
                    </div>

                    {imageSourceType === "upload" ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                        <input type="file" onChange={handleFileUpload} accept="image/*" className="w-full" />
                        <p className="text-xs text-gray-500 mt-2">Supports JPG, PNG, GIF</p>
                      </div>
                    ) : (
                      <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                        placeholder="https://example.com/image.png"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                      />
                    )}

                    {image && (
                      <div className="mt-4 flex justify-center">
                        <img src={image} alt="Preview" className="w-20 h-20 rounded-full object-cover border-4 border-gray-100 shadow-sm" />
                      </div>
                    )}
                 </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:brightness-95 disabled:opacity-50 shadow-lg shadow-primary/30 transition-all active:scale-[0.99]"
              >
                {loading ? "Creating User..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
