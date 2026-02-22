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
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-black text-white mb-6 drop-shadow-md tracking-wide">
          My Passbook
        </h1>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl"></div>
            <div className="h-64 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl"></div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Wallet Summary */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Current Balance Card */}
              <div className="bg-indigo-500/10 backdrop-blur-md p-5 rounded-2xl border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)] relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-indigo-500/30 rounded-full blur-2xl"></div>
                <p className="text-[10px] text-indigo-300 uppercase font-black tracking-widest mb-1 drop-shadow-sm">
                  Current Balance
                </p>
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 to-cyan-400 drop-shadow-sm">
                  {data.balance} <span className="text-xl font-bold text-cyan-400/80">T</span>
                </p>
              </div>

              {/* Total Spent Card */}
              <div className="bg-red-500/10 backdrop-blur-md p-5 rounded-2xl border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.15)] relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-red-500/30 rounded-full blur-2xl"></div>
                <p className="text-[10px] text-red-300 uppercase font-black tracking-widest mb-1 drop-shadow-sm">
                  Total Spent
                </p>
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-300 to-red-500 drop-shadow-sm">
                  -{data.totalSpent}
                </p>
              </div>
            </div>

            {/* transaction List  */}
            <div>
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-3 ml-1">
                Recent Activity
              </h3>
              
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 overflow-hidden">
                {data.transactions.length === 0 ? (
                  <div className="p-8 text-center text-white/50 text-sm font-light">
                    No transactions yet.
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {data.transactions.map((txn, i) => (
                      <div key={i} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors duration-200">
                        
                       
                        <div className="flex items-center gap-3">
                          
                          <div className={` flex items-center justify-center text-lg font-bold 
                            ${txn.type === 'CREDIT' 
                              ? ' text-green-400' 
                              : ' text-red-400'}`}>
                            {txn.type === 'CREDIT' ? '↓' : '↑'}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm tracking-wide">
                              {txn.counterparty?.full_name || "Unknown"}
                            </p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-0.5">
                              {formatDate(txn.created_at)}
                            </p>
                          </div>
                        </div>

                        
                        <div className="text-right">
                          <p className={`font-black text-lg drop-shadow-sm ${txn.type === 'CREDIT' ? 'text-green-400' : 'text-white'}`}>
                            {txn.type === 'CREDIT' ? '+' : '-'}{txn.amount}
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
              onClick={fetchWallet} 
              className="w-full py-4 text-sm font-medium text-gray-400 hover:text-white transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white/60"
            >
              Refresh Passbook
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}