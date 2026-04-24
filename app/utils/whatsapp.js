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
        version,
        logger: pino({ level: 'silent' }),
        browser: ["Elite Barbers", "Chrome", "1.0.0"],
    });

    sock.ev.on('creds.update', saveCreds);

let lastLoggedQR = null;
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr && connection !== 'open' && status !== 'READY') {
            if (qr !== lastLoggedQR) {
                lastQR = qr;
                status = 'WAITING_FOR_SCAN';
                console.log("✨ NEW LIGHTWEIGHT QR GENERATED (Waiting for scan...)");
                lastLoggedQR = qr;
            }
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

const sendWhatsAppMessage = async (number, bookingDetails) => {
    try {
        if (!sock || status !== 'READY') {
            console.log("❌ WHATSAPP NOT READY: Message aborted.");
            return;
        }

        // Clean the number: Remove all non-digits
        let cleanNumber = number.toString().replace(/\D/g, ''); 
        
        // If it's a 10-digit number, assume it's India and add 91
        if (cleanNumber.length === 10) {
            cleanNumber = '91' + cleanNumber;
        }

        const jid = `${cleanNumber}@s.whatsapp.net`;
        const { customerName, serviceName, barberName, bookingDate, price } = bookingDetails;
        
        const dateStr = new Date(bookingDate).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Kolkata'
        });

        const message = `*ELITE BARBERS* 💈\n\n` +
                        `Hello *${customerName}*! Your grooming session is confirmed. ✨\n\n` +
                        `✂️ *Service:* ${serviceName}\n` +
                        `👤 *Barber:* ${barberName}\n` +
                        `📅 *Time:* ${dateStr}\n` +
                        `💰 *Total:* ₹${price}\n\n` +
                        `See you soon! Stay sharp! 🤴🏾🤘🏻`;

        await sock.sendMessage(jid, { text: message });
        console.log(`✅ WHATSAPP SENT to ${cleanNumber}!`);
    } catch (err) {
        console.error("❌ WHATSAPP ERROR:", err.message);
    }
};

module.exports = { initializeWhatsApp, sendWhatsAppMessage, getLatestQR, getStatus, isReady };
