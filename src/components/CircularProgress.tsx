import { useEffect, useRef } from 'react';

interface CircularProgressProps {
  value: number;         // 0–100
  size?: number;         // px, default 120
  strokeWidth?: number;
  label?: string;
  showPercent?: boolean;
  color?: string;
  className?: string;
}

export default function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  label,
  showPercent = true,
  color,
  className = '',
}: CircularProgressProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const progressColor = color || getColor(value);

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.style.strokeDashoffset = String(circumference);
      requestAnimationFrame(() => {
        if (circleRef.current) {
          circleRef.current.style.transition = 'stroke-dashoffset 1.2s ease-out';
          circleRef.current.style.strokeDashoffset = String(offset);
        }
      });
    }
  }, [value, circumference, offset]);

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f0eaff"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            ref={circleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={progressColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showPercent ? (
            <>
              <span className="text-2xl font-bold text-text-primary">{value}</span>
              <span className="text-xs text-text-muted">/100</span>
            </>
          ) : (
            <span className="text-xl font-bold text-text-primary">{value}%</span>
          )}
        </div>
      </div>
      {label && (
        <span className="text-xs font-medium text-text-secondary text-center">{label}</span>
      )}
    </div>
  );
}

function getColor(value: number): string {
  if (value <= 30) return '#10b981';
  if (value <= 60) return '#f59e0b';
  return '#ef4444';
}
