const zohoService = require('../services/zohoService');
const auditService = require('../services/auditService');

class ZohoController {
  /**
   * Get list of Zoho applications authorized for the current user
   */
  async getAuthorizedApps(req, res, next) {
    try {
      const user = req.user;
      const roles = Array.isArray(user.roles) ? user.roles : [user.role];
      const apps = zohoService.getUserAuthorizedApps(roles);

      return res.status(200).json({
        success: true,
        userRole: user.role,
        roles,
        count: apps.length,
        applications: apps
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Proxy Zoho People (HR)
   */
  async getPeopleData(req, res, next) {
    try {
      const data = await zohoService.getPeopleData();
      
      await auditService.log({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: 'ACCESS_ZOHO_PEOPLE',
        resource: 'zoho_people',
        status: 'SUCCESS',
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        details: 'User accessed Zoho People HR portal service'
      });

      return res.status(200).json({
        success: true,
        ...data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Proxy Zoho CRM (Sales)
   */
  async getCrmData(req, res, next) {
    try {
      const data = await zohoService.getCrmData();

      await auditService.log({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: 'ACCESS_ZOHO_CRM',
        resource: 'zoho_crm',
        status: 'SUCCESS',
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        details: 'User accessed Zoho CRM sales pipeline service'
      });

      return res.status(200).json({
        success: true,
        ...data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Proxy Zoho Desk (Support)
   */
  async getDeskData(req, res, next) {
    try {
      const data = await zohoService.getDeskData();

      await auditService.log({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: 'ACCESS_ZOHO_DESK',
        resource: 'zoho_desk',
        status: 'SUCCESS',
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        details: 'User accessed Zoho Desk support service'
      });

      return res.status(200).json({
        success: true,
        ...data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Proxy Zoho Books (Finance)
   */
  async getBooksData(req, res, next) {
    try {
      const data = await zohoService.getBooksData();

      await auditService.log({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: 'ACCESS_ZOHO_BOOKS',
        resource: 'zoho_books',
        status: 'SUCCESS',
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        details: 'User accessed Zoho Books financial accounting service'
      });

      return res.status(200).json({
        success: true,
        ...data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Diagnostic test of Zoho API connection (Admin only)
   */
  async testConnection(req, res, next) {
    try {
      const result = await zohoService.testConnection();

      await auditService.log({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: 'TEST_ZOHO_CONNECTION',
        resource: 'zoho_service_account',
        status: result.status === 'ERROR' ? 'FAILED' : 'SUCCESS',
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        details: `Connection test result: ${result.status}`
      });

      return res.status(200).json({
        success: true,
        connection: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ZohoController();
