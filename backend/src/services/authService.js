const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role, Permission } = require('../models');
const auditService = require('./auditService');

class AuthService {
  /**
   * Authenticate a portal user and return a signed JWT
   */
  async login(email, password, reqInfo = {}) {
    const { ip = '127.0.0.1', userAgent = '' } = reqInfo;

    // Look up user including assigned roles and permissions
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    if (!user) {
      await auditService.log({
        userEmail: email,
        action: 'LOGIN_ATTEMPT',
        resource: 'auth',
        status: 'FAILED',
        ipAddress: ip,
        userAgent,
        details: 'User does not exist'
      });
      throw new Error('Invalid email or password');
    }

    if (!user.is_active) {
      await auditService.log({
        userId: user.id,
        userEmail: email,
        action: 'LOGIN_ATTEMPT',
        resource: 'auth',
        status: 'FORBIDDEN',
        ipAddress: ip,
        userAgent,
        details: 'Account is deactivated'
      });
      throw new Error('Your account has been deactivated. Please contact an administrator.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      await auditService.log({
        userId: user.id,
        userEmail: email,
        action: 'LOGIN_ATTEMPT',
        resource: 'auth',
        status: 'FAILED',
        ipAddress: ip,
        userAgent,
        details: 'Incorrect password provided'
      });
      throw new Error('Invalid email or password');
    }

    // Extract roles and flat list of permissions
    const roles = user.roles.map(r => r.name);
    const primaryRole = roles[0] || 'Employee';
    const permissionsSet = new Set();
    user.roles.forEach(role => {
      if (role.permissions) {
        role.permissions.forEach(perm => permissionsSet.add(perm.name));
      }
    });
    const permissions = Array.from(permissionsSet);

    // Payload strictly matching assignment requirements
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      department: user.department,
      role: primaryRole, // single role compatibility for verifyRole snippet in assignment
      roles: roles,
      permissions: permissions
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    });

    // Record successful login in audit logs
    await auditService.log({
      userId: user.id,
      userEmail: user.email,
      userRole: primaryRole,
      action: 'LOGIN',
      resource: 'auth',
      status: 'SUCCESS',
      ipAddress: ip,
      userAgent,
      details: `User authenticated successfully with role: ${primaryRole}`
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: primaryRole,
        roles,
        permissions
      }
    };
  }

  /**
   * Fetch current user profile with roles and permissions
   */
  async getProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'department', 'is_active', 'createdAt'],
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    if (!user) throw new Error('User not found');

    const roles = user.roles.map(r => r.name);
    const permissionsSet = new Set();
    user.roles.forEach(role => {
      if (role.permissions) {
        role.permissions.forEach(perm => permissionsSet.add(perm.name));
      }
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      department: user.department,
      isActive: user.is_active,
      createdAt: user.createdAt,
      role: roles[0] || 'Employee',
      roles,
      permissions: Array.from(permissionsSet)
    };
  }
}

module.exports = new AuthService();
