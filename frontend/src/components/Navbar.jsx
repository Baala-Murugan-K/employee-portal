import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  LogOut, 
  User, 
  ChevronDown, 
  Sparkles,
  Building2,
  Lock
} from 'lucide-react';

const roleColors = {
  Admin: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
  HR: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
  Sales: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20',
  Support: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
  Finance: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20',
  Manager: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/20'
};

export default function Navbar() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switchLoading, setSwitchLoading] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleQuickSwitch = async (email, password) => {
    setSwitchLoading(true);
    setDropdownOpen(false);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setSwitchLoading(false);
    }
  };

  const currentRole = user?.role || 'Employee';
  const roleBadgeStyle = roleColors[currentRole] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">Custom Employee Portal</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  Zoho One RBAC
                </span>
              </div>
              <p className="text-xs text-slate-600 hidden md:block">
                Single Service Account OAuth Integration & Role-Based Access Control
              </p>
            </div>
          </div>

          {/* User Profile & Demo Switcher */}
          <div className="flex items-center gap-3">
            
            {/* Active Role Tag */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ring-1 ${roleBadgeStyle}`}>
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span>Role: {currentRole}</span>
            </div>

            {/* User Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-lg hover:bg-slate-100 transition text-left"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden lg:block">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">{user?.name}</div>
                  <div className="text-[11px] text-slate-600 leading-tight">{user?.department || 'Staff'}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-600" />
              </button>

              {/* Dropdown Content */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white shadow-xl border border-slate-200 py-2 z-50 text-sm animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-600 truncate">{user?.email}</p>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{user?.department}</span>
                    </div>
                  </div>

                  {/* Quick Role Switcher (Crucial for Video Demo / Evaluators) */}
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 px-1 mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Demo Role Switcher
                    </p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <button
                        onClick={() => handleQuickSwitch('admin@portal.com', 'admin123')}
                        className={`px-2 py-1.5 rounded text-left font-medium hover:bg-slate-100 transition ${user?.email === 'admin@portal.com' ? 'bg-slate-100 text-rose-600 font-bold' : 'text-slate-700'}`}
                      >
                        👑 Admin
                      </button>
                      <button
                        onClick={() => handleQuickSwitch('hr@portal.com', 'hr123')}
                        className={`px-2 py-1.5 rounded text-left font-medium hover:bg-slate-100 transition ${user?.email === 'hr@portal.com' ? 'bg-slate-100 text-amber-600 font-bold' : 'text-slate-700'}`}
                      >
                        👥 HR (People)
                      </button>
                      <button
                        onClick={() => handleQuickSwitch('sales@portal.com', 'sales123')}
                        className={`px-2 py-1.5 rounded text-left font-medium hover:bg-slate-100 transition ${user?.email === 'sales@portal.com' ? 'bg-slate-100 text-blue-600 font-bold' : 'text-slate-700'}`}
                      >
                        💼 Sales (CRM)
                      </button>
                      <button
                        onClick={() => handleQuickSwitch('support@portal.com', 'support123')}
                        className={`px-2 py-1.5 rounded text-left font-medium hover:bg-slate-100 transition ${user?.email === 'support@portal.com' ? 'bg-slate-100 text-emerald-600 font-bold' : 'text-slate-700'}`}
                      >
                        🎧 Support (Desk)
                      </button>
                      <button
                        onClick={() => handleQuickSwitch('finance@portal.com', 'finance123')}
                        className={`px-2 py-1.5 rounded text-left font-medium hover:bg-slate-100 transition col-span-2 ${user?.email === 'finance@portal.com' ? 'bg-slate-100 text-purple-600 font-bold' : 'text-slate-700'}`}
                      >
                        📊 Finance (Books)
                      </button>
                    </div>
                  </div>

                  <div className="p-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition font-medium text-xs"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
