import { useState, useEffect } from 'react';
import axios from '../api/axios';
import AdminLayout from '../components/AdminLayout';
import { User, Phone, Mail, Scissors, Plus, Trash2 } from 'lucide-react';

const AdminBarbers = () => {
    const [barbers, setBarbers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        username: '', email: '', password: '', phoneNumber: '', bio: '', specialties: ''
    });

    const fetchBarbers = async () => {
        try {
            const res = await axios.get('/api/barbers');
            setBarbers(res.data);
        } catch (err) {
            console.error("Failed to fetch barbers", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBarbers();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddBarber = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                role: 'barber',
                specialties: formData.specialties.split(',').map(s => s.trim())
            };
            await axios.post('/api/users/register', payload);
            setShowForm(false);
            setFormData({ username: '', email: '', password: '', phoneNumber: '', bio: '', specialties: '' });
            fetchBarbers(); // Refresh list
        } catch (err) {
            alert(err.response?.data?.error || err.response?.data?.errors?.join(', ') || 'Failed to add barber');
        }
    };

    if (loading) return <div className="container" style={{ marginTop: '5rem', textAlign: 'center' }}>Loading staff...</div>;

    return (
        <AdminLayout title="Manage Barbers" subtitle="Add and manage your shop's master barbers.">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem' }}>Active Staff ({barbers.length})</h3>
                <button 
                    onClick={() => setShowForm(!showForm)} 
                    className="btn-primary"
                    style={{ padding: '0.8rem 1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                >
                    <Plus size={18} /> {showForm ? 'CANCEL' : 'ADD NEW BARBER'}
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '2rem', background: '#111', border: '1px solid var(--accent)' }}>
                    <h3 style={{ color: 'var(--accent)', marginBottom: '1.5rem' }}>Register New Barber</h3>
                    <form onSubmit={handleAddBarber} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Full Name</label>
                            <input name="username" value={formData.username} onChange={handleChange} required style={{ width: '100%' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email Address</label>
                            <input name="email" type="email" value={formData.email} onChange={handleChange} required style={{ width: '100%' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Phone Number</label>
                            <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required style={{ width: '100%' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Temporary Password</label>
                            <input name="password" type="password" value={formData.password} onChange={handleChange} required style={{ width: '100%' }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Specialties (Comma Separated)</label>
                            <input name="specialties" placeholder="Fades, Scissor Cuts, Beard Trim" value={formData.specialties} onChange={handleChange} style={{ width: '100%' }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Short Bio</label>
                            <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" style={{ width: '100%' }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
                            <button type="submit" className="btn-primary" style={{ padding: '0.8rem 2rem' }}>Register staff member</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {barbers.map(b => (
                    <div key={b._id} className="card" style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', alignItems: 'center' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                            <User size={30} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{b.username}</h4>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                <Mail size={12} /> {b.email}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                                <Phone size={12} /> {b.phoneNumber}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {b.specialties?.map((s, i) => (
                                    <span key={i} style={{ background: '#111', color: 'var(--accent)', padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '4px', border: '1px solid #333' }}>{s}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
};

export default AdminBarbers;
