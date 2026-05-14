import React from 'react';

interface MaxCardProps {
  children: React.ReactNode;
  accentColor?: string;
  shadowColor?: string;
  asymmetry?: boolean;
  dashed?: boolean;
  className?: string;
  hoverEffect?: boolean;
}

export const MaxCard: React.FC<MaxCardProps> = ({
  children,
  accentColor = 'var(--accent-1)',
  shadowColor = 'var(--accent-5)',
  asymmetry = true,
  dashed = false,
  className = '',
  hoverEffect = true,
}) => {
  const rotation = asymmetry ? (Math.random() > 0.5 ? 'rotate-1' : '-rotate-1') : '';
  const borderStyle = dashed ? 'border-dashed' : 'border-solid';
  
  return (
    <div 
      className={`
        bg-muted/80 backdrop-blur-md border-4 rounded-3xl p-8
        transition-all duration-300
        ${rotation}
        ${borderStyle}
        ${hoverEffect ? 'hover:scale-[1.02] hover:rotate-0 hover:bg-muted/95' : ''}
        ${className}
      `}
      style={{
        borderColor: accentColor,
        boxShadow: `8px 8px 0 ${shadowColor}, 16px 16px 0 ${accentColor}`,
      }}
    >
      {children}
    </div>
  );
};
