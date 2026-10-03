// Application-wide configuration
export const appConfig = {
  name: 'PMOS Sense',
  title: 'AI-Assisted Early PMOS Risk Detector',
  heroHeading: 'Understand Your PMOS Risk Earlier.',
  heroSubtitle:
    'An AI-assisted screening tool that analyses menstrual patterns, hormonal symptoms, metabolic factors and lifestyle information to provide a personalised PMOS risk assessment.',
  disclaimer:
    'This application is an academic screening and educational prototype. It does not diagnose PMOS or replace professional medical advice.',
  shortDisclaimer:
    'This tool is for educational and screening purposes only. It does not provide a medical diagnosis.',
  scoringDisclaimer:
    'Screening score generated using an academic prototype weighted scoring model.',
  summaryDisclaimer:
    'This summary is not a diagnosis. It is intended to help you communicate your symptoms to a healthcare professional.',

  navigation: [
    { label: 'Home', path: '/' },
    { label: 'Risk Assessment', path: '/assessment' },
    { label: 'My Cycle', path: '/cycle' },
    { label: 'My Results', path: '/results' },
    { label: 'Ask AI', path: '/ask-ai' },
    { label: 'About', path: '/about' },
  ],

  teamMembers: [
    { name: 'Kirthika D', role: 'Member 1', avatar: '👩‍💻' },
    { name: 'Keerthana S', role: 'Member 2', avatar: '👩‍🔬' },
    { name: 'Jaya Joyce', role: 'Member 3', avatar: '👩‍⚕️' },
    { name: 'Poshika Devi', role: 'Member 4', avatar: '👩‍🎓' },
    { name: 'Dhana Lakshmi', role: 'Member 5', avatar: '👩‍💼' },
  ],
};
