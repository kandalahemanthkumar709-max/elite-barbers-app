// v1.0.2 - Monolith & Scoping Fix
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const configureDB = require('./config/db');
const { initializeWhatsApp, getLatestQR } = require('./app/utils/whatsapp');
const QRCode = require('qrcode');

const app = express();
const port = process.env.PORT || 3099;

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Configure Database and then initialize WhatsApp
configureDB().then(() => {
    initializeWhatsApp();
    
    // Initialize Background Job Scheduler
    const { initializeCronJobs } = require('./app/utils/cron-jobs');
    initializeCronJobs();
}).catch(err => {
    console.error("CRITICAL: Failed to connect to DB during startup", err);
});

// QR Code Route
app.get('/qr', async (req, res) => {
    const qr = getLatestQR ? getLatestQR() : null;
    if (!qr) {
        return res.send("<h1>QR code not available!</h1><p>The client may already be authenticated or is still initializing. Check logs.</p>");
    }
    
    try {
        const qrImage = await QRCode.toDataURL(qr);
        res.send(`
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
                <h1>Scan this for Elite Barbers WhatsApp</h1>
                <img src="${qrImage}" style="width: 300px; height: 300px; border: 10px solid white; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />
                <p>Open WhatsApp > Linked Devices > Link a Device</p>
                <script>setTimeout(() => location.reload(), 30000);</script>
            </div>
        `);
    } catch (err) {
        res.status(500).send("Error generating QR image");
    }
});

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

// Serve Frontend static files in production
if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'frontend/dist');
    app.use(express.static(distPath));

    app.get('(.*)', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/qr')) {
            return next();
        }
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.json({ message: "Welcome to Elite Barbers API" });
    });
}

app.listen(port, () => {
    console.log(`Elite Barbers server is running on port ${port}`);
});
