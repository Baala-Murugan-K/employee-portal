const axios = require('axios');
const ZOHO_CONFIG = require('../config/zohoConfig');

class ZohoService {
  constructor() {
    this.cachedToken = null;
    this.tokenExpiresAt = null;
  }

  /**
   * Check if Zoho credentials are configured in environment
   */
  isConfigured() {
    const { clientId, clientSecret, refreshToken } = ZOHO_CONFIG;
    return Boolean(
      clientId && 
      clientId !== 'your_zoho_client_id_here' &&
      clientSecret && 
      clientSecret !== 'your_zoho_client_secret_here' &&
      refreshToken && 
      refreshToken !== 'your_zoho_refresh_token_here'
    );
  }

  /**
   * Securely retrieve backend Zoho OAuth access token using refresh token.
   * Caches token and refreshes automatically before expiration.
   */
  async getZohoAccessToken() {
    // Check in-memory cache with a 5-minute safety buffer
    const now = Date.now();
    if (this.cachedToken && this.tokenExpiresAt && (this.tokenExpiresAt - 300000) > now) {
      return this.cachedToken;
    }

    if (!this.isConfigured()) {
      return null;
    }

    try {
      const response = await axios.post(ZOHO_CONFIG.oauthUrl, null, {
        params: {
          refresh_token: ZOHO_CONFIG.refreshToken,
          client_id: ZOHO_CONFIG.clientId,
          client_secret: ZOHO_CONFIG.clientSecret,
          grant_type: 'refresh_token'
        },
        timeout: 10000
      });

      if (response.data.access_token) {
        this.cachedToken = response.data.access_token;
        const expiresInSeconds = response.data.expires_in || 3600;
        this.tokenExpiresAt = now + (expiresInSeconds * 1000);
        return this.cachedToken;
      } else {
        console.warn('Zoho response did not contain access_token:', response.data);
        return null;
      }
    } catch (error) {
      console.error('Failed to retrieve Zoho Access Token:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Diagnostic test of Zoho API connection
   */
  async testConnection() {
    const configured = this.isConfigured();
    if (!configured) {
      return {
        configured: false,
        status: 'PENDING_CONFIGURATION',
        message: 'Zoho API credentials are not yet configured in backend .env. Demo mode active with simulated data.',
        domain: ZOHO_CONFIG.domain
      };
    }

    const startTime = Date.now();
    try {
      const token = await this.getZohoAccessToken();
      const latency = Date.now() - startTime;
      if (token) {
        return {
          configured: true,
          status: 'CONNECTED',
          message: 'Zoho OAuth Service Account authenticated successfully!',
          latency: `${latency}ms`,
          domain: ZOHO_CONFIG.domain,
          tokenPreview: `${token.substring(0, 10)}...${token.substring(token.length - 6)}`,
          expiresIn: Math.round((this.tokenExpiresAt - Date.now()) / 1000)
        };
      } else {
        return {
          configured: true,
          status: 'ERROR',
          message: 'Failed to generate access token with provided credentials. Please check Client ID, Secret, and Refresh Token.',
          domain: ZOHO_CONFIG.domain
        };
      }
    } catch (err) {
      return {
        configured: true,
        status: 'ERROR',
        message: err.message,
        domain: ZOHO_CONFIG.domain
      };
    }
  }

  /**
   * Determine authorized Zoho applications for given user roles
   * @param {Array<string>} userRoles
   */
  getUserAuthorizedApps(userRoles = []) {
    const authorizedAppIds = new Set();

    userRoles.forEach(role => {
      const apps = ZOHO_CONFIG.roleAppMapping[role] || [];
      apps.forEach(appId => authorizedAppIds.add(appId));
    });

    return Array.from(authorizedAppIds).map(appId => ZOHO_CONFIG.applications[appId]);
  }

  /**
   * Check if a role has permission to access a specific application
   */
  canAccessApp(userRoles = [], appId) {
    const app = ZOHO_CONFIG.applications[appId];
    if (!app) return false;
    return userRoles.some(r => app.requiredRole.includes(r));
  }

  // ==========================================
  // ZOHO APPLICATION PROXY METHODS
  // ==========================================

  /**
   * Zoho People proxy (HR)
   */
  async getPeopleData() {
    const isLive = this.isConfigured();
    const token = await this.getZohoAccessToken();

    if (isLive && token) {
      try {
        const response = await axios.get(`${ZOHO_CONFIG.applications.zoho_people.apiBase}/forms/P_Employee/records`, {
          headers: { Authorization: `Zoho-oauthtoken ${token}` },
          timeout: 8000
        });
        return { source: 'LIVE_ZOHO_API', data: response.data };
      } catch (err) {
        console.warn('Live Zoho People call failed, using high-fidelity dataset:', err.message);
      }
    }

    // High-fidelity fallback dataset for HR portal demo
    return {
      source: isLive ? 'LIVE_WITH_SAMPLE_FALLBACK' : 'SAMPLE_DATASET',
      service: 'Zoho People',
      module: 'Human Resources Management',
      metrics: {
        totalEmployees: 148,
        presentToday: 139,
        onLeave: 9,
        openLeaveRequests: 4
      },
      employeeRecords: [
        { id: 'EMP-1001', name: 'John Doe', department: 'Engineering', designation: 'Lead Architect', email: 'john.doe@portal.com', status: 'Active', joinDate: '2022-03-15' },
        { id: 'EMP-1002', name: 'Sarah Connor', department: 'Human Resources', designation: 'HR Director', email: 'sarah.connor@portal.com', status: 'Active', joinDate: '2021-06-01' },
        { id: 'EMP-1003', name: 'Michael Scott', department: 'Sales', designation: 'Regional Sales Director', email: 'michael.scott@portal.com', status: 'Active', joinDate: '2020-01-10' },
        { id: 'EMP-1004', name: 'Rachel Green', department: 'Customer Support', designation: 'Support Lead', email: 'rachel.green@portal.com', status: 'Active', joinDate: '2023-08-20' },
        { id: 'EMP-1005', name: 'Harvey Specter', department: 'Finance & Accounts', designation: 'Senior Financial Analyst', email: 'harvey.specter@portal.com', status: 'Active', joinDate: '2022-11-05' }
      ],
      leaveRequests: [
        { id: 'LV-8801', employee: 'John Doe', type: 'Annual Leave', days: 3, from: '2026-09-10', to: '2026-09-12', status: 'Pending Approval' },
        { id: 'LV-8802', employee: 'Rachel Green', type: 'Sick Leave', days: 1, from: '2026-09-04', to: '2026-09-04', status: 'Approved' }
      ]
    };
  }

  /**
   * Zoho CRM proxy (Sales)
   */
  async getCrmData() {
    const isLive = this.isConfigured();
    const token = await this.getZohoAccessToken();

    if (isLive && token) {
      try {
        const response = await axios.get(`${ZOHO_CONFIG.applications.zoho_crm.apiBase}/Leads`, {
          headers: { Authorization: `Zoho-oauthtoken ${token}` },
          timeout: 8000
        });
        return { source: 'LIVE_ZOHO_API', data: response.data };
      } catch (err) {
        console.warn('Live Zoho CRM call failed, using high-fidelity dataset:', err.message);
      }
    }

    return {
      source: isLive ? 'LIVE_WITH_SAMPLE_FALLBACK' : 'SAMPLE_DATASET',
      service: 'Zoho CRM',
      module: 'Sales & Customer Relationship Management',
      metrics: {
        totalLeads: 245,
        dealsInProgress: 38,
        pipelineValue: '$840,000',
        winRate: '68%'
      },
      leads: [
        { id: 'LEAD-901', company: 'Acme Global Corp', contactPerson: 'David Miller', email: 'dmiller@acmeglobal.com', phone: '+1 555-0192', leadStatus: 'Qualified', estimatedValue: '$45,000' },
        { id: 'LEAD-902', company: 'NovaTech Solutions', contactPerson: 'Elena Rostova', email: 'erostova@novatech.io', phone: '+1 555-0843', leadStatus: 'Contacted', estimatedValue: '$72,000' },
        { id: 'LEAD-903', company: 'Apex Cloud Logistics', contactPerson: 'Marcus Vance', email: 'mvance@apexcloud.com', phone: '+1 555-0431', leadStatus: 'Proposal Sent', estimatedValue: '$120,000' },
        { id: 'LEAD-904', company: 'Zenith Retailers', contactPerson: 'Priya Patel', email: 'priya@zenithretail.in', phone: '+91 98765-43210', leadStatus: 'Negotiation', estimatedValue: '$95,000' }
      ],
      deals: [
        { id: 'DEAL-301', name: 'Enterprise SaaS Migration', account: 'Acme Global Corp', stage: 'Contract Sent', probability: '90%', amount: '$150,000' },
        { id: 'DEAL-302', name: 'Cloud Infrastructure Upgrade', account: 'NovaTech Solutions', stage: 'Needs Analysis', probability: '40%', amount: '$85,000' }
      ]
    };
  }

  /**
   * Zoho Desk proxy (Support)
   */
  async getDeskData() {
    const isLive = this.isConfigured();
    const token = await this.getZohoAccessToken();

    if (isLive && token) {
      try {
        const response = await axios.get(`${ZOHO_CONFIG.applications.zoho_desk.apiBase}/tickets`, {
          headers: { Authorization: `Zoho-oauthtoken ${token}` },
          timeout: 8000
        });
        return { source: 'LIVE_ZOHO_API', data: response.data };
      } catch (err) {
        console.warn('Live Zoho Desk call failed, using high-fidelity dataset:', err.message);
      }
    }

    return {
      source: isLive ? 'LIVE_WITH_SAMPLE_FALLBACK' : 'SAMPLE_DATASET',
      service: 'Zoho Desk',
      module: 'Customer Support & Helpdesk',
      metrics: {
        openTickets: 17,
        avgResolutionTime: '2.4 hrs',
        customerSatisfaction: '96.2%',
        escalatedTickets: 2
      },
      tickets: [
        { id: 'TCK-5041', subject: 'OAuth token refresh failure on SSO callback', customer: 'Acme Global Corp', priority: 'High', status: 'In Progress', assignedTo: 'Rachel Green', created: '2026-09-03 10:15' },
        { id: 'TCK-5042', subject: 'Invoice generation formatting bug in export PDF', customer: 'NovaTech Solutions', priority: 'Medium', status: 'Open', assignedTo: 'Unassigned', created: '2026-09-03 11:45' },
        { id: 'TCK-5043', subject: 'Webhook notifications delay during peak load', customer: 'Zenith Retailers', priority: 'High', status: 'Under Review', assignedTo: 'Rachel Green', created: '2026-09-02 18:20' },
        { id: 'TCK-5044', subject: 'Permission matrix sync request for new HR managers', customer: 'Apex Cloud Logistics', priority: 'Low', status: 'Resolved', assignedTo: 'Support Bot', created: '2026-09-01 14:10' }
      ]
    };
  }

  /**
   * Zoho Books proxy (Finance)
   */
  async getBooksData() {
    const isLive = this.isConfigured();
    const token = await this.getZohoAccessToken();

    if (isLive && token) {
      try {
        const response = await axios.get(`${ZOHO_CONFIG.applications.zoho_books.apiBase}/invoices`, {
          headers: { Authorization: `Zoho-oauthtoken ${token}` },
          timeout: 8000
        });
        return { source: 'LIVE_ZOHO_API', data: response.data };
      } catch (err) {
        console.warn('Live Zoho Books call failed, using high-fidelity dataset:', err.message);
      }
    }

    return {
      source: isLive ? 'LIVE_WITH_SAMPLE_FALLBACK' : 'SAMPLE_DATASET',
      service: 'Zoho Books',
      module: 'Financial & Accounting Management',
      metrics: {
        totalRevenueQuarter: '$420,500',
        unpaidInvoices: '$38,200',
        overdueCount: 2,
        pendingApprovals: 5
      },
      invoices: [
        { id: 'INV-2026-081', customer: 'Acme Global Corp', issueDate: '2026-08-15', dueDate: '2026-09-15', amount: '$45,000', status: 'Paid', paymentMethod: 'Wire Transfer' },
        { id: 'INV-2026-082', customer: 'NovaTech Solutions', issueDate: '2026-08-20', dueDate: '2026-09-20', amount: '$72,000', status: 'Sent', paymentMethod: 'Credit Terms' },
        { id: 'INV-2026-083', customer: 'Apex Cloud Logistics', issueDate: '2026-07-10', dueDate: '2026-08-10', amount: '$24,500', status: 'Overdue', paymentMethod: 'Net 30' },
        { id: 'INV-2026-084', customer: 'Zenith Retailers', issueDate: '2026-09-01', dueDate: '2026-10-01', amount: '$31,000', status: 'Draft', paymentMethod: 'Pending' }
      ],
      expenses: [
        { id: 'EXP-109', category: 'Cloud Infrastructure & Hosting', vendor: 'AWS / Cloudflare', amount: '$6,420', date: '2026-09-01', status: 'Approved' },
        { id: 'EXP-110', category: 'Software Subscriptions (Zoho One)', vendor: 'Zoho Corporation', amount: '$1,800', date: '2026-08-28', status: 'Paid' }
      ]
    };
  }
}

module.exports = new ZohoService();
