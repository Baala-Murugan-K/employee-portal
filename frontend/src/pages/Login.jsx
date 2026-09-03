import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Users,
  Briefcase,
  LifeBuoy,
  FileSpreadsheet
} from 'lucide-react';

const demoAccounts = [
  {
    role: 'Admin',
    name: 'Alexander Wright',
    email: 'admin@portal.com',
    password: 'admin123',
    app: 'All Zoho Apps + Admin Controls',
    icon: Shield,
    color: 'from-rose-500 to-red-600',
    border: 'hover:border-rose-300'
  },
  {
    role: 'HR',
    name: 'Sarah Connor',
    email: 'hr@portal.com',
    password: 'hr123',
    app: 'Zoho People (HR Management)',
    icon: Users,
    color: 'from-amber-500 to-orange-600',
    border: 'hover:border-amber-300'
  },
  {
    role: 'Sales',
    name: 'Michael Scott',
    email: 'sales@portal.com',
    password: 'sales123',
    app: 'Zoho CRM (Sales & Deals)',
    icon: Briefcase,
    color: 'from-blue-600 to-indigo-600',
    border: 'hover:border-blue-300'
  },
  {
    role: 'Support',
    name: 'Rachel Green',
    email: 'support@portal.com',
    password: 'support123',
    app: 'Zoho Desk (Helpdesk & Tickets)',
    icon: LifeBuoy,
    color: 'from-emerald-500 to-teal-600',
    border: 'hover:border-emerald-300'
  },
  {
    role: 'Finance',
    name: 'Harvey Specter',
    email: 'finance@portal.com',
    password: 'finance123',
    app: 'Zoho Books (Accounting & Invoices)',
    icon: FileSpreadsheet,
    color: 'from-purple-600 to-pink-600',
    border: 'hover:border-purple-300'
  }
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = async (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
    setLoading(true);
    try {
      await login(account.email, account.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Background aesthetic blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-4">
          <Shield className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Custom Employee Portal
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Zoho One Single Service Account OAuth & RBAC Gatekeeper
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-slate-200/80">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@portal.com"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md shadow-blue-600/20 transition disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher Section */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Quick Demo Role Switcher (One-Click Login)
              </p>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Click any role below to immediately test authenticating and viewing only permitted Zoho services:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickSelect(acc)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 text-left transition hover:bg-slate-50 ${acc.border}`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${acc.color} text-white flex items-center justify-center shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{acc.role}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({acc.password})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{acc.app}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Security Info Footnote */}
        <p className="mt-4 text-center text-xs text-slate-500 flex items-center justify-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Employees never need personal Zoho credentials. Zero credential exposure.</span>
        </p>
      </div>
    </div>
  );
}
