import { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Disclaimer from '../components/Disclaimer';

interface CycleEntry {
  id: string;
  date: string;
  label: string;
}

interface CycleStats {
  averageCycleLength: number;
  shortestCycle: number;
  longestCycle: number;
  variability: string;
  longCycles: number;
  missedPeriods: number;
}

export default function CyclePage() {
  const [entries, setEntries] = useState<CycleEntry[]>([]);
  const [newDate, setNewDate] = useState('');
  const [dateError, setDateError] = useState('');

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('pmos_cycle_entries');
    if (stored) {
      try {
        setEntries(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('pmos_cycle_entries', JSON.stringify(entries));
  }, [entries]);

  const addEntry = () => {
    if (!newDate) {
      setDateError('Please select a date');
      return;
    }
    // Check duplicate
    if (entries.some(e => e.date === newDate)) {
      setDateError('This date has already been added');
      return;
    }
    setDateError('');

    const date = new Date(newDate);
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const entry: CycleEntry = {
      id: Date.now().toString(),
      date: newDate,
      label,
    };

    const updated = [...entries, entry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setEntries(updated);
    setNewDate('');
  };

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  // Calculate cycle lengths between consecutive entries
  const cycleLengths: { label: string; days: number }[] = [];
  for (let i = 1; i < entries.length; i++) {
    const prev = new Date(entries[i - 1].date);
    const curr = new Date(entries[i].date);
    const days = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    const month = curr.toLocaleDateString('en-US', { month: 'short' });
    cycleLengths.push({ label: month, days });
  }

  // Calculate stats
  const stats: CycleStats | null = cycleLengths.length > 0 ? (() => {
    const days = cycleLengths.map(c => c.days);
    const avg = Math.round(days.reduce((a, b) => a + b, 0) / days.length);
    const shortest = Math.min(...days);
    const longest = Math.max(...days);
    const range = longest - shortest;
    let variability = 'Low';
    if (range > 14) variability = 'High';
    else if (range > 7) variability = 'Moderate';
    const longCycles = days.filter(d => d > 35).length;
    const missedPeriods = days.filter(d => d > 60).length;

    return { averageCycleLength: avg, shortestCycle: shortest, longestCycle: longest, variability, longCycles, missedPeriods };
  })() : null;

  // Save cycle data for other pages
  useEffect(() => {
    if (stats) {
      localStorage.setItem('pmos_cycle_stats', JSON.stringify(stats));
    }
  }, [stats]);

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">My Cycle Pattern</h1>
            <p className="text-text-secondary text-sm mt-1">
              Track your period dates to analyse your cycle pattern.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={newDate}
              onChange={(e) => { setNewDate(e.target.value); setDateError(''); }}
              className="px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
            <button
              onClick={addEntry}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Period Date
            </button>
          </div>
        </div>

        {dateError && (
          <div className="mb-4 flex items-center gap-2 text-error text-sm bg-red-50 px-4 py-2 rounded-xl border border-red-200">
            <AlertCircle className="w-4 h-4" />
            {dateError}
          </div>
        )}

        {/* Date Tags */}
        {entries.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {entries.map(entry => (
              <div
                key={entry.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-border text-sm group"
              >
                <span className="text-text-primary font-medium">{entry.label}</span>
                <button
                  onClick={() => removeEntry(entry.id)}
                  className="text-text-muted hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                  aria-label={`Remove ${entry.label}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Chart & Summary */}
        {cycleLengths.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Chart */}
            <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-card border border-border">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Cycle Length (Days)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cycleLengths}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0eaff" />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e9e2f5',
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.1)',
                      }}
                      formatter={(value: any) => [`${value} days`, 'Cycle Length']}
                    />
                    <Line
                      type="monotone"
                      dataKey="days"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      dot={{ fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, fill: '#7c3aed' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cycle Summary */}
            {stats && (
              <div className="bg-white rounded-2xl p-6 shadow-card border border-border">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Cycle Summary</h2>
                <div className="space-y-4">
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
          <div className="bg-white rounded-2xl p-12 shadow-card border border-border text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No cycle data yet</h3>
            <p className="text-text-secondary text-sm">
              Add your period start dates (3–6 months) to see your cycle analysis.
            </p>
          </div>
        )}

        {/* Cycle advice */}
        {stats && stats.variability !== 'Low' && (
          <Disclaimer
            text="Your cycle pattern appears variable. Continue tracking your cycles and consider discussing persistent irregularity with a healthcare professional."
          />
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-error' : 'text-text-primary'}`}>{value}</span>
    </div>
  );
}
