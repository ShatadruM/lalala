import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';

export default function StudentStats() {
  const [data, setData] = useState({ balance: 0, totalSpent: 0, transactions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(`${apiUrl}/api/student/stats`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const result = await res.json();
      if (res.ok) setData(result);
    } catch (err) {
      console.error("Passbook Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800 mb-4">My Passbook</h1>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            
            {/* 1. Wallet Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-600 text-white p-5 rounded-xl shadow-lg">
                <p className="text-xs opacity-80 uppercase font-bold tracking-wider">Current Balance</p>
                <p className="text-3xl font-black mt-1">{data.balance} T</p>
              </div>
              <div className="bg-red-50 text-red-700 p-5 rounded-xl border border-red-100 shadow-sm">
                <p className="text-xs opacity-80 uppercase font-bold tracking-wider">Total Spent</p>
                <p className="text-3xl font-black mt-1">-{data.totalSpent}</p>
              </div>
            </div>

            {/* 2. Transaction List */}
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Recent Activity</h3>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {data.transactions.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">No transactions yet.</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {data.transactions.map((txn, i) => (
                      <div key={i} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                        
                        {/* Left: Info */}
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                            ${txn.type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {txn.type === 'CREDIT' ? '↓' : '↑'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">
                              {txn.counterparty?.full_name || "Unknown"}
                            </p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">
                              {formatDate(txn.created_at)}
                            </p>
                          </div>
                        </div>

                        {/* Right: Amount */}
                        <div className="text-right">
                          <p className={`font-black text-lg ${txn.type === 'CREDIT' ? 'text-green-600' : 'text-gray-900'}`}>
                            {txn.type === 'CREDIT' ? '+' : '-'}{txn.amount}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <button onClick={fetchWallet} className="w-full py-4 text-sm text-gray-400 hover:text-gray-600 underline">
              Refresh Passbook
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}