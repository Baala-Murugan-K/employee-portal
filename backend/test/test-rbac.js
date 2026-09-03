const axios = require('axios');
const app = require('../server');

const BASE_URL = 'http://localhost:5001/api';
let server;

async function runTests() {
  console.log('🧪 Starting Backend & RBAC Security Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Start test server on port 5001
  server = app.listen(5001);

  try {
    // 1. Test Health endpoint
    const healthRes = await axios.get(`${BASE_URL}/health`);
    assert(healthRes.status === 200 && healthRes.data.status === 'UP', 'Health check responds with UP');

    // 2. Test Login as HR
    const hrLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'hr@portal.com',
      password: 'hr123'
    });
    const hrToken = hrLogin.data.data.token;
    assert(hrLogin.status === 200 && hrToken && hrLogin.data.data.user.role === 'HR', 'HR login succeeds and returns JWT');

    // 3. Test Login as Sales
    const salesLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'sales@portal.com',
      password: 'sales123'
    });
    const salesToken = salesLogin.data.data.token;
    assert(salesLogin.status === 200 && salesToken && salesLogin.data.data.user.role === 'Sales', 'Sales login succeeds and returns JWT');

    // 4. Test Login as Finance
    const financeLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'finance@portal.com',
      password: 'finance123'
    });
    const financeToken = financeLogin.data.data.token;
    assert(financeLogin.status === 200 && financeToken && financeLogin.data.data.user.role === 'Finance', 'Finance login succeeds and returns JWT');

    // 5. Test Login as Admin
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@portal.com',
      password: 'admin123'
    });
    const adminToken = adminLogin.data.data.token;
    assert(adminLogin.status === 200 && adminToken && adminLogin.data.data.user.role === 'Admin', 'Admin login succeeds and returns JWT');

    // 6. RBAC: HR accessing Zoho People (Expected: 200)
    const hrPeopleRes = await axios.get(`${BASE_URL}/zoho/people`, {
      headers: { Authorization: `Bearer ${hrToken}` }
    });
    assert(hrPeopleRes.status === 200 && hrPeopleRes.data.service === 'Zoho People', 'HR can access authorized Zoho People service');

    // 7. RBAC: HR accessing Zoho CRM (Expected: 403 Forbidden)
    try {
      await axios.get(`${BASE_URL}/zoho/crm`, {
        headers: { Authorization: `Bearer ${hrToken}` }
      });
      assert(false, 'HR accessing Zoho CRM should be blocked with 403');
    } catch (err) {
      assert(err.response && err.response.status === 403, 'RBAC correctly blocked HR from accessing unauthorized Zoho CRM (403)');
    }

    // 8. RBAC: Sales accessing Zoho CRM (Expected: 200)
    const salesCrmRes = await axios.get(`${BASE_URL}/zoho/crm`, {
      headers: { Authorization: `Bearer ${salesToken}` }
    });
    assert(salesCrmRes.status === 200 && salesCrmRes.data.service === 'Zoho CRM', 'Sales can access authorized Zoho CRM service');

    // 9. RBAC: Sales accessing Zoho Books (Expected: 403 Forbidden)
    try {
      await axios.get(`${BASE_URL}/zoho/books`, {
        headers: { Authorization: `Bearer ${salesToken}` }
      });
      assert(false, 'Sales accessing Zoho Books should be blocked with 403');
    } catch (err) {
      assert(err.response && err.response.status === 403, 'RBAC correctly blocked Sales from accessing unauthorized Zoho Books (403)');
    }

    // 10. RBAC: Finance accessing Zoho Books (Expected: 200)
    const financeBooksRes = await axios.get(`${BASE_URL}/zoho/books`, {
      headers: { Authorization: `Bearer ${financeToken}` }
    });
    assert(financeBooksRes.status === 200 && financeBooksRes.data.service === 'Zoho Books', 'Finance can access authorized Zoho Books service');

    // 11. RBAC: Admin accessing All Services
    const adminPeopleRes = await axios.get(`${BASE_URL}/zoho/people`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const adminCrmRes = await axios.get(`${BASE_URL}/zoho/crm`, { headers: { Authorization: `Bearer ${adminToken}` } });
    assert(adminPeopleRes.status === 200 && adminCrmRes.status === 200, 'Admin can access all Zoho services');

    // 12. RBAC: HR attempting to access Admin Users endpoint (Expected: 403 Forbidden)
    try {
      await axios.get(`${BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${hrToken}` }
      });
      assert(false, 'HR should not be allowed to access /api/admin/users');
    } catch (err) {
      assert(err.response && err.response.status === 403, 'Admin endpoint correctly restricted from non-Admin user (403)');
    }

    // 13. Admin accessing Audit Logs (should include the 403 attempts logged)
    const auditRes = await axios.get(`${BASE_URL}/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const forbiddenLogs = auditRes.data.logs.filter(l => l.status === 'FORBIDDEN');
    assert(auditRes.status === 200 && forbiddenLogs.length > 0, `Audit logs correctly recorded security events (${forbiddenLogs.length} forbidden events logged)`);

    console.log(`\n🏁 Test Results: ${passed} Passed, ${failed} Failed`);
  } catch (error) {
    console.error('Test execution error:', error.message);
  } finally {
    if (server) server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
