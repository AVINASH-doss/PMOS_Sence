import { Link } from 'react-router-dom';
import { ArrowRight, Activity, Brain, PieChart, Heart, Sparkles } from 'lucide-react';
import { appConfig } from '../config/appConfig';
import Disclaimer from '../components/Disclaimer';

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-lavender-50 via-white to-accent-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div className="animate-slide-up">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                <span className="bg-gradient-to-r from-primary-800 via-primary-600 to-accent-500 bg-clip-text text-transparent">
                  {appConfig.heroHeading.split(' ').slice(0, 3).join(' ')}
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                  {appConfig.heroHeading.split(' ').slice(3).join(' ')}
                </span>
              </h1>
              <p className="mt-6 text-lg text-text-secondary leading-relaxed max-w-xl">
                {appConfig.heroSubtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/assessment"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Start Risk Assessment
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 rounded-xl font-semibold border border-primary-200 hover:bg-primary-50 hover:border-primary-300 transition-all duration-200"
                >
                  How It Works
                </a>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center">
                  <div className="w-64 h-64 bg-gradient-to-br from-primary-200/50 to-accent-200/50 rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto bg-white rounded-3xl shadow-xl flex items-center justify-center mb-4">
                        <Heart className="w-12 h-12 text-accent-400" fill="currentColor" />
                      </div>
                      <p className="text-primary-700 font-semibold text-sm">PMOS Screening</p>
                      <p className="text-primary-500 text-xs mt-1">AI-Assisted Analysis</p>
                    </div>
                  </div>
                </div>
                {/* Floating badges */}
                <div className="absolute top-4 -left-4 bg-white rounded-2xl shadow-lg p-3 animate-bounce" style={{ animationDuration: '3s' }}>
                  <Activity className="w-6 h-6 text-primary-500" />
                </div>
                <div className="absolute bottom-8 -right-4 bg-white rounded-2xl shadow-lg p-3 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                  <Sparkles className="w-6 h-6 text-accent-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-text-primary">How PMOS Sense Works</h2>
          <p className="text-text-secondary mt-2">Three steps to understand your PMOS risk profile</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Activity,
              title: 'Menstrual Pattern Analysis',
              description: 'Track and analyse your cycle pattern.',
              color: 'from-primary-500 to-primary-600',
              bg: 'bg-primary-50',
            },
            {
              icon: Brain,
              title: 'Explainable AI Risk Assessment',
              description: 'Understand your results with clear explanations.',
              color: 'from-accent-500 to-accent-600',
              bg: 'bg-accent-50',
            },
            {
              icon: PieChart,
              title: 'Personalised PMOS Pattern Map',
              description: 'Get recommendations based on your unique symptom pattern.',
              color: 'from-primary-400 to-accent-400',
              bg: 'bg-lavender-50',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border hover:-translate-y-1"
            >
              <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-text-primary">Your Screening Journey</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Complete Assessment', desc: 'Answer 27 questions about your health patterns' },
              { step: '2', title: 'Get Your Score', desc: 'Receive your PMOS screening score and pattern map' },
              { step: '3', title: 'Understand Results', desc: 'AI explains what your results may indicate' },
              { step: '4', title: 'Take Action', desc: 'Get personalised recommendations and doctor summary' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg mb-4 shadow-md">
                  {item.step}
                </div>
                <h3 className="font-semibold text-text-primary mb-1">{item.title}</h3>
                <p className="text-sm text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-primary-600 to-accent-500 rounded-3xl p-8 md:p-12 text-center text-white shadow-elevated">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start?</h2>
          <p className="text-white/90 max-w-xl mx-auto mb-8">
            Take the first step towards understanding your PMOS risk. Our AI-assisted screening takes approximately 5 minutes.
          </p>
          <Link
            to="/assessment"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 rounded-xl font-semibold hover:bg-primary-50 hover:shadow-lg transition-all duration-200"
          >
            Begin Assessment
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Disclaimer />
      </div>
    </div>
  );
}
