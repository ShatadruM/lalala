import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Layout from "../components/Layout";

export default function VendorStats() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalCustomers: 0,
    chartData: [],
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(`${apiUrl}/api/vendor/stats`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) {
      console.error("Stats Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to format date nicely (e.g. "2:30 PM")
  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatToIST = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      hour12: true,
    }).format(date);
  };

  return (
    <Layout>
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-black text-white mb-6 drop-shadow-md tracking-wide">
          Sales Report
        </h1>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl"></div>
            <div className="h-64 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl"></div>
          </div>
        ) : (
          <div className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              {/* Revenue Card */}
              <div className="bg-green-500/10 backdrop-blur-md p-5 rounded-2xl border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.15)] relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-green-500/30 rounded-full blur-2xl"></div>
                <p className="text-[10px] text-green-300 uppercase font-black tracking-widest mb-1 drop-shadow-sm">
                  Total Revenue
                </p>
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-green-300 to-emerald-500 drop-shadow-sm">
                  {stats.totalSales}{" "}
                  <span className="text-xl font-bold text-emerald-400/80">
                    T
                  </span>
                </p>
              </div>

              {/* Customers Card */}
              <div className="bg-cyan-500/10 backdrop-blur-md p-5 rounded-2xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-cyan-500/30 rounded-full blur-2xl"></div>
                <p className="text-[10px] text-cyan-300 uppercase font-black tracking-widest mb-1 drop-shadow-sm">
                  Customers
                </p>
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-blue-500 drop-shadow-sm">
                  {stats.totalCustomers}
                </p>
              </div>
            </div>

            {/* Graph  */}
            <div className="bg-black/40 backdrop-blur-xl p-5 rounded-2xl shadow-xl border border-white/10 h-72">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">
                Hourly Footfall
              </h3>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart
                  data={stats.chartData}
                  margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="hour"
                    tickFormatter={formatToIST} 
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#9CA3AF" }}
                    dy={10}
                  />
                  <YAxis
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#9CA3AF" }}
                  />
                  <Tooltip
                    labelFormatter={(value) => formatToIST(value)} 
                    cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 2 }}
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      backdropFilter: "blur(8px)",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                    }}
                    itemStyle={{ color: "#00ffd1", fontWeight: "bold" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#00ffd1" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#00ffd1", strokeWidth: 0 }}
                    activeDot={{
                      r: 6,
                      fill: "#fff",
                      stroke: "#00ffd1",
                      strokeWidth: 2,
                    }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Transaction History List*/}
            <div>
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-3 ml-1">
                Recent Transactions
              </h3>
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 overflow-hidden">
                {stats.recentTransactions?.length === 0 ? (
                  <div className="p-8 text-center text-white/50 text-sm font-light">
                    No sales yet today.
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {stats.recentTransactions.map((txn, i) => (
                      <div
                        key={i}
                        className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors duration-200"
                      >
                        <div>
                          <p className="font-bold text-white text-sm tracking-wide">
                            {txn.student?.full_name || "Unknown Student"}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {formatTime(txn.created_at)} •{" "}
                            <span className="text-indigo-300/70">
                              {txn.student?.registration_number}
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-green-400 drop-shadow-sm">
                            +{txn.amount} T
                          </p>
                          <p className="text-[9px] text-white/50 bg-white/10 border border-white/5 px-2 py-0.5 rounded-full inline-block mt-1 uppercase tracking-widest">
                            PAID
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchStats}
              className="w-full py-4 text-sm font-medium text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white/60"
            >
              Refresh Data
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
