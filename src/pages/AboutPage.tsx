import { Code, Lightbulb, AlertTriangle, Users, Brain, Shield, Activity, BarChart3, MessageSquare, FileText, Calendar } from 'lucide-react';
import { appConfig } from '../config/appConfig';
import Disclaimer from '../components/Disclaimer';

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ff' }} className="animate-fade-in-up">
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: 'clamp(1.35rem, 4vw, 1.75rem)', fontWeight: 700, color: '#1e1b3a' }}>About the Project</h1>
          <p style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', color: '#6b7280', marginTop: '0.5rem' }}>
            Development of an AI-Assisted Early PMOS Risk Detector
          </p>
        </div>

        {/* Problem & Solution */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', marginBottom: '1.5rem' }} className="sm:!grid-cols-2">
          <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 1.5rem)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', background: '#fef2f2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle style={{ width: '20px', height: '20px', color: '#ef4444' }} />
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e1b3a' }}>Problem</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.7 }}>
              PMOS-related symptoms can be variable and may go unnoticed or be difficult to track.
              Many individuals experience symptoms for years before seeking professional evaluation,
              leading to delayed awareness and management.
            </p>
          </div>

          <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 1.5rem)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', background: '#f0fdf4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Lightbulb style={{ width: '20px', height: '20px', color: '#22c55e' }} />
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e1b3a' }}>Solution</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.7 }}>
              An interactive AI-assisted screening platform that analyses multiple symptom categories
              and provides an explainable risk assessment. PMOS Sense empowers users with educational
              insights to facilitate early conversations with healthcare professionals.
            </p>
          </div>
        </div>

        {/* Innovation */}
        <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 1.5rem)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '40px', height: '40px', background: '#f5f0ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Brain style={{ width: '20px', height: '20px', color: '#7c3aed' }} />
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e1b3a' }}>Innovation</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.625rem' }}>
            {[
              { icon: BarChart3, label: 'Explainable risk scoring' },
              { icon: Activity, label: 'PMOS Pattern Map' },
              { icon: Calendar, label: 'Menstrual cycle analysis' },
              { icon: Brain, label: 'Gemini AI explanation' },
              { icon: Shield, label: 'Personalised recommendations' },
              { icon: MessageSquare, label: 'AI question answering' },
              { icon: FileText, label: 'Doctor discussion summary' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.625rem', background: '#f5f0ff', borderRadius: '0.75rem',
              }}>
                <item.icon style={{ width: '16px', height: '16px', color: '#8b5cf6', flexShrink: 0 }} />
                <span style={{ fontSize: '0.75rem', color: '#1e1b3a', fontWeight: 500 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Methodology */}
        <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 1.5rem)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', background: '#eef2ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Brain style={{ width: '20px', height: '20px', color: '#6366f1' }} />
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e1b3a' }}>AI Methodology</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.7, marginBottom: '1rem' }}>
            PMOS Sense uses a two-layer approach combining deterministic scoring with generative AI:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }} className="sm:!grid-cols-2">
            <div style={{ padding: '1rem', background: 'rgba(245,240,255,0.5)', borderRadius: '0.75rem', border: '1px solid #ede5ff' }}>
              <h3 style={{ fontWeight: 600, color: '#1e1b3a', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Layer 1: Deterministic Scoring</h3>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.6 }}>
                An Academic Prototype Weighted Screening Algorithm processes questionnaire responses
                into numerical feature values. Each response category is independently scored and weighted
                to produce a transparent, explainable overall screening score.
              </p>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(253,242,248,0.5)', borderRadius: '0.75rem', border: '1px solid #fce7f3' }}>
              <h3 style={{ fontWeight: 600, color: '#1e1b3a', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Layer 2: Generative AI (Gemini)</h3>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.6 }}>
                Google Gemini provides natural-language explanations of the calculated results,
                answers user questions with educational information, generates personalised
                recommendations, and creates doctor discussion summaries. Gemini does not
                calculate or influence the screening score.
              </p>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 1.5rem)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Code style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e1b3a' }}>Technology Stack</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.625rem' }}>
            {[
              { name: 'React', desc: 'UI Framework' },
              { name: 'TypeScript', desc: 'Type Safety' },
              { name: 'Vite', desc: 'Build Tool' },
              { name: 'Tailwind CSS', desc: 'Styling' },
              { name: 'Recharts', desc: 'Data Visualization' },
              { name: 'Gemini AI', desc: 'Generative AI' },
              { name: 'Supabase', desc: 'Backend & Auth' },
              { name: 'React Router', desc: 'Navigation' },
            ].map((tech, i) => (
              <div key={i} style={{
                padding: '0.75rem 0.5rem', background: '#faf8ff', borderRadius: '0.75rem',
                border: '1px solid #e9e2f5', textAlign: 'center',
              }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e1b3a' }}>{tech.name}</p>
                <p style={{ fontSize: '0.6rem', color: '#9ca3af', marginTop: '2px' }}>{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Limitations */}
        <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 1.5rem)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', background: '#fffbeb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e1b3a' }}>Limitations</h2>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              'This is an academic prototype and has not been clinically validated.',
              'The screening score is based on self-reported data and may not reflect clinical findings.',
              'This tool does not diagnose PMOS or any other medical condition.',
              'AI-generated responses are for general educational purposes only.',
              'Results should not replace professional medical evaluation.',
            ].map((item, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
                <span style={{ color: '#f59e0b', marginTop: '2px', flexShrink: 0 }}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Team Members */}
        <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 1.5rem)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', background: '#faf5ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users style={{ width: '20px', height: '20px', color: '#a855f7' }} />
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e1b3a' }}>Team Members</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
            {appConfig.teamMembers.map((member, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '56px', height: '56px', margin: '0 auto 0.5rem',
                  background: 'linear-gradient(135deg, #ede5ff, #fce7f3)',
                  borderRadius: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.35rem',
                  boxShadow: '0 2px 8px rgba(139,92,246,0.1)',
                }}>
                  {member.avatar}
                </div>
                <p style={{ fontSize: '0.65rem', fontWeight: 600, color: '#1e1b3a' }}>{member.role}</p>
                <p style={{ fontSize: '0.65rem', fontWeight: 500, color: '#7c3aed' }}>{member.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <Disclaimer text={appConfig.disclaimer} variant="warning" />
      </div>
    </div>
  );
}
