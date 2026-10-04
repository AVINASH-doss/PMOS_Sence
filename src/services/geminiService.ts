// ============================================================
// PMOS Sense — Gemini AI Service
// Generative AI layer for explanations, Q&A, recommendations
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AI_MODEL,
  SYSTEM_INSTRUCTION,
  generationConfig,
  retryConfig,
} from '../config/aiConfig';

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

// ---- Response cleaning ----
function cleanAIResponse(text: string): string {
  if (!text) return '';
  return text
    .replace(/&#x[0-9a-fA-F]+;/g, ' ')
    .replace(/&[a-zA-Z]+;/g, ' ')
    .replace(/^\*?(Target|Draft text|Word count|Note|Output):.*?\*?\s*/gmi, '')
    .replace(/\*?Draft text:?\*?\s*/gi, '')
    .replace(/\*?Target:\s*\d+[–-]\d+\s*words\.?\*?\s*/gi, '')
    .trim();
}

// ---- Error classification ----
function isRetryableError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return retryConfig.retryableMessages.some(pattern =>
    msg.toLowerCase().includes(pattern.toLowerCase())
  );
}

function handleGeminiError(error: unknown, context: string): Error {
  const errMsg = error instanceof Error ? error.message : String(error);
  console.error(`Gemini API error (${context}):`, error);

  if (
    errMsg.includes('503') ||
    errMsg.includes('high demand') ||
    errMsg.includes('overloaded') ||
    errMsg.includes('RESOURCE_EXHAUSTED') ||
    errMsg.includes('UNAVAILABLE')
  ) {
    return new Error('AI service is temporarily unavailable. Please try again in a moment.');
  }

  if (errMsg.includes('429') || errMsg.includes('rate limit') || errMsg.includes('quota')) {
    return new Error('AI service is temporarily busy. Please wait a moment and try again.');
  }

  if (errMsg.includes('API key') || errMsg.includes('API_KEY_INVALID')) {
    return new Error('Invalid or unconfigured Gemini API key. Please check your .env configuration.');
  }

  if (errMsg.includes('DEADLINE_EXCEEDED') || errMsg.includes('timeout') || errMsg.includes('ETIMEDOUT')) {
    return new Error('AI request timed out. Please try again.');
  }

  return new Error(`Unable to generate AI response. Please try again. (${errMsg})`);
}

