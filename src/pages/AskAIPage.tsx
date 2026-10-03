import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, User, AlertCircle, RefreshCw } from 'lucide-react';
import { type ScoringResult, createAISummary } from '../logic/scoring';
import { chatWithAI, isGeminiConfigured, type AIMessage } from '../services/geminiService';
import FormattedText from '../components/FormattedText';

const SUGGESTED_QUESTIONS = [
  'What are common PMOS symptoms?',
  'How do menstrual cycles relate to PMOS?',
  'What lifestyle changes help manage symptoms?',
  'What should I ask my doctor about PMOS?',
];

export default function AskAIPage() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ScoringResult | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('pmos_screening_result');
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch {}
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    if (!isGeminiConfigured()) {
      setError('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
      return;
    }

    const userMessage: AIMessage = { role: 'user', content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const summary = result ? createAISummary(result) : null;
      const response = await chatWithAI(text.trim(), summary, messages);
      setMessages([...updatedMessages, { role: 'assistant', content: response }]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to get AI response.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ff' }} className="animate-fade-in-up">
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1e1b3a' }}>Ask AI Assistant</h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Get quick, clear educational answers about PMOS, symptoms, and health advice.
          </p>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          {/* Messages container */}
          <div style={{ height: '420px', overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                <div style={{ width: '52px', height: '52px', background: '#f5f0ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <Sparkles style={{ width: '26px', height: '26px', color: '#8b5cf6' }} />
                </div>
                <h3 style={{ fontWeight: 600, color: '#1e1b3a', marginBottom: '0.25rem', fontSize: '1rem' }}>AI Health Assistant</h3>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', maxWidth: '340px', lineHeight: 1.5 }}>
                  {result
                    ? 'Ask questions about your completed screening score or general PMOS topics.'
                    : 'Ask any questions about PMOS symptoms, lifestyle, or checkups.'}
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: msg.role === 'user' ? '#7c3aed' : '#f3e8ff',
                  color: msg.role === 'user' ? 'white' : '#7c3aed',
                }}>
                  {msg.role === 'user' ? <User style={{ width: '15px', height: '15px' }} /> : <Sparkles style={{ width: '15px', height: '15px' }} />}
                </div>
                <div style={{
                  maxWidth: '80%', padding: '0.75rem 1rem', borderRadius: '1rem',
                  ...(msg.role === 'user'
                    ? { background: '#7c3aed', color: 'white', borderTopRightRadius: '4px' }
                    : { background: '#f8fafc', color: '#1e1b3a', border: '1px solid #e2e8f0', borderTopLeftRadius: '4px' }),
                }}>
                  {msg.role === 'user' ? (
                    <p style={{ fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>{msg.content}</p>
                  ) : (
                    <FormattedText content={msg.content} />
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles style={{ width: '15px', height: '15px', color: '#7c3aed' }} />
                </div>
                <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '1rem', borderTopLeftRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', gap: '6px' }}>
                  {[0, 150, 300].map(d => <div key={d} style={{ width: '8px', height: '8px', background: '#a855f7', borderRadius: '50%', animation: `bounce 1s infinite ${d}ms` }} />)}
                </div>
              </div>
            )}

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
                <AlertCircle style={{ width: '16px', height: '16px', color: '#ef4444', flexShrink: 0 }} />
                <span style={{ fontSize: '0.8rem', color: '#991b1b', flex: 1 }}>{error}</span>
                <button onClick={() => setError('')} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600, color: '#991b1b', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <RefreshCw style={{ width: '12px', height: '12px' }} /> Clear
                </button>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 0 && (
            <div style={{ padding: '0 1.25rem 0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button key={q} onClick={() => sendMessage(q)} style={{
                  padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 500,
                  color: '#6d28d9', background: '#f5f0ff', borderRadius: '0.5rem',
                  border: '1px solid #ede5ff', cursor: 'pointer', transition: 'all 0.15s ease',
                }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            style={{ borderTop: '1px solid #e9e2f5', padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem' }}>
            <input
              type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about PMOS..." disabled={loading}
              style={{
                flex: 1, padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0',
                background: '#faf8ff', fontSize: '0.85rem', outline: 'none', opacity: loading ? 0.6 : 1,
              }}
            />
            <button type="submit" disabled={loading || !input.trim()} className="btn-primary"
              style={{ padding: '0.75rem 1.25rem', opacity: (loading || !input.trim()) ? 0.4 : 1, borderRadius: '0.75rem' }}>
              <Send style={{ width: '16px', height: '16px' }} />
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.725rem', color: '#9ca3af', marginTop: '1rem' }}>
          AI responses are for general educational purposes only and do not replace professional medical advice.
        </p>
      </div>
    </div>
  );
}
