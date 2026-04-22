import { Scissors, Award, Users } from 'lucide-react';

const About = () => {
    return (
        <div className="container" style={{ marginTop: '5rem', marginBottom: '8rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Crafting Excellence <br/><span style={{ color: 'var(--accent)' }}>Since 2010</span></h1>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.8' }}>
                    Elite Barber is more than just a place to get a haircut. It's a sanctuary for the modern gentleman who values precision, tradition, and the art of grooming.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem' }}>
                <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                    <div style={{ background: '#222', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                        <Scissors size={28} color="var(--accent)" />
                    </div>
                    <h3 style={{ marginBottom: '1rem' }}>Precision Cuts</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        Our master barbers are trained in both classical techniques and modern trends to deliver the perfect look every time.
                    </p>
                </div>

                <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', border: '1px solid var(--accent)' }}>
                    <div style={{ background: '#222', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                        <Award size={28} color="var(--accent)" />
                    </div>
                    <h3 style={{ marginBottom: '1rem' }}>Premium Service</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        From hot towel shaves to executive skin fades, every session is a luxury experience designed to make you feel your best.
                    </p>
                </div>

                <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                    <div style={{ background: '#222', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                        <Users size={28} color="var(--accent)" />
                    </div>
                    <h3 style={{ marginBottom: '1rem' }}>Expert Team</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                         A diverse team of skilled professionals who are passionate about their craft and dedicated to your satisfaction.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
