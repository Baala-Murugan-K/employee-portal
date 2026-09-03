const jwt = require('jsonwebtoken');
const auditService = require('../services/auditService');

/**
 * Role-Based Access Control (RBAC) Middleware
 * Verifies if user has one of the allowed roles.
 * Supports both direct call (if token already verified by verifyToken)
 * and standalone verification with JWT header extraction as in reference snippet.
 * 
 * @param {Array<string>} allowedRoles 
 */
const verifyRole = (allowedRoles) => {
  return async (req, res, next) => {
    let decoded = req.user;

    // If req.user is not yet populated by verifyToken, inspect authorization header directly
    if (!decoded) {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const token = authHeader.split(' ')[1];
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
      } catch (err) {
        return res.status(401).json({ message: 'Invalid Token' });
      }
    }

    // Determine user's roles
    const userRole = decoded.role;
    const userRoles = Array.isArray(decoded.roles) ? decoded.roles : (userRole ? [userRole] : []);

    // Check if user's role is permitted (either exact role or included in roles list)
    const hasPermission = allowedRoles.includes(userRole) || userRoles.some(r => allowedRoles.includes(r));

    if (!hasPermission) {
      // Record unauthorized attempt in AuditLog
      await auditService.log({
        userId: decoded.id,
        userEmail: decoded.email,
        userRole: userRole || userRoles.join(', '),
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        resource: req.originalUrl,
        status: 'FORBIDDEN',
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        details: `User role [${userRole || userRoles.join(',')}] attempted to access resource requiring one of: [${allowedRoles.join(', ')}]`
      });

      return res.status(403).json({
        success: false,
        message: 'Access Denied: Insufficient Permissions'
      });
    }

    next();
  };
};

/**
 * Permission-based verification middleware
 * Checks if user holds a specific fine-grained permission.
 */
const verifyPermission = (permissionName) => {
  return async (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userPermissions = user.permissions || [];
    const isAllowed = user.role === 'Admin' || (user.roles && user.roles.includes('Admin')) || userPermissions.includes(permissionName);

    if (!isAllowed) {
      await auditService.log({
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        action: 'INSUFFICIENT_PERMISSION',
        resource: req.originalUrl,
        status: 'FORBIDDEN',
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        details: `Missing required permission: ${permissionName}`
      });

      return res.status(403).json({
        success: false,
        message: `Forbidden: Missing required permission [${permissionName}]`
      });
    }

    next();
  };
};

module.exports = {
  verifyRole,
  verifyPermission
};
