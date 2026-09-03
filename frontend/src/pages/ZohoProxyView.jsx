import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { zohoService } from '../services/zohoService';
import { 
  Users, 
  Briefcase, 
  LifeBuoy, 
  FileSpreadsheet, 
  ExternalLink, 
  ArrowLeft,
  Search,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertCircle,
  Database,
  RefreshCw
} from 'lucide-react';

const serviceConfig = {
  people: {
    id: 'zoho_people',
    title: 'Zoho People',
    subtitle: 'Human Resource Management & Attendance',
    roleRequired: 'HR / Admin',
    webUrl: 'https://people.zoho.com',
    icon: Users,
    color: 'from-amber-500 to-orange-600',
    fetcher: zohoService.getPeopleData
  },
  crm: {
    id: 'zoho_crm',
    title: 'Zoho CRM',
    subtitle: 'Customer Relationship Management & Sales Deals',
    roleRequired: 'Sales / Admin',
    webUrl: 'https://crm.zoho.com',
    icon: Briefcase,
    color: 'from-blue-600 to-indigo-600',
    fetcher: zohoService.getCrmData
  },
  desk: {
    id: 'zoho_desk',
    title: 'Zoho Desk',
    subtitle: 'Customer Support Ticketing & Service Desk',
    roleRequired: 'Support / Admin',
    webUrl: 'https://desk.zoho.com',
    icon: LifeBuoy,
    color: 'from-emerald-500 to-teal-600',
    fetcher: zohoService.getDeskData
  },
  books: {
    id: 'zoho_books',
    title: 'Zoho Books',
    subtitle: 'Financial Accounting, Billing & Invoices',
    roleRequired: 'Finance / Admin',
    webUrl: 'https://books.zoho.com',
    icon: FileSpreadsheet,
    color: 'from-purple-600 to-pink-600',
    fetcher: zohoService.getBooksData
  }
};

