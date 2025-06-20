require('dotenv').config();

console.log('=== DATABASE DEBUGGING ===');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Check all possible database variables
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('MYSQL_URL exists:', !!process.env.MYSQL_URL);
console.log('MYSQL_PUBLIC_URL exists:', !!process.env.MYSQL_PUBLIC_URL);
console.log('MYSQL_HOST exists:', !!process.env.MYSQL_HOST);
console.log('MYSQL_USER exists:', !!process.env.MYSQL_USER);
console.log('MYSQL_PASSWORD exists:', !!process.env.MYSQL_PASSWORD);
console.log('MYSQL_DATABASE exists:', !!process.env.MYSQL_DATABASE);
console.log('MYSQL_PORT exists:', !!process.env.MYSQL_PORT);

// Show all DB/MYSQL related env vars
console.log('All DB-related env vars:', Object.keys(process.env).filter(key => 
  key.includes('DB') || key.includes('MYSQL') || key.includes('DATABASE')
));

// Test connection with priority
const { Sequelize } = require('sequelize');
let sequelize;
let connectionType = '';

// Priority 1: Public URL (untuk menghindari internal hostname issues)
if (process.env.MYSQL_PUBLIC_URL) {
  const connectionString = process.env.MYSQL_PUBLIC_URL;
  console.log('Using PUBLIC connection string:', connectionString.replace(/:[^:@]*@/, ':***@'));
  connectionType = 'MYSQL_PUBLIC_URL';
  sequelize = new Sequelize(connectionString, {
    dialect: 'mysql',
    logging: console.log,
    dialectOptions: {
      ssl: false,
      family: 4
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000
    },
    retry: {
      match: [/ETIMEDOUT/, /EHOSTUNREACH/, /ECONNRESET/, /ECONNREFUSED/, /ETIMEDOUT/, /ESOCKETTIMEDOUT/, /EHOSTUNREACH/, /EPIPE/, /EAI_AGAIN/, /SequelizeConnectionError/, /SequelizeConnectionRefusedError/, /SequelizeHostNotFoundError/, /SequelizeInvalidConnectionError/, /SequelizeConnectionTimedOutError/],
      max: 3
    }
  });
} 
// Priority 2: Regular connection string (fallback)
else if (process.env.MYSQL_URL || process.env.DATABASE_URL) {
  const connectionString = process.env.MYSQL_URL || process.env.DATABASE_URL;
  console.log('Using connection string:', connectionString.replace(/:[^:@]*@/, ':***@'));
  connectionType = 'Connection String';
  sequelize = new Sequelize(connectionString, {
    dialect: 'mysql',
    logging: console.log,
    dialectOptions: {
      ssl: false,
      family: 4
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000
    },
    retry: {
      match: [/ETIMEDOUT/, /EHOSTUNREACH/, /ECONNRESET/, /ECONNREFUSED/, /ETIMEDOUT/, /ESOCKETTIMEDOUT/, /EHOSTUNREACH/, /EPIPE/, /EAI_AGAIN/, /SequelizeConnectionError/, /SequelizeConnectionRefusedError/, /SequelizeHostNotFoundError/, /SequelizeInvalidConnectionError/, /SequelizeConnectionTimedOutError/],
      max: 3
    }
  });
} 
// Priority 3: Separate variables
else if (process.env.MYSQL_HOST && process.env.MYSQL_USER) {
  console.log('Using separate variables:');
  console.log('- Host:', process.env.MYSQL_HOST);
  console.log('- User:', process.env.MYSQL_USER);
  console.log('- Database:', process.env.MYSQL_DATABASE || 'railway');
  console.log('- Port:', process.env.MYSQL_PORT || 3306);
  connectionType = 'Separate Variables';
  sequelize = new Sequelize(
    process.env.MYSQL_DATABASE || 'railway',
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT || 3306,
      dialect: 'mysql',
      logging: console.log,
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
} else {
  console.log('❌ No database variables found');
  console.log('Available env vars:', Object.keys(process.env).filter(key => 
    key.includes('DB') || key.includes('MYSQL') || key.includes('DATABASE')
  ));
  process.exit(1);
}

async function testConnection() {
  try {
    console.log(`\n🔍 Testing connection with: ${connectionType}`);
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testConnection(); 