const bcrypt = require('bcryptjs');
const { sequelize, User, Role, Permission, UserRole, RolePermission, AuditLog } = require('../models');

async function seedDatabase() {
  console.log('🔄 Initializing database sync...');
  await sequelize.sync({ force: true });
  console.log('✅ Relational database schema synchronized successfully.');

  console.log('🌱 Seeding initial roles...');
  const rolesData = [
    { name: 'Admin', description: 'Full access to portal, all Zoho services, user & role management, and audit logs' },
    { name: 'HR', description: 'Human Resources management and access to Zoho People' },
    { name: 'Sales', description: 'Sales operations, leads pipeline, and access to Zoho CRM' },
    { name: 'Support', description: 'Customer support, helpdesk ticketing, and access to Zoho Desk' },
    { name: 'Finance', description: 'Financial accounting, invoicing, billing, and access to Zoho Books' },
    { name: 'Manager', description: 'Departmental team management and overview' }
  ];

  const createdRoles = {};
  for (const r of rolesData) {
    createdRoles[r.name] = await Role.create(r);
  }
  console.log(`✅ Seeded ${Object.keys(createdRoles).length} roles.`);

  console.log('🌱 Seeding permissions...');
  const permissionsData = [
    { name: 'access:zoho_people', module: 'zoho_people', description: 'Access Zoho People HR application' },
    { name: 'access:zoho_crm', module: 'zoho_crm', description: 'Access Zoho CRM sales pipeline application' },
    { name: 'access:zoho_desk', module: 'zoho_desk', description: 'Access Zoho Desk customer support application' },
    { name: 'access:zoho_books', module: 'zoho_books', description: 'Access Zoho Books financial accounting application' },
    { name: 'manage:users', module: 'admin', description: 'Create, update, and deactivate portal users' },
    { name: 'manage:roles', module: 'admin', description: 'Manage role assignments and access rules' },
    { name: 'view:audit_logs', module: 'admin', description: 'Inspect audit trail and security access events' },
    { name: 'manage:settings', module: 'admin', description: 'Configure Zoho service account credentials' }
  ];

  const createdPermissions = {};
  for (const p of permissionsData) {
    createdPermissions[p.name] = await Permission.create(p);
  }
  console.log(`✅ Seeded ${Object.keys(createdPermissions).length} permissions.`);

  console.log('🌱 Mapping role permissions...');
  // Admin: All permissions
  for (const permKey in createdPermissions) {
    await RolePermission.create({
      role_id: createdRoles['Admin'].id,
      permission_id: createdPermissions[permKey].id
    });
  }

  // HR: access:zoho_people
  await RolePermission.create({ role_id: createdRoles['HR'].id, permission_id: createdPermissions['access:zoho_people'].id });

  // Sales: access:zoho_crm
  await RolePermission.create({ role_id: createdRoles['Sales'].id, permission_id: createdPermissions['access:zoho_crm'].id });

  // Support: access:zoho_desk
  await RolePermission.create({ role_id: createdRoles['Support'].id, permission_id: createdPermissions['access:zoho_desk'].id });

  // Finance: access:zoho_books
  await RolePermission.create({ role_id: createdRoles['Finance'].id, permission_id: createdPermissions['access:zoho_books'].id });

  // Manager: access:zoho_people + access:zoho_crm
  await RolePermission.create({ role_id: createdRoles['Manager'].id, permission_id: createdPermissions['access:zoho_people'].id });
  await RolePermission.create({ role_id: createdRoles['Manager'].id, permission_id: createdPermissions['access:zoho_crm'].id });
  console.log('✅ Mapped role-permission associations.');

  console.log('🌱 Creating default demo users for each role...');
  const salt = await bcrypt.genSalt(10);

  const demoUsers = [
    {
      name: 'Alexander Wright',
      email: 'admin@portal.com',
      password: 'admin123',
      department: 'Executive IT & Operations',
      role: 'Admin'
    },
    {
      name: 'Sarah Connor',
      email: 'hr@portal.com',
      password: 'hr123',
      department: 'Human Resources',
      role: 'HR'
    },
    {
      name: 'Michael Scott',
      email: 'sales@portal.com',
      password: 'sales123',
      department: 'Direct Enterprise Sales',
      role: 'Sales'
    },
    {
      name: 'Rachel Green',
      email: 'support@portal.com',
      password: 'support123',
      department: 'Customer Success & Support',
      role: 'Support'
    },
    {
      name: 'Harvey Specter',
      email: 'finance@portal.com',
      password: 'finance123',
      department: 'Finance & Accounting',
      role: 'Finance'
    },
    {
      name: 'David Wallace',
      email: 'manager@portal.com',
      password: 'manager123',
      department: 'Regional Management',
      role: 'Manager'
    }
  ];

  for (const u of demoUsers) {
    const password_hash = await bcrypt.hash(u.password, salt);
    const user = await User.create({
      name: u.name,
      email: u.email,
      password_hash,
      department: u.department,
      is_active: true
    });

    const roleObj = createdRoles[u.role];
    if (roleObj) {
      await UserRole.create({
        user_id: user.id,
        role_id: roleObj.id
      });
    }
  }
  console.log(`✅ Seeded ${demoUsers.length} users with hashed credentials.`);

  console.log('🌱 Recording initial system audit logs...');
  await AuditLog.create({
    user_id: 1,
    user_email: 'admin@portal.com',
    user_role: 'Admin',
    action: 'SYSTEM_INITIALIZATION',
    resource: 'database',
    status: 'SUCCESS',
    ipAddress: '127.0.0.1',
    user_agent: 'DatabaseSeeder/1.0',
    details: 'Database initialized and seeded with Admin, HR, Sales, Support, and Finance roles.'
  });

  console.log('🎉 Database seeding completed successfully!');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ Seeding error:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
