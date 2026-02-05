import QRCode from "react-qr-code"
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'

export default function Dashboard() {
  const { profile } = useAuth()

  if (!profile) return <div>Loading Profile...</div>

  return (
    <Layout>
      <div className="text-center">
        <div className="bg-indigo-600 text-white py-2 px-4 rounded-full inline-block text-xs font-bold mb-4 tracking-wide">
          OFFICIAL FEST PASS
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">{profile.full_name}</h2>
        
        {/* New: Display Reg No */}
        <p className="text-indigo-600 font-mono font-bold text-md mt-1">{profile.registration_number}</p>
        
        <p className="text-gray-500 text-sm mt-1 mb-6">
          {profile.college_name}<br/>
          {profile.branch} • Year {profile.year}
        </p>

        <div className="bg-white border-4 border-indigo-100 rounded-xl p-4 inline-block mb-6 shadow-inner">
          <QRCode 
            value={profile.id} 
            size={200}
            fgColor={profile.is_active ? "#000000" : "#9CA3AF"} 
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Current Balance</p>
          {profile.is_active ? (
            <p className="text-3xl font-black text-indigo-600">{profile.balance} Tokens</p>
          ) : (
            <div>
              <p className="text-xl font-bold text-red-500">Not Active</p>
              <p className="text-xs text-gray-400 mt-1">Visit the registration desk to activate</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}