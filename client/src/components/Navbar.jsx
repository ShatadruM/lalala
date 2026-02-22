import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { Menu, X, QrCode, BarChart2, LogOut, User, Wallet } from "lucide-react";

export default function Navbar() {
  const { profile, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  if (!user || !profile) return null;

  const role = profile.role;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
  };

  const getMenuItems = () => {
    switch (role) {
      case "admin":
        return [
          {
            name: "Scanner",
            path: "/admin/scanner",
            icon: <QrCode size={20} />,
          },
          {
            name: "Stats",
            path: "/admin/stats",
            icon: <BarChart2 size={20} />,
          },
        ];
      case "vendor":
        return [
          {
            name: "POS Terminal",
            path: "/vendor/scanner",
            icon: <QrCode size={20} />,
          },
          {
            name: "Sales Report",
            path: "/vendor/stats",
            icon: <BarChart2 size={20} />,
          },
        ];
      default:
        return [
          {
            name: "My Passbook",
            path: "/me/stats",
            icon: <Wallet size={20} />,
          },
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <nav className="bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 ">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center">
            <img
              src="/InfinitusLogo.png"
              alt="Infinitus Logo"
              className="h-auto w-36 object-contain"
            />
          </Link>

          <div className="flex items-center gap-4">
            {role !== "student" && (
              <span
                className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide border
                 ${
                   role === "admin"
                     ? "bg-red-500/20 text-red-400 border-red-500/30"
                     : "bg-green-500/20 text-green-400 border-green-500/30"
                 }`}
              >
                {role} Mode
              </span>
            )}

            {menuItems.length > 0 && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {isOpen &&
        menuItems.length > 0 &&
        createPortal(
          <div className="fixed top-16 left-0 w-full bg-black/40 backdrop-blur-xl border-b border-white/10 shadow-2xl z-[60]">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors
                  ${
                    location.pathname === item.path
                      ? "bg-white/20 text-white shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}

              <div className="border-t border-white/10 my-2"></div>

              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <User size={20} />
                My ID Card
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>,
          document.body
        )}
    </nav>
  );
}
