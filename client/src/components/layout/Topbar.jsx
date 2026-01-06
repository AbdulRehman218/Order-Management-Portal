import { UserCircle, Shield } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useLocation, useSearchParams } from "react-router-dom";
 

export default function Topbar({ onToggleSidebar }) {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const getWelcomeTitle = () => {
    const name = user?.name || "User";
    return `Welcome ${name}`;
  };

  const isAdminPage = () => {
    const adminPages = ["/users", "/register", "/settings"];
    return adminPages.includes(location.pathname);
  };

  return (
    <header className={`bg-primary text-white shadow-lg px-6 py-7 flex justify-between items-center rounded-b-3xl transition-colors duration-300 dark:bg-gray-800`}>
      <div className="flex items-center gap-3">
        <button
          className="md:hidden bg-white/20 text-white px-3 py-1 rounded-full cursor-pointer hover:bg-white/25"
          onClick={onToggleSidebar}
        >
          Menu
        </button>
        {user?.image ? (
          <img src={user.image} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-white/50" />
        ) : (
          <UserCircle className="w-8 h-8 text-white" />
        )}
        <h2 className="font-semibold text-lg">{getWelcomeTitle()}</h2>
        {isAdminPage() && (
          <span className="flex items-center gap-1 bg-white/20 text-white px-2 py-1 rounded-full text-xs font-bold">
            <Shield size={14} />
            ADMIN PAGE
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {location.pathname === "/orders" && (
          <select
            className="bg-white/90 text-primary px-2 py-1 rounded-full text-xs border border-white/30 shadow-sm"
            value={searchParams.get("range") || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                searchParams.set("range", value);
              } else {
                searchParams.delete("range");
              }
              setSearchParams(searchParams, { replace: true });
            }}
          >
            <option value="">Select Range</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="year">Last Year</option>
          </select>
        )}
      </div>
    </header>
  );
}
