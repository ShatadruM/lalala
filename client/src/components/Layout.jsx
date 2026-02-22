import Navbar from "./Navbar";
import { useAuth } from "../contexts/AuthContext";
import { LogOut } from "lucide-react";
import { supabase } from "../lib/supabase";
import ColorBends from "./ColorBends";

export default function Layout({ children }) {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    
    <div className="min-h-screen font-sans text-white relative isolate bg-black">
      
      <div className="fixed inset-0 -z-10">
        <ColorBends
          rotation={64}
          speed={0.2}
          scale={1.2}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          parallax={1.2}
          noise={0}
          transparent
          autoRotate={0}
          color=""
        />
      </div>

      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="grow max-w-md mx-auto px-4 py-6 pb-24 w-full">
          {children}
        </main>

       
        {user && (
          <div className="fixed bottom-0 left-0 w-full bg-black/40 backdrop-blur-md border-t border-white/10 p-4 z-50">
            <div className="max-w-md mx-auto flex justify-between items-center text-xs text-gray-400">
              
              <div className="flex items-center gap-1.5">
                <span>Made in</span>
                <img
                  src="/ntl-logo.png"
                  alt="Next Tech Lab Logo"
                  className="h-4 w-auto object-contain"
                />
                <span className="font-semibold text-gray-300">
                  Next Tech Lab
                </span>
              </div>

             <div className="flex items-center">
  <img 
    src="/Student-Council.png" 
    alt="Student Council Logo" 
    className="h-15 w-auto object-contain" 
  />
</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
