const authService = require('../services/authService');
const auditService = require('../services/auditService');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const reqInfo = {
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent']
      };

      const result = await authService.login(email.trim().toLowerCase(), password, reqInfo);
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message || 'Authentication failed'
      });
    }
  }

  async getProfile(req, res, next) {
    try {
      const profile = await authService.getProfile(req.user.id);
      return res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async logout(req, res, next) {
    try {
      if (req.user) {
        await auditService.log({
          userId: req.user.id,
          userEmail: req.user.email,
          userRole: req.user.role,
          action: 'LOGOUT',
          resource: 'auth',
          status: 'SUCCESS',
          ipAddress: req.ip || req.connection?.remoteAddress,
          userAgent: req.headers['user-agent'],
          details: 'User logged out voluntarily'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
