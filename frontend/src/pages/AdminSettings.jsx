import { useState, useEffect } from 'react';
import axios from '../api/axios';
import AdminLayout from '../components/AdminLayout';
import { Clock, Store } from 'lucide-react';

const AdminSettings = () => {
    const [settings, setSettings] = useState({ openTime: 9, closeTime: 20 });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('/api/settings');
                if (res.data) setSettings(res.data);
            } catch (err) {
                console.error("Failed to load settings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: parseInt(e.target.value) });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMessage('');
        try {
            await axios.put('/api/settings', settings);
            setSuccessMessage("Operating hours successfully updated!");
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error(err);
            alert("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    // Helper to format 24h integer to 12h AM/PM string for display
    const formatTimeOffset = (hour) => {
        const ampm = hour >= 12 && hour < 24 ? 'PM' : 'AM';
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        return `${displayHour}:00 ${ampm}`;
    };

    if (loading) return <div className="container" style={{ marginTop: '5rem', textAlign: 'center' }}>Loading Settings...</div>;

    return (
        <AdminLayout title="Store Settings" subtitle="Configure global operational parameters.">
            <div className="card" style={{ maxWidth: '600px', background: '#111', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                    <Store size={24} color="var(--accent)" />
                    <h2 style={{ fontSize: '1.4rem' }}>Operational Hours</h2>
                </div>

                <form onSubmit={handleSave} style={{ display: 'grid', gap: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Shop Opens At
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', background: '#1a1a1a', borderRadius: '8px', padding: '0.5rem 1rem', border: '1px solid #333' }}>
                                <Clock size={16} color="var(--accent)" style={{ marginRight: '1rem' }} />
                                <select 
                                    name="openTime" 
                                    value={settings.openTime} 
                                    onChange={handleChange}
                                    style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', fontSize: '1rem', outline: 'none' }}
                                >
                                    {[...Array(24).keys()].map(h => (
                                        <option key={`open-${h}`} value={h} style={{ background: '#111' }}>{formatTimeOffset(h)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Shop Closes At
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', background: '#1a1a1a', borderRadius: '8px', padding: '0.5rem 1rem', border: '1px solid #333' }}>
                                <Clock size={16} color="var(--accent)" style={{ marginRight: '1rem' }} />
                                <select 
                                    name="closeTime" 
                                    value={settings.closeTime} 
                                    onChange={handleChange}
                                    style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', fontSize: '1rem', outline: 'none' }}
                                >
                                    {[...Array(24).keys()].map(h => (
                                        <option key={`close-${h}`} value={h} style={{ background: '#111' }}>{formatTimeOffset(h)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                        <span style={{ color: '#4ade80', fontSize: '0.9rem', fontWeight: '600', opacity: successMessage ? 1 : 0, transition: 'opacity 0.3s ease' }}>
                            {successMessage}
                        </span>
                        <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '0.8rem 2.5rem' }}>
                            {saving ? 'SAVING...' : 'SAVE CHANGES'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default AdminSettings;
