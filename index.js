// v1.0.1 - Monolith Fix
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const configureDB = require('./config/db');

const app = express();
const port = process.env.PORT || 3099;

// Configure Database
configureDB();

// Initialize WhatsApp Web Client
const { initializeWhatsApp } = require('./app/utils/whatsapp');
initializeWhatsApp();

// Initialize Background Job Scheduler
const { initializeCronJobs } = require('./app/utils/cron-jobs');
initializeCronJobs();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

const usersCtrl = require('./app/controllers/user-controller');
const authenticateUser = require('./app/middlewares/user-autentication');
const authorizeUser = require('./app/middlewares/authorize');
const upload = require('./app/middlewares/upload');

const bookingsCtrl = require('./app/controllers/booking-controller');
const servicesCtrl = require('./app/controllers/service-controller');
const paymentsCtrl = require('./app/controllers/payment-controller');
const settingsCtrl = require('./app/controllers/settings-controller');

// Static folder for uploads
app.use('/uploads', express.static('uploads'));

// User Routes
app.post('/api/users/register', usersCtrl.register);
app.post('/api/users/login', usersCtrl.login);
app.get('/api/users/account', authenticateUser, usersCtrl.account);
app.put('/api/users/profile', authenticateUser, usersCtrl.updateProfile);
app.get('/api/barbers', usersCtrl.listBarbers);

// Service Routes
app.get('/api/services', servicesCtrl.list);
app.post('/api/services', authenticateUser, authorizeUser(['admin']), upload.single('image'), servicesCtrl.create);
app.put('/api/services/:id', authenticateUser, authorizeUser(['admin']), upload.single('image'), servicesCtrl.update);
app.delete('/api/services/:id', authenticateUser, authorizeUser(['admin']), servicesCtrl.remove);

// Booking Routes
app.post('/api/bookings', authenticateUser, authorizeUser(['customer']), bookingsCtrl.create);
app.get('/api/bookings', authenticateUser, authorizeUser(['admin', 'barber', 'customer']), bookingsCtrl.list);
app.get('/api/bookings/availability', authenticateUser, bookingsCtrl.checkAvailability);
app.put('/api/bookings/:id/cancel', authenticateUser, bookingsCtrl.cancel);
app.put('/api/bookings/:id/status', authenticateUser, authorizeUser(['admin', 'barber']), bookingsCtrl.updateStatus);
app.delete('/api/bookings/:id', authenticateUser, bookingsCtrl.remove);

// Payment Routes
app.post('/api/payments/order', authenticateUser, paymentsCtrl.createOrder);
app.post('/api/payments/verify', authenticateUser, paymentsCtrl.verifyPayment);

// Settings Routes
app.get('/api/settings', settingsCtrl.getSettings);
app.put('/api/settings', authenticateUser, authorizeUser(['admin']), settingsCtrl.updateSettings);

const path = require('path');
// Serve Frontend static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'frontend/dist')));

    app.get('(.*)', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.json({ message: "Welcome to Elite Barbers API" });
    });
}

app.listen(port, () => {
    console.log(`Elite Barbers server is running on port ${port}`);
});
