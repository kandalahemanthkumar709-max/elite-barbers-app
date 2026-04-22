import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchBarbers } from '../slices/barbersSlice';
import { Star, User } from 'lucide-react';

const SelectBarber = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const service = location.state?.service;
    const bookingDate = location.state?.bookingDate;
    const bookedBarbers = location.state?.bookedBarbers || [];
    
    const { data: barbers, loading, error } = useSelector((state) => state.barbers);

    useEffect(() => {
        dispatch(fetchBarbers());
    }, [dispatch]);

    const handleSelectBarber = (barber) => {
        navigate('/payment', { state: { service, barber, bookingDate } });
    };

    const handleSelectFirstAvailable = () => {
        const availableBarber = barbers.find(b => !bookedBarbers.includes(b._id));
        if (availableBarber) {
             handleSelectBarber(availableBarber);
        } else {
             alert('No barbers available at this time. Please go back and select a different time.');
        }
    };

    if (loading) return <div className="container" style={{ marginTop: '5rem', textAlign: 'center' }}>Meeting the elite team...</div>;
    if (error) return <div className="container" style={{ marginTop: '5rem', textAlign: 'center', color: '#ff4444' }}>Error: {error}</div>;

    if (!service || !bookingDate) {
        return (
            <div className="container" style={{ marginTop: '5rem', textAlign: 'center' }}>
                <p>Missing booking details. Please start from the beginning.</p>
                <button className="btn-primary" onClick={() => navigate('/services')} style={{ marginTop: '1.5rem' }}>GO TO SERVICES</button>
            </div>
        );
    }

    return (
        <div className="container" style={{ marginTop: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Our Barbers</h1>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '600px' }}>
                        Select a master technician to handle your grooming session.
                    </p>
                </div>
                {service && bookingDate && (
                    <div style={{ textAlign: 'right', display: 'flex', gap: '2rem' }}>
                        <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>DATE & TIME</span>
                            <div style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '1.1rem' }}>
                                {new Date(bookingDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>SERVICE</span>
                            <div style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '1.1rem' }}>{service.name}</div>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                gap: '2rem',
                marginTop: '3rem',
                marginBottom: '5rem'
            }}>
                {/* First Available Option */}
                <div className="card" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    textAlign: 'center',
                    border: '1px solid var(--accent)',
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)'
                }} onClick={handleSelectFirstAvailable}>
                    <div>
                        <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '50%', 
                            background: 'var(--accent)', 
                            margin: '0 auto 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <User size={35} color="black" />
                        </div>
                        <h3 style={{ marginBottom: '0.5rem' }}>First Available</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            We'll pair you with the next master barber.
                        </p>
                    </div>
                </div>

                {barbers.map((barber) => {
                    const isBooked = bookedBarbers.includes(barber._id);

                    return (
                        <div key={barber._id} className="card" style={{ display: 'flex', gap: '1.5rem', opacity: isBooked ? 0.6 : 1, filter: isBooked ? 'grayscale(100%)' : 'none' }}>
                            <div style={{ 
                                width: '100px', 
                                height: '100px', 
                                borderRadius: '50%', 
                                background: '#333', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                flexShrink: 0,
                                overflow: 'hidden'
                            }}>
                                {barber.profileImage ? (
                                    <img src={barber.profileImage} alt={barber.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <User size={40} color="var(--accent)" />
                                )}
                            </div>

                            <div>
                                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.4rem', color: isBooked ? 'var(--text-secondary)' : 'var(--accent)' }}>{barber.username}</h3>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
                                    {[1, 2, 3, 4, 5].map(star => <Star key={star} size={14} fill={isBooked ? '#555' : 'var(--accent)'} color={isBooked ? '#555' : 'var(--accent)'} />)}
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                                    {barber.bio}
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    {barber.specialties.map(spec => (
                                        <span key={spec} style={{ 
                                            fontSize: '0.7rem', 
                                            padding: '0.2rem 0.6rem', 
                                            background: '#222', 
                                            borderRadius: '12px',
                                            color: 'var(--text-secondary)',
                                            border: '1px solid var(--border)'
                                        }}>
                                            {spec}
                                        </span>
                                    ))}
                                </div>
                                <button 
                                    className="btn-primary" 
                                    style={{ 
                                        width: '100%', 
                                        background: isBooked ? '#333' : 'var(--accent)', 
                                        color: isBooked ? 'var(--text-secondary)' : '#000',
                                        cursor: isBooked ? 'not-allowed' : 'pointer',
                                        border: isBooked ? '1px solid #444' : 'none'
                                    }}
                                    onClick={() => !isBooked && handleSelectBarber(barber)}
                                    disabled={isBooked}
                                >
                                    {isBooked ? 'ALREADY BOOKED' : 'SELECT BARBER'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SelectBarber;
