import { AlertTriangle } from 'lucide-react';

interface DisclaimerProps {
  text?: string;
  variant?: 'info' | 'warning';
  className?: string;
}

export default function Disclaimer({
  text = 'This tool is for educational and screening purposes only. It does not provide a medical diagnosis.',
  variant = 'info',
  className = '',
}: DisclaimerProps) {
  const isWarning = variant === 'warning';

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        borderRadius: '0.75rem',
        border: `1px solid ${isWarning ? '#fcd34d' : '#fbcfe8'}`,
        background: isWarning ? '#fffbeb' : '#fdf2f8',
      }}
    >
      <AlertTriangle style={{
        width: '16px', height: '16px', marginTop: '2px', flexShrink: 0,
        color: isWarning ? '#f59e0b' : '#ec4899',
      }} />
      <p style={{ fontSize: '0.8rem', color: isWarning ? '#92400e' : '#9d174d', lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}
