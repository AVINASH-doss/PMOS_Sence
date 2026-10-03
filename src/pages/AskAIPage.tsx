import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, User, AlertCircle, RefreshCw } from 'lucide-react';
import { type ScoringResult, createAISummary } from '../logic/scoring';
import { chatWithAI, isGeminiConfigured, type AIMessage } from '../services/geminiService';

const SUGGESTED_QUESTIONS = [
  'What does irregular periods mean?',
  'How can I improve my score?',
  'What should I discuss with my doctor?',
  'Why did acne affect my result?',
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
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    if (!result) {
      setError('Please complete the screening assessment first to use AI chat.');
      return;
    }
    if (!isGeminiConfigured()) {
      setError('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
      return;
    }

    const userMessage: AIMessage = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const summary = createAISummary(result);
      const response = await chatWithAI(text.trim(), summary, messages);
      const aiMessage: AIMessage = { role: 'assistant', content: response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      setError(err.message || 'Failed to get response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Ask AI About My Results</h1>
          <p className="text-text-secondary text-sm mt-1">
            Ask any questions about your score, symptoms or recommendations.
          </p>
        </div>

        {/* Chat Area */}
        <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
          {/* Messages */}
          <div className="h-[400px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="font-semibold text-text-primary mb-1">AI Health Assistant</h3>
                <p className="text-sm text-text-secondary max-w-sm">
                  Ask questions about your PMOS screening results. I'll provide general educational information.
                </p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-primary-100'
                      : 'bg-accent-100'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 text-primary-600" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-accent-600" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary-500 text-white rounded-tr-md'
                      : 'bg-lavender-50 text-text-primary border border-primary-100 rounded-tl-md'
                  }`}
                >
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                  ))}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-xl bg-accent-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-accent-600" />
                </div>
                <div className="px-4 py-3 bg-lavender-50 rounded-2xl rounded-tl-md border border-primary-100">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-error bg-red-50 px-4 py-3 rounded-xl border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
                <button
                  onClick={() => { setError(''); if (messages.length > 0) sendMessage(messages[messages.length - 1].content); }}
                  className="ml-auto flex items-center gap-1 text-xs font-medium hover:text-red-700"
                >
                  <RefreshCw className="w-3 h-3" /> Retry
                </button>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 0 && (
            <div className="px-6 pb-3 flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg border border-primary-100 hover:bg-primary-100 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-border p-4 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-surface-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl disabled:opacity-30 hover:shadow-lg transition-all"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Bottom disclaimer */}
        <p className="text-xs text-text-muted text-center mt-4">
          AI responses are for general educational purposes only and do not constitute medical advice.
        </p>
      </div>
    </div>
  );
}
