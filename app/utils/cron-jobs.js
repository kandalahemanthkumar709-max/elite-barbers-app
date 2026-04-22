const cron = require('node-cron');
const Booking = require('../models/booking-model');
const { sendWhatsAppMessage } = require('./whatsapp');

// We want to make sure we don't send duplicate reminders
// A simple array to keep track of notified booking IDs in memory
const notifiedBookings = new Set();

const initializeCronJobs = () => {
    console.log("⏱️ Initializing Background Cron Task (10-Min Reminders)");

    // Run this check every single minute (* * * * *)
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            // Calculate precisely 10 minutes from exactly now
            const tenMinutesFromNow = new Date(now.getTime() + 10 * 60000);
            
            // To be safe against minor delays OR immediate "walk-in" bookings, 
            // we look for ANY upcoming appointment occurring between RIGHT NOW and exactly 15 minutes from now.
            const startWindow = new Date(now.getTime() - 1 * 60000); // 1 minute in the past just to be safe
            const endWindow = new Date(now.getTime() + 15 * 60000); // 15 mins into the future

            const upcomingBookings = await Booking.find({
                bookingDate: { $gte: startWindow, $lt: endWindow },
                status: { $in: ['confirmed', 'pending'] } 
            }).populate('customerId').populate('barberId').populate('serviceId');

            for (const booking of upcomingBookings) {
                // Skip if we already sent a reminder to this exact booking ID
                if (notifiedBookings.has(booking._id.toString())) {
                    continue;
                }

                if (booking.customerId?.phoneNumber) {
                    console.log(`[CRON] Found upcoming booking for ${booking.customerId.username}. Sending 10-min reminder...`);
                    
                    const messageParams = {
                        customerName: booking.customerId.username,
                        serviceName: booking.serviceId?.name || "Service",
                        barberName: booking.barberId?.username || "Your Barber",
                        bookingDate: booking.bookingDate,
                        price: booking.totalPrice,
                        isReminder: true // Flips the whatsapp template logic
                    };
                    
                    // Mark as notified instantly to prevent duplicates
                    notifiedBookings.add(booking._id.toString());
                    
                    // Dispatch the Web-Whatsapp push
                    sendWhatsAppMessage(booking.customerId.phoneNumber, messageParams).catch(err => {
                         console.error("[CRON] Failed to send reminder:", err);
                    });
                }
            }
        } catch (err) {
            console.error("[CRON] Background Job Error:", err);
        }
    });
};

module.exports = {
    initializeCronJobs
};
