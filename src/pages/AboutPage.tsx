import { Code, Lightbulb, AlertTriangle, Users, Brain, Shield, Activity, BarChart3, MessageSquare, FileText, Calendar } from 'lucide-react';
import { appConfig } from '../config/appConfig';
import Disclaimer from '../components/Disclaimer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-text-primary">About the Project</h1>
          <p className="text-lg text-text-secondary mt-2">
            Development of an AI-Assisted Early PMOS Risk Detector
          </p>
        </div>

        {/* Problem & Solution */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-card border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-text-primary">Problem</h2>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              PMOS-related symptoms can be variable and may go unnoticed or be difficult to track. 
              Many individuals experience symptoms for years before seeking professional evaluation, 
              leading to delayed awareness and management.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-green-500" />
              </div>
              <h2 className="text-lg font-bold text-text-primary">Solution</h2>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              An interactive AI-assisted screening platform that analyses multiple symptom categories 
              and provides an explainable risk assessment. PMOS Sense empowers users with educational 
              insights to facilitate early conversations with healthcare professionals.
            </p>
          </div>
        </div>

        {/* Innovation */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-border mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">Innovation</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: BarChart3, label: 'Explainable risk scoring' },
              { icon: Activity, label: 'PMOS Pattern Map' },
              { icon: Calendar, label: 'Menstrual cycle analysis' },
              { icon: Brain, label: 'Gemini AI explanation' },
              { icon: Shield, label: 'Personalised recommendations' },
              { icon: MessageSquare, label: 'AI question answering' },
              { icon: FileText, label: 'Doctor discussion summary' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-lavender-50 rounded-xl">
                <item.icon className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span className="text-sm text-text-primary font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Methodology */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-border mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">AI Methodology</h2>
          </div>
          <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
            <p>
              PMOS Sense uses a two-layer approach combining deterministic scoring with generative AI:
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-primary-50/50 rounded-xl border border-primary-100">
                <h3 className="font-semibold text-text-primary mb-2">Layer 1: Deterministic Scoring</h3>
                <p className="text-xs">
                  An Academic Prototype Weighted Screening Algorithm processes questionnaire responses 
                  into numerical feature values. Each response category (menstrual, androgen, metabolic, 
                  lifestyle) is independently scored and weighted to produce a transparent, explainable 
                  overall screening score.
                </p>
              </div>
              <div className="p-4 bg-accent-50/50 rounded-xl border border-accent-100">
                <h3 className="font-semibold text-text-primary mb-2">Layer 2: Generative AI (Gemini)</h3>
                <p className="text-xs">
                  Google Gemini provides natural-language explanations of the calculated results, 
                  answers user questions with educational information, generates personalised 
                  recommendations, and creates doctor discussion summaries. Gemini does not 
                  calculate or influence the screening score.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-border mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Code className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">Technology Stack</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'React', desc: 'UI Framework' },
              { name: 'TypeScript', desc: 'Type Safety' },
              { name: 'Vite', desc: 'Build Tool' },
              { name: 'Tailwind CSS', desc: 'Styling' },
              { name: 'Recharts', desc: 'Data Visualization' },
              { name: 'Gemini AI', desc: 'Generative AI' },
              { name: 'React Router', desc: 'Navigation' },
              { name: 'LocalStorage', desc: 'Data Persistence' },
            ].map((tech, index) => (
              <div key={index} className="p-3 bg-surface-secondary rounded-xl border border-border text-center">
                <p className="text-sm font-semibold text-text-primary">{tech.name}</p>
                <p className="text-xs text-text-muted mt-0.5">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Limitations */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-border mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">Limitations</h2>
          </div>
          <ul className="space-y-2 text-sm text-text-secondary">
            {[
              'This is an academic prototype and has not been clinically validated.',
              'The screening score is based on self-reported data and may not reflect clinical findings.',
              'This tool does not diagnose PMOS or any other medical condition.',
              'AI-generated responses are for general educational purposes only.',
              'Results should not replace professional medical evaluation.',
              'Data is stored locally in the browser and is not backed up.',
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-amber-400 mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-border mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">Team Members</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {appConfig.teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center text-2xl mb-2 shadow-sm">
                  {member.avatar}
                </div>
                <p className="text-xs font-semibold text-text-primary">{member.role}</p>
                <p className="text-xs text-primary-600 font-medium">{member.name}</p>
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
