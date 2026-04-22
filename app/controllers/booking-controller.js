const Booking = require('../models/booking-model');
const Service = require('../models/service-model');
const { bookingCreateSchema } = require('../validators/booking-validator');

const bookingsCtrl = {};

bookingsCtrl.create = async (req, res) => {
    const { error } = bookingCreateSchema.validate(req.body);
    if (error) {
        console.log('Validation Error:', error.details);
        return res.status(400).json({ errors: error.details.map(d => d.message) });
    }

    try {
        const { barberId, serviceId, bookingDate, paymentMethod } = req.body;
        
        // Check if the barber is already booked at this time
        const existingBarberBooking = await Booking.findOne({ barberId, bookingDate });
        if (existingBarberBooking) {
            return res.status(400).json({ error: 'This barber is already booked for this time slot.' });
        }

        // Check if the customer is already booked at this time (optional but recommended)
        const existingCustomerBooking = await Booking.findOne({ customerId: req.user.id, bookingDate });
        if (existingCustomerBooking) {
            return res.status(400).json({ error: 'You already have an appointment at this time.' });
        }

        // Fetch service details
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        const booking = new Booking({
            customerId: req.user.id,
            barberId,
            serviceId,
            totalPrice: service.price,
            duration: service.duration,
            bookingDate,
            paymentMethod
        });
        
        await booking.save();

        if (paymentMethod === 'cash') {
            const User = require('../models/user-model');
            const customer = await User.findById(req.user.id);
            const barber = await User.findById(barberId);
            const { sendWhatsAppMessage } = require('../utils/whatsapp');
            
            // Fire and forget the notification (don't await) so we don't block the API response
            if (customer?.phoneNumber) {
                sendWhatsAppMessage(customer.phoneNumber, {
                    customerName: customer.username,
                    serviceName: service.name,
                    barberName: barber.username,
                    bookingDate: booking.bookingDate,
                    price: service.price
                }).catch(err => console.log('WhatsApp Notice Error:', err));
            }
        }

        res.status(201).json(booking);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

bookingsCtrl.list = async (req, res) => {
    try {
        let bookings;
        if (req.user.role === 'admin') {
            bookings = await Booking.find().populate('customerId barberId', 'username email phoneNumber').populate('serviceId', 'name');
        } else if (req.user.role === 'barber') {
            bookings = await Booking.find({ barberId: req.user.id }).populate('customerId', 'username email').populate('serviceId', 'name');
        } else {
            bookings = await Booking.find({ customerId: req.user.id }).populate('barberId', 'username email').populate('serviceId', 'name');
        }
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

bookingsCtrl.checkAvailability = async (req, res) => {
    try {
        const { barberId, date } = req.query;
        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch all active barbers to know the total "seats"
        const User = require('../models/user-model');
        const barbers = await User.find({ role: 'barber' });
        const totalBarbers = barbers.length;

        // Find bookings for the date
        const query = { bookingDate: { $gte: startOfDay, $lte: endOfDay } };
        if (barberId) query.barberId = barberId;

        const bookings = await Booking.find(query).select('bookingDate barberId');

        // Logic: Return a map of time -> bookedCount or bookedBarbers
        const availabilityMap = {};
        bookings.forEach(b => {
            const d = new Date(b.bookingDate);
            // We use the same formatting as the frontend expects
            // If the server and client are in different timezones, getHours() will differ
            // To be safe, we should use the hours from the actual stored value relative to the start of the day
            const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
            
            if (!availabilityMap[time]) availabilityMap[time] = [];
            availabilityMap[time].push(b.barberId.toString());
        });

        res.json({ 
            totalSeats: barberId ? 1 : totalBarbers,
            availability: availabilityMap 
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

bookingsCtrl.cancel = async (req, res) => {
    try {
        const { id } = req.params;
        let booking;
        
        if (req.user.role === 'admin') {
            booking = await Booking.findById(id);
        } else {
            booking = await Booking.findOne({ _id: id, customerId: req.user.id });
        }

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (booking.status === 'completed' || booking.status === 'cancelled') {
            return res.status(400).json({ error: `Booking is already ${booking.status}.` });
        }

        booking.status = 'cancelled';
        await booking.save();
        
        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

bookingsCtrl.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true })
            .populate('customerId barberId', 'username email phoneNumber')
            .populate('serviceId', 'name');
            
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

bookingsCtrl.remove = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findOne({ _id: id, customerId: req.user.id });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (booking.status !== 'completed' && booking.status !== 'cancelled') {
            return res.status(400).json({ error: 'You can only delete completed or cancelled appointments.' });
        }

        await Booking.findByIdAndDelete(id);
        res.json({ message: 'Booking permanently deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = bookingsCtrl;
