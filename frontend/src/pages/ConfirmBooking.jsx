import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { Calendar, Clock, Scissors, User as UserIcon, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const ConfirmBooking = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { service, barber } = location.state || {};

    const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
    const [bookingTime, setBookingTime] = useState('');
    const [availability, setAvailability] = useState({ totalSeats: 0, map: {} });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Dynamic Settings
    const [startHour, setStartHour] = useState(9); // Fallback: 9 AM
    const [endHour, setEndHour] = useState(20);    // Fallback: 8 PM

    // Generate dynamic time slots depending on API Shop Settings
    const generateTimeSlots = () => {
        const slots = [];

        for (let hour = startHour; hour <= endHour; hour++) {
            ['00', '30'].forEach(min => {
                const time = `${String(hour).padStart(2, '0')}:${min}`;
                
                // Lunch Break Skip (12:30 PM to 01:30 PM)
                if (time === '12:30' || time === '13:00') return;

                // Today's past slots filtering
                const isToday = bookingDate === new Date().toISOString().split('T')[0];
                if (isToday) {
                    const now = new Date();
                    const slotDate = new Date();
                    slotDate.setHours(hour, parseInt(min), 0, 0);
                    // Only hide slots that are in the past or less than 5 minutes from right now
                    if (slotDate > new Date(now.getTime() + 5 * 60 * 1000)) {
                        slots.push(time);
                    }
                } else {
                    slots.push(time);
                }
            });
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    useEffect(() => {
        const fetchSettingsAndAvailability = async () => {
            try {
                const settingsRes = await axios.get('/api/settings');
                if (settingsRes.data) {
                    setStartHour(settingsRes.data.openTime);
                    setEndHour(settingsRes.data.closeTime);
                }

                if (bookingDate) {
                    const url = barber?._id 
                        ? `/api/bookings/availability?barberId=${barber._id}&date=${bookingDate}`
                        : `/api/bookings/availability?date=${bookingDate}`;
                        
                    const response = await axios.get(url);
                    setAvailability({
                        totalSeats: response.data.totalSeats,
                        map: response.data.availability
                    });
                }
            } catch (err) {
                console.error('Failed to fetch data', err);
            }
        };
        fetchSettingsAndAvailability();
    }, [bookingDate, barber?._id]);

    if (!service) {
        return (
            <div className="container" style={{ marginTop: '5rem', textAlign: 'center' }}>
                <p>No booking details found. Please start from the services page.</p>
                <button className="btn-primary" onClick={() => navigate('/services')} style={{ marginTop: '1.5rem' }}>GO TO SERVICES</button>
            </div>
        );
    }

    const handleConfirmAction = async (e) => {
        if (e) e.preventDefault();
        if (!bookingDate || !bookingTime) return;

        setLoading(true);
        setError(null);

        try {
            // Use 'YYYY-MM-DDTHH:mm:00' format which is safer for ISO parsing
            const timeStr = bookingTime + ':00';
            const fullDateString = `${bookingDate}T${timeStr}`;
            
            // Navigate to SelectBarber page
            navigate('/barbers', { 
                state: { 
                    service, 
                    bookingDate: fullDateString, // Pass as a raw string to prevent shift
                    bookedBarbers: availability.map[bookingTime] || [],
                    bookingTime
                } 
            });
        } catch (err) {
            setError('Something went wrong. Please check your selections.');
        } finally {
            setLoading(false);
        }
    };

    // Generate next 7 days for the date selector
    const getNext7Days = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            days.push({
                full: date.toISOString().split('T')[0],
                day: format(date, 'EEE').toUpperCase(),
                date: format(date, 'd')
            });
        }
        return days;
    };
    const daysVisible = getNext7Days();

    return (
        <div className="container" style={{ marginTop: '3rem', maxWidth: '600px', paddingBottom: '5rem' }}>
            {/* Header / Fee Section */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ 
                    background: 'rgba(197, 161, 99, 0.05)', 
                    padding: '0.8rem 2rem', 
                    borderRadius: '50px', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.8rem',
                    border: '1px solid rgba(197, 161, 99, 0.2)',
                    marginBottom: '1.5rem'
                }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Appointment fee:</span>
                    <span style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '1.1rem' }}>₹{service.price}</span>
                </div>
                <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Reserve Your Slot</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Select a date and time to secure your master grooming.</p>
            </div>

            <div className="card" style={{ padding: '2rem', border: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={18} color="var(--accent)" />
                    Select a Slot
                </h2>

                {/* Horizontal Date Selector */}
                <div style={{ 
                    display: 'flex', 
                    gap: '0.8rem', 
                    overflowX: 'auto', 
                    paddingBottom: '1.2rem',
                    marginBottom: '2rem',
                    borderBottom: '1px solid var(--border)',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}>
                    {daysVisible.map((item) => (
                        <div 
                            key={item.full}
                            onClick={() => {
                                setBookingDate(item.full);
                                setBookingTime(''); // Clear time when date changes
                            }}
                            style={{
                                minWidth: '75px',
                                padding: '1rem 0.5rem',
                                borderRadius: '12px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: bookingDate === item.full ? 'var(--accent)' : '#111',
                                color: bookingDate === item.full ? '#000' : 'var(--text-secondary)',
                                border: `1px solid ${bookingDate === item.full ? 'var(--accent)' : 'var(--border)'}`,
                                transition: 'all 0.2s ease',
                                boxShadow: bookingDate === item.full ? '0 10px 20px rgba(197, 161, 99, 0.2)' : 'none'
                            }}
                        >
                            <div style={{ fontSize: '0.65rem', fontWeight: '700', marginBottom: '0.4rem', opacity: 0.8 }}>{item.day}</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: '800' }}>{item.date}</div>
                        </div>
                    ))}
                </div>

                {/* Time Slot Grid (Responsive) */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                    gap: '0.8rem',
                    marginBottom: '2.5rem'
                }}>
                    {timeSlots.map(time => {
                        const bookedCount = availability.map[time]?.length || 0;
                        const seatsLeft = availability.totalSeats - bookedCount;
                        const isFull = seatsLeft <= 0;
                        const isSelected = bookingTime === time;

                        return (
                            <button
                                key={time}
                                type="button"
                                onClick={() => !isFull && setBookingTime(time)}
                                disabled={isFull}
                                style={{
                                    padding: '0.9rem 0',
                                    borderRadius: '50px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    background: isFull ? '#111' : (isSelected ? 'var(--accent)' : 'transparent'),
                                    color: isFull ? '#333' : (isSelected ? '#000' : (seatsLeft === 1 ? 'var(--accent)' : 'white')),
                                    border: isFull ? '1px solid #1a1a1a' : `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                                    cursor: isFull ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    textAlign: 'center'
                                }}
                            >
                                {(() => {
                                    const [h, m] = time.split(':');
                                    const hour = parseInt(h);
                                    const ampm = hour >= 12 ? 'pm' : 'am';
                                    const displayHour = hour % 12 || 12;
                                    return (
                                       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                                          <span style={{ fontSize: '0.95rem' }}>{`${displayHour}:${m} ${ampm}`}</span>
                                          <span style={{ 
                                              fontSize: '0.65rem', 
                                              fontWeight: '700', 
                                              opacity: isFull ? 0.5 : 0.8,
                                              letterSpacing: '0.05em'
                                          }}>
                                              {isFull ? 'FULLY BOOKED' : `${seatsLeft} SEAT${seatsLeft !== 1 ? 'S' : ''} LEFT`}
                                          </span>
                                       </div>
                                    );
                                })()}
                            </button>
                        );
                    })}
                </div>

                {timeSlots.length === 0 && (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '2rem', 
                        background: 'rgba(255, 68, 68, 0.05)', 
                        borderRadius: '12px',
                        border: '1px dashed rgba(255, 68, 68, 0.2)',
                        marginBottom: '2.5rem'
                    }}>
                        <p style={{ color: '#ff4444', fontSize: '0.9rem', margin: 0 }}>
                            No more slots available for today. Please select a future date.
                        </p>
                    </div>
                )}

                {error && <p style={{ color: '#ff4444', fontSize: '0.8rem', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</p>}

                <button 
                    onClick={handleConfirmAction}
                    className="btn-primary" 
                    style={{ 
                        width: '100%', 
                        padding: '1.3rem', 
                        fontSize: '1.1rem',
                        fontWeight: '800',
                        borderRadius: '50px',
                        background: 'var(--accent)',
                        color: '#000',
                        boxShadow: '0 4px 15px rgba(197, 161, 99, 0.3)',
                        border: 'none',
                        cursor: bookingTime ? 'pointer' : 'not-allowed',
                        opacity: bookingTime ? 1 : 0.5
                    }}
                    disabled={loading || !bookingTime}
                >
                    {loading ? 'PROCESSING...' : 'CHOOSE YOUR BARBER'}
                </button>
            </div>

            {/* Selection Summary */}
            {bookingTime && (
                <div style={{ 
                    marginTop: '2rem', 
                    textAlign: 'center', 
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    animation: 'fadeIn 0.3s ease'
                }}>
                    Booking <span style={{ color: 'var(--accent)', fontWeight: '600' }}>{service.name}</span> at 
                    <span style={{ color: 'var(--accent)', fontWeight: '600' }}> {bookingTime}</span>
                </div>
            )}
        </div>
    );
};

export default ConfirmBooking;
