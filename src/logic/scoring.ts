// ============================================================
// PMOS Sense — Deterministic Weighted Scoring Engine
// Academic Prototype Weighted Screening Algorithm
// ============================================================
// This module calculates all scores deterministically.
// Gemini does NOT calculate or influence the score.
// ============================================================

import {
  questions,
  sectionWeights,
  getPatternLabel,
  getScoreRange,
  type Question,
} from '../config/scoringConfig';

export interface Answers {
  [questionId: string]: string | number;
}

export interface PatternScore {
  category: string;
  label: string;
  score: number;       // 0–100 normalized
  patternLabel: string; // Lower / Moderate / Higher
  color: string;
}

export interface ContributingFactor {
  questionText: string;
  userAnswer: string;
  impact: 'high' | 'medium' | 'low';
}

export interface ScoringResult {
  overallScore: number;           // 0–100
  riskRange: { min: number; max: number; label: string; color: string };
  patternScores: PatternScore[];
  contributingFactors: ContributingFactor[];
  bmi: number | null;
  bmiCategory: string;
  answers: Answers;
}

/** Calculate BMI from height (cm) and weight (kg) */
export function calculateBMI(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/** Get BMI category */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

/** Get raw score for a section from answers */
function getSectionRawScore(sectionKey: string, answers: Answers): { raw: number; max: number } {
  const sectionQuestions = questions.filter(q => q.section === sectionKey && q.options);
  let raw = 0;
  let max = 0;

  for (const q of sectionQuestions) {
    if (!q.options) continue;
    const maxOption = Math.max(...q.options.map(o => o.score));
    max += maxOption;

    const answer = answers[q.id];
    if (answer !== undefined && answer !== '') {
      const option = q.options.find(o => o.value === String(answer));
      if (option) {
        raw += option.score;
      }
    }
  }

  return { raw, max };
}

/** Normalize section score to 0–100 */
function normalizeSectionScore(raw: number, max: number): number {
  if (max === 0) return 0;
  return Math.round((raw / max) * 100);
}

/** Get contributing factors (questions where user scored above minimum) */
function getContributingFactors(answers: Answers): ContributingFactor[] {
  const factors: ContributingFactor[] = [];

  for (const q of questions) {
    if (!q.options) continue;
    const answer = answers[q.id];
    if (answer === undefined || answer === '') continue;

    const option = q.options.find(o => o.value === String(answer));
    if (!option || option.score === 0) continue;

    const maxScore = Math.max(...q.options.map(o => o.score));
    const ratio = option.score / maxScore;

    let impact: 'high' | 'medium' | 'low';
    if (ratio >= 0.7) impact = 'high';
    else if (ratio >= 0.4) impact = 'medium';
    else impact = 'low';

    factors.push({
      questionText: q.text,
      userAnswer: option.label,
      impact,
    });
  }

  // Sort by impact level
  const impactOrder = { high: 0, medium: 1, low: 2 };
  factors.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);

  return factors;
}

/** Get pattern color based on score */
function getPatternColor(score: number): string {
  if (score <= 30) return '#10b981';
  if (score <= 60) return '#f59e0b';
  return '#ef4444';
}

/** Main scoring function — deterministic */
export function calculateScreeningScore(answers: Answers): ScoringResult {
  // Calculate BMI
  let bmi: number | null = null;
  let bmiCategory = '';
  const height = Number(answers.height);
  const weight = Number(answers.weight);
  if (height > 0 && weight > 0) {
    bmi = calculateBMI(height, weight);
    bmiCategory = getBMICategory(bmi);
  }

  // Calculate section scores
  const sections: { key: string; label: string }[] = [
    { key: 'menstrual', label: 'Menstrual Pattern' },
    { key: 'androgen', label: 'Androgen Pattern' },
    { key: 'metabolic', label: 'Metabolic Pattern' },
    { key: 'lifestyle', label: 'Lifestyle Pattern' },
  ];

  const patternScores: PatternScore[] = [];
  let weightedSum = 0;
  let totalWeight = 0;

  for (const section of sections) {
    const { raw, max } = getSectionRawScore(section.key, answers);
    const normalized = normalizeSectionScore(raw, max);

    patternScores.push({
      category: section.label,
      label: section.key,
      score: normalized,
      patternLabel: getPatternLabel(normalized),
      color: getPatternColor(normalized),
    });

    const weight = sectionWeights[section.key as keyof typeof sectionWeights] || 0;
    weightedSum += normalized * weight;
    totalWeight += weight;
  }

  // Add family/reproductive history to overall score
  const familySection = getSectionRawScore('familyReproductive', answers);
  const familyNormalized = normalizeSectionScore(familySection.raw, familySection.max);
  const familyWeight = sectionWeights.familyReproductive;
  weightedSum += familyNormalized * familyWeight;
  totalWeight += familyWeight;

  // Add BMI factor to metabolic component
  let bmiBonus = 0;
  if (bmi !== null) {
    if (bmi >= 30) bmiBonus = 8;
    else if (bmi >= 25) bmiBonus = 4;
    else if (bmi < 18.5) bmiBonus = 2;
  }

  // Calculate overall score (0–100)
  let overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  overallScore = Math.min(100, Math.max(0, overallScore + bmiBonus));

  const riskRange = getScoreRange(overallScore);
  const contributingFactors = getContributingFactors(answers);

  return {
    overallScore,
    riskRange,
    patternScores,
    contributingFactors,
    bmi,
    bmiCategory,
    answers,
  };
}

/** Create a structured summary for AI consumption (no raw user data leaks) */
export function createAISummary(result: ScoringResult): object {
  return {
    overallScore: result.overallScore,
    riskRange: result.riskRange.label,
    bmi: result.bmi,
    bmiCategory: result.bmiCategory,
    patternScores: result.patternScores.map(p => ({
      category: p.category,
      score: p.score,
      level: p.patternLabel,
    })),
    topContributingFactors: result.contributingFactors
      .filter(f => f.impact === 'high' || f.impact === 'medium')
      .map(f => ({
        factor: f.questionText.replace('Do you ', '').replace('Have you ', '').replace('?', ''),
        answer: f.userAnswer,
        impact: f.impact,
      })),
    basicInfo: {
      age: result.answers.age,
      ageAtFirstMenstruation: result.answers.firstMenstruation,
    },
  };
}
