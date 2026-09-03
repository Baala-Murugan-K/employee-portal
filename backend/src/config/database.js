const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const dialect = process.env.DB_DIALECT || 'sqlite';

let sequelize;

if (dialect === 'sqlite') {
  const storagePath = path.resolve(__dirname, '../../database.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: process.env.NODE_ENV === 'test' ? false : false,
    define: {
      timestamps: true,
      underscored: true
    }
  });
} else {
  // Config for PostgreSQL / MySQL if configured
  sequelize = new Sequelize(
    process.env.DB_NAME || 'zoho_portal',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || (dialect === 'postgres' ? 5432 : 3306),
      dialect: dialect,
      logging: false,
      define: {
        timestamps: true,
        underscored: true
      }
    }
  );
}

module.exports = sequelize;
