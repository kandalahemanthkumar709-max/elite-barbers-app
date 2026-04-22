import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const Contact = () => {
    return (
        <div className="container" style={{ marginTop: '5rem', marginBottom: '8rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>Get In <span style={{ color: 'var(--accent)' }}>Touch</span></h1>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                    Have questions about our services or need a special appointment? Reach out to us.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '5rem' }}>
                {/* Info Side */}
                <div>
                    <div style={{ marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{ color: 'var(--accent)' }}><MapPin size={24} /></div>
                            <div>
                                <h4 style={{ marginBottom: '0.5rem' }}>Location</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sunny Grooming Styles, Tirupathi District<br />Leela mahal road, Tirupathi, Andhra Pradesh 517501</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{ color: 'var(--accent)' }}><Phone size={24} /></div>
                            <div>
                                <h4 style={{ marginBottom: '0.5rem' }}>Phone</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>+91 (7702455973)</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{ color: 'var(--accent)' }}><Mail size={24} /></div>
                            <div>
                                <h4 style={{ marginBottom: '0.5rem' }}>Email</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>[sunny@gmail.com]</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <div style={{ color: 'var(--accent)' }}><Clock size={24} /></div>
                            <div>
                                <h4 style={{ marginBottom: '0.5rem' }}>Hours</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Mon - Sat: 9:00 AM - 7:00 PM<br />Sun: Closed</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="card" style={{ padding: '3rem' }}>
                    <form>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>NAME</label>
                                <input type="text" placeholder="John Doe" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>EMAIL</label>
                                <input type="email" placeholder="john@example.com" />
                            </div>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>SUBJECT</label>
                            <input type="text" placeholder="General Inquiry" />
                        </div>
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>MESSAGE</label>
                            <textarea placeholder="How can we help you?" style={{ minHeight: '150px' }}></textarea>
                        </div>
                        <button className="btn-primary" style={{ width: '100%', padding: '1.2rem' }}>SEND MESSAGE</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
