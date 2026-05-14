import React from 'react';

interface FloatingDecorationProps {
  emoji?: string;
  shape?: 'circle' | 'square';
  color?: string;
  size?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  animation?: 'animate-float' | 'animate-float-reverse' | 'animate-wiggle' | 'animate-bounce-subtle' | 'animate-spin-slow';
  opacity?: number;
  zIndex?: number;
}

export const FloatingDecoration: React.FC<FloatingDecorationProps> = ({
  emoji,
  shape,
  color = 'var(--accent-1)',
  size = '3rem',
  top,
  left,
  right,
  bottom,
  animation = 'animate-float',
  opacity = 0.6,
  zIndex = 5,
}) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    top,
    left,
    right,
    bottom,
    opacity,
    zIndex,
    fontSize: size,
  };

  if (emoji) {
    return (
      <div className={`${animation} pointer-events-none`} style={style}>
        {emoji}
      </div>
    );
  }

  if (shape === 'circle') {
    return (
      <div 
        className={`${animation} pointer-events-none border-[4px] rounded-full`}
        style={{
          ...style,
          width: size,
          height: size,
          borderColor: color,
        }}
      />
    );
  }

  if (shape === 'square') {
    return (
      <div 
        className={`${animation} pointer-events-none border-[4px] rounded-xl`}
        style={{
          ...style,
          width: size,
          height: size,
          borderColor: color,
        }}
      />
    );
  }

  return null;
};

export const BackgroundPatterns: React.FC<{ opacity?: number }> = ({ opacity = 0.1 }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" style={{ opacity }}>
      <div className="absolute inset-0 pattern-dots text-accent-1/20" />
      <div className="absolute inset-0 pattern-stripes text-accent-2/10 rotate-[15deg] scale-150" />
    </div>
  );
};
