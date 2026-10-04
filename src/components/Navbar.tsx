import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, User, LogIn } from 'lucide-react';
import { appConfig } from '../config/appConfig';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, profile } = useAuth();

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="no-print" style={{
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #ede5ff',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div className="section-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          {/* Logo */}
          <Link to="/" onClick={closeMobile} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', flexShrink: 0 }}>
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
              fontSize: '1.125rem', fontWeight: 700,
              background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              whiteSpace: 'nowrap',
            }}>
              {appConfig.name}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} className="hidden md:flex">
            {appConfig.navigation.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    color: isActive ? '#6d28d9' : '#6b7280',
                    background: isActive ? '#f5f0ff' : 'transparent',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
            {/* Auth button (desktop) */}
            {user ? (
              <Link to="/profile" style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.375rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem',
                fontWeight: 500, textDecoration: 'none', marginLeft: '4px',
                color: location.pathname === '/profile' ? '#6d28d9' : '#6b7280',
                background: location.pathname === '/profile' ? '#f5f0ff' : 'transparent',
              }}>
                <User style={{ width: '14px', height: '14px' }} />
                <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile?.display_name || 'Profile'}
                </span>
              </Link>
            ) : (
              <Link to="/login" style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.375rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem',
                fontWeight: 500, textDecoration: 'none', marginLeft: '4px',
                color: '#6b7280',
              }}>
                <LogIn style={{ width: '14px', height: '14px' }} />
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
            style={{
              padding: '0.5rem', borderRadius: '0.5rem', border: 'none',
              background: 'transparent', cursor: 'pointer', color: '#6b7280',
              flexShrink: 0,
            }}
          >
            {mobileOpen ? <X style={{ width: '22px', height: '22px' }} /> : <Menu style={{ width: '22px', height: '22px' }} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden" style={{
          background: 'white',
          borderBottom: '1px solid #ede5ff',
          padding: '0.5rem 1rem 0.75rem',
          maxHeight: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}>
          {appConfig.navigation.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobile}
                style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  fontSize: '0.9rem',
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
          <div style={{ borderTop: '1px solid #ede5ff', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
            {user ? (
              <Link to="/profile" onClick={closeMobile} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.9rem',
                fontWeight: 500, textDecoration: 'none',
                color: location.pathname === '/profile' ? '#6d28d9' : '#6b7280',
                background: location.pathname === '/profile' ? '#f5f0ff' : 'transparent',
              }}>
                <User style={{ width: '16px', height: '16px' }} />
                {profile?.display_name || 'My Profile'}
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={closeMobile} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.9rem',
                  fontWeight: 500, textDecoration: 'none', color: '#6b7280',
                }}>
                  <LogIn style={{ width: '16px', height: '16px' }} />
                  Sign In
                </Link>
                <Link to="/signup" onClick={closeMobile} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.9rem',
                  fontWeight: 600, textDecoration: 'none', color: '#7c3aed',
                }}>
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
