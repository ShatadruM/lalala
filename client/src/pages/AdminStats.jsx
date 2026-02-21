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
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-black text-white mb-6 drop-shadow-md tracking-wide">
         Analytics
        </h1>
        
        {loading ? (
          <div className="animate-pulse space-y-4">
            {/* Glassmorphic Skeleton Loaders */}
            <div className="h-32 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl"></div>
            <div className="h-64 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl"></div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* 1. Stats Cards - Neon Glass Vibe */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Tokens Given Card */}
              <div className="bg-purple-500/10 backdrop-blur-md p-5 rounded-2xl border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)] relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-purple-500/30 rounded-full blur-2xl"></div>
                <p className="text-[10px] text-purple-300 uppercase font-black tracking-widest mb-1 drop-shadow-sm">
                  Tokens Given
                </p>
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-300 to-purple-500 drop-shadow-sm">
                  {stats.totalTokens}
                </p>
              </div>

              {/* Students Card */}
              <div className="bg-orange-500/10 backdrop-blur-md p-5 rounded-2xl border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.15)] relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-orange-500/30 rounded-full blur-2xl"></div>
                <p className="text-[10px] text-orange-300 uppercase font-black tracking-widest mb-1 drop-shadow-sm">
                  Students
                </p>
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-300 to-orange-500 drop-shadow-sm">
                  {stats.uniqueStudents}
                </p>
              </div>
            </div>

            {/* 2. Transaction History List (Glass Panel) */}
            <div>
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-3 ml-1">
                Recent Activity
              </h3>
              
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 overflow-hidden">
                {stats.recentTransactions?.length === 0 ? (
                  <div className="p-8 text-center text-white/50 text-sm font-light">
                    No transactions yet.
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {stats.recentTransactions.map((txn, i) => (
                      <div key={i} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors duration-200">
                        <div>
                          <p className="font-bold text-white text-sm tracking-wide">
                            {txn.student?.full_name || "Unknown Student"}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {formatTime(txn.created_at)} • <span className="text-indigo-300/70">{txn.student?.registration_number}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-purple-400">+{txn.amount} T</p>
                          <p className="text-[9px] text-white/50 bg-white/10 border border-white/5 px-2 py-0.5 rounded-full inline-block mt-1 uppercase tracking-widest">
                            CREDITED
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