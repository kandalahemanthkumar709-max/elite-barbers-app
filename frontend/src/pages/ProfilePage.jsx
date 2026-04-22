import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { logout } from '../slices/authSlice';
import { User, Mail, Phone, Shield, Scissors, Calendar, IndianRupee, LogOut, Edit2 } from 'lucide-react';
import EditProfileModal from '../components/EditProfileModal';
import { InfoRow, StatRow, QuickLink } from '../components/ProfileWidgets';

const decodeToken = (token) => {
    try { return JSON.parse(atob(token.split('.')[1])); }
    catch { return {}; }
};

const ROLE_STYLE = {
    admin:    { bg: 'rgba(212,175,55,0.15)', color: '#d4af37', label: 'Shop Owner / Admin' },
    barber:   { bg: 'rgba(0,184,217,0.15)',  color: '#00b8d9', label: 'Barber'             },
    customer: { bg: 'rgba(54,179,126,0.15)', color: '#36b37e', label: 'Customer'            },
};

const ProfilePage = () => {
    const navigate  = useNavigate();
    const dispatch  = useDispatch();
    const { token } = useSelector((state) => state.auth);
    const [profile,    setProfile]    = useState(null);
    const [bookings,   setBookings]   = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [showEdit,   setShowEdit]   = useState(false);

    const decoded  = token ? decodeToken(token) : {};
    const role     = decoded.role || 'customer';
    const roleInfo = ROLE_STYLE[role] || ROLE_STYLE.customer;

    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        const load = async () => {
            try {
                const [userRes, bookRes] = await Promise.all([
                    axios.get('/api/users/account'),
                    axios.get('/api/bookings'),
                ]);
                setProfile(userRes.data);
                setBookings(bookRes.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [token, navigate]);

    if (loading) return <div className="container" style={{ marginTop: '5rem', textAlign: 'center' }}>Loading profile...</div>;
    if (!profile) return null;

    const totalSpent = bookings.filter(b => b.paymentStatus === 'paid').reduce((a, b) => a + b.totalPrice, 0);
    const completed  = bookings.filter(b => b.status === 'completed').length;
    const upcoming   = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;

    return (
        <div className="container" style={{ marginTop: '3rem', paddingBottom: '5rem', maxWidth: '900px' }}>

            {/* ── Hero Card ──────────────────────────────── */}
            <div className="card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {role === 'admin' ? <Shield size={40} color="black" /> : <User size={40} color="black" />}
                </div>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>{profile.username}</h1>
                    <span style={{ display: 'inline-block', padding: '0.3rem 0.9rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '700', background: roleInfo.bg, color: roleInfo.color }}>
                        {roleInfo.label.toUpperCase()}
                    </span>
                </div>
                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setShowEdit(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(212,175,55,0.1)', color: 'var(--accent)', border: '1px solid rgba(212,175,55,0.3)', padding: '0.7rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                        <Edit2 size={16} /> Edit Profile
                    </button>
                    <button onClick={() => { dispatch(logout()); navigate('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,86,48,0.1)', color: '#ff5630', border: '1px solid rgba(255,86,48,0.3)', padding: '0.7rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </div>

            {/* ── Info + Stats ───────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--accent)' }}>Account Info</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <InfoRow icon={<User size={16} />}   label="Username" value={profile.username} />
                        <InfoRow icon={<Mail size={16} />}   label="Email"    value={profile.email} />
                        <InfoRow icon={<Phone size={16} />}  label="Phone"    value={profile.phoneNumber || '—'} />
                        <InfoRow icon={<Shield size={16} />} label="Role"     value={roleInfo.label} color={roleInfo.color} />
                    </div>
                </div>

                {role !== 'admin' ? (
                    <div className="card">
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--accent)' }}>Your Stats</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <StatRow icon={<Calendar size={16} />}    label="Upcoming"    value={upcoming}        color="#ffab00" />
                            <StatRow icon={<Scissors size={16} />}    label="Completed"   value={completed}       color="#36b37e" />
                            <StatRow icon={<IndianRupee size={16} />} label="Total Spent" value={`₹${totalSpent}`} color="var(--accent)" />
                        </div>
                    </div>
                ) : (
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', color: 'var(--accent)' }}>Quick Access</h3>
                        <QuickLink label="View Appointments" onClick={() => navigate('/admin')} />
                        <QuickLink label="Manage Services"   onClick={() => navigate('/admin/services')} />
                    </div>
                )}
            </div>

            {/* ── Edit Modal ────────────────────────────── */}
            {showEdit && (
                <EditProfileModal
                    profile={profile}
                    onClose={() => setShowEdit(false)}
                    onSaved={(updated) => setProfile(updated)}
                />
            )}
        </div>
    );
};

export default ProfilePage;
