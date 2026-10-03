import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Apple, Dumbbell, Moon, Sparkles, Stethoscope, Loader2, AlertCircle } from 'lucide-react';
import { type ScoringResult, createAISummary } from '../logic/scoring';
import { generateActionPlan, isGeminiConfigured } from '../services/geminiService';
import Disclaimer from '../components/Disclaimer';

const CATEGORY_ICONS: Record<string, any> = {
  'Menstrual Health': Heart,
  'Nutrition': Apple,
  'Physical Activity': Dumbbell,
  'Sleep & Stress': Moon,
  'Skin & Hair Care': Sparkles,
  'Regular Check-ups': Stethoscope,
};

const CATEGORY_COLORS: Record<string, string> = {
  'Menstrual Health': 'bg-accent-50 text-accent-600',
  'Nutrition': 'bg-green-50 text-green-600',
  'Physical Activity': 'bg-blue-50 text-blue-600',
  'Sleep & Stress': 'bg-indigo-50 text-indigo-600',
  'Skin & Hair Care': 'bg-pink-50 text-pink-600',
  'Regular Check-ups': 'bg-amber-50 text-amber-600',
};

// Fallback recommendations when API is not available
function getLocalRecommendations(result: ScoringResult): string {
  const recs: string[] = [];
  
  recs.push('## Menstrual Health');
  const menstrualScore = result.patternScores.find(p => p.label === 'menstrual');
  if (menstrualScore && menstrualScore.score > 40) {
    recs.push('- Track your cycles regularly to identify patterns');
    recs.push('- Note any persistent irregularity with a healthcare professional');
    recs.push('- Keep a symptom diary alongside your cycle tracker');
  } else {
    recs.push('- Continue monitoring your cycle patterns');
    recs.push('- Maintain awareness of any changes in your cycle');
  }

  recs.push('\n## Nutrition');
  const answers = result.answers;
  if (answers.diet === 'processed' || answers.diet === 'mixed' || answers.sugarCravings === 'yes') {
    recs.push('- Include a balanced diet with whole foods');
    recs.push('- Reduce refined sugars and processed foods');
    recs.push('- Include fibre-rich foods in your daily meals');
  } else {
    recs.push('- Maintain your current balanced eating habits');
    recs.push('- Ensure adequate intake of essential vitamins and minerals');
  }

  recs.push('\n## Physical Activity');
  if (answers.exercise === 'rarely' || answers.exercise === '1-2') {
    recs.push('- Aim for at least 150 minutes of moderate activity per week');
    recs.push('- Include both cardio and strength training');
    recs.push('- Consider gradually increasing regular physical activity');
  } else {
    recs.push('- Maintain your current exercise routine');
    recs.push('- Continue with a mix of cardio and strength training');
  }

  recs.push('\n## Sleep & Stress');
  if (answers.sleepHours === 'less5' || answers.sleepHours === '5-6' || answers.stressLevel === 'high' || answers.stressLevel === 'veryHigh') {
    recs.push('- Aim for 7–8 hours of sleep per night');
    recs.push('- Consider establishing a consistent sleep schedule');
    recs.push('- Try stress management techniques like breathing exercises or yoga');
  } else {
    recs.push('- Maintain your current sleep routine');
    recs.push('- Continue practicing stress management');
  }

  recs.push('\n## Skin & Hair Care');
  const androgenScore = result.patternScores.find(p => p.label === 'androgen');
  if (androgenScore && androgenScore.score > 40) {
    recs.push('- Maintain a gentle skincare routine');
    recs.push('- Discuss persistent acne or excessive hair growth with a dermatologist');
    recs.push('- Consider gentle, hormone-friendly skincare products');
  } else {
    recs.push('- Maintain your current skincare routine');
    recs.push('- Monitor for any changes in skin or hair health');
  }

  recs.push('\n## Regular Check-ups');
  if (result.overallScore > 50) {
    recs.push('- Consider discussing your symptoms, lifestyle and cycle pattern with a gynaecologist or endocrinologist');
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
    if (!stored) {
      navigate('/assessment');
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setResult(parsed);
      loadPlan(parsed);
    } catch {
      navigate('/assessment');
    }
  }, [navigate]);

  const loadPlan = async (res: ScoringResult) => {
    setLoading(true);
    setError('');
    
    if (isGeminiConfigured()) {
      try {
        const summary = createAISummary(res);
        const plan = await generateActionPlan(summary);
        setPlanText(plan);
      } catch (err: any) {
        // Fallback to local recommendations
        setPlanText(getLocalRecommendations(res));
        setError('AI-generated plan unavailable. Showing general recommendations.');
      }
    } else {
      // Use local fallback
      setPlanText(getLocalRecommendations(res));
    }
    setLoading(false);
  };

  if (!result) return null;

  // Parse markdown categories
  const categories = parsePlanCategories(planText);

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Your Personalised Action Plan</h1>
          <p className="text-text-secondary text-sm mt-1">
            Based on your responses, here are some general recommendations.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
            <p className="text-text-secondary text-sm">Generating your personalised plan...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.title] || Heart;
              const colorClass = CATEGORY_COLORS[cat.title] || 'bg-primary-50 text-primary-600';
              return (
                <div key={cat.title} className="bg-white rounded-2xl p-6 shadow-card border border-border hover:shadow-card-hover transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-text-primary">{cat.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {cat.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className="text-primary-400 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8">
          <Disclaimer text="These are general educational recommendations, not medical treatment instructions. Consult a healthcare professional for personalised medical advice." />
        </div>
      </div>
    </div>
  );
}

function parsePlanCategories(text: string): { title: string; items: string[] }[] {
  if (!text) return [];
  
  const categories: { title: string; items: string[] }[] = [];
  const lines = text.split('\n');
  let currentCategory: { title: string; items: string[] } | null = null;

  for (const line of lines) {
    const headerMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headerMatch) {
      if (currentCategory && currentCategory.items.length > 0) {
        categories.push(currentCategory);
      }
      currentCategory = { title: headerMatch[1].trim(), items: [] };
      continue;
    }

    const bulletMatch = line.match(/^[-*]\s+(.+)/);
    if (bulletMatch && currentCategory) {
      currentCategory.items.push(bulletMatch[1].trim());
    }
  }

  if (currentCategory && currentCategory.items.length > 0) {
    categories.push(currentCategory);
  }

  return categories;
}
