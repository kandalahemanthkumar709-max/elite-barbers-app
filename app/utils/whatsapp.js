const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

let whatsappClient = null;
let isReady = false;

const initializeWhatsApp = () => {
    console.log("Initializing WhatsApp Web Client...");

    // Setup LocalAuth to save session state so we don't scan QR every time server restarts
    whatsappClient = new Client({
        authStrategy: new LocalAuth(),
        authTimeoutMs: 60000,
        puppeteer: {
            headless: true,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ],
            timeout: 60000
        }
    });

    whatsappClient.on('qr', (qr) => {
        console.log('\n==================================================');
        console.log('📱 SCAN THIS QR CODE WITH YOUR WHATSAPP DIRECTLY!');
        console.log('==================================================\n');
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

    whatsappClient.on('disconnected', (reason) => {
        console.log('❌ WhatsApp client disconnected:', reason);
        isReady = false;
        // Optionally try to restart client here if needed
    });

    whatsappClient.initialize();
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

    let textBody = '';
    if (isReminder) {
        textBody = `*Reminder: Appointment in 10 Minutes! ⏰*

Hi ${customerName}, just a friendly heads-up that your appointment is starting very soon.

*Service:* ${serviceName} with ${barberName}
*Time:* ${timeStr}

📍 *Location:* Elite Barbershop, 123 Main Street, City Center.
Please make your way over. See you soon!`;
    } else {
        textBody = `*Booking Confirmed ✂️*

Hi ${customerName}! Your elite grooming session is booked.

*Service:* ${serviceName} with ${barberName}
*Date:* ${dateStr}
*Time:* ${timeStr}
*Total:* ₹${price}

📍 *Location:* Elite Barbershop, 123 Main Street, City Center.

See you soon!`;
    }

    try {
        // WhatsApp internally maps numbers to string identifiers ending in @c.us for regular users
        // It's extremely important we strictly enforce numbers without spaces or plus signs.
        let parsedNumber = toPhone.toString().replace(/\D/g, ''); 
        
        // Let's assume standard Indian code if length is 10 digits
        if (parsedNumber.length === 10) {
            parsedNumber = `91${parsedNumber}`;
        }
        
        const chatId = `${parsedNumber}@c.us`;

        console.log(`Sending WhatsApp dynamically to ${chatId}...`);
        await whatsappClient.sendMessage(chatId, textBody);
        console.log(`✅ Message successfully sent via headless WhatsApp!`);
        return true;
    } catch (err) {
        console.error("❌ Failed to send dynamic WhatsApp message:", err.message);
        return false;
    }
};

module.exports = {
    initializeWhatsApp,
    sendWhatsAppMessage
};
