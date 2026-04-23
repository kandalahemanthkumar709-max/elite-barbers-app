const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const qrcode = require('qrcode-terminal');

let whatsappClient = null;
let isReady = false;
let lastQR = null;
let status = 'INITIALIZING';

const getStatus = () => status;

const initializeWhatsApp = () => {
    console.log("🚀 STARTING WHATSAPP SURVIVOR MODE...");

    const store = new MongoStore({ mongoose: mongoose });

    whatsappClient = new Client({
        authStrategy: new RemoteAuth({
            clientId: 'elite-barbers-main',
            store: store,
            backupSyncIntervalMs: 60000 
        }),
        authTimeoutMs: 0, 
        webVersionCache: {
            type: 'remote',
            remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
        },
        puppeteer: {
            headless: true,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-extensions',
                '--disable-background-networking',
                '--disable-default-apps',
                '--disable-sync',
                '--disable-translate',
                '--hide-scrollbars',
                '--metrics-recording-only',
                '--mute-audio',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--js-flags="--max-old-space-size=256"',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
            ],
            ignoreHTTPSErrors: true,
            timeout: 0
        }
    });

    whatsappClient.on('qr', (qr) => {
        console.log("✨ QR CODE GENERATED!");
        lastQR = qr;
        status = 'WAITING_FOR_SCAN';
        qrcode.generate(qr, { small: true });
    });

    whatsappClient.on('authenticated', () => {
        console.log('✅ WhatsApp successfully authenticated!');
        status = 'AUTHENTICATED';
    });

    whatsappClient.on('auth_failure', msg => {
        console.error('❌ WhatsApp authentication failed:', msg);
        status = 'AUTH_FAILURE';
    });

    whatsappClient.on('ready', () => {
        isReady = true;
        status = 'READY';
        lastQR = null;
        console.log('🚀 WHATSAPP IS READY!');
    });

    whatsappClient.on('remote_session_saved', () => {
        console.log('💾 WhatsApp session successfully saved to MongoDB Atlas!');
    });

    whatsappClient.on('disconnected', (reason) => {
        console.log('❌ WhatsApp client disconnected:', reason);
        isReady = false;
    });

    console.log("🌐 Calling initialize()...");
    whatsappClient.initialize().catch(err => {
        console.error("❌ INITIALIZATION ERROR:", err.message);
    });
};

const sendWhatsAppMessage = async (toPhone, messageParams) => {
    if (!whatsappClient || !isReady) return false;

    const { customerName, serviceName, barberName, bookingDate, price } = messageParams;
    const dateObj = new Date(bookingDate);
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let textBody = `*Booking Confirmed ✂️*\n\nHi ${customerName}! Your appointment for ${serviceName} with ${barberName} at ${timeStr} is confirmed.\n\nTotal: ₹${price}\n\nSee you soon!`;

    try {
        let parsedNumber = toPhone.toString().replace(/\D/g, ''); 
        if (parsedNumber.length === 10) parsedNumber = `91${parsedNumber}`;
        const chatId = `${parsedNumber}@c.us`;

        await whatsappClient.sendMessage(chatId, textBody);
        console.log(`✅ Message sent to ${chatId}`);
        return true;
    } catch (err) {
        console.error("❌ Send error:", err.message);
        return false;
    }
};

module.exports = {
    initializeWhatsApp,
    sendWhatsAppMessage,
    getLatestQR: () => lastQR
};
