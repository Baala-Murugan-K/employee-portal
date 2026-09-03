const jwt = require('jsonwebtoken');
const auditService = require('../services/auditService');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No authorization token provided'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    // Log invalid token attempt
    auditService.log({
      action: 'INVALID_TOKEN',
      resource: req.originalUrl,
      status: 'FAILED',
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      details: err.message
    });

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authorization token'
    });
  }
};

module.exports = verifyToken;
