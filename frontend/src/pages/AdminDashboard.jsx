import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookings } from '../slices/bookingsSlice';
import axios from '../api/axios';
import { Calendar, Phone, Scissors, Clock, CheckCircle, XCircle, TrendingUp, Users, IndianRupee } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import StatCard from '../components/StatCard';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const { data: bookings, loading } = useSelector((state) => state.bookings);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [stats, setStats] = useState({ total: 0, completed: 0, revenue: 0, active: 0 });

    useEffect(() => { dispatch(fetchBookings()); }, [dispatch]);

    useEffect(() => {
        const dateFiltered = bookings.filter(b => b.bookingDate.split('T')[0] === selectedDate);
        setStats({
            total: dateFiltered.length,
            completed: dateFiltered.filter(b => b.status === 'completed').length,
            active: dateFiltered.filter(b => b.status === 'confirmed' || b.status === 'pending').length,
            revenue: dateFiltered
                .filter(b => b.status === 'completed' || b.paymentStatus === 'paid')
                .reduce((acc, cur) => acc + cur.totalPrice, 0),
        });
    }, [bookings, selectedDate]);

    const handleUpdateStatus = async (id, status) => {
        try {
            await axios.put(`/api/bookings/${id}/status`, { status });
            dispatch(fetchBookings());
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const filteredBookings = bookings.filter(b => b.bookingDate.split('T')[0] === selectedDate);

    if (loading) return <div className="container" style={{ marginTop: '5rem', textAlign: 'center' }}>Loading Admin Panel...</div>;

    const STATS = [
        { icon: <Users color="var(--accent)" size={24} />, label: 'Total Bookings', value: stats.total, accentColor: 'var(--accent)' },
        { icon: <Calendar color="#ffab00" size={24} />, label: "Completed Slots", value: stats.completed, accentColor: '#ffab00' },
        { icon: <TrendingUp color="#00b8d9" size={24} />, label: 'Active Slots', value: stats.active, accentColor: '#00b8d9' },
        { icon: <IndianRupee color="#36b37e" size={24} />, label: 'Total Revenue', value: `₹${stats.revenue}`, accentColor: '#36b37e' },
    ];

    return (
        <AdminLayout title="Admin Dashboard" subtitle="Manage your shop's performance and appointments.">
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {STATS.map(s => <StatCard key={s.label} {...s} />)}
            </div>

            {/* Content: Date Picker + Table */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
                {/* Date Picker */}
                <div className="card" style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}>
                    <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={18} /> Select Date
                    </h4>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ width: '100%', marginBottom: '1rem' }}
                    />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Bookings Table */}
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                        <h3>Appointments ({filteredBookings.length})</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.02)', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                                <tr>
                                    {['Customer', 'Service/Barber', 'Timing', 'Status', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '1rem 1.5rem' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.map((b) => (
                                    <BookingRow key={b._id} booking={b} onUpdateStatus={handleUpdateStatus} />
                                ))}
                                {filteredBookings.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            No appointments found for this date.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

// Extracted to avoid repeating tr/td structure inside the loop
const statusColors = {
    completed: { bg: 'rgba(54,179,126,0.1)', color: '#36b37e' },
    cancelled:  { bg: 'rgba(255,86,48,0.1)',  color: '#ff5630' },
};
const defaultStatus = { bg: 'rgba(255,171,0,0.1)', color: '#ffab00' };

const BookingRow = ({ booking, onUpdateStatus }) => {
    const { bg, color } = statusColors[booking.status] || defaultStatus;
    const isPending = booking.status === 'confirmed' || booking.status === 'pending';
    return (
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <td style={{ padding: '1.5rem' }}>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{booking.customerId?.username}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <Phone size={12} /> {booking.customerId?.phoneNumber}
                </div>
            </td>
            <td style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '4px' }}>
                    <Scissors size={14} color="var(--accent)" /> {booking.serviceId?.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Barber: {booking.barberId?.username}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 'bold', marginTop: '0.3rem' }}>₹{booking.totalPrice}</div>
            </td>
            <td style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '4px' }}>
                    <Clock size={14} /> {new Date(booking.bookingDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>{booking.duration} MINS</div>
            </td>
            <td style={{ padding: '1.5rem' }}>
                <span style={{ padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.7rem', fontWeight: '700', background: bg, color }}>
                    {booking.status.toUpperCase()}
                </span>
            </td>
            <td style={{ padding: '1.5rem' }}>
                {isPending ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button title="Complete" onClick={() => onUpdateStatus(booking._id, 'completed')} style={{ background: 'none', color: '#36b37e', padding: '0.5rem' }}>
                            <CheckCircle size={20} />
                        </button>
                        <button title="Cancel" onClick={() => onUpdateStatus(booking._id, 'cancelled')} style={{ background: 'none', color: '#ff5630', padding: '0.5rem' }}>
                            <XCircle size={20} />
                        </button>
                    </div>
                ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No actions</span>
                )}
            </td>
        </tr>
    );
};

export default AdminDashboard;
