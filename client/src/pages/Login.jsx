import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'

export default function Login() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` } 
    })
  }

  return (
    <Layout>
      
      <div className="flex flex-col items-center justify-center min-h-[75vh] animate-fade-in">
        
       
        <div className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl text-center relative overflow-hidden">
        
          <img 
            src="/InfinitusLogo.png" 
            alt="Infinitus Logo" 
            className="h-36 w-auto mx-auto mb-3 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
          />
          
          
          <p className="text-indigo-300 font-mono tracking-[0.2em] text-xs uppercase mb-10 drop-shadow-sm">
            Arcade Token Registration
          </p>
          
          {/* Google Sign In Button  */}
          <button 
            onClick={handleLogin} 
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 text-white font-medium py-3.5 px-4 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
          >
            <img 
              src="https://www.svgrepo.com/show/475656/google-color.svg" 
              className="w-5 h-5 drop-shadow-md" 
              alt="Google Logo" 
            />
            Sign in with College Email
          </button>
          
        </div>
      </div>
    </Layout>
  )
}