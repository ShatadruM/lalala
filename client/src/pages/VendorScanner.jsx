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
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-4">POS Terminal</h1>

        <div className="space-y-4">
          {/* POS Price Setter */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <span className="font-bold text-gray-700 text-sm">ITEM PRICE:</span>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setPrice(p => Math.max(10, p-10))} 
                className="bg-gray-100 w-10 h-10 rounded-full font-bold text-gray-600 hover:bg-gray-200 active:scale-95"
              >-</button>
              <span className="text-2xl font-black text-indigo-600 w-16 text-center">{price}</span>
              <button 
                onClick={() => setPrice(p => p+10)} 
                className="bg-gray-100 w-10 h-10 rounded-full font-bold text-gray-600 hover:bg-gray-200 active:scale-95"
              >+</button>
            </div>
          </div>

          {/* Scanner Area */}
          <div className="relative rounded-xl overflow-hidden border-4 border-indigo-600 aspect-square bg-black shadow-lg">
            <Scanner 
              onScan={handleScan}
              formats={['qr_code']}
              components={{ audio: false }}
            />
            
            {/* Overlay UI */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {!processing && !lastTxn && !errorMsg && (
                <div className="w-56 h-56 border-2 border-white/30 rounded-lg"></div>
              )}
              
              {/* STATUS: Processing */}
              {processing && !lastTxn && !errorMsg && (
                <div className="bg-white/90 px-6 py-3 rounded-full font-bold text-indigo-600 animate-pulse shadow-lg">
                  Processing Payment...
                </div>
              )}

              {/* STATUS: Success */}
              {lastTxn && (
                <div className="bg-green-500 text-white p-6 text-center w-full h-full flex flex-col items-center justify-center animate-bounce-in">
                  <div className="text-6xl mb-4 bg-white text-green-500 rounded-full w-20 h-20 flex items-center justify-center font-bold">✓</div>
                  <h2 className="text-3xl font-black">PAID!</h2>
                  <p className="mt-2 text-xl font-medium">{lastTxn.name}</p>
                  <div className="mt-4 bg-green-600 px-4 py-1 rounded-full text-xs opacity-90">
                    Remaining: {lastTxn.bal} T
                  </div>
                </div>
              )}

              {/* STATUS: Error */}
              {errorMsg && (
                <div className="bg-red-600 text-white p-6 text-center w-full h-full flex flex-col items-center justify-center animate-shake">
                  <div className="text-6xl mb-4">🛑</div>
                  <h2 className="text-3xl font-black">{errorMsg}</h2>
                  <p className="mt-2 text-sm opacity-90">Transaction Failed</p>
                </div>
              )}
            </div>
          </div>
          
          <p className="text-center text-xs text-gray-400 font-medium">
            Ready to scan. Transactions happen automatically.
          </p>
        </div>
      </div>
    </Layout>
  );
}