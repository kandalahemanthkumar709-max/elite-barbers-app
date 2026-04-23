const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const qrcode = require('qrcode-terminal');

let whatsappClient = null;
let isReady = false;
let lastQR = null;

const initializeWhatsApp = () => {
    console.log("🚀 STARTING WHATSAPP INITIALIZATION...");

    const store = new MongoStore({ mongoose: mongoose });

    console.log("📦 Creating WhatsApp Client with High-Stability Settings...");
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
                '--js-flags="--max-old-space-size=256"',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
            ],
            timeout: 60000
        }
    });

    whatsappClient.on('qr', (qr) => {
        console.log("✨ QR CODE GENERATED!");
        lastQR = qr;
        qrcode.generate(qr, { small: true });
    });

    whatsappClient.on('authenticated', () => {
        console.log('✅ WhatsApp successfully authenticated!');
    });

    whatsappClient.on('auth_failure', msg => {
        console.error('❌ WhatsApp authentication failed:', msg);
    });

    whatsappClient.on('ready', () => {
        isReady = true;
        console.log('🚀 WHATSAPP IS READY! Background notification bot running.');
    });

    whatsappClient.on('remote_session_saved', () => {
        console.log('💾 WhatsApp session successfully saved to MongoDB Atlas!');
    });

    whatsappClient.on('disconnected', (reason) => {
        console.log('❌ WhatsApp client disconnected:', reason);
        isReady = false;
    });

    console.log("🌐 Calling whatsappClient.initialize()...");
    whatsappClient.initialize().catch(err => {
        console.error("❌ FAILED TO INITIALIZE WHATSAPP:", err);
    });
};

const sendWhatsAppMessage = async (toPhone, messageParams) => {
    if (!whatsappClient || !isReady) {
        console.error("WhatsApp client is not ready yet! Skipping real message.");
        return false;
    }

    const { customerName, serviceName, barberName, bookingDate, price, isReminder } = messageParams;
    
    const dateObj = new Date(bookingDate);
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let textBody = `*Booking Confirmed ✂️*\n\nHi ${customerName}! Your appointment is set.\n\n*Service:* ${serviceName}\n*Time:* ${timeStr}\n\nSee you soon!`;

    try {
        let parsedNumber = toPhone.toString().replace(/\D/g, ''); 
        if (parsedNumber.length === 10) parsedNumber = `91${parsedNumber}`;
        const chatId = `${parsedNumber}@c.us`;

        await whatsappClient.sendMessage(chatId, textBody);
        console.log(`✅ Message successfully sent to ${chatId}`);
        return true;
    } catch (err) {
        console.error("❌ Failed to send WhatsApp:", err.message);
        return false;
    }
};

module.exports = {
    initializeWhatsApp,
    sendWhatsAppMessage,
    getLatestQR: () => lastQR
};
