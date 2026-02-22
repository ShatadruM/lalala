import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Scanner } from '@yudiel/react-qr-scanner';
import Layout from '../components/Layout';

export default function VendorScanner() {
  const [price, setPrice] = useState(50); // Default item price
  const [processing, setProcessing] = useState(false);
  const [lastTxn, setLastTxn] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleScan = async (detectedCodes) => {
    if (processing || !detectedCodes.length) return;
    
    const studentId = detectedCodes[0].rawValue;
    setProcessing(true);
    setErrorMsg(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch(`${apiUrl}/api/vendor/deduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ studentId, amount: price })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402) throw new Error(`❌ LOW BALANCE!`);
        throw new Error(data.error || 'Failed');
      }

      setLastTxn({ name: data.student_name, bal: data.new_balance });
      setTimeout(() => setLastTxn(null), 3000); // Reset after 3s

    } catch (err) {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(null), 3000);
    } finally {
      setTimeout(() => setProcessing(false), 2000);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto animate-fade-in">
        <h1 className="text-2xl font-black text-white mb-6 drop-shadow-md tracking-wide">
          POS Terminal
        </h1>

        <div className="space-y-6">
          
          {/*  POS Price Setter */}
          <div className="bg-black/40 backdrop-blur-xl p-5 rounded-2xl shadow-xl border border-white/10 flex items-center justify-between relative overflow-hidden">
           
            
            <span className="font-bold text-gray-400 text-xs tracking-widest uppercase ml-2">
              ITEM PRICE
            </span>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setPrice(p => Math.max(10, p-10))} 
                className="bg-white/5 border border-white/10 w-12 h-12 rounded-full font-bold text-white hover:bg-white/15 hover:border-white/30 active:scale-95 transition-all shadow-inner flex items-center justify-center text-xl"
              >-</button>
              
              <span className="text-3xl font-black bg-clip-text text-red-400 w-16 text-center drop-shadow-sm">
                {price}
              </span>
              
              <button 
                onClick={() => setPrice(p => p+10)} 
                className="bg-white/5 border border-white/10 w-12 h-12 rounded-full font-bold text-white hover:bg-white/15 hover:border-white/30 active:scale-95 transition-all shadow-inner flex items-center justify-center text-xl"
              >+</button>
            </div>
          </div>

          {/* Scanner Area */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] aspect-square bg-black">
            <Scanner 
              onScan={handleScan}
              formats={['qr_code']}
              components={{ audio: false }}
            />
            
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              
            
              {!processing && !lastTxn && !errorMsg && (
                <div className="w-56 h-56 border border-cyan-400/30 rounded-3xl shadow-[inset_0_0_20px_rgba(6,182,212,0.2)] flex items-center justify-center">
                  <div className="w-2 h-2 bg-cyan-400/50 rounded-full animate-pulse"></div>
                </div>
              )}
               {/* processing */}
              {processing && !lastTxn && !errorMsg && (
                <div className="bg-black/80 backdrop-blur-md px-6 py-3 rounded-full font-bold text-cyan-300 tracking-widest uppercase text-sm border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.4)] animate-pulse">
                  Processing...
                </div>
              )}

               {/* Success */}
              {lastTxn && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-lg flex flex-col items-center justify-center p-6 text-center animate-bounce-in z-10 border-4 border-green-500/80 shadow-[inset_0_0_50px_rgba(34,197,94,0.2)]">
                  <div className="text-6xl mb-4 bg-green-500/20 text-green-400 rounded-full w-24 h-24 flex items-center justify-center font-black border border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                    ✓
                  </div>
                  <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-green-300 to-green-600">
                    PAID!
                  </h2>
                  <p className="mt-2 text-xl font-bold text-white tracking-wide">
                    {lastTxn.name}
                  </p>
                  <div className="mt-6 bg-green-500/20 border border-green-500/30 px-5 py-2 rounded-full text-xs text-green-300 font-bold uppercase tracking-widest shadow-inner">
                    Remaining: {lastTxn.bal} T
                  </div>
                </div>
              )}

              {/* Error */}
              {errorMsg && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-lg flex flex-col items-center justify-center p-6 text-center animate-shake z-10 border-4 border-red-500/80 shadow-[inset_0_0_50px_rgba(239,68,68,0.2)]">
                  <div className="text-5xl mb-4 bg-red-500/20 text-red-400 rounded-full w-24 h-24 flex items-center justify-center font-black border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                    ✕
                  </div>
                  <h2 className="text-2xl font-black text-red-400 drop-shadow-md">
                    {errorMsg}
                  </h2>
                  <p className="mt-3 text-xs font-bold text-red-300/70 uppercase tracking-widest">
                    Transaction Failed
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <p className="text-center text-xs text-white/40 font-medium tracking-wide">
            Ready to scan
          </p>
        </div>
      </div>
    </Layout>
  );
}