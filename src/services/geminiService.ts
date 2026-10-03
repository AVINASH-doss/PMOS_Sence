// ============================================================
// PMOS Sense — Gemini AI Service
// Generative AI layer for explanations, Q&A, recommendations
// ============================================================
// Gemini does NOT calculate scores.
// It receives pre-calculated results and generates explanations.
// Architecture allows swapping to another LLM later.
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_INSTRUCTION = `You are the AI assistant for PMOS Sense, an academic screening and educational prototype tool. 

CRITICAL RULES:
- This is an academic screening prototype, NOT a diagnostic tool.
- NEVER diagnose PMOS or any medical condition.
- NEVER prescribe medication or specific treatments.
- NEVER claim certainty about a user's health status.
- NEVER replace healthcare professional advice.
- Always use language like "may", "could", "consider", "it is suggested".
- Always encourage professional medical consultation when appropriate.
- Use the supplied questionnaire/result information to provide context.
- Provide general educational information about PMOS-related topics.
- Be empathetic, supportive, and professional.
- Keep responses concise but informative.
- When explaining scores, clarify that these are screening indicators, not diagnoses.
- Reference that PMOS Sense uses an "Academic Prototype Weighted Screening Algorithm".`;

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
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const prompt = `Based on the following PMOS screening results from our academic prototype tool, provide a clear, empathetic explanation of what these results may indicate. Remember this is a screening result, NOT a diagnosis.

Screening Results:
${JSON.stringify(resultSummary, null, 2)}

Provide:
1. A brief overview of the screening result
2. Which reported patterns appear most prominent
3. General educational context about these patterns
4. A clear statement that this is a screening result and professional consultation is recommended

Keep the response under 300 words. Use a warm, supportive tone.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Unable to generate AI explanation. Please check your API key and try again.');
  }
}

/** Chat with AI about results */
export async function chatWithAI(
  userMessage: string,
  resultSummary: object,
  conversationHistory: AIMessage[]
): Promise<string> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const historyContext = conversationHistory
      .slice(-6)
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const prompt = `The user has completed a PMOS screening assessment. Here are their results:

${JSON.stringify(resultSummary, null, 2)}

${historyContext ? `Previous conversation:\n${historyContext}\n` : ''}
User's new question: ${userMessage}

Provide a helpful, educational response. Remember:
- Do not diagnose
- Do not prescribe medication
- Encourage professional consultation when appropriate
- Be empathetic and supportive
- Keep response concise (under 250 words)`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini chat error:', error);
    throw new Error('Unable to get AI response. Please try again.');
  }
}

/** Generate personalized action plan */
export async function generateActionPlan(resultSummary: object): Promise<string> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const prompt = `Based on the following PMOS screening results, generate a personalized action plan with general educational recommendations. This is NOT medical advice.

Screening Results:
${JSON.stringify(resultSummary, null, 2)}

Create recommendations in these categories (use markdown formatting with ## headers):
## Menstrual Health
## Nutrition  
## Physical Activity
## Sleep & Stress
## Skin & Hair Care
## Regular Check-ups

For each category, provide 2-3 specific, actionable general recommendations based on the user's reported patterns. Use encouraging, supportive language.

IMPORTANT: These are general educational recommendations, not medical treatment instructions. Include a reminder to consult healthcare professionals.

Keep each category to 2-3 bullet points. Be specific but not prescriptive.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini action plan error:', error);
    throw new Error('Unable to generate action plan. Please try again.');
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
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const prompt = `Generate a professional, concise doctor discussion summary based on these PMOS screening results. This summary is designed to help the user communicate their symptoms to a healthcare professional.

Screening Results:
${JSON.stringify(resultSummary, null, 2)}

${cycleData ? `Cycle Tracking Data:\n${JSON.stringify(cycleData, null, 2)}` : ''}

Create a structured summary with:
1. Overview of reported symptoms
2. Key areas of concern based on screening patterns
3. Suggested discussion points for the healthcare appointment
4. Questions the user might want to ask their doctor

Keep it professional, factual, and under 300 words. Do not diagnose or prescribe. Frame everything as "reported symptoms" and "screening indicators".`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini doctor summary error:', error);
    throw new Error('Unable to generate doctor summary. Please try again.');
  }
}

/** Check if Gemini is configured */
export function isGeminiConfigured(): boolean {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  return !!(apiKey && apiKey !== 'your_api_key_here');
}
