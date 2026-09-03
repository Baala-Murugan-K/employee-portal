import React, { useState, useEffect } from 'react';
import { zohoService } from '../services/zohoService';
import { 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  Terminal, 
  ShieldCheck, 
  Server
} from 'lucide-react';

export default function AdminZohoConfig() {
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    runConnectionTest();
  }, []);

  const runConnectionTest = async () => {
    try {
      setTesting(true);
      const res = await zohoService.testConnection();
      if (res.success) {
        setTestResult(res.connection);
      }
    } catch (err) {
      setTestResult({
        configured: false,
        status: 'ERROR',
        message: err.message
      });
    } finally {
      setTesting(false);
    }
  };

  const sampleEnv = `ZOHO_CLIENT_ID=your_client_id_from_api_console
ZOHO_CLIENT_SECRET=your_client_secret_from_api_console
ZOHO_REFRESH_TOKEN=your_generated_refresh_token
ZOHO_DOMAIN=com  # Use 'in' for India, 'eu' for Europe, 'com' for Global`;

  const copyEnv = () => {
    navigator.clipboard.writeText(sampleEnv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">

      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Zoho One OAuth Service Account Integration
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Backend-to-Zoho OAuth token management & single service account authentication status
        </p>
      </div>

      {/* Connection Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm ${
              testResult?.status === 'CONNECTED' ? 'bg-emerald-600' : 'bg-amber-500'
            }`}>
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">OAuth Connection Diagnostic</h2>
                {testResult?.status === 'CONNECTED' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    LIVE CONNECTED
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    DEMO DATASET ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {testResult?.message}
              </p>
            </div>
          </div>

          <button
            onClick={runConnectionTest}
            disabled={testing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Testing Token...' : 'Test Connection'}</span>
          </button>
        </div>

        {/* Technical Diagnostics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-400 uppercase text-[10px] block">Data Center Domain</span>
            <p className="text-slate-800 font-mono font-bold mt-1">
              https://accounts.zoho.{testResult?.domain || 'com'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-400 uppercase text-[10px] block">OAuth Access Token</span>
            <p className="text-slate-800 font-mono font-bold mt-1">
              {testResult?.tokenPreview || 'Simulated Service Proxy'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-400 uppercase text-[10px] block">Token Lifetime / Cache</span>
            <p className="text-slate-800 font-mono font-bold mt-1">
              {testResult?.expiresIn ? `${testResult.expiresIn} seconds remaining` : 'Auto-Refreshes on Request'}
            </p>
          </div>
        </div>
      </div>

      {/* How to Configure Real Zoho Credentials Guide */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              How to Connect Your Real Zoho API Credentials
            </h3>
          </div>
          <a
            href="https://api-console.zoho.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            <span>Zoho API Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          When you are ready to link your real Zoho One account, simply update the <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">backend/.env</code> file. The portal will automatically detect your credentials and switch from demo simulation to live Zoho API queries!
        </p>

        {/* Steps */}
        <div className="space-y-3 pt-2 text-xs">
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
            <div>
              <p className="font-bold text-slate-800">Register an App in Zoho API Console</p>
              <p className="text-slate-500">Go to <a href="https://api-console.zoho.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">api-console.zoho.com</a> and create a <strong>Server-based Applications</strong> or <strong>Self Client</strong>.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
            <div>
              <p className="font-bold text-slate-800">Generate Refresh Token with Scopes</p>
              <p className="text-slate-500">Generate a refresh token with appropriate scopes (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">ZohoPeople.employee.ALL</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">ZohoCRM.modules.ALL</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">Desk.tickets.ALL</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">ZohoBooks.invoices.ALL</code>).</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] shrink-0">3</span>
            <div>
              <p className="font-bold text-slate-800">Add Keys into backend/.env</p>
              <p className="text-slate-500">Add the variables to your backend <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">.env</code> file:</p>
            </div>
          </div>
        </div>

        {/* Code Box */}
        <div className="relative mt-2">
          <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed">
            {sampleEnv}
          </pre>
          <button
            onClick={copyEnv}
            className="absolute right-3 top-3 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1.5 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
