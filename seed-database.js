require('dotenv').config();
const sequelize = require('./scr/config/sequelize');

// Import models
const User = require('./scr/models/user');
const Kategori = require('./scr/models/kategori'); 
const Menu = require('./scr/models/menu');

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');
        
        // Test connection
        await sequelize.authenticate();
        console.log('✅ Database connection established');
        
        // Sync models
        await sequelize.sync({ force: false, alter: true });
        console.log('✅ Models synchronized');

        // Check if data already exists
        const menuCount = await Menu.count();
        const categoryCount = await Kategori.count();
        
        if (menuCount > 0 || categoryCount > 0) {
            console.log(`📊 Database already has data: ${categoryCount} categories, ${menuCount} menu items`);
            return;
        }

        // Seed Categories
        console.log('📂 Creating categories...');
        const categories = await Kategori.bulkCreate([
            { nama_kategori: 'Makanan Utama', deskripsi: 'Menu makanan utama seperti nasi dan mie' },
            { nama_kategori: 'Minuman', deskripsi: 'Berbagai jenis minuman segar' },
            { nama_kategori: 'Dessert', deskripsi: 'Makanan penutup dan camilan manis' },
            { nama_kategori: 'Appetizer', deskripsi: 'Makanan pembuka' }
        ]);
        console.log(`✅ Created ${categories.length} categories`);

        // Seed Menu Items
        console.log('🍽️ Creating menu items...');
        const menuItems = await Menu.bulkCreate([
            // Makanan Utama
            {
                nama: 'Nasi Goreng Spesial',
                id_kategori: categories[0].id_kategori,
                harga: 25000,
                gambar: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop'
            },
            {
                nama: 'Mie Ayam Bakso',
                id_kategori: categories[0].id_kategori,
                harga: 20000,
                gambar: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=300&fit=crop'
            },
            {
                nama: 'Ayam Bakar',
                id_kategori: categories[0].id_kategori,
                harga: 30000,
                gambar: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop'
            },
            {
                nama: 'Gado-Gado',
                id_kategori: categories[0].id_kategori,
                harga: 18000,
                gambar: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop'
            },

            // Minuman
            {
                nama: 'Es Teh Manis',
                id_kategori: categories[1].id_kategori,
                harga: 8000,
                gambar: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop'
            },
            {
                nama: 'Jus Jeruk Fresh',
                id_kategori: categories[1].id_kategori,
                harga: 15000,
                gambar: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&h=300&fit=crop'
            },
            {
                nama: 'Kopi Hitam',
                id_kategori: categories[1].id_kategori,
                harga: 12000,
                gambar: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop'
            },
            {
                nama: 'Es Campur',
                id_kategori: categories[1].id_kategori,
                harga: 18000,
                gambar: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop'
            },

            // Dessert
            {
                nama: 'Es Krim Vanilla',
                id_kategori: categories[2].id_kategori,
                harga: 15000,
                gambar: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop'
            },
            {
                nama: 'Puding Coklat',
                id_kategori: categories[2].id_kategori,
                harga: 12000,
                gambar: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop'
            },

            // Appetizer
            {
                nama: 'Kerupuk Udang',
                id_kategori: categories[3].id_kategori,
                harga: 8000,
                gambar: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'
            },
            {
                nama: 'Lumpia Semarang',
                id_kategori: categories[3].id_kategori,
                harga: 15000,
                gambar: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'
            }
        ]);
        console.log(`✅ Created ${menuItems.length} menu items`);

        // Create admin user
        console.log('👤 Creating admin user...');
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await User.create({
            nama: 'Administrator',
            email: 'admin@restaurant.com',
            password: hashedPassword,
            role: 'admin'
        });
        console.log('✅ Admin user created (email: admin@restaurant.com, password: admin123)');

        console.log('🎉 Database seeding completed successfully!');
        console.log(`📊 Summary:`);
        console.log(`   - Categories: ${categories.length}`);
        console.log(`   - Menu Items: ${menuItems.length}`);
        console.log(`   - Admin User: 1`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}

// Run seeding
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('✅ Seeding process completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Seeding process failed:', error);
            process.exit(1);
        });
}

module.exports = seedDatabase; 