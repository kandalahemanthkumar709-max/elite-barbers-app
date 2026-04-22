import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, X, IndianRupee, Clock } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getImageUrl } from '../utils/helpers';

const CATEGORIES = ['Haircuts', 'Beard & Shave', 'Facial & Spa', 'Combos', 'Color & Chemical'];

const EMPTY_FORM = { name: '', description: '', price: '', duration: '', category: 'Haircuts' };

// ── Sub-components ──────────────────────────────────────────────────────────

const ServiceCard = ({ service, onEdit, onDelete }) => (
    <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: '100%', height: '200px', backgroundColor: 'var(--bg-primary)', position: 'relative' }}>
            {service.image ? (
                <img src={getImageUrl(service.image)} alt={service.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    <ImageIcon size={48} />
                </div>
            )}
            <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(0,0,0,0.8)', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 'bold' }}>
                {service.category.toUpperCase()}
            </div>
        </div>
        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>{service.name}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => onEdit(service)} style={{ background: 'none', color: 'var(--text-secondary)' }}><Edit2 size={16} /></button>
                    <button onClick={() => onDelete(service._id)} style={{ background: 'none', color: '#ff4444' }}><Trash2 size={16} /></button>
                </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>{service.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 'bold' }}>
                    <IndianRupee size={16} color="var(--accent)" />{service.price}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
                    <Clock size={16} />{service.duration} mins
                </span>
            </div>
        </div>
    </div>
);

const ServiceModal = ({ editingService, onClose, onSaved }) => {
    const [formData, setFormData] = useState(editingService ? {
        name: editingService.name,
        description: editingService.description,
        price: editingService.price,
        duration: editingService.duration,
        category: editingService.category,
    } : EMPTY_FORM);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(getImageUrl(editingService?.image));
    const [submitting, setSubmitting] = useState(false);

    const set = (key) => (e) => setFormData(f => ({ ...f, [key]: e.target.value }));

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const data = new FormData();
        Object.entries(formData).forEach(([k, v]) => data.append(k, v));
        if (imageFile) data.append('image', imageFile);
        try {
            if (editingService) {
                await axios.put(`/api/services/${editingService._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await axios.post('/api/services', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            onSaved();
        } catch (err) {
            console.error('Error saving service:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle = { marginBottom: 0 };
    const labelStyle = { display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', width: '100%', maxWidth: '600px', borderRadius: '8px', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem' }}>{editingService ? 'Edit Service' : 'Add New Service'}</h2>
                    <button onClick={onClose} style={{ background: 'none', color: 'white' }}><X /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div><label style={labelStyle}>Service Name</label><input required type="text" value={formData.name} onChange={set('name')} style={inputStyle} /></div>
                    <div>
                        <label style={labelStyle}>Category</label>
                        <select value={formData.category} onChange={set('category')} style={{ width: '100%', padding: '0.8rem', backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: '4px' }}>
                            {CATEGORIES.map(c => <option key={c} value={c} style={{ color: 'black' }}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Description</label>
                        <textarea required rows="3" value={formData.description} onChange={set('description')} style={{ width: '100%', padding: '0.8rem', backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: '4px', resize: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}><label style={labelStyle}>Price (₹)</label><input required type="number" value={formData.price} onChange={set('price')} style={inputStyle} /></div>
                        <div style={{ flex: 1 }}><label style={labelStyle}>Duration (Mins)</label><input required type="number" value={formData.duration} onChange={set('duration')} style={inputStyle} /></div>
                    </div>
                    <div style={{ padding: '1rem', border: '1px dashed var(--border)', borderRadius: '4px', textAlign: 'center' }}>
                        <label style={labelStyle}>Service Image</label>
                        {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', display: 'block', margin: '0 auto 1rem auto' }} />}
                        <label style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', cursor: 'pointer' }}>
                            Choose File
                            <input type="file" onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
                        </label>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '1rem', background: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: '4px' }}>Cancel</button>
                        <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, opacity: submitting ? 0.7 : 1 }}>
                            {submitting ? 'Saving...' : (editingService ? 'Save Changes' : 'Create Service')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Main Page ────────────────────────────────────────────────────────────────

const AdminServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalTarget, setModalTarget] = useState(null); // null = closed, false = add new, object = edit

    const fetchServices = async () => {
        try {
            const res = await axios.get('/api/services');
            setServices(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchServices(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this service?')) return;
        try { await axios.delete(`/api/services/${id}`); fetchServices(); }
        catch (err) { console.error(err); }
    };

    const filtered = services.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addAction = (
        <button className="btn-primary" onClick={() => setModalTarget(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Add New Service
        </button>
    );

    if (loading) return <div className="container" style={{ marginTop: '5rem', textAlign: 'center' }}>Loading Services...</div>;

    return (
        <AdminLayout title="Service Management" subtitle="Manage your shop's offerings, pricing, and styles." actions={addAction}>
            <div style={{ position: 'relative', marginBottom: '2rem' }}>
                <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '15px' }} />
                <input type="text" placeholder="Search by name or category..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '3rem' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {filtered.map(s => (
                    <ServiceCard key={s._id} service={s} onEdit={svc => setModalTarget(svc)} onDelete={handleDelete} />
                ))}
                {filtered.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No services found!</div>
                )}
            </div>

            {modalTarget !== null && (
                <ServiceModal
                    editingService={modalTarget || null}
                    onClose={() => setModalTarget(null)}
                    onSaved={() => { fetchServices(); setModalTarget(null); }}
                />
            )}
        </AdminLayout>
    );
};

export default AdminServices;
