import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { CreditCard, Wallet, ChevronRight, Loader } from 'lucide-react';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { service, barber, bookingDate } = location.state || {};

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!service || !barber || !bookingDate) {
        return (
            <div className="container" style={{ marginTop: '5rem', textAlign: 'center' }}>
                <p>Incomplete booking details. Please start over.</p>
                <button className="btn-primary" onClick={() => navigate('/services')} style={{ marginTop: '1.5rem' }}>GO TO SERVICES</button>
            </div>
        );
    }

    const handleBookingFinalize = async (method) => {
        setLoading(true);
        setError(null);

        try {
            // 1. Create the booking as 'pending' first
            const bookingResponse = await axios.post('/api/bookings', {
                serviceId: service._id,
                barberId: barber._id,
                bookingDate: bookingDate,
                paymentMethod: method
            });

            const booking = bookingResponse.data;

            if (method === 'cash') {
                navigate('/bookings');
                return;
            }

            // 2. If online, initiate Razorpay
            // Load Razorpay Script
            const loadScript = (src) => {
                return new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = src;
                    script.onload = () => resolve(true);
                    script.onerror = () => resolve(false);
                    document.body.appendChild(script);
                });
            };

            const isLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
            if (!isLoaded) {
                setError('Razorpay SDK failed to load. Are you online?');
                setLoading(false);
                return;
            }

            // 3. Create Order
            const orderResponse = await axios.post('/api/payments/order', {
                amount: service.price,
                bookingId: booking._id
            });

            const order = orderResponse.data;

            // 4. Open Razorpay Modal
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
                amount: order.amount,
                currency: order.currency,
                name: "Elite Barbers",
                description: `Booking for ${service.name}`,
                order_id: order.id,
                handler: async (response) => {
                    try {
                        const verifyRes = await axios.post('/api/payments/verify', {
                            ...response,
                            bookingId: booking._id
                        });
                        if (verifyRes.data.success) {
                            navigate('/bookings');
                        }
                    } catch (err) {
                        setError('Verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: user.username || "Grooming Client",
                    email: user.email || "",
                    contact: user.phoneNumber || ""
                },
                modal: {
                    ondismiss: function() {
                        setLoading(false);
                    }
                },
                theme: { color: "#C5A163" }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            setError(err.response?.data?.error || 'Failed to process booking.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ marginTop: '3rem', maxWidth: '600px' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Payment Method</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>
                Choose how you'd like to pay for your ₹{service.price} {service.name}.
            </p>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* Online Payment */}
                <div
                    className="card"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        cursor: 'pointer',
                        padding: '2rem',
                        transition: 'all 0.3s ease'
                    }}
                    onClick={() => handleBookingFinalize('online')}
                >
                    <div style={{ background: 'var(--bg-primary)', p: '1rem', borderRadius: '50%', color: 'var(--accent)' }}>
                        <CreditCard size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ marginBottom: '0.2rem' }}>Pay Online</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Secure payment via Stripe or Razorpay.</p>
                    </div>
                    <ChevronRight size={20} color="var(--border)" />
                </div>

                {/* Cash/Shop Payment */}
                <div
                    className="card"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        cursor: 'pointer',
                        padding: '2rem',
                        transition: 'all 0.3s ease'
                    }}
                    onClick={() => handleBookingFinalize('cash')}
                >
                    <div style={{ background: 'var(--bg-primary)', p: '1rem', borderRadius: '50%', color: 'var(--accent)' }}>
                        <Wallet size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ marginBottom: '0.2rem' }}>Pay at Shop</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pay after your session with cash or card.</p>
                    </div>
                    <ChevronRight size={20} color="var(--border)" />
                </div>
            </div>

            {loading && (
                <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Loader size={20} className="spin" />
                    Finalizing your appointment...
                </div>
            )}

            {error && <p style={{ color: '#ff4444', marginTop: '2rem', textAlign: 'center' }}>{error}</p>}
        </div>
    );
};

export default Payment;
