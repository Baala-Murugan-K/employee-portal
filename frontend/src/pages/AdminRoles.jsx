import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { 
  ShieldCheck, 
  Check, 
  X, 
  Layers, 
  Lock, 
  Key
} from 'lucide-react';

const roleColorMap = {
  Admin: 'border-rose-300 bg-rose-50 text-rose-800',
  HR: 'border-amber-300 bg-amber-50 text-amber-800',
  Sales: 'border-blue-300 bg-blue-50 text-blue-800',
  Support: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  Finance: 'border-purple-300 bg-purple-50 text-purple-800',
  Manager: 'border-indigo-300 bg-indigo-50 text-indigo-800'
};

export default function AdminRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await adminService.getRoles();
      if (res.success) {
        setRoles(res.roles);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const allSystemPermissions = [
    { code: 'access:zoho_people', label: 'Zoho People (HR)', category: 'Zoho Apps' },
    { code: 'access:zoho_crm', label: 'Zoho CRM (Sales)', category: 'Zoho Apps' },
    { code: 'access:zoho_desk', label: 'Zoho Desk (Support)', category: 'Zoho Apps' },
    { code: 'access:zoho_books', label: 'Zoho Books (Finance)', category: 'Zoho Apps' },
    { code: 'manage:users', label: 'Manage Employees', category: 'Administration' },
    { code: 'manage:roles', label: 'Manage Roles', category: 'Administration' },
    { code: 'view:audit_logs', label: 'View Audit Logs', category: 'Security' },
    { code: 'manage:settings', label: 'Zoho OAuth Config', category: 'Configuration' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Role-Based Access Control (RBAC) Matrix
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Explicit mapping of system roles to Zoho One applications and administrative privileges
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((r) => {
          const badgeClass = roleColorMap[r.name] || 'bg-slate-50 text-slate-700 border-slate-200';
          const permNames = (r.permissions || []).map(p => p.name);

          return (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeClass}`}>
                  {r.name}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">ID: #{r.id}</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                {r.description || 'No description provided.'}
              </p>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Assigned Permissions ({permNames.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {permNames.map(p => (
                    <span key={p} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-medium">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* RBAC Permission Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Comprehensive Permission Matrix</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {allSystemPermissions.length} Defined Permissions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Permission / Capability</th>
                <th className="py-3.5 px-4">Category</th>
                {roles.map(r => (
                  <th key={r.id} className="py-3.5 px-4 text-center">{r.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allSystemPermissions.map(perm => (
                <tr key={perm.code} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{perm.label}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{perm.code}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                      {perm.category}
                    </span>
                  </td>
                  {roles.map(r => {
                    const has = (r.permissions || []).some(p => p.name === perm.code);
                    return (
                      <td key={r.id} className="py-3 px-4 text-center">
                        {has ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-300">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
