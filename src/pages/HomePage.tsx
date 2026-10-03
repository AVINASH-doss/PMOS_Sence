import { Link } from 'react-router-dom';
import { ArrowRight, Activity, Brain, PieChart, Heart, Sparkles } from 'lucide-react';
import { appConfig } from '../config/appConfig';
import Disclaimer from '../components/Disclaimer';

export default function HomePage() {
  return (
    <div className="animate-fade-in-up">
      {/* ======== HERO ======== */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f8f5ff 0%, #ffffff 40%, #fdf2f8 100%)',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '-160px', right: '-160px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-160px', left: '-160px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />

        <div className="section-container" style={{ position: 'relative', paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'center' }} className="lg:!grid-cols-2">
            {/* Text Side */}
            <div style={{ textAlign: 'left' }}>
              <h1 style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
                <span style={{ display: 'block', background: 'linear-gradient(135deg, #4c1d95, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Understand Your
                </span>
                <span style={{ display: 'block', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  PMOS Risk Earlier.
                </span>
              </h1>
              <p style={{ fontSize: '1.05rem', color: '#6b7280', lineHeight: 1.7, maxWidth: '520px', marginBottom: '2rem' }}>
                {appConfig.heroSubtitle}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <Link to="/assessment" className="btn-primary">
                  Start Risk Assessment
                  <ArrowRight style={{ width: '16px', height: '16px' }} />
                </Link>
                <a href="#how-it-works" className="btn-secondary">
                  How It Works
                </a>
              </div>
            </div>

            {/* Illustration Side */}
            <div className="hidden lg:flex" style={{ justifyContent: 'center' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '300px', height: '300px',
                  background: 'linear-gradient(135deg, #ede5ff, #fce7f3)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: '220px', height: '220px',
                    background: 'linear-gradient(135deg, rgba(221,208,255,0.5), rgba(251,207,232,0.5))',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '80px', height: '80px', margin: '0 auto 12px',
                        background: 'white', borderRadius: '20px',
                        boxShadow: '0 8px 24px rgba(139,92,246,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Heart style={{ width: '40px', height: '40px', color: '#f472b6', fill: '#f472b6' }} />
                      </div>
                      <p style={{ color: '#6d28d9', fontWeight: 600, fontSize: '0.8rem' }}>PMOS Screening</p>
                      <p style={{ color: '#8b5cf6', fontSize: '0.7rem', marginTop: '2px' }}>AI-Assisted Analysis</p>
                    </div>
                  </div>
                </div>
                {/* Floating badges */}
                <div style={{ position: 'absolute', top: '12px', left: '-12px', background: 'white', borderRadius: '16px', padding: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', animation: 'bounce 3s infinite' }}>
                  <Activity style={{ width: '22px', height: '22px', color: '#8b5cf6' }} />
                </div>
                <div style={{ position: 'absolute', bottom: '24px', right: '-12px', background: 'white', borderRadius: '16px', padding: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', animation: 'bounce 4s infinite 1s' }}>
                  <Sparkles style={{ width: '22px', height: '22px', color: '#ec4899' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======== FEATURE CARDS ======== */}
      <section id="how-it-works" className="section-container" style={{ paddingTop: '4rem', paddingBottom: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e1b3a' }}>How PMOS Sense Works</h2>
          <p style={{ color: '#6b7280', marginTop: '0.5rem', fontSize: '0.95rem' }}>Three steps to understand your PMOS risk profile</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: Activity, title: 'Menstrual Pattern Analysis', desc: 'Track and analyse your cycle pattern.', bg: '#f5f0ff', iconColor: '#7c3aed' },
            { icon: Brain, title: 'Explainable AI Risk Assessment', desc: 'Understand your results with clear explanations.', bg: '#fdf2f8', iconColor: '#ec4899' },
            { icon: PieChart, title: 'Personalised PMOS Pattern Map', desc: 'Get recommendations based on your unique symptom pattern.', bg: '#f0eaff', iconColor: '#8b5cf6' },
          ].map((feature, i) => (
            <div key={i} className="card" style={{ padding: '1.5rem', cursor: 'default' }}>
              <div style={{
                width: '52px', height: '52px', background: feature.bg, borderRadius: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
              }}>
                <feature.icon style={{ width: '26px', height: '26px', color: feature.iconColor }} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1e1b3a', marginBottom: '0.5rem' }}>{feature.title}</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======== STEPS ======== */}
      <section style={{ background: 'white', padding: '4rem 0' }}>
        <div className="section-container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e1b3a' }}>Your Screening Journey</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            {[
              { step: '1', title: 'Complete Assessment', desc: 'Answer 27 questions about your health patterns' },
              { step: '2', title: 'Get Your Score', desc: 'Receive your PMOS screening score and pattern map' },
              { step: '3', title: 'Understand Results', desc: 'AI explains what your results may indicate' },
              { step: '4', title: 'Take Action', desc: 'Get personalised recommendations and doctor summary' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '48px', height: '48px', margin: '0 auto 1rem',
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  borderRadius: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '1.1rem',
                  boxShadow: '0 4px 12px rgba(139,92,246,0.25)'
                }}>
                  {item.step}
                </div>
                <h3 style={{ fontWeight: 600, color: '#1e1b3a', marginBottom: '0.25rem', fontSize: '0.95rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== CTA ======== */}
      <section className="section-container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
          borderRadius: '1.5rem',
          padding: '3rem 2rem',
          textAlign: 'center',
          color: 'white',
          boxShadow: '0 10px 40px rgba(124,58,237,0.2)'
        }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>Ready to Start?</h2>
          <p style={{ opacity: 0.9, maxWidth: '500px', margin: '0 auto 2rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Take the first step towards understanding your PMOS risk. Our AI-assisted screening takes approximately 5 minutes.
          </p>
          <Link to="/assessment" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.875rem 2rem', background: 'white', color: '#6d28d9',
            borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.95rem',
            textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s',
          }}>
            Begin Assessment
            <ArrowRight style={{ width: '18px', height: '18px' }} />
          </Link>
        </div>
      </section>

      {/* ======== DISCLAIMER ======== */}
      <div className="section-container" style={{ paddingBottom: '3rem' }}>
        <Disclaimer />
      </div>
    </div>
  );
}
