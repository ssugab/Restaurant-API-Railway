const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

const sequelize = require('./scr/config/sequelize');

const menuRoutes = require('./scr/routes/menu');
const orderRoutes = require('./scr/routes/orders');
const userRoutes = require('./scr/routes/users');
const kategoriRoutes = require('./scr/routes/kategori');
const paymentRoutes = require('./scr/routes/payment');
const authRoutes = require('./scr/routes/auth');
const apikeyRoutes = require('./scr/routes/apikey');

const app = express();

// CORS configuration - Allow all Vercel domains and specific origins
const corsOptions = {
  origin: true, // Allow all origins for now - will be filtered by manual middleware
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Origin', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// Debug CORS configuration
console.log('🔧 CORS Configuration:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL);

// Middleware - Apply CORS first
app.use(cors(corsOptions));

// Manual CORS middleware with better logging
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const timestamp = new Date().toISOString();
  
  console.log(`\n🌐 [${timestamp}] ${req.method} ${req.url}`);
  console.log(`   Origin: ${origin || 'NO-ORIGIN'}`);

  // List of allowed origins
  const allowedOrigins = [
    'https://restaurant-fe-vercel.vercel.app',
    'https://pemesanan-menu-restoran-7adgfgi28-bagus-projects-d637296f.vercel.app',
    'https://pemesanan-menu-restoran-api.vercel.app',
    'https://pemesanan-menu-restoran.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5500'
  ];

  // Set CORS headers for allowed origins
  if (!origin) {
    // No origin (Postman, mobile apps, etc.)
    console.log('   ✅ NO ORIGIN - Allowing request');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, Origin, X-Requested-With, Accept');
  }
  else if (allowedOrigins.includes(origin)) {
    console.log('   ✅ ALLOWED ORIGIN - Setting CORS headers for:', origin);
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, Origin, X-Requested-With, Accept');
    res.header('Access-Control-Expose-Headers', 'Authorization');
  }
  else if (origin && origin.includes('vercel.app')) {
    // Allow all Vercel domains as fallback
    console.log('   ⚠️  VERCEL DOMAIN - Allowing as fallback:', origin);
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, Origin, X-Requested-With, Accept');
    res.header('Access-Control-Expose-Headers', 'Authorization');
  }
  else if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    console.log('   ✅ LOCALHOST - Allowing for development:', origin);
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, Origin, X-Requested-With, Accept');
    res.header('Access-Control-Expose-Headers', 'Authorization');
  }
  else {
    console.log('   ❌ BLOCKED ORIGIN:', origin);
    console.log('   📋 Allowed origins:', allowedOrigins);
  }

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    console.log('   🔄 PREFLIGHT OPTIONS - Returning 200 OK');
    return res.status(200).end();
  }

  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (untuk test files dan dokumentasi)
app.use(express.static('./', {
  index: false, // Disable directory indexing
  maxAge: '1d'  // Cache for 1 day
}));

// Additional logging for debug
app.use((req, res, next) => {
  // Skip logging if already handled by CORS middleware
  if (req.method !== 'OPTIONS') {
    const userAgent = req.headers['user-agent'] || 'no-user-agent';
    console.log(`   User-Agent: ${userAgent.substring(0, 80)}...`);
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', authRoutes); // Authentication routes (login & register)
app.use('/api/users', userRoutes); // User CRUD and login/register
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/kategori', kategoriRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api', apikeyRoutes);

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

// CORS Test endpoint - JSON response untuk testing
app.get('/cors-test', (req, res) => {
  const origin = req.headers.origin;
  const corsInfo = {
    message: '✅ CORS Test Berhasil!',
    timestamp: new Date().toISOString(),
    requestOrigin: origin,
    method: req.method,
    headers: {
      'Access-Control-Allow-Origin': res.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Credentials': res.get('Access-Control-Allow-Credentials'),
      'Access-Control-Allow-Methods': res.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': res.get('Access-Control-Allow-Headers')
    },
    note: 'Jika Anda bisa melihat response ini dari frontend Vercel, maka CORS sudah bekerja dengan benar!'
  };
  
  console.log('🧪 CORS Test accessed from:', origin);
  res.json(corsInfo);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Database connection and server start
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync all models
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('All models were synchronized successfully.');

    // Auto-seed database if RUN_SEED is true
    if (process.env.RUN_SEED === 'true') {
      console.log('🌱 RUN_SEED is enabled, seeding database...');
      try {
        const seedDatabase = require('./seed-database');
        await seedDatabase();
        console.log('✅ Database seeded successfully!');
      } catch (seedError) {
        console.error('❌ Error seeding database:', seedError);
        // Don't exit, continue with server startup
      }
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      if (process.env.RUN_SEED === 'true') {
        console.log('🌱 Auto-seed was enabled for this startup');
      }
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();