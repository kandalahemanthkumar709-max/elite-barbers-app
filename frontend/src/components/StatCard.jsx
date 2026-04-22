/**
 * Reusable stat card for the Admin Dashboard.
 */
const StatCard = ({ icon, label, value, accentColor = 'var(--accent)' }) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
        <div style={{ background: `${accentColor}18`, padding: '1rem', borderRadius: '12px' }}>
            {icon}
        </div>
        <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '4px' }}>
                {label}
            </p>
            <h3 style={{ fontSize: '1.5rem' }}>{value}</h3>
        </div>
    </div>
);

export default StatCard;
