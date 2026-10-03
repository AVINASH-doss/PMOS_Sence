import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AssessmentPage from './pages/AssessmentPage';
import ResultsPage from './pages/ResultsPage';
import CyclePage from './pages/CyclePage';
import AskAIPage from './pages/AskAIPage';
import ActionPlanPage from './pages/ActionPlanPage';
import DoctorSummaryPage from './pages/DoctorSummaryPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/cycle" element={<CyclePage />} />
          <Route path="/ask-ai" element={<AskAIPage />} />
          <Route path="/action-plan" element={<ActionPlanPage />} />
          <Route path="/doctor-summary" element={<DoctorSummaryPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
