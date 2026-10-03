// ============================================================
// PMOS Sense — Scoring Configuration
// Academic Prototype Weighted Screening Algorithm
// ============================================================
// All weights and thresholds are configurable from this file.
// Do NOT claim clinical validation.
// ============================================================

export interface QuestionOption {
  label: string;
  value: string;
  score: number;
}

export interface Question {
  id: string;
  section: string;
  sectionLabel: string;
  number: number;
  text: string;
  type: 'number' | 'select' | 'radio';
  options?: QuestionOption[];
  required: boolean;
  unit?: string;
  min?: number;
  max?: number;
  placeholder?: string;
}

// ---- SECTION WEIGHTS ----
// These weights determine how much each category contributes to the overall score.
export const sectionWeights = {
  menstrual: 0.30,
  androgen: 0.25,
  metabolic: 0.20,
  familyReproductive: 0.10,
  lifestyle: 0.15,
};

// ---- SCORE RANGES ----
export const scoreRanges = {
  lower: { min: 0, max: 30, label: 'Lower reported-risk range', color: '#10b981' },
  moderate: { min: 31, max: 60, label: 'Moderate reported-risk range', color: '#f59e0b' },
  higher: { min: 61, max: 100, label: 'Higher reported-risk range', color: '#ef4444' },
};

// ---- PATTERN LABELS ----
export const patternLabels = {
  lower: 'Lower',
  moderate: 'Moderate',
  higher: 'Higher',
};

export function getPatternLabel(score: number): string {
  if (score <= 30) return patternLabels.lower;
  if (score <= 60) return patternLabels.moderate;
  return patternLabels.higher;
}

export function getScoreRange(score: number) {
  if (score <= 30) return scoreRanges.lower;
  if (score <= 60) return scoreRanges.moderate;
  return scoreRanges.higher;
}

