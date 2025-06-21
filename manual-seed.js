// Manual Database Seeding Script
// Run this locally to seed Railway database

const mysql = require('mysql2/promise');

const MYSQL_URL = 'mysql://root:kxraCqgJSDUMHTNMGmhKcQLlSMJokucP@mysql.railway.internal:3306/railway';

async function seedDatabase() {
    let connection;
    
    try {
        console.log('🔗 Connecting to Railway MySQL...');
        
        connection = await mysql.createConnection(MYSQL_URL);
        console.log('✅ Connected to Railway database!');

        // Create tables if not exist
        console.log('📋 Creating tables...');
        
        // Users table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'customer') DEFAULT 'customer',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Categories table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS kategoris (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nama VARCHAR(100) NOT NULL,
                deskripsi TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Menu table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS menus (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nama VARCHAR(100) NOT NULL,
                deskripsi TEXT,
                harga DECIMAL(10, 2) NOT NULL,
                kategori_id INT,
                gambar VARCHAR(255),
                tersedia BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (kategori_id) REFERENCES kategoris(id)
            )
        `);

        console.log('✅ Tables created successfully!');

        // Seed admin users
        console.log('👤 Seeding admin users...');
        
        const adminUsers = [
            {
                username: 'dilla_admin',
                email: 'dilla@gmail.com',
                password: 'password123', // Plain text - will be hashed by backend
                role: 'admin'
            },
            {
                username: 'bayu_admin', 
                email: 'bayu@gmail.com',
                password: 'password123',
                role: 'admin'
            },
            {
                username: 'test_customer',
                email: 'customer@gmail.com', 
                password: 'password123',
                role: 'customer'
            }
        ];

        for (const user of adminUsers) {
            try {
                await connection.execute(
                    'INSERT IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                    [user.username, user.email, user.password, user.role]
                );
                console.log(`   ✅ Created ${user.role}: ${user.email}`);
            } catch (err) {
                console.log(`   ⚠️  User ${user.email} already exists`);
            }
        }

        // Seed categories
        console.log('📂 Seeding categories...');
        
        const categories = [
            { nama: 'Makanan Utama', deskripsi: 'Hidangan utama seperti nasi, mie, dan lauk pauk' },
            { nama: 'Minuman', deskripsi: 'Berbagai jenis minuman segar dan hangat' },
            { nama: 'Dessert', deskripsi: 'Makanan penutup dan camilan manis' }
        ];

        for (const cat of categories) {
            try {
                await connection.execute(
                    'INSERT IGNORE INTO kategoris (nama, deskripsi) VALUES (?, ?)',
                    [cat.nama, cat.deskripsi]
                );
                console.log(`   ✅ Created category: ${cat.nama}`);
            } catch (err) {
                console.log(`   ⚠️  Category ${cat.nama} already exists`);
            }
        }

        // Seed sample menu items
        console.log('🍽️ Seeding menu items...');
        
        const menuItems = [
            { nama: 'Nasi Goreng Spesial', deskripsi: 'Nasi goreng dengan telur, ayam, dan sayuran', harga: 25000, kategori_id: 1 },
            { nama: 'Mie Ayam Bakso', deskripsi: 'Mie ayam dengan bakso dan pangsit', harga: 20000, kategori_id: 1 },
            { nama: 'Ayam Bakar', deskripsi: 'Ayam bakar bumbu kecap dengan lalapan', harga: 30000, kategori_id: 1 },
            { nama: 'Es Teh Manis', deskripsi: 'Teh manis dingin yang segar', harga: 5000, kategori_id: 2 },
            { nama: 'Jus Jeruk', deskripsi: 'Jus jeruk segar tanpa gula tambahan', harga: 8000, kategori_id: 2 },
            { nama: 'Es Cream Vanilla', deskripsi: 'Es krim vanilla yang lembut dan manis', harga: 15000, kategori_id: 3 },
            { nama: 'Brownies Coklat', deskripsi: 'Brownies coklat yang lembut dan legit', harga: 12000, kategori_id: 3 }
        ];

        for (const item of menuItems) {
            try {
                await connection.execute(
                    'INSERT IGNORE INTO menus (nama, deskripsi, harga, kategori_id) VALUES (?, ?, ?, ?)',
                    [item.nama, item.deskripsi, item.harga, item.kategori_id]
                );
                console.log(`   ✅ Created menu: ${item.nama}`);
            } catch (err) {
                console.log(`   ⚠️  Menu ${item.nama} already exists`);
            }
        }

        console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
        console.log('\n📋 ADMIN CREDENTIALS:');
        console.log('1. Email: dilla@gmail.com | Password: password123');
        console.log('2. Email: bayu@gmail.com | Password: password123');
        console.log('\n🔗 TEST FRONTEND: https://pemesanan-menu-restoran-api.vercel.app');
        
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run seeding
if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase; 