// ---- Retry wrapper with exponential backoff ----
async function callWithRetry<T>(
  fn: () => Promise<T>,
  context: string
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;
      const isRetryable = isRetryableError(error);

      if (!isRetryable || attempt === retryConfig.maxRetries) {
        throw handleGeminiError(error, context);
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        retryConfig.baseDelayMs * Math.pow(2, attempt) + Math.random() * 500,
        retryConfig.maxDelayMs
      );

      console.warn(
        `Gemini (${context}): Retryable error on attempt ${attempt + 1}/${retryConfig.maxRetries + 1}. ` +
        `Retrying in ${Math.round(delay)}ms...`,
        error instanceof Error ? error.message : error
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw handleGeminiError(lastError, context);
}

// ---- Public types ----
export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ============================================================
// explainResults — Post-Risk Assessment Analysis
// ============================================================
export async function explainResults(resultSummary: object): Promise<string> {
  return callWithRetry(async () => {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({
      model: AI_MODEL,
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: generationConfig.explainResults,
    });

    const prompt = `You are analysing a PMOS screening assessment result for a user. Provide a thorough, structured, educational analysis.

User Assessment Data:
${JSON.stringify(resultSummary, null, 2)}

REQUIREMENTS:
- Output ONLY the final user-facing response. Do NOT include meta text, "Draft text:", "Target:", or raw JSON.
- Structure your response using the following sections with markdown headers:

### Overall Interpretation
Explain what the overall risk category means in plain, reassuring language. This is an educational screening indicator, NOT a medical diagnosis. Mention the overall score and risk range.

### Main Patterns Noticed
List the specific user-provided factors from the data that contributed to this screening result. Reference actual domain scores (menstrual, androgen, metabolic, lifestyle) and mention which domains appear more notable. Use bullet points.

### Why These Patterns Matter
Explain the reported features in plain language. Describe what these patterns may indicate in general health terms without diagnosing.

### What to Monitor
Provide useful non-diagnostic observations. Suggest specific things the user can track or be aware of based on their reported patterns.

### When to Discuss with a Healthcare Professional
Give general guidance about when and why they might want to discuss their screening results with a doctor. Include 2-3 specific questions they could ask.

### Important Limitation
State clearly that this is a screening/awareness prototype and not a diagnosis. The screening score is based on self-reported data and should be discussed with a healthcare professional for proper evaluation.

- ONLY cite factors and symptoms present in the user's provided data. Do NOT invent missing symptoms or clinical tests.
- Write in a warm, educational, and empowering tone.
- Aim for 200-350 words total.
- End naturally with a complete sentence.`;

    const result = await model.generateContent(prompt);
    return cleanAIResponse(result.response.text());
  }, 'explainResults');
}

// ============================================================
// chatWithAI — Ask AI conversational Q&A
// ============================================================
export async function chatWithAI(
  userMessage: string,
  resultSummary?: object | null,
  conversationHistory: AIMessage[] = []
): Promise<string> {
  return callWithRetry(async () => {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({
      model: AI_MODEL,
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: generationConfig.chatWithAI,
    });

    const historyContext = conversationHistory
      .slice(-6)
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const prompt = `${resultSummary ? `User Assessment Context:\n${JSON.stringify(resultSummary, null, 2)}\n` : ''}
${historyContext ? `Previous Chat:\n${historyContext}\n` : ''}
User Question: ${userMessage}

REQUIREMENTS:
- Directly answer the user's question first.
- If the user has completed an assessment and asks about their results, reference specific data from their assessment context.
- If the user asks about PMOS symptoms, menstrual irregularity, lifestyle, or health topics related to the screening, provide helpful, educational information.
- If the user asks something completely unrelated to health or PMOS, briefly explain that PMOS Sense is focused on PMOS screening and health topics, and gently redirect.
- Keep the response readable and natural — typically 150–300 words depending on complexity.
- Use markdown formatting (headers, bullet points, bold) where appropriate to structure the response.
- End naturally with a complete sentence.
- Output ONLY the clean answer without meta labels or draft headers.
- NEVER diagnose or prescribe medication.`;

    const result = await model.generateContent(prompt);
    return cleanAIResponse(result.response.text());
  }, 'chatWithAI');
}

// ============================================================
// generateActionPlan — Personalised Action Plan
// ============================================================
export async function generateActionPlan(resultSummary: object): Promise<string> {
  return callWithRetry(async () => {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({
      model: AI_MODEL,
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: generationConfig.actionPlan,
    });

    const prompt = `Based on these PMOS screening results, generate a comprehensive personalised action plan.

Assessment Data:
${JSON.stringify(resultSummary, null, 2)}

REQUIREMENTS:
- Organize under clear markdown headers (## for each section).
- Include the following sections. For each section, provide 3-5 specific, actionable bullet points tailored to the user's assessment data:

## Menstrual & Hormonal Health
Specific recommendations based on the user's menstrual pattern score and reported symptoms.

## Nutrition & Exercise
Dietary and physical activity recommendations. Reference the user's reported diet, exercise frequency, BMI, and metabolic pattern.

## Stress & Sleep Care
Recommendations based on the user's reported stress level and sleep hours.

## Skin & Hair Care
If the user has elevated androgen pattern scores, include relevant skincare and hair care tips.

## Doctor Visit Preparation
What to bring, what to ask, and when to schedule based on the user's risk range and notable patterns.

- Tailor each recommendation to the user's ACTUAL assessment data — do not give generic advice.
- Ensure all bullet points and sentences are complete.
- Aim for 250-400 words total.
- Output ONLY the clean action plan.`;

    const result = await model.generateContent(prompt);
    return cleanAIResponse(result.response.text());
  }, 'generateActionPlan');
}

// ============================================================
// generateDoctorSummary — Doctor Discussion Summary
// ============================================================
export async function generateDoctorSummary(
  resultSummary: object,
  cycleData?: object
): Promise<string> {
  return callWithRetry(async () => {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({
      model: AI_MODEL,
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: generationConfig.doctorSummary,
    });

    const prompt = `Write a structured Doctor Discussion Summary for the user to share with their healthcare provider.

User Assessment Data:
${JSON.stringify(resultSummary, null, 2)}
${cycleData ? `\nCycle Tracking Data:\n${JSON.stringify(cycleData, null, 2)}` : ''}

REQUIREMENTS:
- Output ONLY the final doctor summary text. Do NOT output "Draft text:", "Target:", "Word count:", HTML entities, or prompt notes.
- Structure the summary using these sections with markdown headers:

### Patient/User Overview
Age, BMI (if available), and general screening context.

### Reported Menstrual Pattern
Summarise the user's reported menstrual characteristics — regularity, cycle length, pain, bleeding patterns. Reference the menstrual domain score.

### Reported Symptoms
List the key self-reported symptoms including androgen-related symptoms (hair growth, acne, skin changes, hair thinning). Reference the androgen domain score.

### Metabolic & Lifestyle Factors
Summarise reported metabolic factors (weight changes, insulin resistance, cravings), sleep, exercise, stress, and diet. Reference the metabolic and lifestyle domain scores.

### Family & Reproductive History
Summarise relevant family history and reproductive history if available in the data.

### Screening Result
State the overall screening score, risk range, and domain pattern scores clearly.

### Main Patterns to Discuss
Identify the 2-4 most notable patterns from the assessment that may warrant discussion with a clinician.

### Questions for Clinician
Provide 3-5 specific questions the user can ask their healthcare provider based on their assessment patterns.

### Limitations
Clearly state this is a self-reported screening tool, not a diagnostic instrument. Results should be interpreted alongside clinical evaluation.

- Use professional, clinical-friendly language.
- Use wording like "reported", "may warrant discussion", "screening result", "reported pattern", "consider discussing with a healthcare professional".
- Do NOT diagnose PMOS, claim clinical certainty, or prescribe medication.
- Aim for 250-400 words total.
- End naturally with a complete sentence.`;

    const result = await model.generateContent(prompt);
    return cleanAIResponse(result.response.text());
  }, 'generateDoctorSummary');
}

// ============================================================
// Utility exports
// ============================================================

/** Check if Gemini is configured */
export function isGeminiConfigured(): boolean {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  return !!(apiKey && apiKey !== 'your_api_key_here');
}
