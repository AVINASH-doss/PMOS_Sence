import React from 'react';

interface FormattedTextProps {
  content: string;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Formats AI text nicely:
 * - Converts **bold** to <strong>
 * - Converts *italic* to <em>
 * - Converts ## headers to styled section titles
 * - Converts * or - bullet points to clean list items (•)
 * - Removes double asterisks and stray markdown noise
 */
export default function FormattedText({ content, style, className = '' }: FormattedTextProps) {
  if (!content) return null;

  // Split into paragraphs/lines
  const lines = content.split('\n');

  const renderFormattedLine = (line: string, index: number) => {
    let trimmed = line.trim();
    if (!trimmed) return <div key={index} style={{ height: '0.5rem' }} />;

    // Check for Headers (### or ## or #)
    if (trimmed.startsWith('#')) {
      const headerText = trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '');
      return (
        <h4
          key={index}
          style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            color: '#1e1b3a',
            marginTop: index > 0 ? '1rem' : '0.25rem',
            marginBottom: '0.35rem',
          }}
        >
          {headerText}
        </h4>
      );
    }

    // Check for bullet points (* or - or •)
    const isBullet = /^[*\-•]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed);
    let bulletPrefix = '';
    if (isBullet) {
      if (/^\d+\.\s+/.test(trimmed)) {
        const match = trimmed.match(/^(\d+\.)\s+/);
        bulletPrefix = match ? match[1] : '';
        trimmed = trimmed.replace(/^\d+\.\s+/, '');
      } else {
        bulletPrefix = '•';
        trimmed = trimmed.replace(/^[*\-•]\s+/, '');
      }
    }

    // Process inline formatting (**bold**, *italic*)
    const parts: React.ReactNode[] = [];
    let lastIdx = 0;
    // Regex for **bold** or *italic*
    const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3/g;
    let match;

    while ((match = regex.exec(trimmed)) !== null) {
      // Add text before match
      if (match.index > lastIdx) {
        parts.push(trimmed.substring(lastIdx, match.index));
      }

      if (match[2]) {
        // Bold
        parts.push(<strong key={`${index}-${match.index}`} style={{ fontWeight: 600, color: '#1e1b3a' }}>{match[2]}</strong>);
      } else if (match[4]) {
        // Italic
        parts.push(<em key={`${index}-${match.index}`}>{match[4]}</em>);
      }

      lastIdx = regex.lastIndex;
    }

    if (lastIdx < trimmed.length) {
      parts.push(trimmed.substring(lastIdx));
    }

    if (isBullet) {
      return (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            marginTop: '0.35rem',
            marginBottom: '0.35rem',
            fontSize: '0.85rem',
            lineHeight: 1.6,
          }}
        >
          <span style={{ color: '#7c3aed', fontWeight: 700, flexShrink: 0 }}>{bulletPrefix}</span>
          <span style={{ flex: 1 }}>{parts.length > 0 ? parts : trimmed}</span>
        </div>
      );
    }

    return (
      <p
        key={index}
        style={{
          fontSize: '0.85rem',
          lineHeight: 1.65,
          marginTop: index > 0 ? '0.5rem' : 0,
          color: '#374151',
        }}
      >
        {parts.length > 0 ? parts : trimmed}
      </p>
    );
  };

  return (
    <div className={className} style={{ width: '100%', ...style }}>
      {lines.map((line, idx) => renderFormattedLine(line, idx))}
    </div>
  );
}
