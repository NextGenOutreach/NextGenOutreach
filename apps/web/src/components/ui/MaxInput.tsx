import React from 'react';

interface MaxInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  accentColor?: string;
  isTextArea?: boolean;
}

export const MaxInput: React.FC<MaxInputProps> = ({
  label,
  accentColor = 'var(--accent-1)',
  isTextArea = false,
  className = '',
  ...props
}) => {
  const Component = isTextArea ? 'textarea' : 'input';
  
  return (
    <div className="w-full space-y-2">
      <label className="block text-sm font-black uppercase tracking-widest text-accent-4 rotate-[-1deg] w-fit">
        {label}
      </label>
      <Component
        className={`
          w-full bg-muted/50 backdrop-blur-sm border-4 rounded-full px-6 py-4
          text-lg font-bold text-white placeholder:text-white/30
          focus:outline-dashed focus:outline-accent-2 focus:border-accent-2
          transition-all duration-300
          ${isTextArea ? 'rounded-3xl h-40' : ''}
          ${className}
        `}
        style={{ borderColor: accentColor }}
        {...props}
      />
    </div>
  );
};
