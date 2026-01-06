import { LayoutDashboard, ShoppingCart, Trash2, Users, LogOut, MessageSquare, FileText, Shield, BarChart3, Settings, Bot } from "lucide-react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useState, useEffect } from "react";
import api from "../../services/api";

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const viewUser = searchParams.get("user") || "";
  const accountId = searchParams.get("account") || "";
  const [accountInfo, setAccountInfo] = useState(null);

  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (!accountId) {
        setAccountInfo(null);
        return;
      }
      try {
        if (user?.role === "admin" && viewUser) {
          const res = await api.get("/users");
          const targetUser = (res.data || []).find(u => u._id === viewUser);
          const acc = targetUser?.accounts?.find(a => a._id === accountId);
          setAccountInfo(acc || null);
        } else {
           // For non-admin or admin viewing own (if applicable), try to find in current user context or fetch
           // Since user object in context might not be full, let's try to fetch if not found
           if (user?.accounts) {
             const acc = user.accounts.find(a => a._id === accountId);
             if (acc) {
               setAccountInfo(acc);
               return;
             }
           }
           // Fallback if needed, but for now let's rely on what we have or just skip if not found
           setAccountInfo(null);
        }
      } catch (e) {
        console.error("Failed to fetch account info for sidebar", e);
      }
    };
    fetchAccountInfo();
  }, [accountId, viewUser, user]);

  const qs = (() => {
    const params = new URLSearchParams();
    if (viewUser) params.set("user", viewUser);
    if (accountId) params.set("account", accountId);
    const str = params.toString();
    return str ? `?${str}` : "";
  })();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  //

  return (
    <aside className="w-64 bg-primary text-white p-4 h-full overflow-y-auto no-scrollbar transition-colors duration-300">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Order Portal</h1>
        {accountInfo && (
          <div className="mt-4 flex items-center gap-3 bg-white/10 p-2 rounded-lg">
            {accountInfo.image ? (
              <img src={accountInfo.image} className="w-10 h-10 rounded-full object-cover border border-white/20" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                {accountInfo.accountName?.charAt(0)?.toUpperCase() || "A"}
              </div>
            )}
            <div className="overflow-hidden text-white">
              <div className="font-semibold text-sm truncate">{accountInfo.accountName}</div>
              <div className="text-xs opacity-80 truncate">{accountInfo.platform}</div>
            </div>
          </div>
        )}
        {user?.role === "admin" && (
          <div className="mt-2 flex items-center gap-1 text-xs bg-white/20 text-white px-2 py-1 rounded">
            <Shield size={12} />
            <span className="font-semibold">Administrator</span>
          </div>
        )}
      </div>

      <nav className="space-y-3">
        
        <NavLink 
          className={({ isActive }) => 
            `flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${isActive ? "bg-white text-primary" : "hover:bg-white/10"}`
          }
          to={qs ? `/${qs}` : "/"}
        > 
          <LayoutDashboard /> Dashboard
        </NavLink>
        {user?.role === "admin" && (
          <NavLink 
            className={({ isActive }) => 
              `flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${isActive ? "bg-white text-primary" : "hover:bg-white/10"}`
            }
            to={qs ? `/analytics${qs}` : "/analytics"}
          > 
            <BarChart3 /> Analytics
          </NavLink>
        )}
        <NavLink 
          className={({ isActive }) => 
            `flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${isActive ? "bg-white text-primary" : "hover:bg-white/10"}`
          }
          to={qs ? `/orders${qs}` : "/orders"}
        > 
          <ShoppingCart /> Orders
        </NavLink>
        <NavLink 
          className={({ isActive }) => 
            `flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${isActive ? "bg-white text-primary" : "hover:bg-white/10"}`
          }
          to={qs ? `/queries${qs}` : "/queries"}
        >
          <MessageSquare /> Queries
        </NavLink>
        <NavLink 
          className={({ isActive }) => 
            `flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${isActive ? "bg-white text-primary" : "hover:bg-white/10"}`
          }
          to={qs ? `/ai-assistant${qs}` : "/ai-assistant"}
        > 
          <Bot /> AI Assistant
        </NavLink>
        <NavLink 
          className={({ isActive }) => 
            `flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${isActive ? "bg-white text-primary" : "hover:bg-white/10"}`
          }
          to={qs ? `/reports${qs}` : "/reports"}
        >
          <FileText /> Reports
        </NavLink>
        <NavLink 
          className={({ isActive }) => 
            `flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${isActive ? "bg-white text-primary" : "hover:bg-white/10"}`
          }
          to={qs ? `/trash${qs}` : "/trash"}
        > 
          <Trash2 /> Trash
        </NavLink>
        {user?.role === "admin" && (
          <>
            <div className="mt-4 mb-2 px-3 text-xs font-semibold text_white/80 uppercase">
              Admin Section
            </div>
            <NavLink 
              className={({ isActive }) => 
                `flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${isActive ? "bg-white text-primary" : "hover:bg-white/10"}`
              }
              to={qs ? `/users${qs}` : "/users"}
            > 
              <Users /> Users
            </NavLink>
            <NavLink 
              className={({ isActive }) => 
                `flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${isActive ? "bg-white text-primary" : "hover:bg-white/10"}`
              }
              to={qs ? `/register${qs}` : "/register"}
            > 
              <Shield size={18} /> Add User
            </NavLink>
            <NavLink 
              className={({ isActive }) => 
                `flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${isActive ? "bg-white text-primary" : "hover:bg-white/10"}`
              }
              to={qs ? `/settings${qs}` : "/settings"}
            > 
              <Settings size={18} /> Settings
            </NavLink>
          </>
        )}
        

        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-white/10 w-full text-left text-red-300 hover:text-red-200 mt-4"
        >
          <LogOut /> Logout
        </button>
      </nav>
    </aside>
  );
}
