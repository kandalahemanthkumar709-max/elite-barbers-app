const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const fs = require('fs');

let sock;
let lastQR = null;
let status = 'INITIALIZING';

const getLatestQR = () => lastQR;
const getStatus = () => status;
const isReady = () => status === 'READY';

const initializeWhatsApp = async () => {
    console.log("🚀 STARTING LIGHTWEIGHT WHATSAPP (BAILEYS)...");
    
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '../../auth_info_baileys'));
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        printQRInTerminal: true,
        version,
        logger: pino({ level: 'silent' }),
        browser: ["Elite Barbers", "Chrome", "1.0.0"],
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            lastQR = qr;
            status = 'WAITING_FOR_SCAN';
            console.log("✨ NEW LIGHTWEIGHT QR GENERATED!");
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut);
            console.log('🔴 Connection closed. Reason: ', lastDisconnect.error, ', Reconnecting: ', shouldReconnect);
            status = 'DISCONNECTED';
            if (shouldReconnect) {
                initializeWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('🟢 LIGHTWEIGHT WHATSAPP IS READY!');
            status = 'READY';
            lastQR = null;
        }
    });
};

const sendWhatsAppMessage = async (number, data) => {
    if (status !== 'READY' || !sock) {
        console.log('❌ Cannot send message: WhatsApp not ready');
        return;
    }

    try {
        // Format number: remove + and add @s.whatsapp.net
        const formattedNumber = number.replace(/\D/g, '') + '@s.whatsapp.net';
        
        const message = `*ELITE BARBERS - BOOKING CONFIRMED* ✂️\n\n` +
            `Hello *${data.customerName}*,\n` +
            `Your appointment is confirmed!\n\n` +
            `🔹 *Service:* ${data.serviceName}\n` +
            `🔹 *Barber:* ${data.barberName}\n` +
            `🔹 *Date:* ${new Date(data.bookingDate).toLocaleDateString()}\n` +
            `🔹 *Price:* ₹${data.price}\n\n` +
            `See you soon at the shop! 💈`;

        await sock.sendMessage(formattedNumber, { text: message });
        console.log(`✅ WhatsApp sent to ${number}`);
    } catch (err) {
        console.error('❌ Error sending WhatsApp:', err);
    }
};

module.exports = { initializeWhatsApp, sendWhatsAppMessage, getLatestQR, getStatus, isReady };
