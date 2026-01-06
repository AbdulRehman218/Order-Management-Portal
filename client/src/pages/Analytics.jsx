import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useSearchParams } from "react-router-dom";
import StatCard from "../components/dashboard/StatCard";
import ProfitChart from "../components/dashboard/ProfitChart";
import PieChart from "../components/dashboard/PieChart";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/ThemeContext";

export default function Analytics() {
  const [searchParams] = useSearchParams();
  const viewUser = searchParams.get("user") || undefined;
  const accountRef = searchParams.get("account") || undefined;
  const { user } = useAuth();
  const { currency } = useTheme();
  const [range, setRange] = useState("week");
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    netProfit: 0,
    avgROI: "0%"
  });
  const [chartData, setChartData] = useState([]);
  const [composition, setComposition] = useState({ profit: 0, cost: 0 });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const [summaryRes, chartRes] = await Promise.all([
        api.get("/reports", { params: { user: viewUser, account: accountRef, range } }),
        api.get("/charts/profit", { params: { user: viewUser, account: accountRef, range } })
      ]);

      const totalOrders = Number(summaryRes.data?.totalOrders ?? 0);
      const totalSales = Number(summaryRes.data?.totalSales ?? 0);
      const netProfit = Number(summaryRes.data?.netProfit ?? 0);
      const avgROI =
        typeof summaryRes.data?.avgROI === "string"
          ? summaryRes.data.avgROI
          : `${Number(summaryRes.data?.avgROI ?? 0).toFixed(2)}%`;

      setStats({ totalOrders, totalSales, netProfit, avgROI });
      setChartData(chartRes.data || []);
      const cost = Math.max(totalSales - netProfit, 0);
      setComposition({ profit: netProfit, cost });
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [viewUser, accountRef, range]);

  useEffect(() => {
    if (accountRef) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [accountRef, fetchAnalytics]);

  if (loading) {
    return <div className="text-center p-4">Loading analytics...</div>;
  }

  return (
    <>
      {user?.role !== "admin" && (
        <div className="text-center p-6 text-gray-600 bg-white rounded shadow">
          Analytics is only visible to administrators.
        </div>
      )}
      {user?.role === "admin" && !accountRef && (
        <div className="text-center p-6 text-gray-600 bg-white rounded shadow">
          Select an account from Dashboard to view Analytics.
        </div>
      )}
      {user?.role === "admin" && accountRef && (
        <>
          <div className="mb-4">
            <label className="block text-sm mb-1">Range</label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="border bg-gray-50 rounded p-2"
            >
              <option value="1d">Today</option>
             
              <option value="yesterday">Yesterday</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard color="blue" title="Total Orders" value={stats.totalOrders.toString()} />
            <StatCard
              color="cyan"
              title="Total Sales"
              value={`${currency}${Number.isFinite(stats.totalSales) ? stats.totalSales.toFixed(2) : "0.00"}`}
            />
            <StatCard
              color="green"
              title="Net Profit"
              value={`${currency}${Number.isFinite(stats.netProfit) ? stats.netProfit.toFixed(2) : "0.00"}`}
            />
            <StatCard color="indigo" title="Avg ROI" value={stats.avgROI} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Profit Trend</h2>
                <span className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 font-semibold">Daily</span>
              </div>
              <ProfitChart data={chartData} />
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Revenue Composition</h2>
                <span className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 font-semibold">Current Range</span>
              </div>
              <PieChart
                labels={["Profit", "Cost"]}
                values={[composition.profit, composition.cost]}
                colors={["#3b82f6", "#f97316"]}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
