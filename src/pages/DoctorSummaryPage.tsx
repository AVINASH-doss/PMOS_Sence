import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Printer, Loader2, AlertCircle } from 'lucide-react';
import CircularProgress from '../components/CircularProgress';
import { type ScoringResult, createAISummary } from '../logic/scoring';
import { generateDoctorSummary, isGeminiConfigured } from '../services/geminiService';
import { appConfig } from '../config/appConfig';

export default function DoctorSummaryPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [cycleStats, setCycleStats] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('pmos_screening_result');
    if (!stored) { navigate('/assessment'); return; }
    try { setResult(JSON.parse(stored)); } catch { navigate('/assessment'); }
    const cycleData = localStorage.getItem('pmos_cycle_stats');
    if (cycleData) try { setCycleStats(JSON.parse(cycleData)); } catch {}
  }, [navigate]);

  const handleGenerateSummary = async () => {
    if (!result) return;
    if (!isGeminiConfigured()) {
      setError('Gemini API key not configured. Showing data-only summary.');
      return;
    }
    setLoading(true); setError('');
    try {
      const text = await generateDoctorSummary(createAISummary(result), cycleStats || undefined);
      setAiSummary(text);
    } catch (err: any) {
      setError(err.message || 'Failed to generate summary.');
    } finally { setLoading(false); }
  };

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('PMOS_Sense_Doctor_Summary.pdf');
    } catch { window.print(); }
  };

  if (!result) return null;
  const answers = result.answers;
  const highFactors = result.contributingFactors.filter(f => f.impact === 'high' || f.impact === 'medium');

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ff' }} className="animate-fade-in-up">
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Header */}
        <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e1b3a' }}>My Doctor Discussion Summary</h1>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              A simple summary of your responses to help you discuss with a healthcare professional.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleDownloadPDF} className="btn-primary" style={{ padding: '0.625rem 1rem', fontSize: '0.8rem' }}>
              <Download style={{ width: '16px', height: '16px' }} /> Download PDF
            </button>
            <button onClick={handlePrint} className="btn-secondary" style={{ padding: '0.625rem 1rem', fontSize: '0.8rem' }}>
              <Printer style={{ width: '16px', height: '16px' }} /> Print
            </button>
          </div>
        </div>

        {/* Summary Content */}
        <div ref={printRef} className="card" style={{ padding: '2rem' }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e9e2f5' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#6d28d9' }}>{appConfig.name}</h2>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>Doctor Discussion Summary</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {/* Column 1 */}
            <div>
              <SectionTitle>Basic Information</SectionTitle>
              <InfoRow label="Age" value={`${answers.age} years`} />
              <InfoRow label="Height" value={`${answers.height} cm`} />
              <InfoRow label="Weight" value={`${answers.weight} kg`} />
              <InfoRow label="BMI" value={result.bmi ? `${result.bmi} (${result.bmiCategory})` : 'N/A'} />
              <InfoRow label="Age at first period" value={`${answers.firstMenstruation} years`} />

              {cycleStats && (
                <div style={{ marginTop: '1.5rem' }}>
                  <SectionTitle>Menstrual Summary</SectionTitle>
                  <InfoRow label="Average cycle length" value={`${cycleStats.averageCycleLength} days`} />
                  <InfoRow label="Cycle variability" value={cycleStats.variability} />
                  <InfoRow label="Missed periods" value={String(cycleStats.missedPeriods)} />
                </div>
              )}
            </div>

            {/* Column 2 */}
            <div>
              <SectionTitle>Key Reported Symptoms</SectionTitle>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {highFactors.slice(0, 6).map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
                    <span style={{ color: '#8b5cf6', marginTop: '2px' }}>•</span>
                    {f.questionText.replace(/^(Do you have |Have you experienced |Do you |Have you been told that you have |Is your |Are your )/i, '').replace('?', '')}
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: '1.5rem' }}>
                <SectionTitle>Lifestyle Factors</SectionTitle>
                <InfoRow label="Sleep" value={getAnswerLabel(answers.sleepHours)} />
                <InfoRow label="Exercise" value={getAnswerLabel(answers.exercise)} />
                <InfoRow label="Stress level" value={getAnswerLabel(answers.stressLevel)} />
                <InfoRow label="Diet" value={getAnswerLabel(answers.diet)} />
                <InfoRow label="Smoking/Alcohol" value={getAnswerLabel(answers.smokingAlcohol)} />
              </div>
            </div>

            {/* Column 3 */}
            <div>
              <SectionTitle>PMOS Screening Score</SectionTitle>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <CircularProgress value={result.overallScore} size={100} strokeWidth={7} />
              </div>
              <p style={{
                textAlign: 'center', fontSize: '0.7rem', fontWeight: 600,
                padding: '0.25rem 0.75rem', borderRadius: '9999px',
                width: 'fit-content', margin: '0 auto',
                background: result.riskRange.color + '18', color: result.riskRange.color,
              }}>
                {result.riskRange.label}
              </p>

              <div style={{ marginTop: '1.5rem' }}>
                <SectionTitle>Pattern Scores</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {result.patternScores.map(p => (
                    <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                      <span style={{ color: '#6b7280' }}>{p.category}</span>
                      <span style={{ fontWeight: 600, color: p.color }}>{p.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Discussion Points */}
          {!aiSummary && !loading && (
            <div className="no-print" style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button onClick={handleGenerateSummary} disabled={loading} className="btn-primary">
                Generate AI Discussion Points
              </button>
            </div>
          )}

          {loading && (
            <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: '#6b7280' }}>
              <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '0.85rem' }}>Generating discussion points...</span>
            </div>
          )}

          {error && (
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
              <AlertCircle style={{ width: '14px', height: '14px', color: '#f59e0b', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', color: '#92400e' }}>{error}</span>
            </div>
          )}

          {aiSummary && (
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e9e2f5' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e1b3a', marginBottom: '0.75rem' }}>AI-Generated Discussion Points</h3>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{aiSummary}</p>
            </div>
          )}

          {/* Disclaimer */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e9e2f5', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <AlertCircle style={{ width: '14px', height: '14px', color: '#f59e0b', marginTop: '2px', flexShrink: 0 }} />
            <p style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{appConfig.summaryDisclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e1b3a', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e9e2f5' }}>
      {children}
    </h3>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '0.8rem' }}>
      <span style={{ color: '#9ca3af' }}>{label}</span>
      <span style={{ fontWeight: 500, color: '#1e1b3a' }}>{value}</span>
    </div>
  );
}

function getAnswerLabel(value: any): string {
  const labels: Record<string, string> = {
    'less5': 'Less than 5h', '5-6': '5–6 hours', '7-8': '7–8 hours', 'more8': 'More than 8h',
    'daily': 'Daily', '3-5': '3–5 times/week', '1-2': '1–2 times/week', 'rarely': 'Rarely',
    'low': 'Low', 'moderate': 'Moderate', 'high': 'High', 'veryHigh': 'Very high',
    'balanced': 'Balanced', 'mostly': 'Mostly healthy', 'mixed': 'Mixed', 'processed': 'Mostly processed',
    'no': 'No', 'occasionally': 'Occasionally', 'regularly': 'Regularly',
  };
  return labels[String(value)] || String(value);
}
