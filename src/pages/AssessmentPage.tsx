import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { getQuestionSections } from '../config/scoringConfig';
import { calculateScreeningScore, calculateBMI, getBMICategory, type Answers } from '../logic/scoring';

export default function AssessmentPage() {
  const navigate = useNavigate();
  const sections = getQuestionSections();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<string[]>([]);

  const totalSteps = sections.length;
  const currentSection = sections[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // BMI calculation for display
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

  const handleSubmit = () => {
    const result = calculateScreeningScore(answers);
    localStorage.setItem('pmos_screening_result', JSON.stringify(result));
    localStorage.setItem('pmos_answers', JSON.stringify(answers));
    navigate('/results');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => currentStep > 0 ? handlePrevious() : navigate('/')}
            className="flex items-center gap-2 text-text-secondary hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <span className="text-sm font-medium text-text-secondary">
            {currentStep + 1}/{totalSteps}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-primary-100 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Section Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">{currentSection.label}</h1>
          <p className="text-text-secondary mt-1">
            {getSectionDescription(currentSection.key)}
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {currentSection.questions.map((question) => (
            <div
              key={question.id}
              className={`bg-white rounded-2xl p-6 shadow-card border transition-colors ${
                errors.includes(question.id) ? 'border-error' : 'border-border'
              }`}
            >
              <label className="block text-sm font-semibold text-text-primary mb-4">
                <span className="text-primary-500 mr-1">{question.number}.</span>
                {question.text}
                {question.required && <span className="text-error ml-1">*</span>}
              </label>

              {question.type === 'number' && (
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={answers[question.id] ?? ''}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                    placeholder={question.placeholder}
                    min={question.min}
                    max={question.max}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all text-text-primary"
                  />
                  {question.unit && (
                    <span className="text-sm text-text-muted font-medium">{question.unit}</span>
                  )}
                </div>
              )}

              {question.type === 'radio' && question.options && (
                <div className="flex flex-wrap gap-3">
                  {question.options.map((option) => {
                    const isSelected = String(answers[question.id]) === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleAnswer(question.id, option.value)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                          isSelected
                            ? 'bg-primary-500 text-white border-primary-500 shadow-md'
                            : 'bg-white text-text-secondary border-border hover:border-primary-300 hover:text-primary-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {errors.includes(question.id) && (
                <p className="text-error text-xs mt-2">This field is required</p>
              )}
            </div>
          ))}
        </div>

        {/* BMI Display */}
        {showBMI && bmi !== null && (
          <div className="mt-6 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-5 border border-primary-100">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  Your BMI: <span className="text-primary-600">{bmi}</span>
                </p>
                <p className="text-xs text-text-secondary">
                  Category: {getBMICategory(bmi)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pb-8">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed bg-white text-text-secondary border border-border hover:bg-primary-50 hover:border-primary-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:-translate-y-0.5"
          >
            {currentStep === totalSteps - 1 ? 'Get Results' : 'Next'}
            <ArrowRight className="w-4 h-4" />
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
