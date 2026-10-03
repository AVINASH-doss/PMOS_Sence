// ============================================================
// PMOS Sense — Gemini AI Service
// Generative AI layer for explanations, Q&A, recommendations
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_NAME = 'gemini-3.6-flash';

const SYSTEM_INSTRUCTION = `You are the AI health assistant for PMOS Sense, an academic screening and educational prototype tool for PMOS (Polycystic Metabolic & Ovarian Syndrome).

GUIDELINES FOR RESPONSES:
- Directly answer the user's question first.
- Provide concise but complete answers (typically 100–180 words; up to 200–250 words for complex questions; if answerable in 50–100 words, keep it shorter).
- Always finish naturally with a complete sentence. Never cut off mid-sentence.
- Use short paragraphs or clean bullet points (using •) when helpful.
- Avoid unnecessary repetition, long introductions, and excessive disclaimers.
- NEVER diagnose PMOS or any medical condition.
- NEVER prescribe medication or clinical treatments.
- Use supportive, empathetic, and clear language ("may", "could", "consider").`;

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

/** Generate an AI explanation of screening results */
export async function explainResults(resultSummary: object): Promise<string> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: { maxOutputTokens: 600, temperature: 0.7 },
    });

    const prompt = `Provide a concise, easy-to-read explanation (100–180 words) of these PMOS screening results:

Screening Results:
${JSON.stringify(resultSummary, null, 2)}

Cover:
1. Overview of screening result
2. Key observed pattern
3. Educational advice & medical checkup recommendation

Ensure every sentence finishes completely.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
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

    const prompt = `${resultSummary ? `User Screening Context:\n${JSON.stringify(resultSummary, null, 2)}\n` : ''}
${historyContext ? `Previous Chat:\n${historyContext}\n` : ''}
User Question: ${userMessage}

Instructions:
- Directly answer the user's question first.
- Keep the response readable, medium-length, and complete (typically 100–180 words; up to 200–250 words for complex questions).
- End naturally with a complete sentence.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
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

Screening Results:
${JSON.stringify(resultSummary, null, 2)}

Organize under simple headers:
- Menstrual & Hormonal Health
- Nutrition & Exercise
- Stress & Sleep Care
- Doctor Visit Preparation

Ensure every bullet point and sentence is complete.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
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
      generationConfig: { maxOutputTokens: 600, temperature: 0.7 },
    });

    const prompt = `Generate a concise Doctor Discussion Summary (120–180 words) for the user to share with their doctor:

Screening Results:
${JSON.stringify(resultSummary, null, 2)}
${cycleData ? `Cycle Data:\n${JSON.stringify(cycleData, null, 2)}` : ''}

Include 3 simple sections:
1. Reported Symptoms & Score Overview
2. Key Areas to Discuss
3. Recommended Questions for Doctor

Ensure all sentences finish completely.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: unknown) {
    throw handleGeminiError(error, 'generateDoctorSummary');
  }
}

/** Check if Gemini is configured */
export function isGeminiConfigured(): boolean {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  return !!(apiKey && apiKey !== 'your_api_key_here');
}
