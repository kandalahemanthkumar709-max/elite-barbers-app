import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
    { label: 'Appointments', path: '/admin' },
    { label: 'Manage Services', path: '/admin/services' },
    { label: 'Manage Staff', path: '/admin/barbers' },
    { label: 'Store Settings', path: '/admin/settings' },
];

/**
 * Shared layout wrapper for all Admin pages.
 * Renders the page header with title/subtitle and a tab-nav
 * for switching between admin sections.
 */
const AdminLayout = ({ title, subtitle, actions, children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="container" style={{ marginTop: '3rem', paddingBottom: '5rem' }}>
            {/* Top Bar */}
            <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{title}</h1>
                    {subtitle && <p style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
                </div>
                {actions && <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>{actions}</div>}
            </div>

            {/* Tab Navigation */}
            <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                marginBottom: '3rem', 
                borderBottom: '1px solid var(--border)', 
                paddingBottom: '-1px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
            }}>
                {NAV_ITEMS.map(item => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            style={{
                                padding: '0.7rem 1.5rem',
                                background: 'none',
                                border: 'none',
                                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                                fontWeight: isActive ? '700' : '400',
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                marginBottom: '-1px',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </div>

            {/* Page Content */}
            {children}
        </div>
    );
};

export default AdminLayout;
