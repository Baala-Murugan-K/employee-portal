require('dotenv').config();

const domain = process.env.ZOHO_DOMAIN || 'com';

const ZOHO_CONFIG = {
  clientId: process.env.ZOHO_CLIENT_ID || '',
  clientSecret: process.env.ZOHO_CLIENT_SECRET || '',
  refreshToken: process.env.ZOHO_REFRESH_TOKEN || '',
  oauthUrl: `https://accounts.zoho.${domain}/oauth/v2/token`,
  domain,
  
  // App definitions with web URLs, descriptions, API base endpoints
  applications: {
    zoho_people: {
      id: 'zoho_people',
      name: 'Zoho People',
      code: 'HR',
      description: 'Human Resource Management, Employee Directory, Attendance & Leave Tracking',
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-orange-500',
      bgLight: 'bg-orange-50',
      webUrl: `https://people.zoho.${domain}`,
      apiBase: `https://people.zoho.${domain}/people/api`,
      requiredRole: ['Admin', 'HR'],
      requiredPermission: 'access:zoho_people',
      icon: 'Users'
    },
    zoho_crm: {
      id: 'zoho_crm',
      name: 'Zoho CRM',
      code: 'CRM',
      description: 'Customer Relationship Management, Leads, Contact Management & Deals Pipeline',
      color: 'from-blue-600 to-indigo-700',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
      webUrl: `https://crm.zoho.${domain}`,
      apiBase: `https://www.zohoapis.${domain}/crm/v3`,
      requiredRole: ['Admin', 'Sales'],
      requiredPermission: 'access:zoho_crm',
      icon: 'Briefcase'
    },
    zoho_desk: {
      id: 'zoho_desk',
      name: 'Zoho Desk',
      code: 'DESK',
      description: 'Customer Support Ticketing System, Issue Tracking & Service Level Management',
      color: 'from-emerald-500 to-teal-700',
      textColor: 'text-emerald-600',
      bgLight: 'bg-emerald-50',
      webUrl: `https://desk.zoho.${domain}`,
      apiBase: `https://desk.zoho.${domain}/api/v1`,
      requiredRole: ['Admin', 'Support'],
      requiredPermission: 'access:zoho_desk',
      icon: 'LifeBuoy'
    },
    zoho_books: {
      id: 'zoho_books',
      name: 'Zoho Books',
      code: 'BOOKS',
      description: 'Financial & Accounting Operations, Invoicing, Billing & Expense Reports',
      color: 'from-purple-600 to-pink-600',
      textColor: 'text-purple-600',
      bgLight: 'bg-purple-50',
      webUrl: `https://books.zoho.${domain}`,
      apiBase: `https://books.zoho.${domain}/api/v3`,
      requiredRole: ['Admin', 'Finance'],
      requiredPermission: 'access:zoho_books',
      icon: 'FileSpreadsheet'
    }
  },

  // Role to permitted app mapping
  roleAppMapping: {
    Admin: ['zoho_people', 'zoho_crm', 'zoho_desk', 'zoho_books'],
    HR: ['zoho_people'],
    Sales: ['zoho_crm'],
    Support: ['zoho_desk'],
    Finance: ['zoho_books'],
    Manager: ['zoho_people', 'zoho_crm']
  }
};

module.exports = ZOHO_CONFIG;
