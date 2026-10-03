import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';
import { appConfig } from '../config/appConfig';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="no-print" style={{ 
      background: 'rgba(255,255,255,0.85)', 
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #ede5ff',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="section-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(139,92,246,0.3)'
            }}>
              <Shield style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <span style={{
              fontSize: '1.25rem', fontWeight: 700,
              background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              {appConfig.name}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="hidden md:flex">
            {appConfig.navigation.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    padding: '0.5rem 0.875rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    color: isActive ? '#6d28d9' : '#6b7280',
                    background: isActive ? '#f5f0ff' : 'transparent',
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
            style={{
              padding: '0.5rem', borderRadius: '0.5rem', border: 'none',
              background: 'transparent', cursor: 'pointer', color: '#6b7280'
            }}
          >
            {mobileOpen ? <X style={{ width: '20px', height: '20px' }} /> : <Menu style={{ width: '20px', height: '20px' }} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden" style={{ background: 'white', borderBottom: '1px solid #ede5ff', padding: '0.75rem 1rem' }}>
          {appConfig.navigation.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: isActive ? '#6d28d9' : '#6b7280',
                  background: isActive ? '#f5f0ff' : 'transparent',
                  marginBottom: '2px',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
