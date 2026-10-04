import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Apple, Dumbbell, Moon, Sparkles, Stethoscope, Loader2, AlertCircle } from 'lucide-react';
import { type ScoringResult, createAISummary } from '../logic/scoring';
import { generateActionPlan, isGeminiConfigured } from '../services/geminiService';
import Disclaimer from '../components/Disclaimer';

const CATEGORY_ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  'Menstrual Health': Heart, 'Menstrual & Hormonal Health': Heart,
  'Nutrition': Apple, 'Nutrition & Exercise': Apple,
  'Physical Activity': Dumbbell,
  'Sleep & Stress': Moon, 'Stress & Sleep Care': Moon, 'Sleep & Stress Care': Moon,
  'Skin & Hair Care': Sparkles,
  'Regular Check-ups': Stethoscope, 'Doctor Visit Preparation': Stethoscope,
};
const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  'Menstrual Health': { bg: '#fdf2f8', color: '#ec4899' },
  'Menstrual & Hormonal Health': { bg: '#fdf2f8', color: '#ec4899' },
  'Nutrition': { bg: '#f0fdf4', color: '#22c55e' },
  'Nutrition & Exercise': { bg: '#f0fdf4', color: '#22c55e' },
  'Physical Activity': { bg: '#eff6ff', color: '#3b82f6' },
  'Sleep & Stress': { bg: '#eef2ff', color: '#6366f1' },
  'Stress & Sleep Care': { bg: '#eef2ff', color: '#6366f1' },
  'Sleep & Stress Care': { bg: '#eef2ff', color: '#6366f1' },
  'Skin & Hair Care': { bg: '#fdf2f8', color: '#ec4899' },
  'Regular Check-ups': { bg: '#fffbeb', color: '#f59e0b' },
  'Doctor Visit Preparation': { bg: '#fffbeb', color: '#f59e0b' },
};

function getLocalRecommendations(result: ScoringResult): string {
  const recs: string[] = [];
  const a = result.answers;
  const ms = result.patternScores.find(p => p.label === 'menstrual');
  const as2 = result.patternScores.find(p => p.label === 'androgen');

  recs.push('## Menstrual Health');
  if (ms && ms.score > 40) {
    recs.push('- Track your cycles regularly to identify patterns');
    recs.push('- Note any persistent irregularity with a healthcare professional');
    recs.push('- Keep a symptom diary alongside your cycle tracker');
  } else {
    recs.push('- Continue monitoring your cycle patterns');
    recs.push('- Maintain awareness of any changes in your cycle');
  }

  recs.push('\n## Nutrition');
  if (a.diet === 'processed' || a.diet === 'mixed' || a.sugarCravings === 'yes') {
    recs.push('- Include a balanced diet with whole foods');
    recs.push('- Reduce refined sugars and processed foods');
    recs.push('- Include fibre-rich foods in your daily meals');
  } else {
    recs.push('- Maintain your current balanced eating habits');
    recs.push('- Ensure adequate intake of essential vitamins and minerals');
  }

  recs.push('\n## Physical Activity');
  if (a.exercise === 'rarely' || a.exercise === '1-2') {
    recs.push('- Aim for at least 150 minutes of moderate activity per week');
    recs.push('- Include both cardio and strength training');
    recs.push('- Consider gradually increasing regular physical activity');
  } else {
    recs.push('- Maintain your current exercise routine');
    recs.push('- Continue with a mix of cardio and strength training');
  }

  recs.push('\n## Sleep & Stress');
  if (a.sleepHours === 'less5' || a.sleepHours === '5-6' || a.stressLevel === 'high' || a.stressLevel === 'veryHigh') {
    recs.push('- Aim for 7–8 hours of sleep per night');
    recs.push('- Consider establishing a consistent sleep schedule');
    recs.push('- Try stress management techniques like breathing exercises or yoga');
  } else {
    recs.push('- Maintain your current sleep routine');
    recs.push('- Continue practicing stress management');
  }

  recs.push('\n## Skin & Hair Care');
  if (as2 && as2.score > 40) {
    recs.push('- Maintain a gentle skincare routine');
    recs.push('- Discuss persistent acne or excessive hair growth with a dermatologist');
    recs.push('- Consider gentle, hormone-friendly skincare products');
  } else {
    recs.push('- Maintain your current skincare routine');
    recs.push('- Monitor for any changes in skin or hair health');
  }

  recs.push('\n## Regular Check-ups');
  if (result.overallScore > 50) {
    recs.push('- Consider discussing your symptoms with a gynaecologist or endocrinologist');
    recs.push('- Bring your PMOS Sense screening summary to your appointment');
    recs.push('- Consider taking your symptom history to a healthcare professional');
  } else {
    recs.push('- Continue with regular health check-ups');
    recs.push('- Monitor for any new or changing symptoms');
  }
  return recs.join('\n');
}

