import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../slices/authSlice';
import { Scissors, User } from 'lucide-react';

// Safely decode the JWT role without crashing if token is malformed
const getRoleFromToken = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1])).role;
    } catch {
        return null;
    }
};

const navLink = { color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.95rem' };
const accentLink = { color: 'var(--accent)', textDecoration: 'none', fontWeight: '700', fontSize: '0.95rem' };

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token } = useSelector((state) => state.auth);
    const role = token ? getRoleFromToken(token) : null;

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <header style={{ padding: '1.5rem 0', borderBottom: '1px solid var(--border)', marginBottom: '3rem' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Logo */}
                <Link to={role === 'admin' ? '/admin' : '/'} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--accent)', textDecoration: 'none', fontSize: '1.5rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    <Scissors size={28} />
                    Elite Barbers
                </Link>

                <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    {/* ── GUEST ─────────────────────────────── */}
                    {!token && (
                        <>
                            <Link to="/services" style={navLink}>Services</Link>
                            <Link to="/about" style={navLink}>About</Link>
                            <Link to="/contact" style={navLink}>Contact</Link>
                            <Link to="/" style={navLink}>Login</Link>
                            <Link to="/register" className="btn-primary" style={{ textDecoration: 'none' }}>Join</Link>
                        </>
                    )}

                    {/* ── ADMIN ─────────────────────────────── */}
                    {role === 'admin' && (
                        <>
                            <Link to="/admin" style={navLink}>Dashboard</Link>
                            <Link to="/admin/services" style={navLink}>Services</Link>
                            <Link to="/about" style={navLink}>About</Link>
                            <Link to="/contact" style={navLink}>Contact</Link>
                            <Link to="/profile" style={navLink}>Profile</Link>
                            <button onClick={handleLogout} style={{ background: 'none', color: 'var(--accent)', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>
                                LOGOUT
                            </button>
                        </>
                    )}

                    {/* ── CUSTOMER / BARBER ─────────────────── */}
                    {token && role !== 'admin' && (
                        <>
                            <Link to="/services" style={navLink}>Services</Link>
                            <Link to="/bookings" style={navLink}>My Bookings</Link>
                            <Link to="/about" style={navLink}>About</Link>
                            <Link to="/contact" style={navLink}>Contact</Link>
                            <Link to="/profile" style={{ ...navLink, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <User size={16} /> Profile
                            </Link>
                            <button onClick={handleLogout} style={{ background: 'none', color: 'var(--accent)', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>
                                LOGOUT
                            </button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
