import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Scanner } from '@yudiel/react-qr-scanner'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import Layout from '../components/Layout'

export default function VendorDashboard() {
  const { user } = useAuth()
  const [mode, setMode] = useState('dashboard') // 'dashboard' or 'scan'
  
  // Dashboard State
  const [stats, setStats] = useState({ totalSales: 0, totalCustomers: 0, chartData: [] })
  
  // Scanner State
  const [price, setPrice] = useState(50) // Default item price
  const [processing, setProcessing] = useState(false)
  const [lastTxn, setLastTxn] = useState(null) // To show "Success" popup
  const [errorMsg, setErrorMsg] = useState(null)

  // Fetch Stats on Load
  useEffect(() => {
    if (mode === 'dashboard') fetchStats()
  }, [mode])

  const fetchStats = async () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    const { data: { session } } = await import('../lib/supabase').then(m => m.supabase.auth.getSession())
    
    const res = await fetch(`${apiUrl}/api/vendor/stats`, {
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    })
    const data = await res.json()
    if (res.ok) setStats(data)
  }

  const handleScan = async (detectedCodes) => {
    if (processing || !detectedCodes.length) return
    
    const studentId = detectedCodes[0].rawValue
    setProcessing(true)
    setErrorMsg(null)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const { data: { session } } = await import('../lib/supabase').then(m => m.supabase.auth.getSession())

      const res = await fetch(`${apiUrl}/api/vendor/deduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ studentId, amount: price })
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 402) throw new Error(`❌ LOW BALANCE!`)
        throw new Error(data.error || 'Failed')
      }

      // Success Sound or Vibration could go here
      setLastTxn({ name: data.student_name, bal: data.new_balance })
      
      // Auto-hide success msg after 2 seconds so they can scan next person
      setTimeout(() => setLastTxn(null), 3000)

    } catch (err) {
      setErrorMsg(err.message)
      setTimeout(() => setErrorMsg(null), 3000)
    } finally {
      // Add small delay to prevent double scans
      setTimeout(() => setProcessing(false), 2000)
    }
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">Vendor Portal</h1>
        <button 
          onClick={() => setMode(mode === 'dashboard' ? 'scan' : 'dashboard')}
          className={`px-4 py-2 rounded-lg font-bold text-sm shadow-md ${
            mode === 'dashboard' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          {mode === 'dashboard' ? '📷 Start Selling' : '📊 View Stats'}
        </button>
      </div>

      {mode === 'dashboard' ? (
        <div className="space-y-6 animate-fade-in">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <p className="text-xs text-gray-500 uppercase">Total Sales</p>
              <p className="text-2xl font-black text-green-600">{stats.totalSales} T</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <p className="text-xs text-gray-500 uppercase">Customers</p>
              <p className="text-2xl font-black text-blue-600">{stats.totalCustomers}</p>
            </div>
          </div>

          {/* Graph */}
          <div className="bg-white p-4 rounded-xl shadow-sm border h-64">
            <h3 className="text-sm font-bold text-gray-600 mb-4">Hourly Footfall</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <XAxis dataKey="hour" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* POS Input */}
          <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center justify-between">
            <span className="font-bold text-gray-700">Set Price:</span>
            <div className="flex items-center space-x-2">
              <button onClick={() => setPrice(p => Math.max(0, p-10))} className="bg-gray-200 w-8 h-8 rounded-full">-</button>
              <span className="text-xl font-black text-indigo-600 w-12 text-center">{price}</span>
              <button onClick={() => setPrice(p => p+10)} className="bg-gray-200 w-8 h-8 rounded-full">+</button>
            </div>
          </div>

          {/* Scanner Area */}
          <div className="relative rounded-xl overflow-hidden border-4 border-indigo-600 aspect-square bg-black">
            <Scanner 
              onScan={handleScan}
              formats={['qr_code']}
              components={{ audio: false }}
            />
            {/* Overlay UI */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {!processing && !lastTxn && !errorMsg && (
                <div className="w-48 h-48 border-2 border-white/50 rounded-lg"></div>
              )}
              
              {/* STATUS MESSAGES */}
              {processing && !lastTxn && !errorMsg && (
                <div className="bg-white/90 px-6 py-3 rounded-full font-bold text-indigo-600 animate-pulse">
                  Processing...
                </div>
              )}

              {lastTxn && (
                <div className="bg-green-500 text-white p-6 text-center w-full h-full flex flex-col items-center justify-center animate-bounce-in">
                  <div className="text-5xl mb-2">✅</div>
                  <h2 className="text-2xl font-bold">Paid!</h2>
                  <p className="mt-2 text-lg">{lastTxn.name}</p>
                  <p className="text-sm opacity-80">Bal: {lastTxn.bal}</p>
                </div>
              )}

              {errorMsg && (
                <div className="bg-red-600 text-white p-6 text-center w-full h-full flex flex-col items-center justify-center animate-shake">
                  <div className="text-5xl mb-2">🛑</div>
                  <h2 className="text-2xl font-bold">{errorMsg}</h2>
                </div>
              )}
            </div>
          </div>
          <p className="text-center text-xs text-gray-500">Keep camera open. Scans happen automatically.</p>
        </div>
      )}
    </Layout>
  )
}