import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchBookings, cancelBooking, deleteBooking } from '../slices/bookingsSlice';
import { Calendar, Clock, User, Scissors } from 'lucide-react';
import { format } from 'date-fns';

const Bookings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: bookings, loading, error } = useSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  if (loading) return <div className="container" style={{ marginTop: '5rem', textAlign: 'center' }}>Loading your elite appointments...</div>;
  if (error) return <div className="container" style={{ marginTop: '5rem', textAlign: 'center', color: '#ff4444' }}>Error: {error}</div>;

  return (
    <div className="container" style={{ marginTop: '3rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>My Bookings</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>
        Manage your upcoming grooming sessions.
      </p>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {bookings.map((booking) => {
          const bDate = new Date(booking.bookingDate);
          const isPast = bDate < new Date();

          return (
            <div key={booking._id} className="card" style={{ 
              padding: '0', 
              overflow: 'hidden', 
              border: isPast ? '1px solid #222' : '1px solid var(--border)',
              opacity: isPast ? 0.6 : 1,
              position: 'relative'
            }}>
              {/* Top Accent Bar */}
              <div style={{ 
                height: '4px', 
                background: isPast ? '#333' : 'linear-gradient(90deg, var(--accent) 0%, #d4af37 100%)' 
              }} />

              <div style={{ 
                display: 'flex', 
                flexDirection: 'row', 
                padding: '2rem',
                gap: '2rem',
                flexWrap: 'wrap'
              }}>
                {/* Date Chip */}
                <div style={{ 
                  background: '#111', 
                  padding: '1.5rem', 
                  borderRadius: '12px', 
                  textAlign: 'center',
                  minWidth: '100px',
                  border: '1px solid #222'
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>{format(bDate, 'EEEE')}</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', lineHeight: '1', color: 'var(--accent)' }}>{format(bDate, 'dd')}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', marginTop: '0.4rem' }}>{format(bDate, 'MMMM')}</div>
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      background: 'rgba(197, 161, 99, 0.1)', 
                      color: 'var(--accent)', 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: '4px',
                      fontWeight: '700',
                      letterSpacing: '0.05em'
                    }}>
                      {booking.paymentMethod.toUpperCase()}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>• {booking.duration} MIN SESSION</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.8rem', letterSpacing: '-0.02em', margin: 0 }}>
                      {booking.serviceId?.name || 'Haircut & Styling'}
                    </h2>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent)' }}>
                      ₹{booking.totalPrice}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <Clock size={16} color="var(--accent)" />
                      {format(bDate, 'hh:mm a')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <User size={16} color="var(--accent)" />
                      {booking.barberId?.username}
                    </div>
                  </div>
                </div>

                {/* Status Column */}
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
                  {(() => {
                      let bg, color, border;
                      switch(booking.status) {
                          case 'confirmed': bg = '#1a472a'; color = '#4ade80'; border = '#2d6a4f'; break;
                          case 'cancelled':  bg = 'rgba(255,86,48,0.1)'; color = '#ff5630'; border = 'rgba(255,86,48,0.3)'; break;
                          case 'completed':  bg = 'rgba(54,179,126,0.1)'; color = '#36b37e'; border = 'rgba(54,179,126,0.3)'; break;
                          case 'pending':    bg = 'rgba(255,171,0,0.1)'; color = '#ffab00'; border = 'rgba(255,171,0,0.3)'; break;
                          default:           bg = '#222'; color = 'var(--text-secondary)'; border = '#333';
                      }
                      return (
                          <div style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: '800', 
                            padding: '0.6rem 1.5rem', 
                            borderRadius: '30px',
                            background: bg,
                            color: color,
                            border: `1px solid ${border}`,
                            textAlign: 'center'
                          }}>
                            {booking.status.toUpperCase()}
                          </div>
                      );
                  })()}
                  
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Payment: <span style={{ 
                        color: booking.status === 'cancelled' ? '#ff5630' : (booking.paymentStatus === 'paid' ? '#4ade80' : 'var(--accent)'), 
                        fontWeight: '600' 
                    }}>
                        {(() => {
                            if (booking.status === 'cancelled') return 'VOIDED / CANCELLED';
                            if (booking.paymentMethod === 'cash') return 'PAY AT SHOP (CASH)';
                            if (booking.paymentMethod === 'online' && booking.paymentStatus === 'paid') return 'PAID SECURELY ONLINE';
                            if (booking.paymentStatus === 'failed') return 'ONLINE PAYMENT FAILED';
                            return 'PENDING PAYMENT';
                        })()}
                    </span>
                  </div>

                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button 
                        onClick={() => {
                            if (window.confirm('Are you sure you want to cancel this booking?')) {
                                dispatch(cancelBooking(booking._id));
                            }
                        }}
                        style={{ 
                            background: 'transparent', 
                            color: '#ff4444', 
                            border: '1px solid #ff4444', 
                            borderRadius: '30px', 
                            padding: '0.5rem 1rem', 
                            fontSize: '0.7rem', 
                            cursor: 'pointer',
                            marginTop: '0.5rem',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => { e.target.style.background = '#ff4444'; e.target.style.color = 'white'; }}
                        onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#ff4444'; }}
                      >
                        CANCEL
                      </button>
                  )}

                  {(booking.status === 'cancelled' || booking.status === 'completed') && (
                      <button 
                        onClick={() => {
                            if (window.confirm('Delete this appointment entirely from your history?')) {
                                dispatch(deleteBooking(booking._id));
                            }
                        }}
                        style={{ 
                            background: 'rgba(255, 255, 255, 0.05)', 
                            color: 'var(--text-secondary)', 
                            border: '1px solid var(--border)', 
                            borderRadius: '30px', 
                            padding: '0.4rem 1rem', 
                            fontSize: '0.65rem', 
                            cursor: 'pointer',
                            marginTop: '0.5rem',
                            transition: 'all 0.2s ease',
                            textTransform: 'uppercase'
                        }}
                        onMouseOver={(e) => { e.target.style.background = '#222'; e.target.style.color = 'white'; }}
                        onMouseOut={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.05)'; e.target.style.color = 'var(--text-secondary)'; }}
                      >
                        Remove from History
                      </button>
                  )}
                </div>
              </div>

              {/* Decorative Corner */}
              <div style={{ 
                position: 'absolute', 
                bottom: '-20px', 
                right: '-20px', 
                width: '60px', 
                height: '60px', 
                background: 'rgba(197, 161, 99, 0.05)', 
                borderRadius: '50%' 
              }} />
            </div>
          );
        })}

        {bookings.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '5rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>You have no upcoming bookings.</p>
            <button className="btn-primary" onClick={() => navigate('/services')}>BOOK YOUR FIRST SESSION</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
