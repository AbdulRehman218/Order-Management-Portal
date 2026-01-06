import { useState } from "react";
import api from "../services/api";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Download, FileText } from "lucide-react";

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [queryLoading, setQueryLoading] = useState(false);
  const [range, setRange] = useState("week");
  const [searchParams] = useSearchParams();
  const accountRef = searchParams.get("account") || undefined;
  const { primaryColor } = useTheme();

  const handleDownload = async (type) => {
    const isOrder = type === "orders";
    if (isOrder) setLoading(true);
    else setQueryLoading(true);

    try {
      const response = await api.get(`/reports/${type}`, {
        responseType: "blob",
        params: { account: accountRef, range }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}-${new Date().toISOString()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(`Failed to download ${type} report:`, error);
      alert(`Failed to download ${type} report`);
    } finally {
      if (isOrder) setLoading(false);
      else setQueryLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <FileText style={{ color: primaryColor }} /> Reports
      </h2>
      
      {accountRef ? (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <p className="mb-4 text-gray-600 font-medium">
              Download Excel reports for the selected account.
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date Range</label>
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="w-full md:w-64 border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              >
                <option value="1d">Last 24 Hours</option>
                <option value="2d">Last 48 Hours</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last 365 Days</option>
              </select>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={() => handleDownload("orders")}
                disabled={loading}
                className="flex items-center justify-center gap-2 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:brightness-95 disabled:opacity-50 transition-all active:scale-95"
                style={{ backgroundColor: primaryColor }}
              >
                <Download size={20} />
                {loading ? "Downloading..." : "Download Orders Report"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No Account Selected</h3>
          <p className="text-gray-500 mt-2">
            Please select an account from the Dashboard to access reports.
          </p>
        </div>
      )}
    </div>
  );
}
