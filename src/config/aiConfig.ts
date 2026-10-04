// ============================================================
// PMOS Sense — Centralized AI Configuration
// All Gemini model settings in one place
// ============================================================

/** Use a stable, widely available Gemini model */
export const AI_MODEL = 'gemini-3.6-flash';

/** System instruction shared across all AI functions */
export const SYSTEM_INSTRUCTION = `You are the AI health assistant for PMOS Sense, an academic screening and educational prototype tool for PMOS (Polycystic Metabolic & Ovarian Syndrome).

OUTPUT CONSTRAINTS:
- Output ONLY the final, user-facing text response.
- NEVER output internal instructions, prompt reflections, meta notes, or labels such as "Draft text:", "Target: X words", "Word count:", or "Output:".
- NEVER output HTML entities (such as &#x20;).
- Give direct, natural, human-readable, complete responses.
- NEVER cut off mid-sentence; always finish naturally with a complete sentence.
- NEVER diagnose PMOS or any medical condition, and never prescribe treatments.
- Do NOT invent symptoms or test results not provided in the input data.
- Use markdown formatting for headers (##, ###), bullet points (- or *), and bold (**text**) when structuring responses.`;

/**
 * Per-feature generation settings.
 * Different features need different output limits.
 */
export const generationConfig = {
  /** Post-Risk Assessment Analysis (explainResults) */
  explainResults: {
    maxOutputTokens: 2048,
    temperature: 0.7,
    topP: 0.9,
  },

  /** Ask AI chat responses */
  chatWithAI: {
    maxOutputTokens: 2048,
    temperature: 0.7,
    topP: 0.9,
  },

  /** Personalised Action Plan */
  actionPlan: {
    maxOutputTokens: 3000,
    temperature: 0.7,
    topP: 0.9,
  },

  /** Doctor Discussion Summary */
  doctorSummary: {
    maxOutputTokens: 3000,
    temperature: 0.6,
    topP: 0.9,
  },
} as const;

/**
 * Retry configuration for transient Gemini errors.
 */
export const retryConfig = {
  /** Maximum number of retry attempts */
  maxRetries: 3,
  /** Base delay in ms (doubled each retry = exponential backoff) */
  baseDelayMs: 1000,
  /** Maximum delay cap in ms */
  maxDelayMs: 8000,
  /** HTTP status codes that should trigger a retry */
  retryableStatusCodes: [429, 500, 503],
  /** Error message substrings that should trigger a retry */
  retryableMessages: [
    '503',
    '500',
    '429',
    'high demand',
    'overloaded',
    'RESOURCE_EXHAUSTED',
    'UNAVAILABLE',
    'DEADLINE_EXCEEDED',
    'temporarily unavailable',
    'rate limit',
    'quota',
    'fetch failed',
    'network',
    'ECONNRESET',
    'ETIMEDOUT',
  ],
} as const;
