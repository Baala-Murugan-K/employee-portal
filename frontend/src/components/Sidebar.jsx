import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  LifeBuoy, 
  FileSpreadsheet, 
  ShieldCheck, 
  UserCheck, 
  ScrollText, 
  Settings,
  Lock,
  ExternalLink
} from 'lucide-react';

export default function Sidebar() {
  const { user, isAdmin, hasRole } = useAuth();

  const navClass = ({ isActive }) => 
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive 
        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30' 
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  // Role checks for each Zoho app
  const canPeople = isAdmin || hasRole('HR') || hasRole('Manager');
  const canCrm = isAdmin || hasRole('Sales') || hasRole('Manager');
  const canDesk = isAdmin || hasRole('Support');
  const canBooks = isAdmin || hasRole('Finance');

  return (
    <aside className="w-64 shrink-0 hidden md:block">
      <div className="sticky top-20 space-y-6">

        {/* General Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Workspace
          </p>
          <NavLink to="/" end className={navClass}>
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Hub</span>
          </NavLink>
        </div>

        {/* Authorized Zoho Services (strictly role-filtered!) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              My Zoho Apps
            </p>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              RBAC Filtered
            </span>
          </div>

          {canPeople && (
            <NavLink to="/zoho/people" className={navClass}>
              <Users className="w-4 h-4 text-amber-500" />
              <span>Zoho People (HR)</span>
            </NavLink>
          )}

          {canCrm && (
            <NavLink to="/zoho/crm" className={navClass}>
              <Briefcase className="w-4 h-4 text-blue-500" />
              <span>Zoho CRM (Sales)</span>
            </NavLink>
          )}

          {canDesk && (
            <NavLink to="/zoho/desk" className={navClass}>
              <LifeBuoy className="w-4 h-4 text-emerald-500" />
              <span>Zoho Desk (Support)</span>
            </NavLink>
          )}

          {canBooks && (
            <NavLink to="/zoho/books" className={navClass}>
              <FileSpreadsheet className="w-4 h-4 text-purple-500" />
              <span>Zoho Books (Finance)</span>
            </NavLink>
          )}

          {!canPeople && !canCrm && !canDesk && !canBooks && (
            <div className="px-3 py-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
              No Zoho services assigned to your role.
            </div>
          )}
        </div>

        {/* Admin Management Panel (Admin only) */}
        {isAdmin && (
          <div className="space-y-1 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between px-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
                Administration
              </p>
              <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
            </div>

            <NavLink to="/admin/users" className={navClass}>
              <UserCheck className="w-4 h-4" />
              <span>Manage Users</span>
            </NavLink>

            <NavLink to="/admin/roles" className={navClass}>
              <ShieldCheck className="w-4 h-4" />
              <span>Roles & Permissions</span>
            </NavLink>

            <NavLink to="/admin/audit-logs" className={navClass}>
              <ScrollText className="w-4 h-4" />
              <span>System Audit Logs</span>
            </NavLink>

            <NavLink to="/admin/zoho-config" className={navClass}>
              <Settings className="w-4 h-4" />
              <span>Zoho OAuth Service</span>
            </NavLink>
          </div>
        )}

        {/* Security Badge */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md">
          <div className="flex items-center gap-2 text-xs font-semibold mb-1">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Zoho Login Required</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            All API calls are authenticated via our backend service account with JWT RBAC enforcement.
          </p>
        </div>

      </div>
    </aside>
  );
}
