const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/booking-model');

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn('⚠️ Razorpay keys are missing in .env file!');
} else {
    console.log('✅ Razorpay keys loaded successfully');
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const paymentsCtrl = {};

paymentsCtrl.createOrder = async (req, res) => {
    try {
        const { amount, bookingId } = req.body;

        if (!process.env.RAZORPAY_KEY_ID) {
            return res.status(400).json({ 
                error: 'Razorpay keys are not configured. Please add them to your .env file and RESTART the server.' 
            });
        }

        const options = {
            amount: amount * 100, // Razorpay works in paise
            currency: "INR",
            receipt: `rcpt_${bookingId}`
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
};

paymentsCtrl.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingId
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Update booking status
            const updatedBooking = await Booking.findByIdAndUpdate(bookingId, {
                paymentStatus: 'paid',
                paymentId: razorpay_payment_id
            }, { new: true }).populate('customerId barberId').populate('serviceId');

            const { sendWhatsAppMessage } = require('../utils/whatsapp');
            if (updatedBooking?.customerId?.phoneNumber) {
                sendWhatsAppMessage(updatedBooking.customerId.phoneNumber, {
                    customerName: updatedBooking.customerId.username,
                    serviceName: updatedBooking.serviceId.name,
                    barberName: updatedBooking.barberId.username,
                    bookingDate: updatedBooking.bookingDate,
                    price: updatedBooking.totalPrice
                }).catch(err => console.log('WhatsApp Notice Error:', err));
            }

            res.json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ error: 'Invalid signature' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Verification failed' });
    }
};

module.exports = paymentsCtrl;
