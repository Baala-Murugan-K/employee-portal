const { Role, Permission } = require('../models');

class RoleController {
  async getRoles(req, res, next) {
    try {
      const roles = await Role.findAll({
        include: [
          {
            model: Permission,
            as: 'permissions',
            through: { attributes: [] }
          }
        ]
      });

      return res.status(200).json({
        success: true,
        roles
      });
    } catch (error) {
      next(error);
    }
  }

  async getPermissions(req, res, next) {
    try {
      const permissions = await Permission.findAll();
      return res.status(200).json({
        success: true,
        permissions
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RoleController();
