// ============================================================
// PMOS Sense — Gemini AI Service
// Generative AI layer for explanations, Q&A, recommendations
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_INSTRUCTION = `You are the AI health assistant for PMOS Sense, an academic screening and educational prototype tool for PMOS (Polycystic Metabolic & Ovarian Syndrome).

CRITICAL CONSTRAINTS & FORMATTING RULES:
- Keep all responses SHORT, CLEAR, CLEAN, and directly understandable (max 150-200 words).
- DO NOT output excessive markdown symbols or raw asterisks like "**Title**" or "*item*". Use clean, plain titles and simple bullet points using "•".
- NEVER diagnose PMOS or any medical condition.
- NEVER prescribe medication or clinical treatments.
- Use supportive, empathetic, and clear language ("may", "could", "consider").
- State clearly that screening indicators are educational, not clinical diagnoses.`;

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
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
      model: 'gemini-flash-latest',
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: { maxOutputTokens: 350, temperature: 0.7 },
    });

    const prompt = `Provide a concise, easy-to-read explanation (under 150 words) of these PMOS screening results. Keep formatting clean without raw asterisks:

Screening Results:
${JSON.stringify(resultSummary, null, 2)}

Cover:
1. Overview of result
2. Key observed pattern
3. Simple educational advice & medical checkup recommendation`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Gemini API error (explainResults):', error);
    throw new Error(`Unable to generate AI explanation: ${errMsg}`);
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
      model: 'gemini-flash-latest',
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
    });

    const historyContext = conversationHistory
      .slice(-4)
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const prompt = `${resultSummary ? `User Screening Context:\n${JSON.stringify(resultSummary, null, 2)}\n` : ''}
${historyContext ? `Previous Chat:\n${historyContext}\n` : ''}
User Question: ${userMessage}

Answer concisely, cleanly, and under 150 words. Avoid unnecessary formatting noise or asterisks.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Gemini API error (chatWithAI):', error);
    throw new Error(`AI Chat Error: ${errMsg}`);
  }
}

/** Generate personalized action plan */
export async function generateActionPlan(resultSummary: object): Promise<string> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: { maxOutputTokens: 400, temperature: 0.7 },
    });

    const prompt = `Based on these PMOS screening results, generate a short, clean personalized action plan with simple bullet points (keep under 200 words total):

Screening Results:
${JSON.stringify(resultSummary, null, 2)}

Organize under simple headers:
- Menstrual & Hormonal Health
- Nutrition & Exercise
- Stress & Sleep Care
- Doctor Visit Preparation`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Gemini API error (generateActionPlan):', error);
    throw new Error(`Unable to generate action plan: ${errMsg}`);
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
      model: 'gemini-flash-latest',
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: { maxOutputTokens: 350, temperature: 0.7 },
    });

    const prompt = `Generate a concise, clean Doctor Discussion Summary (under 180 words) for the user to share with their doctor. Do not use raw asterisks:

Screening Results:
${JSON.stringify(resultSummary, null, 2)}
${cycleData ? `Cycle Data:\n${JSON.stringify(cycleData, null, 2)}` : ''}

Include 3 simple sections:
1. Reported Symptoms & Score Overview
2. Key Areas to Discuss
3. Recommended Questions for Doctor`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Gemini API error (generateDoctorSummary):', error);
    throw new Error(`Unable to generate doctor summary: ${errMsg}`);
  }
}

/** Check if Gemini is configured */
export function isGeminiConfigured(): boolean {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  return !!(apiKey && apiKey !== 'your_api_key_here');
}
