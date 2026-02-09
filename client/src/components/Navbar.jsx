import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, QrCode, BarChart2, LogOut, User,Wallet } from 'lucide-react';

export default function Navbar() {
  const { profile, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // If not logged in, don't show navbar (or show simple login link)
  if (!user || !profile) return null;

  const role = profile.role; // 'student', 'admin', 'vendor'

  // Define menu items based on role
  const getMenuItems = () => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Scanner', path: '/admin/scanner', icon: <QrCode size={20} /> },
          { name: 'Stats', path: '/admin/stats', icon: <BarChart2 size={20} /> },
        ];
      case 'vendor':
        return [
          { name: 'POS Terminal', path: '/vendor/scanner', icon: <QrCode size={20} /> },
          { name: 'Sales Report', path: '/vendor/stats', icon: <BarChart2 size={20} /> },
        ];
      default: // STUDENTS
      return [
        { name: 'My Passbook', path: '/me/stats', icon: <Wallet size={20} /> },
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo / Home Link */}
          <Link to="/dashboard" className="font-black text-xl text-indigo-600 tracking-tighter">
            INFINITUS
          </Link>

          {/* Desktop/Mobile Menu Button */}
          <div className="flex items-center gap-4">
            
            {/* Role Badge (Visual Indicator) */}
            {role !== 'student' && (
               <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide
                 ${role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                 {role} Mode
               </span>
            )}

            {/* Hamburger Button (Only if there are menu items) */}
            {menuItems.length > 0 && (
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dropdown Menu (Mobile Friendly) */}
      {isOpen && menuItems.length > 0 && (
        <div className="absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-lg animate-fade-in-down">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors
                  ${location.pathname === item.path 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            
            {/* Divider */}
            <div className="border-t border-gray-100 my-2"></div>
            
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <User size={20} />
              My ID Card
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}