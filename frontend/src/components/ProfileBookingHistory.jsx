const STATUS_COLORS = {
    completed: { bg: 'rgba(54,179,126,0.1)',   color: '#36b37e' },
    cancelled:  { bg: 'rgba(255,86,48,0.1)',    color: '#ff5630' },
    confirmed:  { bg: 'rgba(255,171,0,0.1)',    color: '#ffab00' },
    pending:    { bg: 'rgba(255,171,0,0.1)',    color: '#ffab00' },
    default:    { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' },
};

const ProfileBookingHistory = ({ bookings, onCancel }) => {
    if (!bookings || bookings.length === 0) return null;

    return (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <h3>Booking History ({bookings.length})</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.02)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                        <tr>{['Service', 'Date', 'Barber', 'Amount', 'Status', 'Actions'].map(h => <th key={h} style={{ padding: '0.8rem 1.5rem', textAlign: 'left' }}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                        {bookings.map(b => {
                            const { bg, color } = STATUS_COLORS[b.status] || STATUS_COLORS.default;
                            const isCancellable = b.status === 'confirmed' || b.status === 'pending';
                            return (
                                <tr key={b._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>{b.serviceId?.name || '—'}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        {new Date(b.bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{b.barberId?.username || '—'}</td>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--accent)' }}>₹{b.totalPrice}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{ padding: '0.25rem 0.7rem', borderRadius: '50px', fontSize: '0.7rem', fontWeight: '700', background: bg, color }}>{b.status.toUpperCase()}</span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        {isCancellable && (
                                            <button 
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to cancel this booking?')) {
                                                        onCancel(b._id);
                                                    }
                                                }}
                                                style={{ background: 'rgba(255,86,48,0.1)', color: '#ff5630', border: '1px solid rgba(255,86,48,0.3)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                                            >
                                                CANCEL
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProfileBookingHistory;
