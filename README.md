## THIS FOLDER IS NOT USE

# Restaurant API - Railway Deployment

Backend API untuk aplikasi pemesanan menu restoran yang di-deploy di Railway.

## 🚀 Live Deployment

- **Backend API**: Will be available after Railway deployment
- **Frontend**: [https://pemesanan-menu-restoran-neydezgzf-bagus-projects-d637296f.vercel.app](https://pemesanan-menu-restoran-neydezgzf-bagus-projects-d637296f.vercel.app)

## 📋 Features

- Authentication & Authorization
- Menu Management
- Order Processing
- Payment Integration
- User Management
- Category Management

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (Railway)
- **ORM**: Sequelize
- **Authentication**: JWT
- **Deployment**: Railway

## 🗃️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Menu
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Orders
- `GET /api/orders` - Get orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order

### Categories
- `GET /api/kategori` - Get categories
- `POST /api/kategori` - Create category

### Payment
- `POST /api/payment` - Process payment

## 🔧 Environment Variables

Required environment variables for Railway:

```
NODE_ENV=production
MYSQL_PUBLIC_URL=<railway-mysql-public-url>
JWT_SECRET=<your-jwt-secret>
```

## 🚀 Railway Deployment

1. Connect this repository to Railway
2. Add MySQL database service
3. Set environment variables
4. Deploy automatically

## 📝 Database Schema

The application uses Sequelize ORM with MySQL database. Models include:
- User
- Menu
- Category (Kategori)
- Order
- OrderItem
- Payment
- ApiKey

## 🔗 Frontend Integration

This backend is designed to work with the React frontend deployed at Vercel. CORS is configured to allow requests from the frontend domain. 
