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

// Using manual CORS middleware instead of cors() library for better control

// Debug CORS configuration
console.log('🔧 CORS Configuration:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('- Server will allow these origins:');
console.log('  * https://restaurant-fe-vercel.vercel.app');
console.log('  * https://pemesanan-menu-restoran-7adgfgi28-bagus-projects-d637296f.vercel.app');
console.log('  * https://pemesanan-menu-restoran-api.vercel.app');
console.log('  * https://pemesanan-menu-restoran.vercel.app');
console.log('  * All *.vercel.app domains (fallback)');
console.log('  * localhost and 127.0.0.1 (development)');

// Comprehensive CORS middleware - Handles everything in one place
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

  // ALWAYS set CORS headers first - simplified approach
  try {
    // Always allow the requesting origin for Vercel domains or localhost
    if (!origin) {
      // No origin (Postman, mobile apps, etc.)
      console.log('   ✅ NO ORIGIN - Setting wildcard CORS');
      res.header('Access-Control-Allow-Origin', '*');
    } else if (allowedOrigins.includes(origin) || 
               origin.includes('vercel.app') || 
               origin.includes('localhost') || 
               origin.includes('127.0.0.1')) {
      console.log('   ✅ ALLOWED ORIGIN - Setting CORS for:', origin);
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    } else {
      // Even for unknown origins, set basic CORS to avoid browser errors
      console.log('   ⚠️  UNKNOWN ORIGIN - Setting basic CORS for:', origin);
      res.header('Access-Control-Allow-Origin', origin);
    }

    // Always set these headers
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, Origin, X-Requested-With, Accept');
    res.header('Access-Control-Expose-Headers', 'Authorization');

    // Log final headers set
    console.log('   📋 CORS Headers Set:', {
      'Access-Control-Allow-Origin': res.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': res.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': res.get('Access-Control-Allow-Headers')
    });

    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      console.log('   🔄 PREFLIGHT - Sending 200 OK with CORS headers');
      return res.status(200).end();
    }

    next();
  } catch (error) {
    console.error('❌ Error in CORS middleware:', error);
    // Fallback CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, Origin, X-Requested-With, Accept');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  }
});

// Additional CORS safety net - always set basic CORS headers
app.use((req, res, next) => {
  // Backup CORS headers in case main middleware fails
  if (!res.get('Access-Control-Allow-Origin')) {
    console.log('🔧 BACKUP CORS: Setting fallback headers');
    const origin = req.headers.origin;
    if (origin && (origin.includes('vercel.app') || origin.includes('localhost'))) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    } else {
      res.header('Access-Control-Allow-Origin', '*');
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, Origin, X-Requested-With, Accept');
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

// Routes with logging
console.log('🔗 Registering routes...');
app.use('/api/auth', (req, res, next) => {
  console.log(`   🔐 AUTH ROUTE: ${req.method} ${req.originalUrl}`);
  next();
}, authRoutes); // Authentication routes (login & register)

app.use('/api/users', userRoutes); // User CRUD and login/register
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/kategori', kategoriRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api', apikeyRoutes);

console.log('✅ All routes registered successfully');

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

// Debug routes - Show all registered routes
app.get('/debug-routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) { // Routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') { // Router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  
  res.json({
    message: 'Available routes',
    routes: routes,
    timestamp: new Date().toISOString()
  });
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

// Special debug endpoint for CORS issues
app.all('/debug-cors', (req, res) => {
  const origin = req.headers.origin;
  console.log('🔍 DEBUG CORS - Method:', req.method, 'Origin:', origin);
  
  // Force set CORS headers
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, Origin, X-Requested-With, Accept');
  
  if (req.method === 'OPTIONS') {
    console.log('🔍 DEBUG CORS - Handling OPTIONS preflight');
    return res.status(200).end();
  }
  
  res.json({
    message: 'CORS Debug endpoint',
    method: req.method,
    origin: origin,
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

// Error handling middleware with CORS headers
app.use((err, req, res, next) => {
  console.error('❌ Error occurred:', err);
  
  // Ensure CORS headers are set even on error
  const origin = req.headers.origin;
  if (origin && (origin.includes('vercel.app') || origin.includes('localhost'))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, Origin, X-Requested-With, Accept');
  
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler with CORS
app.use('*', (req, res) => {
  // Ensure CORS headers are set even for 404
  const origin = req.headers.origin;
  if (origin && (origin.includes('vercel.app') || origin.includes('localhost'))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, Origin, X-Requested-With, Accept');
  
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