const { Sequelize } = require('sequelize');
require('dotenv').config();

// Priority 1: Public URL (untuk menghindari internal hostname issues)
if (process.env.MYSQL_PUBLIC_URL) {
  console.log('🔗 Using MYSQL_PUBLIC_URL for database connection');
  const sequelize = new Sequelize(process.env.MYSQL_PUBLIC_URL, {
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: false,
      family: 4,
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000
    },
    retry: {
      match: [/ETIMEDOUT/, /EHOSTUNREACH/, /ECONNRESET/, /ECONNREFUSED/, /ESOCKETTIMEDOUT/, /EHOSTUNREACH/, /EPIPE/, /EAI_AGAIN/, /SequelizeConnectionError/, /SequelizeConnectionRefusedError/, /SequelizeHostNotFoundError/, /SequelizeInvalidConnectionError/, /SequelizeConnectionTimedOutError/],
      max: 3
    }
  });
  module.exports = sequelize;
} 
// Priority 2: Regular connection string (fallback)
else if (process.env.MYSQL_URL || process.env.DATABASE_URL) {
  console.log('🔗 Using MYSQL_URL/DATABASE_URL for database connection');
  const connectionString = process.env.MYSQL_URL || process.env.DATABASE_URL;
  const sequelize = new Sequelize(connectionString, {
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: false,
      family: 4,
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000
    },
    retry: {
      match: [/ETIMEDOUT/, /EHOSTUNREACH/, /ECONNRESET/, /ECONNREFUSED/, /ESOCKETTIMEDOUT/, /EHOSTUNREACH/, /EPIPE/, /EAI_AGAIN/, /SequelizeConnectionError/, /SequelizeConnectionRefusedError/, /SequelizeHostNotFoundError/, /SequelizeInvalidConnectionError/, /SequelizeConnectionTimedOutError/],
      max: 3
    }
  });
  module.exports = sequelize;
} 
// Priority 3: Separate variables (Railway fallback)
else if (process.env.MYSQL_HOST && process.env.MYSQL_USER) {
  console.log('🔗 Using separate MYSQL variables for database connection');
  const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE || 'railway',
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT || 3306,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: {
        ssl: false,
        family: 4,
        connectTimeout: 60000,
        acquireTimeout: 60000,
        timeout: 60000
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 60000,
        idle: 10000
      },
      retry: {
        match: [/ETIMEDOUT/, /EHOSTUNREACH/, /ECONNRESET/, /ECONNREFUSED/, /ESOCKETTIMEDOUT/, /EHOSTUNREACH/, /EPIPE/, /EAI_AGAIN/, /SequelizeConnectionError/, /SequelizeConnectionRefusedError/, /SequelizeHostNotFoundError/, /SequelizeInvalidConnectionError/, /SequelizeConnectionTimedOutError/],
        max: 3
      }
    }
  );
  module.exports = sequelize;
} 
// Local development (prioritas ketiga)
else {
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'restoran', 
    process.env.DB_USER || 'root', 
    process.env.DB_PASSWORD || '1234', {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  });
  module.exports = sequelize;
} 