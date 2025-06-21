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

// ==========================
// ✅ CORS Configuration
// ==========================
const allowedOrigins = [
  'https://menu-restaurant-fe.vercel.app',
  'https://menu-restaurant-fe-ver2.vercel.app',
  'https://menu-restaurant-fe-ver2-git-main-bagus-projects-d637296f.vercel.app',
  'https://menu-restaurant-fe-ver2-e3ox9jqbo-bagus-projects-d637296f.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5500'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('❌ CORS Blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Origin', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Authorization']
};

app.use(cors(corsOptions));

// ==========================
// ✅ Core Middleware
// ==========================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(express.static('./', {
  index: false,
  maxAge: '1d'
}));

// ==========================
// ✅ Logging
// ==========================
app.use((req, res, next) => {
  if (req.method !== 'OPTIONS') {
    const userAgent = req.headers['user-agent'] || 'no-user-agent';
    console.log(`   User-Agent: ${userAgent.substring(0, 80)}...`);
  }
  next();
});

// ==========================
// ✅ Health Check
// ==========================
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ==========================
// ✅ API Routes
// ==========================
console.log('🔗 Registering routes...');
app.use('/api/auth', (req, res, next) => {
  console.log(`   🔐 AUTH ROUTE: ${req.method} ${req.originalUrl}`);
  next();
}, authRoutes);

app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/kategori', kategoriRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api', apikeyRoutes);

console.log('✅ All routes registered successfully');

// ==========================
// ✅ Manual Seed Endpoint
// ==========================
app.get('/api/seed', async (req, res) => {
  try {
    console.log('🌱 Manual seed database triggered...');
    const seedDatabase = require('./seed-database');
    await seedDatabase();
    res.json({
      success: true,
      message: '✅ Database seeded successfully!',
      timestamp: new Date().toISOString(),
      data: {
        users: '3 admin accounts created',
        categories: '3 categories created',
        menus: '100+ menu items created'
      }
    });
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed database',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==========================
// ✅ Test Endpoints
// ==========================
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

app.get('/cors-test', (req, res) => {
  const origin = req.headers.origin;
  res.json({
    message: '✅ CORS Test Berhasil!',
    origin: origin,
    timestamp: new Date().toISOString(),
    note: 'Jika Anda melihat ini dari frontend, maka CORS sudah berjalan.'
  });
});

app.get('/debug-routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
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

// ==========================
// ✅ Error Handling
// ==========================
app.use((err, req, res, next) => {
  console.error('❌ Error occurred:', err);

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ==========================
// ✅ 404 Handler
// ==========================
app.use('*', (req, res) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  res.status(404).json({ error: 'Route not found' });
});

// ==========================
// ✅ Start Server
// ==========================
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('All models were synchronized successfully.');

    if (process.env.RUN_SEED === 'true') {
      console.log('🌱 RUN_SEED is enabled, seeding database...');
      const seedDatabase = require('./seed-database');
      await seedDatabase();
      console.log('✅ Database seeded successfully!');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();
