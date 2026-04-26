import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../slices/authSlice';
import { clearBookings } from '../slices/bookingsSlice';
import { Scissors, User, Menu, X } from 'lucide-react';

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
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(clearBookings());
        setIsMenuOpen(false);
        navigate('/');
    };

    return (
        <header style={{ padding: '1.2rem 0', borderBottom: '1px solid var(--border)', marginBottom: '2rem', position: 'sticky', top: 0, background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000 }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Logo */}
                <Link to={role === 'admin' ? '/admin' : '/'} onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent)', textDecoration: 'none', fontSize: '1.25rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', zIndex: 1001 }}>
                    <Scissors size={24} />
                    Elite Barbers
                </Link>

                {/* Mobile Toggle */}
                <button onClick={toggleMenu} style={{ background: 'none', color: 'white', display: 'none', zIndex: 1001 }} className="mobile-toggle">
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    {/* ── GUEST ─────────────────────────────── */}
                    {!token && (
                        <>
                            <Link to="/services" style={navLink} onClick={closeMenu}>Services</Link>
                            <Link to="/about" style={navLink} onClick={closeMenu}>About</Link>
                            <Link to="/contact" style={navLink} onClick={closeMenu}>Contact</Link>
                            <Link to="/" style={navLink} onClick={closeMenu}>Login</Link>
                            <Link to="/register" className="btn-primary" style={{ textDecoration: 'none' }} onClick={closeMenu}>Join</Link>
                        </>
                    )}

                    {/* ── ADMIN ─────────────────────────────── */}
                    {role === 'admin' && (
                        <>
                            <Link to="/admin" style={navLink} onClick={closeMenu}>Dashboard</Link>
                            <Link to="/admin/services" style={navLink} onClick={closeMenu}>Services</Link>
                            <Link to="/about" style={navLink} onClick={closeMenu}>About</Link>
                            <Link to="/profile" style={navLink} onClick={closeMenu}>Profile</Link>
                            <button onClick={handleLogout} style={{ background: 'none', color: 'var(--accent)', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>
                                LOGOUT
                            </button>
                        </>
                    )}

                    {/* ── CUSTOMER / BARBER ─────────────────── */}
                    {token && role !== 'admin' && (
                        <>
                            <Link to="/services" style={navLink} onClick={closeMenu}>Services</Link>
                            <Link to="/bookings" style={navLink} onClick={closeMenu}>My Bookings</Link>
                            <Link to="/about" style={navLink} onClick={closeMenu}>About</Link>
                            <Link to="/profile" style={{ ...navLink, display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={closeMenu}>
                                <User size={16} /> Profile
                            </Link>
                            <button onClick={handleLogout} style={{ background: 'none', color: 'var(--accent)', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>
                                LOGOUT
                            </button>
                        </>
                    )}
                </nav>
            </div>
            
            {/* Mobile Nav Styles (Injecting via style tag for simplicity in this component) */}
            <style>{`
                @media (max-width: 768px) {
                    .mobile-toggle { display: block !important; }
                    .nav-links {
                        position: fixed;
                        top: 0;
                        right: -100%;
                        width: 80%;
                        height: 100vh;
                        background: var(--bg-secondary);
                        flex-direction: column;
                        justify-content: center;
                        padding: 2rem;
                        transition: 0.3s ease-in-out;
                        box-shadow: -10px 0 30px rgba(0,0,0,0.5);
                        z-index: 1000;
                    }
                    .nav-links.open { right: 0; }
                    .nav-links a, .nav-links button {
                        font-size: 1.2rem !important;
                        width: 100%;
                        text-align: center;
                    }
                }
            `}</style>
        </header>
    );
};

export default Header;
