import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchServices } from '../slices/servicesSlice';
import { getImageUrl } from '../utils/helpers';
import { Clock, IndianRupee, Search, Scissors } from 'lucide-react';

const Services = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { data: services, loading, error } = useSelector((state) => state.services);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const categories = ['All', 'Haircuts', 'Beard & Shave', 'Facial & Spa', 'Combos', 'Color & Chemical'];

    useEffect(() => {
        dispatch(fetchServices());
    }, [dispatch]);

    const filteredServices = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSelectService = (service) => {
        navigate('/confirm-booking', { state: { service } });
    };

    if (loading) return <div className="container" style={{ marginTop: '5rem', textAlign: 'center' }}>Loading elite services...</div>;
    if (error) return <div className="container" style={{ marginTop: '5rem', textAlign: 'center', color: '#ff4444' }}>Error: {error}</div>;

    return (
        <div className="container" style={{ marginTop: '3rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Our Services</h1>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '500px' }}>
                        Precision-engineered grooming experiences. Choose a service to begin your booking.
                    </p>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', width: '100%', maxWidth: '100%' }} className="search-container">
                    <Search
                        size={18}
                        color="var(--text-secondary)"
                        style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <input
                        type="text"
                        placeholder="Search services..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ 
                            width: '100%', 
                            padding: '0.8rem 1rem 0.8rem 3rem', 
                            background: '#111', 
                            border: '1px solid var(--border)', 
                            borderRadius: '4px', 
                            color: 'white', 
                            fontSize: '1rem',
                            outline: 'none',
                            marginBottom: '0' // Override the global index.css 1rem margin to fix vertical icon alignment!
                        }}
                    />
                </div>
            </div>

            <style>{`
                @media (min-width: 769px) {
                    .search-container { max-width: 350px !important; }
                }
            `}</style>

            {/* Category Filter Bar */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '3rem',
                overflowX: 'auto',
                paddingBottom: '1rem',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        style={{
                            padding: '0.8rem 1.5rem',
                            borderRadius: '50px',
                            whiteSpace: 'nowrap',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            background: selectedCategory === cat ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                            color: selectedCategory === cat ? '#000' : 'var(--text-secondary)',
                            border: `1px solid ${selectedCategory === cat ? 'var(--accent)' : 'var(--border)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {cat.toUpperCase()}
                    </button>
                ))}
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '2rem',
                marginBottom: '5rem'
            }}>
                {filteredServices.map((service) => (
                    <div key={service._id} className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {/* Service Image */}
                        <div style={{ width: '100%', height: '200px', overflow: 'hidden', position: 'relative', backgroundColor: 'var(--bg-primary)' }}>
                            {service.image ? (
                                <img
                                    src={getImageUrl(service.image)}
                                    alt={service.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                />
                            ) : (
                                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--border)' }}>
                                    <Scissors size={48} />
                                </div>
                            )}
                            <div style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'rgba(0,0,0,0.7)',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                color: 'var(--accent)',
                                fontWeight: '700',
                                border: '1px solid var(--accent)'
                            }}>
                                {service.category.toUpperCase()}
                            </div>
                        </div>

                        <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.8rem', color: 'var(--accent)' }}>{service.name}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                                    {service.description}
                                </p>
                            </div>

                            <div>
                                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Clock size={16} color="var(--accent)" />
                                        {service.duration} MINS
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <IndianRupee size={16} color="var(--accent)" />
                                        {service.price}
                                    </span>
                                </div>
                                <button
                                    className="btn-primary"
                                    style={{ width: '100%' }}
                                    onClick={() => handleSelectService(service)}
                                >
                                    SELECT SERVICE
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredServices.length === 0 && (
                    <p style={{ gridColumn: '1 / -1', textAlign: 'center', py: '5rem', color: 'var(--text-secondary)' }}>
                        No services found matching your search.
                    </p>
                )}
            </div>
        </div>
    );
};

export default Services;
