// ============================================================
// PMOS Sense — Gemini AI Service
// Generative AI layer for explanations, Q&A, recommendations
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_NAME = 'gemini-3.6-flash';

const SYSTEM_INSTRUCTION = `You are the AI health assistant for PMOS Sense, an academic screening and educational prototype tool for PMOS (Polycystic Metabolic & Ovarian Syndrome).

OUTPUT CONSTRAINTS:
- Output ONLY the final, user-facing text response.
- NEVER output internal instructions, prompt reflections, meta notes, or labels such as "Draft text:", "Target: X words", "Word count:", or "Output:".
- NEVER output HTML entities (such as &#x20;).
- Give direct, natural, human-readable, complete responses.
- NEVER cut off mid-sentence; always finish naturally with a complete sentence.
- NEVER diagnose PMOS or any medical condition, and never prescribe treatments.
- Do NOT invent symptoms or test results not provided in the input data.`;

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

function cleanAIResponse(text: string): string {
  if (!text) return '';
  return text
    .replace(/&#x[0-9a-fA-F]+;/g, ' ')
    .replace(/&[a-zA-Z]+;/g, ' ')
    .replace(/^\*?(Target|Draft text|Word count|Note|Output):.*?\*\?\s*/gmi, '')
    .replace(/\*?Draft text:?\*?\s*/gi, '')
    .replace(/\*?Target:\s*\d+[-–]\d+\s*words\.?\*?\s*/gi, '')
    .trim();
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
    return new Error('The AI service is currently busy or experiencing high demand. Please try again in a moment.');
  }

  if (errMsg.includes('API key') || errMsg.includes('API_KEY_INVALID')) {
    return new Error('Invalid or unconfigured Gemini API key. Please check your .env configuration.');
  }

  return new Error('Unable to generate AI response. Please try again.');
}

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Generate an AI explanation of screening results (Post Risk Assessment Analysis) */
export async function explainResults(resultSummary: object): Promise<string> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: { maxOutputTokens: 650, temperature: 0.7 },
    });

    const prompt = `Provide a clear, natural, and informative analysis (around 100–180 words) of these PMOS screening assessment results:

User Assessment Data:
${JSON.stringify(resultSummary, null, 2)}

REQUIREMENTS:
- Output ONLY the final user-facing response. Do NOT include meta text, "Draft text:", "Target:", or raw JSON.
- Explain what the overall risk category means in plain, reassuring language (it is an educational screening indicator, NOT a medical diagnosis).
- Mention specific user-provided factors from the data that contributed to this category (both positive/reassuring factors and any reported symptoms or lifestyle areas).
- ONLY cite factors and symptoms present in the user's provided data. Do NOT invent missing symptoms or clinical tests.
- Provide practical next steps (symptom monitoring, healthy habits, discussing concerns with a doctor when appropriate).
- End naturally with a complete sentence.`;

    const result = await model.generateContent(prompt);
    return cleanAIResponse(result.response.text());
  } catch (error: unknown) {
    throw handleGeminiError(error, 'explainResults');
  }
}

/** Chat with AI about results or general PMOS health questions */
export async function chatWithAI(
  userMessage: string,
  resultSummary?: object | null,
  conversationHistory: AIMessage[] = []
): Promise<string> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: { maxOutputTokens: 650, temperature: 0.7 },
    });

    const historyContext = conversationHistory
      .slice(-4)
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const prompt = `${resultSummary ? `User Assessment Context:\n${JSON.stringify(resultSummary, null, 2)}\n` : ''}
${historyContext ? `Previous Chat:\n${historyContext}\n` : ''}
User Question: ${userMessage}

REQUIREMENTS:
- Directly answer the user's question first.
- Keep the response readable, medium-length (typically 100–180 words; up to 200–250 for complex questions).
- End naturally with a complete sentence.
- Output ONLY the clean answer without meta labels or draft headers.`;

    const result = await model.generateContent(prompt);
    return cleanAIResponse(result.response.text());
  } catch (error: unknown) {
    throw handleGeminiError(error, 'chatWithAI');
  }
}

/** Generate personalized action plan */
export async function generateActionPlan(resultSummary: object): Promise<string> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: { maxOutputTokens: 650, temperature: 0.7 },
    });

    const prompt = `Based on these PMOS screening results, generate a concise personalized action plan (150–220 words total):

Assessment Data:
${JSON.stringify(resultSummary, null, 2)}

Organize under simple headers:
- Menstrual & Hormonal Health
- Nutrition & Exercise
- Stress & Sleep Care
- Doctor Visit Preparation

Ensure all bullet points and sentences are complete. Output ONLY the clean action plan.`;

    const result = await model.generateContent(prompt);
    return cleanAIResponse(result.response.text());
  } catch (error: unknown) {
    throw handleGeminiError(error, 'generateActionPlan');
  }
}

/** Generate doctor discussion summary */
export async function generateDoctorSummary(
  resultSummary: object,
  cycleData?: object
): Promise<string> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: { maxOutputTokens: 650, temperature: 0.7 },
    });

    const prompt = `Write a clear Doctor Discussion Summary for the user to share with their healthcare provider:

User Assessment Data:
${JSON.stringify(resultSummary, null, 2)}
${cycleData ? `Cycle Data:\n${JSON.stringify(cycleData, null, 2)}` : ''}

REQUIREMENTS:
- Output ONLY the final doctor summary text. Do NOT output "Draft text:", "Target: 120-180 words", "Word count:", HTML entities, or prompt notes.
- Summarize user-reported symptoms, lifestyle factors (sleep, stress, exercise), and key risk pattern indicators in clear, natural language.
- Distinguish self-reported observations from risk pattern indicators.
- Include 2-3 practical discussion questions the user can ask their doctor.
- Keep the summary clear, professional, concise, and around 120–180 words (or shorter if data is limited).
- End naturally with a complete sentence without making a diagnosis.`;

    const result = await model.generateContent(prompt);
    return cleanAIResponse(result.response.text());
  } catch (error: unknown) {
    throw handleGeminiError(error, 'generateDoctorSummary');
  }
}

/** Check if Gemini is configured */
export function isGeminiConfigured(): boolean {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  return !!(apiKey && apiKey !== 'your_api_key_here');
}
