import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowRight, TrendingUp, Activity, Zap, Heart, AlertCircle } from 'lucide-react';
import CircularProgress from '../components/CircularProgress';
import Disclaimer from '../components/Disclaimer';
import { type ScoringResult, createAISummary } from '../logic/scoring';
import { explainResults, isGeminiConfigured } from '../services/geminiService';
import { appConfig } from '../config/appConfig';

export default function ResultsPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [explLoading, setExplLoading] = useState(false);
  const [explError, setExplError] = useState('');

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
      const summary = createAISummary(result);
      const text = await explainResults(summary);
      setExplanation(text);
    } catch (err: any) {
      setExplError(err.message || 'Failed to generate explanation.');
    } finally {
      setExplLoading(false);
    }
  };

  if (!result) return null;

  const patternIcons = [Activity, TrendingUp, Zap, Heart];

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Score */}
        <div className="bg-white rounded-3xl p-8 shadow-card border border-border mb-8">
          <h1 className="text-2xl font-bold text-text-primary text-center mb-8">
            Your PMOS Screening Score
          </h1>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="animate-pulse-glow rounded-full">
              <CircularProgress
                value={result.overallScore}
                size={160}
                strokeWidth={10}
                showPercent={true}
              />
            </div>

            <div className="text-center md:text-left max-w-md">
              <span
                className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold text-white mb-3"
                style={{ backgroundColor: result.riskRange.color }}
              >
                {result.riskRange.label}
              </span>
              <p className="text-text-secondary text-sm leading-relaxed">
                Your responses indicate a {result.riskRange.label.toLowerCase().replace(' reported-risk range', '')} concentration of reported PMOS-related symptoms. This is a screening result and not a diagnosis.
              </p>
              <button
                onClick={handleExplain}
                disabled={explLoading}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-accent-200 text-accent-600 bg-accent-50 hover:bg-accent-100 transition-all disabled:opacity-50"
              >
                <HelpCircle className="w-4 h-4" />
                {explLoading ? 'Analyzing...' : 'What does this mean?'}
              </button>
            </div>
          </div>

          {/* AI Explanation */}
          {explanation && (
            <div className="mt-6 bg-lavender-50 rounded-2xl p-5 border border-primary-100">
              <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">{explanation}</p>
            </div>
          )}
          {explError && (
            <div className="mt-6 bg-red-50 rounded-2xl p-4 border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{explError}</p>
            </div>
          )}
        </div>

        {/* Pattern Map */}
        <div className="bg-white rounded-3xl p-8 shadow-card border border-border mb-8">
          <h2 className="text-xl font-bold text-text-primary text-center mb-8">
            Your PMOS Pattern Map
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {result.patternScores.map((pattern, index) => {
              const Icon = patternIcons[index] || Activity;
              return (
                <div key={pattern.label} className="text-center">
                  <CircularProgress
                    value={pattern.score}
                    size={100}
                    strokeWidth={7}
                    showPercent={false}
                    color={pattern.color}
                  />
                  <p className="text-sm font-semibold text-text-primary mt-2">{pattern.category}</p>
                  <span
                    className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: pattern.color + '15',
                      color: pattern.color,
                    }}
                  >
                    {pattern.patternLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contributing Factors */}
        <div className="bg-white rounded-3xl p-8 shadow-card border border-border mb-8">
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Main Contributing Responses
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            These reported factors contributed most to your screening result.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {result.contributingFactors
              .filter(f => f.impact === 'high')
              .slice(0, 8)
              .map((factor, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-2 p-4 bg-lavender-50 rounded-2xl border border-primary-100 text-center"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="text-xs font-medium text-text-primary leading-tight">
                    {factor.questionText.replace('Do you have ', '').replace('Have you experienced ', '').replace('Do you ', '').replace('?', '')}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/action-plan"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            View Action Plan
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/ask-ai"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-primary-700 rounded-2xl font-semibold border border-primary-200 hover:bg-primary-50 transition-all"
          >
            Ask AI Questions
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/doctor-summary"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-primary-700 rounded-2xl font-semibold border border-primary-200 hover:bg-primary-50 transition-all"
          >
            Doctor Summary
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Disclaimers */}
        <Disclaimer text={appConfig.scoringDisclaimer} />
        <div className="mt-3">
          <Disclaimer text={appConfig.disclaimer} variant="warning" />
        </div>
      </div>
    </div>
  );
}
