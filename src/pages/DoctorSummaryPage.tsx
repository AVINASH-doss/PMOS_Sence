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
    if (!stored) {
      navigate('/assessment');
      return;
    }
    try {
      setResult(JSON.parse(stored));
    } catch {
      navigate('/assessment');
    }

    const cycleData = localStorage.getItem('pmos_cycle_stats');
    if (cycleData) {
      try {
        setCycleStats(JSON.parse(cycleData));
      } catch { /* ignore */ }
    }
  }, [navigate]);

  const handleGenerateSummary = async () => {
    if (!result) return;
    if (!isGeminiConfigured()) {
      setError('Gemini API key not configured. Showing data-only summary.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const summary = createAISummary(result);
      const text = await generateDoctorSummary(summary, cycleStats || undefined);
      setAiSummary(text);
    } catch (err: any) {
      setError(err.message || 'Failed to generate summary.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('PMOS_Sense_Doctor_Summary.pdf');
    } catch (err) {
      console.error('PDF generation error:', err);
      // Fallback to print
      window.print();
    }
  };

  if (!result) return null;

  const answers = result.answers;
  const highFactors = result.contributingFactors.filter(f => f.impact === 'high' || f.impact === 'medium');

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 no-print">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">My Doctor Discussion Summary</h1>
            <p className="text-text-secondary text-sm mt-1">
              A simple summary of your responses to help you discuss with a healthcare professional.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-text-secondary rounded-xl text-sm font-medium border border-border hover:bg-primary-50 transition-all"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        {/* Summary Content */}
        <div ref={printRef} className="bg-white rounded-3xl p-8 shadow-card border border-border">
          {/* Title */}
          <div className="text-center mb-8 pb-6 border-b border-border">
            <h2 className="text-xl font-bold text-primary-700">{appConfig.name}</h2>
            <p className="text-sm text-text-secondary mt-1">Doctor Discussion Summary</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Column 1: Basic Info + Menstrual Summary */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-text-primary mb-3 pb-2 border-b border-border">
                  Basic Information
                </h3>
                <div className="space-y-2 text-sm">
                  <InfoRow label="Age" value={`${answers.age} years`} />
                  <InfoRow label="Height" value={`${answers.height} cm`} />
                  <InfoRow label="Weight" value={`${answers.weight} kg`} />
                  <InfoRow label="BMI" value={result.bmi ? `${result.bmi} (${result.bmiCategory})` : 'N/A'} />
                  <InfoRow label="Age at first period" value={`${answers.firstMenstruation} years`} />
                </div>
              </div>

              {cycleStats && (
                <div>
                  <h3 className="text-sm font-bold text-text-primary mb-3 pb-2 border-b border-border">
                    Menstrual Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <InfoRow label="Average cycle length" value={`${cycleStats.averageCycleLength} days`} />
                    <InfoRow label="Cycle variability" value={cycleStats.variability} />
                    <InfoRow label="Missed periods" value={String(cycleStats.missedPeriods)} />
                  </div>
                </div>
              )}
            </div>

            {/* Column 2: Symptoms + Lifestyle */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-text-primary mb-3 pb-2 border-b border-border">
                  Key Reported Symptoms
                </h3>
                <ul className="space-y-1.5">
                  {highFactors.slice(0, 6).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="text-primary-500 mt-1">•</span>
                      {f.questionText.replace('Do you have ', '').replace('Have you experienced ', '').replace('Do you ', '').replace('?', '')}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-text-primary mb-3 pb-2 border-b border-border">
                  Lifestyle Factors
                </h3>
                <div className="space-y-2 text-sm">
                  <InfoRow label="Sleep" value={getAnswerLabel(answers.sleepHours)} />
                  <InfoRow label="Exercise" value={getAnswerLabel(answers.exercise)} />
                  <InfoRow label="Stress level" value={getAnswerLabel(answers.stressLevel)} />
                  <InfoRow label="Diet" value={getAnswerLabel(answers.diet)} />
                  <InfoRow label="Smoking/Alcohol" value={getAnswerLabel(answers.smokingAlcohol)} />
                </div>
              </div>
            </div>

            {/* Column 3: Score + Patterns */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-text-primary mb-3 pb-2 border-b border-border">
                  PMOS Screening Score
                </h3>
                <div className="flex justify-center mb-3">
                  <CircularProgress value={result.overallScore} size={100} strokeWidth={7} />
                </div>
                <p
                  className="text-center text-xs font-semibold px-3 py-1 rounded-full mx-auto w-fit"
                  style={{ backgroundColor: result.riskRange.color + '15', color: result.riskRange.color }}
                >
                  {result.riskRange.label}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-text-primary mb-3 pb-2 border-b border-border">
                  Pattern Scores
                </h3>
                <div className="space-y-3">
                  {result.patternScores.map(p => (
                    <div key={p.label} className="flex justify-between items-center text-sm">
                      <span className="text-text-secondary">{p.category}</span>
                      <span className="font-semibold" style={{ color: p.color }}>{p.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Summary */}
          {!aiSummary && !loading && (
            <div className="mt-8 text-center no-print">
              <button
                onClick={handleGenerateSummary}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                Generate AI Discussion Points
              </button>
            </div>
          )}

          {loading && (
            <div className="mt-8 flex items-center justify-center gap-3 text-text-secondary">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Generating discussion points...</span>
            </div>
          )}

          {error && (
            <div className="mt-6 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {aiSummary && (
            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="text-sm font-bold text-text-primary mb-3">AI-Generated Discussion Points</h3>
              <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {aiSummary}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-start gap-2 text-xs text-text-muted">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-400" />
              <p>{appConfig.summaryDisclaimer}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-text-primary">{value}</span>
    </div>
  );
}

function getAnswerLabel(value: any): string {
  const labels: Record<string, string> = {
    'less5': 'Less than 5h',
    '5-6': '5–6 hours',
    '7-8': '7–8 hours',
    'more8': 'More than 8h',
    'daily': 'Daily',
    '3-5': '3–5 times/week',
    '1-2': '1–2 times/week',
    'rarely': 'Rarely',
    'low': 'Low',
    'moderate': 'Moderate',
    'high': 'High',
    'veryHigh': 'Very high',
    'balanced': 'Balanced',
    'mostly': 'Mostly healthy',
    'mixed': 'Mixed',
    'processed': 'Mostly processed',
    'no': 'No',
    'occasionally': 'Occasionally',
    'regularly': 'Regularly',
  };
  return labels[String(value)] || String(value);
}