// ---- QUESTIONNAIRE DEFINITION ----
export const questions: Question[] = [
  // SECTION A — Basic Information
  {
    id: 'age',
    section: 'basic',
    sectionLabel: 'Basic Information',
    number: 1,
    text: 'What is your age?',
    type: 'number',
    required: true,
    unit: 'years',
    min: 10,
    max: 60,
    placeholder: 'Enter your age',
  },
  {
    id: 'height',
    section: 'basic',
    sectionLabel: 'Basic Information',
    number: 2,
    text: 'What is your height?',
    type: 'number',
    required: true,
    unit: 'cm',
    min: 100,
    max: 220,
    placeholder: 'Enter height in cm',
  },
  {
    id: 'weight',
    section: 'basic',
    sectionLabel: 'Basic Information',
    number: 3,
    text: 'What is your weight?',
    type: 'number',
    required: true,
    unit: 'kg',
    min: 25,
    max: 200,
    placeholder: 'Enter weight in kg',
  },
  {
    id: 'firstMenstruation',
    section: 'basic',
    sectionLabel: 'Basic Information',
    number: 4,
    text: 'At what age did you first menstruate?',
    type: 'number',
    required: true,
    unit: 'years',
    min: 8,
    max: 20,
    placeholder: 'Age at first period',
  },

  // SECTION B — Menstrual Pattern
  {
    id: 'periodsRegular',
    section: 'menstrual',
    sectionLabel: 'Menstrual Pattern',
    number: 5,
    text: 'Are your periods regular?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Yes', value: 'yes', score: 0 },
      { label: 'No', value: 'no', score: 10 },
      { label: 'Sometimes', value: 'sometimes', score: 5 },
    ],
  },
  {
    id: 'cycleLength',
    section: 'menstrual',
    sectionLabel: 'Menstrual Pattern',
    number: 6,
    text: 'What is your usual cycle length?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Less than 21 days', value: 'less21', score: 6 },
      { label: '21–35 days', value: '21-35', score: 0 },
      { label: 'More than 35 days', value: 'more35', score: 8 },
      { label: 'Very irregular', value: 'irregular', score: 10 },
    ],
  },
  {
    id: 'skipPeriods',
    section: 'menstrual',
    sectionLabel: 'Menstrual Pattern',
    number: 7,
    text: 'Do you sometimes skip periods for 2 months or more?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Yes', value: 'yes', score: 10 },
      { label: 'No', value: 'no', score: 0 },
    ],
  },
  {
    id: 'heavyBleeding',
    section: 'menstrual',
    sectionLabel: 'Menstrual Pattern',
    number: 8,
    text: 'Is your menstrual bleeding unusually heavy?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Yes', value: 'yes', score: 7 },
      { label: 'No', value: 'no', score: 0 },
      { label: 'Sometimes', value: 'sometimes', score: 4 },
    ],
  },
  {
    id: 'severePain',
    section: 'menstrual',
    sectionLabel: 'Menstrual Pattern',
    number: 9,
    text: 'Do you experience severe period pain?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Yes', value: 'yes', score: 6 },
      { label: 'No', value: 'no', score: 0 },
      { label: 'Sometimes', value: 'sometimes', score: 3 },
    ],
  },

  // SECTION C — Androgen-Related Symptoms
  {
    id: 'facialHair',
    section: 'androgen',
    sectionLabel: 'Androgen-Related Symptoms',
    number: 10,
    text: 'Do you have excessive facial hair growth?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Yes', value: 'yes', score: 10 },
      { label: 'No', value: 'no', score: 0 },
      { label: 'Sometimes', value: 'sometimes', score: 5 },
    ],
  },
  {
    id: 'bodyHair',
    section: 'androgen',
    sectionLabel: 'Androgen-Related Symptoms',
    number: 11,
    text: 'Do you have increased hair growth on your chest, abdomen or back?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Yes', value: 'yes', score: 9 },
      { label: 'No', value: 'no', score: 0 },
      { label: 'Sometimes', value: 'sometimes', score: 4 },
    ],
  },
  {
    id: 'hairThinning',
    section: 'androgen',
    sectionLabel: 'Androgen-Related Symptoms',
    number: 12,
    text: 'Have you experienced scalp hair thinning or increased hair fall?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Yes', value: 'yes', score: 7 },
      { label: 'No', value: 'no', score: 0 },
      { label: 'Sometimes', value: 'sometimes', score: 3 },
    ],
  },
  {
    id: 'acne',
    section: 'androgen',
    sectionLabel: 'Androgen-Related Symptoms',
    number: 13,
    text: 'Do you frequently experience acne?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Yes', value: 'yes', score: 8 },
      { label: 'No', value: 'no', score: 0 },
      { label: 'Sometimes', value: 'sometimes', score: 4 },
    ],
  },
  {
    id: 'darkSkin',
    section: 'androgen',
    sectionLabel: 'Androgen-Related Symptoms',
    number: 14,
    text: 'Do you have darkened/thickened skin around your neck, armpits or groin?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Yes', value: 'yes', score: 8 },
      { label: 'No', value: 'no', score: 0 },
      { label: 'Sometimes', value: 'sometimes', score: 4 },
    ],
  },

  // SECTION D — Metabolic Factors
  {
    id: 'weightGain',
    section: 'metabolic',
    sectionLabel: 'Metabolic Factors',
    number: 15,
    text: 'Have you experienced unexplained weight gain?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Yes', value: 'yes', score: 8 },
      { label: 'No', value: 'no', score: 0 },
      { label: 'Sometimes', value: 'sometimes', score: 4 },
    ],
  },
  {
    id: 'difficultyLosingWeight',
    section: 'metabolic',
    sectionLabel: 'Metabolic Factors',
    number: 16,
    text: 'Do you find it difficult to lose weight?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Yes', value: 'yes', score: 7 },
      { label: 'No', value: 'no', score: 0 },
      { label: 'Sometimes', value: 'sometimes', score: 3 },
    ],
  },
  {
    id: 'sugarCravings',
    section: 'metabolic',
    sectionLabel: 'Metabolic Factors',
    number: 17,
    text: 'Do you frequently experience strong sugar cravings?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Yes', value: 'yes', score: 6 },
      { label: 'No', value: 'no', score: 0 },
      { label: 'Sometimes', value: 'sometimes', score: 3 },
    ],
  },
  {
    id: 'insulinResistance',
    section: 'metabolic',
    sectionLabel: 'Metabolic Factors',
    number: 18,
    text: 'Have you been told that you have insulin resistance or high blood sugar?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Yes', value: 'yes', score: 10 },
      { label: 'No', value: 'no', score: 0 },
      { label: 'Not sure', value: 'notsure', score: 3 },
    ],
  },

  // SECTION E — Family & Reproductive History
  {
    id: 'familyPMOS',
    section: 'familyReproductive',
    sectionLabel: 'Family & Reproductive History',
    number: 19,
    text: 'Does PMOS run in your family?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Yes', value: 'yes', score: 10 },
      { label: 'No', value: 'no', score: 0 },
      { label: 'Not sure', value: 'notsure', score: 3 },
    ],
  },
  {
    id: 'hormonalImbalance',
    section: 'familyReproductive',
    sectionLabel: 'Family & Reproductive History',
    number: 20,
    text: 'Have you previously been told that you have a hormonal imbalance?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Yes', value: 'yes', score: 8 },
      { label: 'No', value: 'no', score: 0 },
      { label: 'Not sure', value: 'notsure', score: 2 },
    ],
  },
  {
    id: 'difficultyPregnant',
    section: 'familyReproductive',
    sectionLabel: 'Family & Reproductive History',
    number: 21,
    text: 'Have you experienced difficulty becoming pregnant?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Yes', value: 'yes', score: 7 },
      { label: 'No', value: 'no', score: 0 },
      { label: 'Not applicable', value: 'na', score: 0 },
    ],
  },
  {
    id: 'previousDiagnosis',
    section: 'familyReproductive',
    sectionLabel: 'Family & Reproductive History',
    number: 22,
    text: 'Have you previously been diagnosed with PMOS?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Yes', value: 'yes', score: 10 },
      { label: 'No', value: 'no', score: 0 },
      { label: 'Not sure', value: 'notsure', score: 3 },
    ],
  },

  // SECTION F — Lifestyle
  {
    id: 'sleepHours',
    section: 'lifestyle',
    sectionLabel: 'Lifestyle',
    number: 23,
    text: 'How many hours do you sleep per night?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Less than 5 hours', value: 'less5', score: 8 },
      { label: '5–6 hours', value: '5-6', score: 5 },
      { label: '7–8 hours', value: '7-8', score: 0 },
      { label: 'More than 8 hours', value: 'more8', score: 2 },
    ],
  },
  {
    id: 'exercise',
    section: 'lifestyle',
    sectionLabel: 'Lifestyle',
    number: 24,
    text: 'How frequently do you exercise?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Daily', value: 'daily', score: 0 },
      { label: '3–5 times/week', value: '3-5', score: 1 },
      { label: '1–2 times/week', value: '1-2', score: 4 },
      { label: 'Rarely or never', value: 'rarely', score: 8 },
    ],
  },
  {
    id: 'stressLevel',
    section: 'lifestyle',
    sectionLabel: 'Lifestyle',
    number: 25,
    text: 'How would you describe your stress level?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Low', value: 'low', score: 0 },
      { label: 'Moderate', value: 'moderate', score: 3 },
      { label: 'High', value: 'high', score: 7 },
      { label: 'Very high', value: 'veryHigh', score: 10 },
    ],
  },
  {
    id: 'diet',
    section: 'lifestyle',
    sectionLabel: 'Lifestyle',
    number: 26,
    text: 'How would you describe your usual diet?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Balanced and healthy', value: 'balanced', score: 0 },
      { label: 'Mostly healthy', value: 'mostly', score: 2 },
      { label: 'Mixed', value: 'mixed', score: 5 },
      { label: 'Mostly processed/fast food', value: 'processed', score: 8 },
    ],
  },
  {
    id: 'smokingAlcohol',
    section: 'lifestyle',
    sectionLabel: 'Lifestyle',
    number: 27,
    text: 'Do you smoke or consume alcohol?',
    type: 'radio',
    required: true,
    options: [
      { label: 'No', value: 'no', score: 0 },
      { label: 'Occasionally', value: 'occasionally', score: 3 },
      { label: 'Regularly', value: 'regularly', score: 7 },
    ],
  },
];

// Helper to group questions by section
export function getQuestionSections() {
  const sections: { key: string; label: string; questions: Question[] }[] = [];
  const sectionMap = new Map<string, Question[]>();

  for (const q of questions) {
    if (!sectionMap.has(q.section)) {
      sectionMap.set(q.section, []);
    }
    sectionMap.get(q.section)!.push(q);
  }

  const sectionOrder = ['basic', 'menstrual', 'androgen', 'metabolic', 'familyReproductive', 'lifestyle'];
  for (const key of sectionOrder) {
    const qs = sectionMap.get(key);
    if (qs && qs.length > 0) {
      sections.push({ key, label: qs[0].sectionLabel, questions: qs });
    }
  }

  return sections;
}
