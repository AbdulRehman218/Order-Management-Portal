import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { ChevronRight, CreditCard, Layers } from "lucide-react";

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const viewUser = searchParams.get("user") || undefined;
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      if (currentUser?.role === "admin" && viewUser) {
        const usersRes = await api.get("/users");
        const target = (usersRes.data || []).find((u) => u._id === viewUser);
        setUserInfo(target || null);
      } else {
        setUserInfo(currentUser || null);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, viewUser]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return <div className="text-center p-4">Loading dashboard...</div>;
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow border border-gray-100 transition-colors duration-300">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Accounts</h3>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(userInfo?.accounts) && userInfo.accounts.length > 0 ? (
              userInfo.accounts.map((a) => (
                <button
                  key={a._id}
                  className="group relative flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer overflow-hidden"
                  onClick={() => {
                    const userId = (currentUser?.role === "admin" && viewUser) ? viewUser : (currentUser?._id || "");
                    if (!userId) return;
                    navigate(`/?user=${userId}&account=${a._id}`);
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="relative">
                      {a.image ? (
                        <img src={a.image} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm border border-gray-100 group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-primary shadow-inner group-hover:scale-105 transition-transform">
                          <CreditCard size={24} className="opacity-80" />
                        </div>
                      )}
                      {/* Status indicator dot (mocked as green for active) */}
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    
                      <div className="text-left">
                        <div className="text-xs font-bold tracking-wider text-primary uppercase mb-0.5 flex items-center gap-1">
                          <Layers size={10} />
                          {a.platform || "Platform"}
                        </div>
                        <h4 className="text-lg font-bold text-gray-800 leading-tight group-hover:text-primary transition-colors">
                          {a.accountName}
                        </h4>
                      </div>
                  </div>

                  <div className="relative z-10 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                    <ChevronRight size={18} className="ml-0.5" />
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                  <Layers size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No Accounts Found</h3>
                <p className="text-gray-500 mt-1 max-w-sm mx-auto">This user hasn't connected any accounts yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
