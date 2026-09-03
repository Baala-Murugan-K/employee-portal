const bcrypt = require('bcryptjs');
const { User, Role, UserRole, Permission, AuditLog, sequelize } = require('../models');
const auditService = require('../services/auditService');

class AdminController {
  /**
   * Get all users with roles
   */
  async getUsers(req, res, next) {
    try {
      const users = await User.findAll({
        attributes: ['id', 'name', 'email', 'department', 'is_active', 'createdAt', 'updatedAt'],
        include: [
          {
            model: Role,
            as: 'roles',
            attributes: ['id', 'name', 'description'],
            through: { attributes: [] }
          }
        ],
        order: [['id', 'ASC']]
      });

      const formatted = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        department: u.department,
        isActive: u.is_active,
        roles: u.roles.map(r => r.name),
        primaryRole: u.roles[0]?.name || 'Employee',
        createdAt: u.createdAt
      }));

      return res.status(200).json({
        success: true,
        count: formatted.length,
        users: formatted
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new employee
   */
  async createUser(req, res, next) {
    const t = await sequelize.transaction();
    try {
      const { name, email, password, department, roleName } = req.body;

      if (!name || !email || !password) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required'
        });
      }

      // Check for existing user
      const existing = await User.findOne({ where: { email: email.trim().toLowerCase() } });
      if (existing) {
        await t.rollback();
        return res.status(409).json({
          success: false,
          message: 'A user with this email already exists'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password_hash,
        department: department || 'General',
        is_active: true
      }, { transaction: t });

      // Assign role
      const targetRoleName = roleName || 'Employee';
      let role = await Role.findOne({ where: { name: targetRoleName } });
      if (!role) {
        role = await Role.findOne({ where: { name: 'Employee' } });
      }

      if (role) {
        await UserRole.create({
          user_id: newUser.id,
          role_id: role.id
        }, { transaction: t });
      }

      await t.commit();

      await auditService.log({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: 'CREATE_USER',
        resource: 'users',
        status: 'SUCCESS',
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        details: `Created new user ${newUser.email} with role ${targetRoleName}`
      });

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          department: newUser.department,
          role: targetRoleName
        }
      });
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  /**
   * Update user details and role
   */
  async updateUser(req, res, next) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { name, department, roleName, isActive, password } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (name) user.name = name.trim();
      if (department !== undefined) user.department = department;
      if (isActive !== undefined) user.is_active = Boolean(isActive);

      if (password && password.length >= 6) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(password, salt);
      }

      await user.save({ transaction: t });

      // Update role if specified
      if (roleName) {
        const role = await Role.findOne({ where: { name: roleName } });
        if (role) {
          await UserRole.destroy({ where: { user_id: user.id }, transaction: t });
          await UserRole.create({ user_id: user.id, role_id: role.id }, { transaction: t });
        }
      }

      await t.commit();

      await auditService.log({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: 'UPDATE_USER',
        resource: 'users',
        status: 'SUCCESS',
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        details: `Updated user ID ${user.id} (${user.email})`
      });

      return res.status(200).json({
        success: true,
        message: 'User updated successfully'
      });
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  /**
   * Delete user
   */
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      if (parseInt(id, 10) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own account'
        });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Remove roles and user
      await UserRole.destroy({ where: { user_id: id } });
      await user.destroy();

      await auditService.log({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: 'DELETE_USER',
        resource: 'users',
        status: 'SUCCESS',
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        details: `Deleted user ${user.email} (ID ${id})`
      });

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieve Audit Logs with pagination and filters
   */
  async getAuditLogs(req, res, next) {
    try {
      const { page = 1, limit = 50, action, resource, status } = req.query;
      const result = await auditService.getLogs({ page, limit, action, resource, status });

      return res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get system summary metrics
   */
  async getSystemStats(req, res, next) {
    try {
      const [totalUsers, activeUsers, totalLogs, roles] = await Promise.all([
        User.count(),
        User.count({ where: { is_active: true } }),
        AuditLog.count(),
        Role.findAll({
          include: [{ model: User, as: 'users', attributes: ['id'] }]
        })
      ]);

      const roleBreakdown = roles.map(r => ({
        role: r.name,
        userCount: r.users ? r.users.length : 0
      }));

      return res.status(200).json({
        success: true,
        stats: {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers,
          totalAuditEvents: totalLogs,
          roleBreakdown
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
