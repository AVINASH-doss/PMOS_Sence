import { AlertTriangle } from 'lucide-react';

interface DisclaimerProps {
  text?: string;
  variant?: 'info' | 'warning';
  className?: string;
}

export default function Disclaimer({ 
  text = 'This tool is for educational and screening purposes only. It does not provide a medical diagnosis.',
  variant = 'info',
  className = ''
}: DisclaimerProps) {
  const bgColor = variant === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-accent-50 border-accent-200';
  const textColor = variant === 'warning' ? 'text-amber-800' : 'text-accent-600';
  const iconColor = variant === 'warning' ? 'text-amber-500' : 'text-accent-400';

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${bgColor} ${className}`}>
      <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconColor}`} />
      <p className={`text-sm ${textColor}`}>{text}</p>
    </div>
  );
}
