import Navbar from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Layout({ children }) {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Navbar /> {/* <--- Inserted Here */}
      
      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        {children}
      </main>

      {/* Global Footer / Logout for everyone */}
      {user && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4">
          <div className="max-w-md mx-auto flex justify-between items-center text-xs text-gray-400">
             <span>Infinitus © 2026</span>
             <button onClick={handleLogout} className="flex items-center gap-1 text-red-400 hover:text-red-600 font-bold">
               <LogOut size={14} />
               LOGOUT
             </button>
          </div>
        </div>
      )}
    </div>
  );
}