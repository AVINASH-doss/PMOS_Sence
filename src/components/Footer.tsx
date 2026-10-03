import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { appConfig } from '../config/appConfig';

export default function Footer() {
  return (
    <footer className="no-print" style={{ background: '#4c1d95', color: 'white' }}>
      <div className="section-container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{
                width: '32px', height: '32px', background: 'rgba(255,255,255,0.2)',
                borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Shield style={{ width: '16px', height: '16px', color: 'white' }} />
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{appConfig.name}</span>
            </div>
            <p style={{ color: 'rgba(196,171,255,0.9)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Early Awareness.<br />Healthier tomorrows.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ fontWeight: 600, marginBottom: '1rem', color: '#ddd0ff', fontSize: '0.9rem' }}>Quick Links</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {appConfig.navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{ color: 'rgba(196,171,255,0.8)', fontSize: '0.8rem', textDecoration: 'none', transition: 'color 0.2s' }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Follow Us */}
          <div>
            <h3 style={{ fontWeight: 600, marginBottom: '1rem', color: '#ddd0ff', fontSize: '0.9rem' }}>Follow Us</h3>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {['LinkedIn', 'Instagram', 'YouTube'].map((name) => (
                <a
                  key={name}
                  href="#"
                  aria-label={name}
                  style={{
                    width: '36px', height: '36px', background: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none',
                    transition: 'background 0.2s',
                  }}
                >
                  {name[0]}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '2rem', paddingTop: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'rgba(196,171,255,0.7)', fontSize: '0.75rem' }}>
            Developed as an academic project. Screening tool only — not a diagnostic medical device.
          </p>
        </div>
      </div>
    </footer>
  );
}
