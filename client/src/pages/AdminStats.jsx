import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";

export default function AdminStats() {
  const [stats, setStats] = useState({ 
    totalTokens: 0, 
    uniqueStudents: 0, 
    recentTransactions: [] 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return;

      const res = await fetch(`${apiUrl}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to load stats", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper for nice time formatting
  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Live Analytics</h1>
        
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            
            {/* 1. Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 p-5 rounded-xl border border-purple-200 shadow-sm">
                <p className="text-xs text-purple-800 uppercase font-bold tracking-wider mb-1">
                  Tokens Given
                </p>
                <p className="text-3xl font-black text-purple-600">
                  {stats.totalTokens}
                </p>
              </div>

              <div className="bg-orange-50 p-5 rounded-xl border border-orange-200 shadow-sm">
                <p className="text-xs text-orange-800 uppercase font-bold tracking-wider mb-1">
                  Students
                </p>
                <p className="text-3xl font-black text-orange-600">
                  {stats.uniqueStudents}
                </p>
              </div>
            </div>

            {/* 2. Transaction History List (New Section) */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Recent Activity</h3>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {stats.recentTransactions?.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">No transactions yet.</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {stats.recentTransactions.map((txn, i) => (
                      <div key={i} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                        <div>
                          <p className="font-bold text-gray-800 text-sm">
                            {txn.student?.full_name || "Unknown Student"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTime(txn.created_at)} • {txn.student?.registration_number}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-600">+{txn.amount} T</p>
                          <p className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full inline-block">
                            CREDITED
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={fetchStats}
              className="w-full py-4 text-sm text-gray-500 hover:text-gray-800 underline"
            >
              Refresh Data
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}