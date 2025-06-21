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
  origin: function (origin, callback) {
    console.log('🔍 CORS Origin Check:', origin);
    
    // Allow requests with no origin (mobile apps, postman, etc.)
    if (!origin) {
      console.log('✅ No origin - allowing request');
      return callback(null, true);
    }

    // List of allowed origins
    const allowedOrigins = [
      'https://restaurant-fe-vercel.vercel.app',
      'https://pemesanan-menu-restoran-7adgfgi28-bagus-projects-d637296f.vercel.app',
      'https://pemesanan-menu-restoran-api.vercel.app',
      'https://pemesanan-menu-restoran.vercel.app',
      'http://localhost:3000',
      'http://127.0.0.1:3000', 
      'http://localhost:5500',
      process.env.FRONTEND_URL
    ].filter(Boolean); // Remove null/undefined entries

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log('✅ Origin allowed from static list:', origin);
      return callback(null, true);
    }

    // Check patterns for Vercel domains
    const vercelPatterns = [
      /^https:\/\/restaurant-fe-vercel.*\.vercel\.app$/,
      /^https:\/\/pemesanan-menu-restoran.*\.vercel\.app$/,
      /^https:\/\/.*bagus-projects-d637296f\.vercel\.app$/,
      /^https:\/\/.*\.vercel\.app$/
    ];

    for (const pattern of vercelPatterns) {
      if (pattern.test(origin)) {
        console.log('✅ Origin allowed by pattern:', origin, 'Pattern:', pattern);
        return callback(null, true);
      }
    }

    console.log('❌ Origin not allowed:', origin);
    console.log('📋 Allowed origins:', allowedOrigins);
    callback(new Error('Not allowed by CORS'));
  },
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

// Simplified and robust CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  console.log('🌐 Request:', req.method, req.url, 'from origin:', origin);

  // Always set CORS headers for known domains
  const allowedOrigins = [
    'https://restaurant-fe-vercel.vercel.app',
    'https://pemesanan-menu-restoran-7adgfgi28-bagus-projects-d637296f.vercel.app',
    'https://pemesanan-menu-restoran-api.vercel.app',
    'https://pemesanan-menu-restoran.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5500'
  ];

  // Check exact match first
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, Origin, X-Requested-With, Accept');
    res.header('Access-Control-Expose-Headers', 'Authorization');
    console.log('✅ CORS allowed for:', origin);
  } 
  // Check Vercel patterns
  else if (origin && origin.includes('vercel.app') && 
           (origin.includes('restaurant-fe-vercel') || 
            origin.includes('pemesanan-menu-restoran') || 
            origin.includes('bagus-projects-d637296f'))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, Origin, X-Requested-With, Accept');
    res.header('Access-Control-Expose-Headers', 'Authorization');
    console.log('✅ CORS allowed for Vercel domain:', origin);
  }
  // For development and testing - allow all localhost
  else if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, Origin, X-Requested-With, Accept');
    res.header('Access-Control-Expose-Headers', 'Authorization');
    console.log('✅ CORS allowed for localhost:', origin);
  }
  else if (origin) {
    console.log('❌ CORS blocked for:', origin);
  }

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    console.log('🔄 OPTIONS preflight - sending 200');
    res.status(200).end();
    return;
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

// Enhanced request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const origin = req.headers.origin || 'no-origin';
  const userAgent = req.headers['user-agent'] || 'no-user-agent';
  
  console.log(`📝 ${timestamp} - ${req.method} ${req.url}`);
  console.log(`   Origin: ${origin}`);
  console.log(`   User-Agent: ${userAgent.substring(0, 100)}...`);
  
  // Log CORS-related headers
  if (req.method === 'OPTIONS') {
    console.log('   🔄 PREFLIGHT REQUEST');
    console.log('   Access-Control-Request-Method:', req.headers['access-control-request-method']);
    console.log('   Access-Control-Request-Headers:', req.headers['access-control-request-headers']);
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