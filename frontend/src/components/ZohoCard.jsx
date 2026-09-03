import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  LifeBuoy, 
  FileSpreadsheet, 
  ExternalLink, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const iconMap = {
  Users: Users,
  Briefcase: Briefcase,
  LifeBuoy: LifeBuoy,
  FileSpreadsheet: FileSpreadsheet
};

export default function ZohoCard({ app }) {
  const navigate = useNavigate();
  const IconComponent = iconMap[app.icon] || Briefcase;

  const appPathMap = {
    zoho_people: '/zoho/people',
    zoho_crm: '/zoho/crm',
    zoho_desk: '/zoho/desk',
    zoho_books: '/zoho/books'
  };

  const internalPath = appPathMap[app.id] || '/';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between group">
      <div>
        {/* Header with Icon and Badge */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${app.color} flex items-center justify-center text-white shadow-sm`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Authorized ({app.requiredRole.join(' / ')})
          </span>
        </div>

        {/* Title and Description */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
          {app.name}
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Role Scope: {app.code}
        </p>
        <p className="text-sm text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
          {app.description}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={() => navigate(internalPath)}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm"
        >
          <span>View Live Data</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <a
          href={app.webUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`Launch ${app.name} in new window`}
          className="inline-flex items-center justify-center p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
