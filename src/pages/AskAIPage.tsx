import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, User, AlertCircle, RefreshCw } from 'lucide-react';
import { type ScoringResult, createAISummary } from '../logic/scoring';
import { chatWithAI, isGeminiConfigured, type AIMessage } from '../services/geminiService';

const SUGGESTED_QUESTIONS = [
  'What does irregular periods mean?',
  'How can I improve my score?',
  'What should I discuss with my doctor?',
  'What lifestyle factors can I improve?',
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
    if (stored) try { setResult(JSON.parse(stored)); } catch {}
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    if (!result) { setError('Please complete the screening assessment first.'); return; }
    if (!isGeminiConfigured()) { setError('Gemini API key not configured. Add VITE_GEMINI_API_KEY to .env.'); return; }

    const userMessage: AIMessage = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const response = await chatWithAI(text.trim(), createAISummary(result), messages);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err: any) {
      setError(err.message || 'Failed to get response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ff' }} className="animate-fade-in-up">
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e1b3a' }}>Ask AI About My Results</h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Ask any questions about your score, symptoms or recommendations.
          </p>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          {/* Messages */}
          <div style={{ height: '400px', overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', background: '#f5f0ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Sparkles style={{ width: '28px', height: '28px', color: '#a87bff' }} />
                </div>
                <h3 style={{ fontWeight: 600, color: '#1e1b3a', marginBottom: '0.25rem' }}>AI Health Assistant</h3>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', maxWidth: '320px' }}>
                  Ask questions about your PMOS screening results. I'll provide general educational information.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: msg.role === 'user' ? '#ede5ff' : '#fce7f3',
                }}>
                  {msg.role === 'user' ? <User style={{ width: '14px', height: '14px', color: '#7c3aed' }} /> : <Sparkles style={{ width: '14px', height: '14px', color: '#ec4899' }} />}
                </div>
                <div style={{
                  maxWidth: '75%', padding: '0.75rem 1rem', borderRadius: '1rem', fontSize: '0.85rem', lineHeight: 1.6,
                  ...(msg.role === 'user'
                    ? { background: '#8b5cf6', color: 'white', borderTopRightRadius: '4px' }
                    : { background: '#f5f0ff', color: '#1e1b3a', border: '1px solid #ede5ff', borderTopLeftRadius: '4px' }),
                }}>
                  {msg.content.split('\n').map((line, j) => <p key={j} style={j > 0 ? { marginTop: '0.5rem' } : {}}>{line}</p>)}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles style={{ width: '14px', height: '14px', color: '#ec4899' }} />
                </div>
                <div style={{ padding: '0.75rem 1rem', background: '#f5f0ff', borderRadius: '1rem', borderTopLeftRadius: '4px', border: '1px solid #ede5ff', display: 'flex', gap: '6px' }}>
                  {[0, 150, 300].map(d => <div key={d} style={{ width: '8px', height: '8px', background: '#c4abff', borderRadius: '50%', animation: `bounce 1s infinite ${d}ms` }} />)}
                </div>
              </div>
            )}

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
                <AlertCircle style={{ width: '14px', height: '14px', color: '#ef4444', flexShrink: 0 }} />
                <span style={{ fontSize: '0.8rem', color: '#991b1b', flex: 1 }}>{error}</span>
                <button onClick={() => { setError(''); }} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 500, color: '#991b1b', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <RefreshCw style={{ width: '10px', height: '10px' }} /> Retry
                </button>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 0 && (
            <div style={{ padding: '0 1.5rem 0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button key={q} onClick={() => sendMessage(q)} style={{
                  padding: '0.375rem 0.75rem', fontSize: '0.7rem', fontWeight: 500,
                  color: '#7c3aed', background: '#f5f0ff', borderRadius: '0.5rem',
                  border: '1px solid #ede5ff', cursor: 'pointer', transition: 'background 0.15s',
                }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            style={{ borderTop: '1px solid #e9e2f5', padding: '1rem 1.5rem', display: 'flex', gap: '0.75rem' }}>
            <input
              type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..." disabled={loading}
              style={{
                flex: 1, padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #e9e2f5',
                background: '#faf8ff', fontSize: '0.85rem', outline: 'none', opacity: loading ? 0.5 : 1,
              }}
            />
            <button type="submit" disabled={loading || !input.trim()} className="btn-primary"
              style={{ padding: '0.75rem', opacity: (loading || !input.trim()) ? 0.3 : 1 }}>
              <Send style={{ width: '16px', height: '16px' }} />
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#9ca3af', marginTop: '1rem' }}>
          AI responses are for general educational purposes only and do not constitute medical advice.
        </p>
      </div>
    </div>
  );
}
