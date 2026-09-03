import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';

export default function Unauthorized() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const attemptedPath = location.state?.attemptedPath || 'the requested resource';
  const requiredRoles = location.state?.requiredRoles || [];

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 text-center space-y-6">
        
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 tracking-wider uppercase">
            403 Access Denied
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight pt-1">
            Insufficient Permissions
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your current assigned role (<strong className="text-slate-900">{user?.role || 'Guest'}</strong>) does not have authorization to access <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-rose-600">{attemptedPath}</code>.
          </p>
        </div>

        {requiredRoles.length > 0 && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 text-left">
            <span className="font-bold text-slate-700 block mb-1">Permitted Roles:</span>
            <div className="flex flex-wrap gap-1">
              {requiredRoles.map(r => (
                <span key={r} className="px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-800 text-[11px]">
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>

      </div>
    </div>
  );
}
