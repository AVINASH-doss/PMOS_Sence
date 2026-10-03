import { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Disclaimer from '../components/Disclaimer';

interface CycleEntry { id: string; date: string; label: string; }
interface CycleStats { averageCycleLength: number; shortestCycle: number; longestCycle: number; variability: string; longCycles: number; missedPeriods: number; }

export default function CyclePage() {
  const [entries, setEntries] = useState<CycleEntry[]>([]);
  const [newDate, setNewDate] = useState('');
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('pmos_cycle_entries');
    if (stored) try { setEntries(JSON.parse(stored)); } catch {}
  }, []);

  useEffect(() => { localStorage.setItem('pmos_cycle_entries', JSON.stringify(entries)); }, [entries]);

  const addEntry = () => {
    if (!newDate) { setDateError('Please select a date'); return; }
    if (entries.some(e => e.date === newDate)) { setDateError('This date has already been added'); return; }
    setDateError('');
    const date = new Date(newDate);
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const updated = [...entries, { id: Date.now().toString(), date: newDate, label }]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setEntries(updated);
    setNewDate('');
  };

  const removeEntry = (id: string) => setEntries(prev => prev.filter(e => e.id !== id));

  const cycleLengths: { label: string; days: number }[] = [];
  for (let i = 1; i < entries.length; i++) {
    const days = Math.round((new Date(entries[i].date).getTime() - new Date(entries[i - 1].date).getTime()) / 86400000);
    cycleLengths.push({ label: new Date(entries[i].date).toLocaleDateString('en-US', { month: 'short' }), days });
  }

  const stats: CycleStats | null = cycleLengths.length > 0 ? (() => {
    const days = cycleLengths.map(c => c.days);
    const avg = Math.round(days.reduce((a, b) => a + b, 0) / days.length);
    const range = Math.max(...days) - Math.min(...days);
    return {
      averageCycleLength: avg, shortestCycle: Math.min(...days), longestCycle: Math.max(...days),
      variability: range > 14 ? 'High' : range > 7 ? 'Moderate' : 'Low',
      longCycles: days.filter(d => d > 35).length, missedPeriods: days.filter(d => d > 60).length,
    };
  })() : null;

  useEffect(() => { if (stats) localStorage.setItem('pmos_cycle_stats', JSON.stringify(stats)); }, [stats]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ff' }} className="animate-fade-in-up">
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e1b3a' }}>My Cycle Pattern</h1>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Track your period dates to analyse your cycle pattern.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="date"
              value={newDate}
              onChange={(e) => { setNewDate(e.target.value); setDateError(''); }}
              style={{
                padding: '0.625rem 1rem', borderRadius: '0.75rem', border: '1px solid #e9e2f5',
                background: 'white', fontSize: '0.85rem', outline: 'none',
              }}
            />
            <button onClick={addEntry} className="btn-primary" style={{ padding: '0.625rem 1rem', fontSize: '0.8rem' }}>
              <Plus style={{ width: '16px', height: '16px' }} /> Add Period Date
            </button>
          </div>
        </div>

        {dateError && (
          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.5rem 1rem' }}>
            <AlertCircle style={{ width: '14px', height: '14px', color: '#ef4444' }} />
            <span style={{ fontSize: '0.8rem', color: '#991b1b' }}>{dateError}</span>
          </div>
        )}

        {/* Date Tags */}
        {entries.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
            {entries.map(entry => (
              <div key={entry.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.375rem 0.75rem', background: 'white', borderRadius: '0.75rem',
                border: '1px solid #e9e2f5', fontSize: '0.8rem',
              }}>
                <span style={{ fontWeight: 500, color: '#1e1b3a' }}>{entry.label}</span>
                <button onClick={() => removeEntry(entry.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }} aria-label={`Remove ${entry.label}`}>
                  <Trash2 style={{ width: '12px', height: '12px' }} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Chart & Summary */}
        {cycleLengths.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="card" style={{ padding: '1.5rem', gridColumn: 'span 1' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e1b3a', marginBottom: '1rem' }}>Cycle Length (Days)</h2>
              <div style={{ height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cycleLengths}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0eaff" />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e9e2f5', boxShadow: '0 4px 12px rgba(139,92,246,0.1)' }}
                      formatter={(value: any) => [`${value} days`, 'Cycle Length']}
                    />
                    <Line type="monotone" dataKey="days" stroke="#8b5cf6" strokeWidth={2.5}
                      dot={{ fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, fill: '#7c3aed' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {stats && (
              <div className="card" style={{ padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e1b3a', marginBottom: '1rem' }}>Cycle Summary</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <SummaryRow label="Average cycle length" value={`${stats.averageCycleLength} days`} />
                  <SummaryRow label="Shortest cycle" value={`${stats.shortestCycle} days`} />
                  <SummaryRow label="Longest cycle" value={`${stats.longestCycle} days`} />
                  <SummaryRow label="Cycle variability" value={stats.variability} highlight={stats.variability === 'High'} />
                  <SummaryRow label="Missed periods" value={String(stats.missedPeriods)} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: '56px', height: '56px', margin: '0 auto 1rem', background: '#f5f0ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus style={{ width: '28px', height: '28px', color: '#a87bff' }} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1e1b3a', marginBottom: '0.5rem' }}>No cycle data yet</h3>
            <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Add your period start dates (3–6 months) to see your cycle analysis.</p>
          </div>
        )}

        {stats && stats.variability !== 'Low' && (
          <Disclaimer text="Your cycle pattern appears variable. Continue tracking your cycles and consider discussing persistent irregularity with a healthcare professional." />
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{label}</span>
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: highlight ? '#ef4444' : '#1e1b3a' }}>{value}</span>
    </div>
  );
}
