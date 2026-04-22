require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./app/models/service-model');
const User = require('./app/models/user-model');
const bcrypt = require('bcryptjs');

const configureDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elite-barber');
        console.log('Connected to DB for seeding...');
    } catch (err) {
        console.log('Error connecting to DB', err);
    }
};

const seedDB = async () => {
    await configureDB();

    try {
        // Clear existing data
        await Service.deleteMany({});
        await User.deleteMany({});

        // Add Barbers
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('barber123', salt);
        const adminPassword = await bcrypt.hash('adminpassword', salt);

        const barbers = [
            {
                username: 'Marco Rossi',
                email: 'marco@elite.com',
                password,
                role: 'barber',
                phoneNumber: '9876543210',
                specialties: ['Fades', 'Beard Shaping'],
                bio: 'Master of the precision fade with over 10 years of experience in high-end grooming.'
            },
            {
                username: 'Aidan Smith',
                email: 'aidan@elite.com',
                password,
                role: 'barber',
                phoneNumber: '9876543211',
                specialties: ['Scissor Cuts', 'Classic Styling'],
                bio: 'Traditional techniques meet modern style. Specialist in long hair and classic silhouettes.'
            },
            {
                username: 'Leo Vance',
                email: 'leo@elite.com',
                password,
                role: 'barber',
                phoneNumber: '9876543212',
                specialties: ['Royal Shaves', 'Facials'],
                bio: 'The king of comfort. Leo provides the ultimate luxury straight-razor experience.'
            }
        ];

        // Add Admin
        const admin = {
            username: 'Shop Owner',
            email: 'admin@elite.com',
            password: adminPassword,
            phoneNumber: '9999999999',
            role: 'admin'
        };

        await User.insertMany([...barbers, admin]);
        console.log('Users (Barbers & Admin) seeded!');

        // Add Services
        const services = [
            // Haircuts
            { name: 'Elite Skin Fade', description: 'Precision skin fade with foil finish and clipper styling.', price: 600, duration: 45, category: 'Haircuts', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80' },
            { name: 'Executive Scissor Cut', description: 'Full scissor work for a tailored, natural look.', price: 800, duration: 60, category: 'Haircuts', image: 'https://images.unsplash.com/photo-1621605815841-aa344243a854?auto=format&fit=crop&w=800&q=80' },
            { name: 'Classic Buzz Cut', description: 'Uniform length with clean machine work and taper edges.', price: 400, duration: 30, category: 'Haircuts', image: 'https://images.unsplash.com/photo-1599351431247-f509f7184852?auto=format&fit=crop&w=800&q=80' },
            { name: 'Kids Hero Cut', description: 'Stylish cuts for the younger gentlemen (under 12).', price: 350, duration: 30, category: 'Haircuts' },
            
            // Beard & Shave
            { name: 'Beard Sculpture', description: 'Detailed trim, shape-up, and hot towel finish with premium oils.', price: 500, duration: 30, category: 'Beard & Shave', image: 'https://images.unsplash.com/photo-1621605815841-62d9426fcd92?auto=format&fit=crop&w=800&q=80' },
            { name: 'The Royal Straight Razor Shave', description: 'Luxury traditional shave with multiple hot towels and aromatherapy.', price: 700, duration: 45, category: 'Beard & Shave', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80' },
            { name: 'Moustache Refinement', description: 'Precision trim and styling for the perfect stache.', price: 200, duration: 15, category: 'Beard & Shave' },
            
            // Facial & Spa
            { name: '24K Gold Facial', description: 'Ultimate rejuvenation with gold-infused serums and deep massage.', price: 1500, duration: 60, category: 'Facial & Spa', image: 'https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=800&q=80' },
            { name: 'Charcoal Detox Mask', description: 'Deep pore cleansing to remove impurities and target blackheads.', price: 900, duration: 45, category: 'Facial & Spa', image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc206e?auto=format&fit=crop&w=800&q=80' },
            { name: 'Refresh Facial', description: 'Quick exfoliation and hydration for a glowing look.', price: 600, duration: 20, category: 'Facial & Spa' },
            
            // Combos
            { name: 'The Grand Master Combo', description: 'Elite Haircut + Royal Shave + 24k Gold Facial.', price: 2500, duration: 150, category: 'Combos', image: 'https://images.unsplash.com/photo-1516914943479-89db7d9ae7f2?auto=format&fit=crop&w=800&q=80' },
            { name: 'Gentleman’s Standard', description: 'Classic Haircut + Beard Sculpture.', price: 1000, duration: 75, category: 'Combos', image: 'https://images.unsplash.com/photo-1621605815841-aa344243a854?auto=format&fit=crop&w=800&q=80' },
            
            // Color & Chemical
            { name: 'Grey Blending', description: 'Subtle color treatment for a natural salt & pepper look.', price: 1200, duration: 45, category: 'Color & Chemical', image: 'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=800&q=80' },
            { name: 'Vibrant Global Color', description: 'Full application of premium ammonia-free hair color.', price: 2000, duration: 90, category: 'Color & Chemical', image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=800&q=80' }
        ];

        await Service.insertMany(services);
        console.log('Services seeded!');

        console.log('Database Seeding Completed Successfully!');
        process.exit(0);
    } catch (err) {
        console.log('Error seeding DB', err);
        process.exit(1);
    }
};

seedDB();
