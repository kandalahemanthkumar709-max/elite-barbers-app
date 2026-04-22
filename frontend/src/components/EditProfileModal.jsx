import { useState } from 'react';
import axios from '../api/axios';
import { Edit2, Check, X, Lock } from 'lucide-react';

const EditProfileModal = ({ profile, onClose, onSaved }) => {
    const [form, setForm] = useState({
        username: profile.username,
        email:    profile.email,
        phoneNumber: profile.phoneNumber || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [saving, setSaving]   = useState(false);
    const [error,  setError]    = useState('');
    const [success, setSuccess] = useState('');

    const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

    const handleSave = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');

        if (form.newPassword && form.newPassword !== form.confirmPassword) {
            setError('New passwords do not match.');
            return;
        }
        if (form.newPassword && form.newPassword.length < 6) {
            setError('New password must be at least 6 characters.');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                username: form.username,
                email:    form.email,
                phoneNumber: form.phoneNumber,
            };
            if (form.newPassword) {
                payload.currentPassword = form.currentPassword;
                payload.newPassword     = form.newPassword;
            }
            const res = await axios.put('/api/users/profile', payload);
            setSuccess('Profile updated successfully!');
            setTimeout(() => { onSaved(res.data); onClose(); }, 1200);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const inputStyle = { marginBottom: 0 };
    const labelStyle = { display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' };
    const divider    = { borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '0.5rem' };

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', width: '100%', maxWidth: '520px', borderRadius: '12px', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Edit2 size={20} color="var(--accent)" /> Edit Profile
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                {/* Form */}
                <form onSubmit={handleSave} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {/* Basic info */}
                    <div>
                        <label style={labelStyle}>Username</label>
                        <input type="text" value={form.username} onChange={set('username')} required style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Email</label>
                        <input type="email" value={form.email} onChange={set('email')} required style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Phone Number</label>
                        <input type="tel" value={form.phoneNumber} onChange={set('phoneNumber')} style={inputStyle} />
                    </div>

                    {/* Password section */}
                    <div style={divider}>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                            <Lock size={14} /> Leave password fields blank to keep your current password
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Current Password</label>
                                <input type="password" value={form.currentPassword} onChange={set('currentPassword')} placeholder="Required only if changing password" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>New Password</label>
                                <input type="password" value={form.newPassword} onChange={set('newPassword')} placeholder="Min 6 characters" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Confirm New Password</label>
                                <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat new password" style={inputStyle} />
                            </div>
                        </div>
                    </div>

                    {/* Feedback */}
                    {error   && <p style={{ color: '#ff5630', fontSize: '0.85rem', margin: 0 }}>⚠ {error}</p>}
                    {success && <p style={{ color: '#36b37e', fontSize: '0.85rem', margin: 0 }}>✓ {success}</p>}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.5rem' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.9rem', background: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: saving ? 0.7 : 1 }}>
                            {saving ? 'Saving...' : <><Check size={16} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