export default function ActionPlanPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [planText, setPlanText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('pmos_screening_result');
    if (!stored) { navigate('/assessment'); return; }
    try {
      const parsed = JSON.parse(stored);
      setResult(parsed);
      loadPlan(parsed);
    } catch { navigate('/assessment'); }
  }, [navigate]);

  const loadPlan = async (res: ScoringResult) => {
    setLoading(true);
    setError('');
    if (isGeminiConfigured()) {
      try {
        const plan = await generateActionPlan(createAISummary(res));
        setPlanText(plan);
      } catch {
        setPlanText(getLocalRecommendations(res));
        setError('AI plan unavailable. Showing general recommendations.');
      }
    } else {
      setPlanText(getLocalRecommendations(res));
    }
    setLoading(false);
  };

  if (!result) return null;
  const categories = parsePlanCategories(planText);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ff' }} className="animate-fade-in-up">
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', fontWeight: 700, color: '#1e1b3a' }}>Your Personalised Action Plan</h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Based on your responses, here are some general recommendations.
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
            <AlertCircle style={{ width: '14px', height: '14px', color: '#f59e0b', flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', color: '#92400e' }}>{error}</span>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
            <Loader2 style={{ width: '32px', height: '32px', color: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '1rem' }}>Generating your personalised plan...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }} className="sm:!grid-cols-2">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.title] || Heart;
              const colors = CATEGORY_COLORS[cat.title] || { bg: '#f5f0ff', color: '#7c3aed' };
              return (
                <div key={cat.title} className="card" style={{ padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', background: colors.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon style={{ width: '20px', height: '20px', color: colors.color }} />
                    </div>
                    <h3 style={{ fontWeight: 600, color: '#1e1b3a', fontSize: '0.9rem', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{cat.title}</h3>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {cat.items.map((item, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: '#4b5563', lineHeight: 1.6 }}>
                        <span style={{ color: '#8b5cf6', marginTop: '2px', fontWeight: 'bold', flexShrink: 0 }}>•</span>
                        <span style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>{item.replace(/\*\*/g, '').replace(/^[*\-•]\s*/, '')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: '2rem' }}>
          <Disclaimer text="These are general educational recommendations, not medical treatment instructions. Consult a healthcare professional for personalised medical advice." />
        </div>
      </div>
    </div>
  );
}

function parsePlanCategories(text: string): { title: string; items: string[] }[] {
  if (!text) return [];
  const categories: { title: string; items: string[] }[] = [];
  let current: { title: string; items: string[] } | null = null;
  for (const line of text.split('\n')) {
    const hdr = line.match(/^#{1,3}\s+(.+)/);
    if (hdr) {
      if (current && current.items.length > 0) categories.push(current);
      current = { title: hdr[1].trim().replace(/\*\*/g, ''), items: [] };
      continue;
    }
    const bullet = line.match(/^[-*]\s+(.+)/);
    if (bullet && current) current.items.push(bullet[1].trim());
  }
  if (current && current.items.length > 0) categories.push(current);
  return categories;
}
