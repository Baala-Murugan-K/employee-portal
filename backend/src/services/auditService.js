const { AuditLog } = require('../models');

class AuditService {
  /**
   * Record an audit log entry
   * @param {Object} logData
   */
  async log({
    userId = null,
    userEmail = null,
    userRole = null,
    action,
    resource,
    status = 'SUCCESS',
    ipAddress = null,
    userAgent = null,
    details = null
  }) {
    try {
      const detailsString = typeof details === 'object' ? JSON.stringify(details) : (details || '');
      
      const entry = await AuditLog.create({
        user_id: userId,
        user_email: userEmail,
        user_role: userRole,
        action,
        resource,
        status,
        ip_address: ipAddress || '127.0.0.1',
        user_agent: userAgent ? userAgent.substring(0, 255) : null,
        details: detailsString,
        timestamp: new Date()
      });
      return entry;
    } catch (error) {
      console.error('Failed to write audit log:', error.message);
      return null;
    }
  }

  /**
   * Retrieve audit logs with filtering and pagination
   */
  async getLogs({ page = 1, limit = 50, action, resource, status, search }) {
    const offset = (page - 1) * limit;
    const where = {};

    if (action) where.action = action;
    if (resource) where.resource = resource;
    if (status) where.status = status;

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });

    return {
      total: count,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(count / limit),
      logs: rows
    };
  }
}

module.exports = new AuditService();
