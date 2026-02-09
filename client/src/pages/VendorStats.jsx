import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';

export default function VendorStats() {
  const [stats, setStats] = useState({ 
    totalSales: 0, 
    totalCustomers: 0, 
    chartData: [], 
    recentTransactions: [] // <--- New State
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(`${apiUrl}/api/vendor/stats`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
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
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Sales Report</h1>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* 1. Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-xl border border-green-200 shadow-sm">
                <p className="text-xs text-gray-500 uppercase font-bold">Total Revenue</p>
                <p className="text-2xl font-black text-green-600">{stats.totalSales} T</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm">
                <p className="text-xs text-gray-500 uppercase font-bold">Customers</p>
                <p className="text-2xl font-black text-blue-600">{stats.totalCustomers}</p>
              </div>
            </div>

            {/* 2. Graph */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-64">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">Hourly Footfall</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData}>
                  <XAxis dataKey="hour" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#F3F4F6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* 3. Transaction History List (New Section) */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Recent Transactions</h3>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {stats.recentTransactions?.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">No sales yet today.</div>
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
                          <p className="font-bold text-green-600">+{txn.amount} T</p>
                          <p className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full inline-block">
                            PAID
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button onClick={fetchStats} className="w-full py-4 text-sm text-gray-500 underline">
              Refresh Data
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}