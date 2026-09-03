import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { zohoService } from '../services/zohoService';
import ZohoCard from '../components/ZohoCard';
import { 
  Shield, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Server,
  Layers,
  ArrowUpRight,
  EyeOff
} from 'lucide-react';

const allServicesCatalog = [
  { id: 'zoho_people', name: 'Zoho People', role: 'HR', purpose: 'Human Resources & Attendance' },
  { id: 'zoho_crm', name: 'Zoho CRM', role: 'Sales', purpose: 'Sales Leads & Pipeline Deals' },
  { id: 'zoho_desk', name: 'Zoho Desk', role: 'Support', purpose: 'Helpdesk & Ticket Management' },
  { id: 'zoho_books', name: 'Zoho Books', role: 'Finance', purpose: 'Invoicing & Financial Operations' }
];

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [authorizedApps, setAuthorizedApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApps();
  }, [user]);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const res = await zohoService.getAuthorizedApps();
      if (res.success) {
        setAuthorizedApps(res.applications || []);
      }
    } catch (err) {
      setError('Unable to load authorized applications');
    } finally {
      setLoading(false);
    }
  };

  const authorizedIds = authorizedApps.map(a => a.id);
  const restrictedApps = allServicesCatalog.filter(s => !authorizedIds.includes(s.id));

  return (
    <div className="space-y-8">

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-8 sm:p-10 shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-4 backdrop-blur-sm">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Role-Based Access Control (RBAC) Active</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>

          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            You are authenticated as <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">{user?.role}</span> in the <span className="font-semibold text-slate-200">{user?.department}</span> department. The portal's backend service account securely handles your Zoho API access without requiring personal Zoho credentials.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>JWT Authentication Verified</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <Server className="w-4 h-4 text-blue-400" />
              <span>OAuth Service Account Backend Proxy</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>{authorizedApps.length} Permitted Service{authorizedApps.length === 1 ? '' : 's'}</span>
            </div>
          </div>
        </div>

        {/* Aesthetic background accent */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Authorized Services Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Authorized Zoho Services
            </h2>
            <p className="text-xs text-slate-500">
              Direct entry points and data proxies permitted for the <strong className="text-slate-700">{user?.role}</strong> role
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            {authorizedApps.length} Available
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map(n => (
              <div key={n} className="h-48 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
            {error}
          </div>
        ) : authorizedApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {authorizedApps.map((app) => (
              <ZohoCard key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <Lock className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No Authorized Applications</p>
            <p className="text-xs text-slate-500 mt-1">Please contact your administrator to assign role permissions.</p>
          </div>
        )}
      </div>

      {/* RBAC Restricted Services Card (demonstrates RBAC isolation visually) */}
      {!isAdmin && restrictedApps.length > 0 && (
        <div className="bg-slate-100/80 rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <EyeOff className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-700">
              Access Restricted by RBAC Policy
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            The following Zoho One applications are restricted from your role (<span className="font-semibold text-slate-700">{user?.role}</span>) and cannot be accessed or viewed from your account:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {restrictedApps.map((item) => (
              <div key={item.id} className="p-3 bg-white/60 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-700 line-through opacity-70">{item.name}</p>
                  <p className="text-[11px] text-slate-400">{item.purpose}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                  {item.role} only
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Notice if Admin */}
      {isAdmin && (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-600" />
              <h4 className="text-sm font-bold text-rose-900">Administrator Privileges Granted</h4>
            </div>
            <p className="text-xs text-rose-700 mt-1">
              As an Administrator, you have full visibility over all 4 integrated Zoho applications, user accounts, roles & permissions, and live system audit logs.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