export default function ZohoProxyView({ service: propService }) {
  const { service: paramService } = useParams();
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  const pathService = pathParts[pathParts.length - 1]; // e.g. 'people', 'crm', 'desk', 'books'
  const service = propService || paramService || pathService;
  const navigate = useNavigate();
  const config = serviceConfig[service];

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('primary');

  useEffect(() => {
    if (!config) {
      navigate('/unauthorized');
      return;
    }
    loadServiceData();
  }, [service]);

  const loadServiceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await config.fetcher();
      if (res.success) {
        setData(res);
      } else {
        setError(res.message || 'Failed to fetch Zoho data');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        navigate('/unauthorized');
      } else {
        setError(err.response?.data?.message || 'Error connecting to Zoho proxy endpoint');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!config) return null;
  const Icon = config.icon;

  // Filter lists based on search
  const filterList = (list = []) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(q)
      )
    );
  };

  return (
    <div className="space-y-6">

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${config.color} text-white flex items-center justify-center shadow-md`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{config.title}</h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Database className="w-3 h-3" />
                {data?.source === 'LIVE_ZOHO_API' ? 'Live Zoho API' : 'OAuth Proxy Active'}
              </span>
            </div>
            <p className="text-xs text-slate-500">{config.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadServiceData}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <a
            href={config.webUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition"
          >
            <span>Launch Official {config.title}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500">Querying backend Zoho proxy...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold text-sm">Service Access Error</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          {data?.metrics && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(data.metrics).map(([key, val]) => (
                <div key={key} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">
                    {val}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Sub-tabs & Search filter */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Tab Selector */}
              <div className="flex items-center gap-2 border-b border-slate-100 sm:border-0 pb-2 sm:pb-0">
                {service === 'people' && (
                  <>
                    <button
                      onClick={() => setActiveTab('primary')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'primary' ? 'bg-amber-100 text-amber-800' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      Employee Directory ({data?.employeeRecords?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveTab('secondary')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'secondary' ? 'bg-amber-100 text-amber-800' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      Leave Requests ({data?.leaveRequests?.length || 0})
                    </button>
                  </>
                )}

                {service === 'crm' && (
                  <>
                    <button
                      onClick={() => setActiveTab('primary')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'primary' ? 'bg-blue-100 text-blue-800' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      Sales Leads ({data?.leads?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveTab('secondary')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'secondary' ? 'bg-blue-100 text-blue-800' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      Deals Pipeline ({data?.deals?.length || 0})
                    </button>
                  </>
                )}

                {service === 'desk' && (
                  <button
                    onClick={() => setActiveTab('primary')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800"
                  >
                    Customer Tickets ({data?.tickets?.length || 0})
                  </button>
                )}

                {service === 'books' && (
                  <>
                    <button
                      onClick={() => setActiveTab('primary')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'primary' ? 'bg-purple-100 text-purple-800' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      Customer Invoices ({data?.invoices?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveTab('secondary')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'secondary' ? 'bg-purple-100 text-purple-800' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      Business Expenses ({data?.expenses?.length || 0})
                    </button>
                  </>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              {/* 1. Zoho People */}
              {service === 'people' && activeTab === 'primary' && (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Employee ID</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Designation</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filterList(data.employeeRecords).map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono font-medium text-slate-700">{emp.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{emp.name}</td>
                        <td className="py-3 px-4 text-slate-600">{emp.department}</td>
                        <td className="py-3 px-4 text-slate-600">{emp.designation}</td>
                        <td className="py-3 px-4 text-slate-500 font-mono">{emp.email}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {emp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {service === 'people' && activeTab === 'secondary' && (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Request ID</th>
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Dates</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filterList(data.leaveRequests).map((lv) => (
                      <tr key={lv.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono text-slate-700">{lv.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{lv.employee}</td>
                        <td className="py-3 px-4 text-slate-600">{lv.type}</td>
                        <td className="py-3 px-4 text-slate-600">{lv.days} day(s)</td>
                        <td className="py-3 px-4 text-slate-500">{lv.from} to {lv.to}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${lv.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                            {lv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* 2. Zoho CRM */}
              {service === 'crm' && activeTab === 'primary' && (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Lead ID</th>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Contact Person</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Est. Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filterList(data.leads).map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono text-slate-700">{lead.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{lead.company}</td>
                        <td className="py-3 px-4 text-slate-700">{lead.contactPerson}</td>
                        <td className="py-3 px-4 text-slate-500 font-mono">{lead.email}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {lead.leadStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{lead.estimatedValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {service === 'crm' && activeTab === 'secondary' && (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Deal ID</th>
                      <th className="py-3 px-4">Deal Name</th>
                      <th className="py-3 px-4">Account</th>
                      <th className="py-3 px-4">Stage</th>
                      <th className="py-3 px-4">Probability</th>
                      <th className="py-3 px-4">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filterList(data.deals).map((deal) => (
                      <tr key={deal.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono text-slate-700">{deal.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{deal.name}</td>
                        <td className="py-3 px-4 text-slate-700">{deal.account}</td>
                        <td className="py-3 px-4 font-semibold text-blue-600">{deal.stage}</td>
                        <td className="py-3 px-4 text-slate-600">{deal.probability}</td>
                        <td className="py-3 px-4 font-extrabold text-slate-900">{deal.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* 3. Zoho Desk */}
              {service === 'desk' && (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Ticket ID</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Assignee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filterList(data.tickets).map((tck) => (
                      <tr key={tck.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono font-medium text-slate-700">{tck.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{tck.subject}</td>
                        <td className="py-3 px-4 text-slate-600">{tck.customer}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tck.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                            {tck.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {tck.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{tck.assignedTo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* 4. Zoho Books */}
              {service === 'books' && activeTab === 'primary' && (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Issue Date</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filterList(data.invoices).map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono font-medium text-slate-700">{inv.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{inv.customer}</td>
                        <td className="py-3 px-4 text-slate-600">{inv.issueDate}</td>
                        <td className="py-3 px-4 text-slate-600">{inv.dueDate}</td>
                        <td className="py-3 px-4 font-extrabold text-slate-900">{inv.amount}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : inv.status === 'Overdue' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {service === 'books' && activeTab === 'secondary' && (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Expense ID</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Vendor</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filterList(data.expenses).map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono font-medium text-slate-700">{exp.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{exp.category}</td>
                        <td className="py-3 px-4 text-slate-600">{exp.vendor}</td>
                        <td className="py-3 px-4 text-slate-600">{exp.date}</td>
                        <td className="py-3 px-4 font-extrabold text-slate-900">{exp.amount}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {exp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </>
      )}

    </div>
  );
}
