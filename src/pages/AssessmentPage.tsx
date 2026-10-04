import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { getQuestionSections } from '../config/scoringConfig';
import { calculateScreeningScore, calculateBMI, getBMICategory, type Answers } from '../logic/scoring';
import { useAuth } from '../context/AuthContext';
import { saveAssessment } from '../services/databaseService';

export default function AssessmentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const sections = getQuestionSections();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const totalSteps = sections.length;
  const currentSection = sections[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const height = Number(answers.height) || 0;
  const weight = Number(answers.weight) || 0;
  const showBMI = currentSection.key === 'basic' && height > 0 && weight > 0;
  const bmi = showBMI ? calculateBMI(height, weight) : null;

  const handleAnswer = useCallback((questionId: string, value: string | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setErrors(prev => prev.filter(e => e !== questionId));
  }, []);

  const validateStep = (): boolean => {
    const missing: string[] = [];
    for (const q of currentSection.questions) {
      if (q.required && (answers[q.id] === undefined || answers[q.id] === '')) {
        missing.push(q.id);
      }
    }
    setErrors(missing);
    return missing.length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    const result = calculateScreeningScore(answers);
    // Always store in localStorage for immediate use
    localStorage.setItem('pmos_screening_result', JSON.stringify(result));
    localStorage.setItem('pmos_answers', JSON.stringify(answers));

    // If authenticated, save to Supabase
    if (user) {
      const menstrualScore = result.patternScores.find(p => p.label === 'menstrual')?.score ?? 0;
      const androgenScore = result.patternScores.find(p => p.label === 'androgen')?.score ?? 0;
      const metabolicScore = result.patternScores.find(p => p.label === 'metabolic')?.score ?? 0;
      const lifestyleScore = result.patternScores.find(p => p.label === 'lifestyle')?.score ?? 0;

      await saveAssessment({
        user_id: user.id,
        answers: result.answers,
        overall_score: result.overallScore,
        risk_range: result.riskRange.label,
        menstrual_score: menstrualScore,
        androgen_score: androgenScore,
        metabolic_score: metabolicScore,
        lifestyle_score: lifestyleScore,
        bmi: result.bmi,
        bmi_category: result.bmiCategory || null,
        pattern_scores: result.patternScores.map(p => ({
          category: p.category, label: p.label, score: p.score, patternLabel: p.patternLabel,
        })),
        contributing_factors: result.contributingFactors.map(f => ({
          questionText: f.questionText, userAnswer: f.userAnswer, impact: f.impact,
        })),
      });
    }

    setSubmitting(false);
    navigate('/results');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ff' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Header Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <button
            onClick={() => currentStep > 0 ? handlePrevious() : navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6b7280', fontSize: '0.875rem', fontWeight: 500,
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Back
          </button>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280' }}>
            {currentStep + 1}/{totalSteps}
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', background: '#ede5ff', borderRadius: '4px', marginBottom: '2rem', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
            borderRadius: '4px',
            transition: 'width 0.5s ease-out',
          }} />
        </div>

        {/* Section Title */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', fontWeight: 700, color: '#1e1b3a', marginBottom: '0.25rem' }}>
            {currentSection.label}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            {getSectionDescription(currentSection.key)}
          </p>
        </div>

        {/* Question Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {currentSection.questions.map((question) => {
            const hasError = errors.includes(question.id);
            return (
              <div
                key={question.id}
                className="card"
                style={{
                  padding: 'clamp(1rem, 3vw, 1.5rem)',
                  borderColor: hasError ? '#ef4444' : undefined,
                }}
              >
                <label style={{
                  display: 'block', fontSize: '0.9rem', fontWeight: 600,
                  color: '#1e1b3a', marginBottom: '1rem',
                }}>
                  <span style={{ color: '#8b5cf6', marginRight: '4px' }}>{question.number}.</span>
                  {question.text}
                  {question.required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
                </label>

                {question.type === 'number' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input
                      type="number"
                      value={answers[question.id] ?? ''}
                      onChange={(e) => handleAnswer(question.id, e.target.value)}
                      placeholder={question.placeholder}
                      min={question.min}
                      max={question.max}
                      style={{
                        width: '100%', padding: '0.75rem 1rem',
                        borderRadius: '0.75rem', border: '1px solid #e9e2f5',
                        background: '#faf8ff', fontSize: '0.9rem',
                        outline: 'none', color: '#1e1b3a',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                      onBlur={(e) => e.target.style.borderColor = '#e9e2f5'}
                    />
                    {question.unit && (
                      <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 500, whiteSpace: 'nowrap' }}>{question.unit}</span>
                    )}
                  </div>
                )}

                {question.type === 'radio' && question.options && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {question.options.map((option) => {
                      const isSelected = String(answers[question.id]) === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleAnswer(question.id, option.value)}
                          style={{
                            padding: '0.625rem 1rem',
                            borderRadius: '0.75rem',
                            fontSize: '0.825rem',
                            fontWeight: 500,
                            border: isSelected ? '2px solid #8b5cf6' : '1.5px solid #e9e2f5',
                            background: isSelected ? '#8b5cf6' : 'white',
                            color: isSelected ? 'white' : '#6b7280',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            boxShadow: isSelected ? '0 2px 8px rgba(139,92,246,0.25)' : 'none',
                            flexShrink: 0,
                          }}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {hasError && (
                  <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.5rem' }}>This field is required</p>
                )}
              </div>
            );
          })}
        </div>

        {/* BMI Display */}
        {showBMI && bmi !== null && (
          <div style={{
            marginTop: '1rem', padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, #f5f0ff, #fdf2f8)',
            borderRadius: '1rem', border: '1px solid #ede5ff',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <CheckCircle style={{ width: '20px', height: '20px', color: '#8b5cf6', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e1b3a' }}>
                Your BMI: <span style={{ color: '#7c3aed' }}>{bmi}</span>
              </p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Category: {getBMICategory(bmi)}</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginTop: '2rem', paddingBottom: '2rem',
          gap: '0.75rem',
        }}>
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="btn-secondary"
            style={{ opacity: currentStep === 0 ? 0.3 : 1 }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Previous
          </button>
          <button onClick={handleNext} disabled={submitting} className="btn-primary" style={{ opacity: submitting ? 0.6 : 1 }}>
            {submitting ? (
              <><Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> Saving...</>
            ) : currentStep === totalSteps - 1 ? (
              <>Get Results <ArrowRight style={{ width: '16px', height: '16px' }} /></>
            ) : (
              <>Next <ArrowRight style={{ width: '16px', height: '16px' }} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function getSectionDescription(key: string): string {
  const descriptions: Record<string, string> = {
    basic: 'Tell us some basic information to help calculate your health metrics.',
    menstrual: 'Tell us about your menstrual cycle and period-related symptoms.',
    androgen: 'Tell us about any androgen-related symptoms you may experience.',
    metabolic: 'Tell us about your metabolic health and weight patterns.',
    familyReproductive: 'Tell us about your family and reproductive history.',
    lifestyle: 'Tell us about your daily lifestyle habits.',
  };
  return descriptions[key] || '';
}
