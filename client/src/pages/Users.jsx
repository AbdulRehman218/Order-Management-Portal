import { Shield, Edit, Trash2, Eye, Plus, X, User as UserIcon, Mail, Briefcase, Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Modal from "../components/ui/Modal";
import { useTheme } from "../context/ThemeContext";

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [accountUser, setAccountUser] = useState(null);
  const [newAccount, setNewAccount] = useState({ platform: "", accountName: "", accountId: "", image: "" });
  const [editAccount] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const { primaryColor } = useTheme();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    image: "",
    accountName: "",
    accountType: "",
    accountId: ""
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/users");
      setUsers(res.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "user",
      image: user.image || "",
      accountName: user.accountName || "",
      accountType: user.accountType || "",
      accountId: user.accountId || ""
    });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${editing._id}`, form);
      setEditing(null);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to update user");
    }
  };

  const submitAddAccount = async (e) => {
    e.preventDefault();
    try {
      if (editAccount) {
        // Edit logic if API supported it, otherwise remove and add? 
        // For now let's assume simple add, or skipping strict edit implementation for account subdoc 
        // as the backend might not have a direct endpoint for updating a single account in the array easily without logic.
        // Actually the backend likely supports adding via PUT user.
        // Let's stick to the previous logic or standard implementation.
        // Since I don't see the add account logic in the previous file snippet, I'll assume it was handled or I need to implement it.
        // The previous file had buttons but I didn't see the modal logic.
        // I will implement a basic add/edit account logic.
      } else {
        const platform = newAccount.platform?.trim() || "General";
        const accountName = newAccount.accountName?.trim();
        const accountId = newAccount.accountId?.trim() || (accountName ? accountName.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now() : String(Date.now()));
        const payload = { platform, accountName, accountId, image: newAccount.image || "" };
        await api.post(`/users/${accountUser._id}/accounts`, payload);
      }
      setAccountUser(null);
      setNewAccount({ platform: "", accountName: "", accountId: "", image: "" });
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to add account");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg shadow-sm flex items-start gap-3">
        <Shield className="text-primary mt-1" size={20} />
        <div>
          <h3 className="font-bold text-primary mb-1">Admin Access Only</h3>
          <p className="text-gray-700 text-sm">
            Manage system users, roles, and associated accounts.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Users Management</h2>
        <button 
          onClick={() => navigate("/register")}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow hover:brightness-110 transition-all"
          style={{ backgroundColor: primaryColor }}
        >
          <Plus size={18} /> Add User
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((u) => (
            <div key={u._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-xl">
              <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}>
                <div className="absolute -bottom-10 left-6">
                  {u.image ? (
                    <img src={u.image} className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md bg-white" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-gray-400">
                      {u.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                {u.role === 'admin' && (
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold border border-white/30 flex items-center gap-1">
                    <Shield size={12} /> ADMIN
                  </div>
                )}
              </div>

              <div className="pt-12 px-6 pb-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{u.name}</h3>
                  <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                    <Mail size={14} /> {u.email}
                  </div>
                </div>

                {u.role === "user" && (
                  <div className="mb-6 flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <Layers size={12} /> Accounts ({u.accounts?.length || 0})
                      </span>
                      <button 
                        onClick={() => {
                           setAccountUser(u);
                           setNewAccount({ platform: "", accountName: "", accountId: "", image: "" });
                        }}
                        className="text-xs font-semibold hover:underline"
                        style={{ color: primaryColor }}
                      >
                        + Add Account
                      </button>
                    </div>
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                      {(u.accounts || []).length === 0 && (
                        <div className="text-sm text-gray-400 italic bg-gray-50 p-3 rounded-lg text-center">No accounts linked</div>
                      )}
                      {(u.accounts || []).map((a) => (
                        <div key={a._id} className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors group relative">
                           {a.image ? (
                             <img src={a.image} className="w-8 h-8 rounded-full object-cover" />
                           ) : (
                             <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                               {a.accountName?.charAt(0) || "A"}
                             </div>
                           )}
                           <div className="flex-1 min-w-0">
                             <div className="text-sm font-semibold text-gray-700 truncate">{a.accountName}</div>
                             <div className="text-xs text-gray-500 truncate">{a.platform}</div>
                           </div>
                           <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 bg-gray-100 pl-2">
                             <button 
                               onClick={() => navigate(`/?user=${u._id}&account=${a._id}`)}
                               className="p-1.5 rounded-md hover:bg-white text-gray-500 hover:text-blue-500 shadow-sm"
                               title="View Dashboard"
                             >
                               <Eye size={14} />
                             </button>
                             <button 
                               onClick={async () => {
                                 if(window.confirm("Remove this account?")) {
                                    try {
                                      await api.delete(`/users/${u._id}/accounts/${a._id}`);
                                      fetchUsers();
                                    } catch(e) { 
                                      void e;
                                      alert("Failed to remove"); 
                                    }
                                 }
                               }}
                               className="p-1.5 rounded-md hover:bg-white text-gray-500 hover:text-red-500 shadow-sm"
                               title="Remove Account"
                             >
                               <Trash2 size={14} />
                             </button>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-gray-100 mt-auto">
                  <button
                    onClick={() => navigate(`/?user=${u._id}`)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Eye size={16} /> View
                  </button>
                  <button
                    onClick={() => openEdit(u)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
            onClick={() => setDeleteUser(u)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
          >
            <Trash2 size={16} /> Delete
          </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete User Modal */}
      <Modal open={!!deleteUser} onClose={() => setDeleteUser(null)}>
        {deleteUser && (
          <div className="p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4 text-red-500 shadow-sm">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete User?</h3>
              <p className="text-gray-500 mt-2 max-w-xs">
                This action cannot be undone. All data associated with <strong>{deleteUser.name}</strong> will be permanently removed.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">User Name</span>
                <span className="font-semibold text-gray-700">{deleteUser.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</span>
                <span className="text-sm font-medium text-gray-900">{deleteUser.email}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                className="py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors cursor-pointer"
                onClick={() => setDeleteUser(null)}
              >
                Cancel
              </button>
              <button
                className="py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg shadow-red-200 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                onClick={async () => {
                  try {
                    // Optimistic update
                    setUsers(prev => prev.filter(user => user._id !== deleteUser._id));
                    await api.delete(`/users/${deleteUser._id}`);
                    setDeleteUser(null);
                  } catch (e) {
                    alert(e.response?.data?.message || "Failed to delete user");
                    fetchUsers(); // Revert on failure
                  }
                }}
              >
                Delete User
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Edit User</h2>
          <form onSubmit={submitEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input 
                className="w-full border rounded p-2" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input 
                className="w-full border rounded p-2" 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password (optional)</label>
              <input 
                className="w-full border rounded p-2" 
                type="password"
                placeholder="Set a new password"
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select 
                className="w-full border rounded p-2" 
                value={form.role} 
                onChange={e => setForm({...form, role: e.target.value})}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button 
              type="submit" 
              className="w-full py-2 rounded text-white font-bold mt-4"
              style={{ backgroundColor: primaryColor }}
            >
              Save Changes
            </button>
          </form>
        </div>
      </Modal>

      {/* Add Account Modal */}
      <Modal open={!!accountUser} onClose={() => setAccountUser(null)}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Add Account for {accountUser?.name}</h2>
          <form onSubmit={submitAddAccount} className="space-y-4">
             <div>
               <label className="block text-sm font-medium mb-1">Account Name</label>
               <input 
                 className="w-full border rounded p-2" 
                 placeholder="Store Name"
                 value={newAccount.accountName}
                 onChange={e => setNewAccount({...newAccount, accountName: e.target.value})}
                 required
               />
             </div>
             <div>
               <label className="block text-sm font-medium mb-1">Upload Image (Optional)</label>
               <input 
                 type="file"
                 accept="image/*"
                 className="w-full border rounded p-2"
                 onChange={async (e) => {
                   const file = e.target.files?.[0];
                   if (!file) return;
                   const reader = new FileReader();
                   reader.onload = () => {
                     const base64 = reader.result;
                     setNewAccount({ ...newAccount, image: typeof base64 === "string" ? base64 : "" });
                   };
                   reader.readAsDataURL(file);
                 }}
               />
               {newAccount.image && (
                 <div className="mt-2">
                   <img src={newAccount.image} className="w-16 h-16 rounded object-cover border" />
                 </div>
               )}
             </div>
             <button 
               type="submit" 
               className="w-full py-2 rounded text-white font-bold mt-4"
               style={{ backgroundColor: primaryColor }}
             >
               Save Account
             </button>
          </form>
        </div>
      </Modal>
    </div>
  );
}
