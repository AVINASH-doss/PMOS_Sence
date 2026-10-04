import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Edit3, LogOut, Loader2, AlertCircle, CheckCircle, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserAssessments } from '../services/databaseService';
import type { AssessmentRow } from '../types/database';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signOut, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveError, setSaveError] = useState('');
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (profile) setDisplayName(profile.display_name || '');
  }, [profile]);

  useEffect(() => {
    if (user) {
      setLoadingAssessments(true);
      getUserAssessments(user.id).then(({ data }) => {
        setAssessments(data);
        setLoadingAssessments(false);
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    setSaveMsg('');
    const { error } = await updateProfile({ display_name: displayName });
    setSaving(false);
    if (error) {
      setSaveError(error);
    } else {
      setSaveMsg('Profile updated!');
      setEditing(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: '32px', height: '32px', color: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ff' }} className="animate-fade-in-up">
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e1b3a', marginBottom: '1.5rem' }}>My Profile</h1>

        {/* Profile Card */}
        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{
              width: '64px', height: '64px', flexShrink: 0,
              background: 'linear-gradient(135deg, #ede5ff, #fce7f3)',
              borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User style={{ width: '28px', height: '28px', color: '#7c3aed' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#1e1b3a', wordBreak: 'break-word' }}>
                {profile?.display_name || 'PMOS Sense User'}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem' }}>
                <Mail style={{ width: '13px', height: '13px', color: '#9ca3af' }} />
                <span style={{ fontSize: '0.8rem', color: '#6b7280', wordBreak: 'break-all' }}>{user.email}</span>
              </div>
              {user.created_at && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem' }}>
                  <Calendar style={{ width: '13px', height: '13px', color: '#9ca3af' }} />
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Edit Section */}
          {editing ? (
            <div style={{ borderTop: '1px solid #e9e2f5', paddingTop: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1e1b3a', marginBottom: '0.375rem' }}>Display Name</label>
              <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #e9e2f5', background: '#faf8ff', fontSize: '0.875rem', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.8rem', opacity: saving ? 0.6 : 1 }}>
                  {saving ? <><Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> Saving...</> : 'Save'}
                </button>
                <button onClick={() => { setEditing(false); setDisplayName(profile?.display_name || ''); }} className="btn-secondary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.8rem' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={() => setEditing(true)} className="btn-secondary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.8rem' }}>
                <Edit3 style={{ width: '14px', height: '14px' }} /> Edit Profile
              </button>
              <button onClick={handleSignOut} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.625rem 1.25rem', fontSize: '0.8rem', fontWeight: 600,
                borderRadius: '0.75rem', border: '1px solid #fecaca', background: '#fef2f2',
                color: '#ef4444', cursor: 'pointer',
              }}>
                <LogOut style={{ width: '14px', height: '14px' }} /> Sign Out
              </button>
            </div>
          )}

          {saveError && (
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.5rem 1rem' }}>
              <AlertCircle style={{ width: '14px', height: '14px', color: '#ef4444', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', color: '#991b1b' }}>{saveError}</span>
            </div>
          )}
          {saveMsg && (
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', padding: '0.5rem 1rem' }}>
              <CheckCircle style={{ width: '14px', height: '14px', color: '#22c55e', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', color: '#166534' }}>{saveMsg}</span>
            </div>
          )}
        </div>

        {/* Assessment History */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '36px', height: '36px', background: '#f5f0ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <History style={{ width: '18px', height: '18px', color: '#7c3aed' }} />
            </div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e1b3a' }}>Assessment History</h2>
          </div>

          {loadingAssessments ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
              <Loader2 style={{ width: '24px', height: '24px', color: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : assessments.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>
              No assessments yet. Complete an assessment to see your history here.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {assessments.slice(0, 10).map((a) => (
                <div key={a.id} style={{
                  display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.875rem 1rem', background: '#faf8ff', borderRadius: '0.75rem', border: '1px solid #e9e2f5',
                  gap: '0.5rem',
                }}>
                  <div>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e1b3a' }}>
                      Score: {a.overall_score}/100
                    </p>
                    <p style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '2px' }}>
                      {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.7rem',
                    fontWeight: 600, background: getRiskBg(a.risk_range), color: getRiskColor(a.risk_range),
                  }}>
                    {a.risk_range}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getRiskColor(risk: string): string {
  if (risk.toLowerCase().includes('lower')) return '#10b981';
  if (risk.toLowerCase().includes('moderate')) return '#f59e0b';
  return '#ef4444';
}

function getRiskBg(risk: string): string {
  if (risk.toLowerCase().includes('lower')) return '#dcfce7';
  if (risk.toLowerCase().includes('moderate')) return '#fef3c7';
  return '#fee2e2';
}
