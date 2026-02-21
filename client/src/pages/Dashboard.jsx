import QRCode from "react-qr-code";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/Layout";

export default function Dashboard() {
  const { profile } = useAuth();

  if (!profile) return (
    <Layout>
      <div className="text-center text-white/70 animate-pulse mt-20 font-mono tracking-widest">
        LOADING_PROFILE...
      </div>
    </Layout>
  );

  return (
    <Layout>
      {/* 1. Main Glass Card Container */}
      <div className="bg-transparent text-center relative overflow-hidden">
        
        {/* Optional: Subtle ambient glow behind the card content */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -z-10"></div>

        {/* Pass Header - Neon Badge Style */}
        <div className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 py-1.5 px-4 rounded-full inline-block text-[10px] font-black mb-6 tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          Official Arcade Pass
        </div>

        {/* Student Name */}
        <h2 className="text-3xl font-black text-white leading-tight drop-shadow-md">
          {profile.full_name}
        </h2>

        {/* Registration Number */}
        <p className="text-indigo-400 font-mono font-bold text-lg mt-1 tracking-wider">
          {profile.registration_number}
        </p>

        {/* College Details */}
        <p className="text-gray-300 text-sm mt-2 mb-8 font-light">
          {profile.college_name}
          <br />
          <span className="opacity-75">{profile.branch} • Year {profile.year}</span>
        </p>

        {/* QR Code Section - MUST stay white for scannability */}
        <div className="bg-white border outline outline-4 outline-white/10 rounded-2xl p-4 inline-block mb-8 shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-transform hover:scale-105 duration-300">
          <QRCode
            value={profile.id}
            size={200}
            fgColor={"#000000"}
            // Keeping bg transparent here since the parent div is solid white
            bgColor="transparent" 
          />
        </div>

        {/* Balance Section - Inner Glass Panel */}
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-sm shadow-inner">
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1 font-semibold">
            Current Balance
          </p>
          
          {profile.is_active ? (
            // Space-themed Gradient Text for the balance
            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 drop-shadow-sm">
              {profile.balance} <span className="text-lg font-bold text-cyan-400/80">Tokens</span>
            </p>
          ) : (
            <div>
              <p className="text-xl font-bold text-red-400 drop-shadow-sm">Account Not Activated</p>
              <p className="text-xs text-red-300/70 mt-1">
                Visit the registration desk to activate
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}