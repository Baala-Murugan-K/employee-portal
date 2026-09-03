import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import Modal from '../components/Modal';
import { 
  ScrollText, 
  Search, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Info
} from 'lucide-react';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [statusFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await adminService.getAuditLogs(params);
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    return (
      (l.user_email && l.user_email.toLowerCase().includes(q)) ||
      (l.action && l.action.toLowerCase().includes(q)) ||
      (l.resource && l.resource.toLowerCase().includes(q)) ||
      (l.details && l.details.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            SUCCESS
          </span>
        );
      case 'FORBIDDEN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert className="w-3 h-3" />
            FORBIDDEN
          </span>
        );
      case 'FAILED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3" />
            FAILED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Security & System Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log tracking user logins, RBAC permission violations, and backend Zoho API calls
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Quick Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${statusFilter === '' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              All Events ({logs.length})
            </button>
            <button
              onClick={() => setStatusFilter('FORBIDDEN')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${statusFilter === 'FORBIDDEN' ? 'bg-rose-600 text-white' : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'}`}
            >
              🚨 Forbidden Violations
            </button>
            <button
              onClick={() => setStatusFilter('SUCCESS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${statusFilter === 'SUCCESS' ? 'bg-emerald-600 text-white' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'}`}
            >
              ✅ Successful Operations
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search email, action, details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400 font-sans">
                    Loading audit trail...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400 font-sans">
                    No matching audit logs found.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition font-sans">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-[11px] font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {log.user_email || 'System / Anonymous'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {log.user_role || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 text-[11px]">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px] font-mono">
                      {log.resource}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(log.status)}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] font-mono">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-600 hover:text-blue-800 font-bold text-[11px]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Audit Log Event Inspection"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Event ID</span>
                <span className="font-mono text-slate-800">#{selectedLog.id}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Status</span>
                <div className="mt-0.5">{getStatusBadge(selectedLog.status)}</div>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Timestamp</span>
                <span className="font-mono text-slate-800">{new Date(selectedLog.timestamp).toISOString()}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">IP Address</span>
                <span className="font-mono text-slate-800">{selectedLog.ip_address}</span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 uppercase text-[10px] block mb-1">User & Role</span>
              <p className="p-2 rounded-lg bg-slate-100 font-mono text-slate-800">
                {selectedLog.user_email || 'None'} ({selectedLog.user_role || 'No Role'})
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-700 uppercase text-[10px] block mb-1">Action & Resource</span>
              <p className="p-2 rounded-lg bg-slate-100 font-mono text-slate-800">
                {selectedLog.action} &rarr; {selectedLog.resource}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-700 uppercase text-[10px] block mb-1">Event Details / Reason</span>
              <div className="p-3 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] whitespace-pre-wrap max-h-48 overflow-y-auto">
                {selectedLog.details || 'No additional details logged.'}
              </div>
            </div>

            {selectedLog.user_agent && (
              <div>
                <span className="font-bold text-slate-700 uppercase text-[10px] block mb-1">User Agent</span>
                <p className="p-2 rounded-lg bg-slate-100 font-mono text-[10px] text-slate-600 truncate">
                  {selectedLog.user_agent}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
}
