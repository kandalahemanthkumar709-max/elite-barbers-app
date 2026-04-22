export const InfoRow = ({ icon, label, value, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <span style={{ color: 'var(--accent)' }}>{icon}</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', minWidth: '80px' }}>{label}</span>
        <span style={{ fontWeight: '600', color: color || 'white', fontSize: '0.9rem' }}>{value}</span>
    </div>
);

export const StatRow = ({ icon, label, value, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem', background: 'var(--bg-primary)', borderRadius: '8px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <span style={{ color }}>{icon}</span>{label}
        </span>
        <span style={{ fontWeight: '700', color, fontSize: '1.1rem' }}>{value}</span>
    </div>
);

export const QuickLink = ({ label, onClick }) => (
    <button onClick={onClick}
        style={{ width: '100%', textAlign: 'left', padding: '0.9rem 1rem', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', transition: 'border-color 0.2s' }}
        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
        onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
        {label} →
    </button>
);
