import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import CircularProgress from '../components/CircularProgress';
import FormattedText from '../components/FormattedText';
import Disclaimer from '../components/Disclaimer';
import { type ScoringResult, createAISummary } from '../logic/scoring';
import { explainResults, isGeminiConfigured } from '../services/geminiService';
import { appConfig } from '../config/appConfig';

export default function ResultsPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [explanation, setExplanation] = useState('');
  const [explLoading, setExplLoading] = useState(false);
  const [explError, setExplError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('pmos_screening_result');
    if (!stored) { navigate('/assessment'); return; }
    try { setResult(JSON.parse(stored)); } catch { navigate('/assessment'); }
  }, [navigate]);

  const handleExplain = async () => {
    if (!result) return;
    if (!isGeminiConfigured()) {
      setExplError('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
      return;
    }
    setExplLoading(true);
    setExplError('');
    try {
      const text = await explainResults(createAISummary(result));
      setExplanation(text);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate explanation.';
      setExplError(msg);
    } finally {
      setExplLoading(false);
    }
  };

  if (!result) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ff' }} className="animate-fade-in-up">
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* ======== Overall Score ======== */}
        <div className="card" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 3vw, 2rem)', marginBottom: '1.5rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(1.15rem, 4vw, 1.5rem)', fontWeight: 700, color: '#1e1b3a', marginBottom: '1.5rem' }}>
            Your PMOS Screening Score
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
               className="md:!flex-row md:!justify-center md:!gap-12">
            <div className="animate-pulse-glow" style={{ borderRadius: '50%' }}>
              <CircularProgress value={result.overallScore} size={140} strokeWidth={10} showPercent={true} />
            </div>

            <div style={{ textAlign: 'center', maxWidth: '380px' }} className="md:!text-left">
              <span style={{
                display: 'inline-block', padding: '0.375rem 1rem', borderRadius: '9999px',
                fontSize: '0.8rem', fontWeight: 600, color: 'white', marginBottom: '0.75rem',
                background: result.riskRange.color,
              }}>
                {result.riskRange.label}
              </span>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.7 }}>
                Your responses indicate a {result.riskRange.label.toLowerCase().replace(' reported-risk range', '')} concentration of reported PMOS-related symptoms. This is a screening result and not a diagnosis.
              </p>
              <button
                onClick={handleExplain}
                disabled={explLoading}
                style={{
                  marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 1rem', borderRadius: '0.75rem', fontSize: '0.8rem', fontWeight: 500,
                  border: '1px solid #fbcfe8', background: '#fdf2f8', color: '#db2777',
                  cursor: 'pointer', opacity: explLoading ? 0.5 : 1,
                }}
              >
                {explLoading ? (
                  <><Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> Analyzing...</>
                ) : (
                  <><HelpCircle style={{ width: '14px', height: '14px' }} /> What does this mean?</>
                )}
              </button>
            </div>
          </div>

          {explanation && (
            <div style={{ marginTop: '1.5rem', background: '#f5f0ff', borderRadius: '1rem', padding: 'clamp(1rem, 3vw, 1.25rem)', border: '1px solid #ede5ff', textAlign: 'left', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
              <FormattedText content={explanation} />
            </div>
          )}
          {explError && (
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
              <AlertCircle style={{ width: '14px', height: '14px', color: '#ef4444', flexShrink: 0 }} />
              <p style={{ fontSize: '0.8rem', color: '#991b1b' }}>{explError}</p>
            </div>
          )}
        </div>

        {/* ======== Pattern Map ======== */}
        <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', marginBottom: '1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.05rem, 3.5vw, 1.25rem)', fontWeight: 700, color: '#1e1b3a', marginBottom: '1.5rem' }}>
            Your PMOS Pattern Map
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem', justifyItems: 'center' }}>
            {result.patternScores.map((pattern) => (
              <div key={pattern.label} style={{ textAlign: 'center' }}>
                <CircularProgress value={pattern.score} size={90} strokeWidth={7} showPercent={false} color={pattern.color} />
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e1b3a', marginTop: '0.5rem' }}>{pattern.category}</p>
                <span style={{
                  display: 'inline-block', marginTop: '0.25rem', padding: '0.125rem 0.5rem',
                  borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 500,
                  background: pattern.color + '18', color: pattern.color,
                }}>
                  {pattern.patternLabel}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ======== Contributing Factors ======== */}
        <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e1b3a', marginBottom: '0.5rem' }}>
            Main Contributing Responses
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1.25rem' }}>
            These reported factors contributed most to your screening result.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
            {result.contributingFactors
              .filter(f => f.impact === 'high')
              .slice(0, 8)
              .map((factor, i) => (
                <div key={i} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                  padding: '0.875rem', background: '#f5f0ff', borderRadius: '1rem', border: '1px solid #ede5ff', textAlign: 'center',
                }}>
                  <div style={{ width: '32px', height: '32px', background: '#ede5ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AlertCircle style={{ width: '16px', height: '16px', color: '#7c3aed' }} />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#1e1b3a', lineHeight: 1.3, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                    {factor.questionText.replace(/^(Do you have |Have you experienced |Do you |Have you been told that you have |Is your |Are your )/i, '').replace('?', '')}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* ======== Action Buttons ======== */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '1.5rem' }} className="sm:!grid-cols-3">
          <Link to="/action-plan" className="btn-primary" style={{ justifyContent: 'center', padding: '1rem 1.5rem' }}>
            View Action Plan <ArrowRight style={{ width: '16px', height: '16px' }} />
          </Link>
          <Link to="/ask-ai" className="btn-secondary" style={{ justifyContent: 'center', padding: '1rem 1.5rem' }}>
            Ask AI Questions <ArrowRight style={{ width: '16px', height: '16px' }} />
          </Link>
          <Link to="/doctor-summary" className="btn-secondary" style={{ justifyContent: 'center', padding: '1rem 1.5rem' }}>
            Doctor Summary <ArrowRight style={{ width: '16px', height: '16px' }} />
          </Link>
        </div>

        {/* ======== Disclaimers ======== */}
        <Disclaimer text={appConfig.scoringDisclaimer} />
        <div style={{ marginTop: '0.75rem' }}>
          <Disclaimer text={appConfig.disclaimer} variant="warning" />
        </div>
      </div>
    </div>
  );
}
