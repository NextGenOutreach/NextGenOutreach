import React from 'react';
import Link from 'next/link';

interface MaxButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  target?: React.AnchorHTMLAttributes<HTMLAnchorElement>['target'];
  rel?: React.AnchorHTMLAttributes<HTMLAnchorElement>['rel'];
}

export const MaxButton: React.FC<MaxButtonProps> = ({
  children,
  variant = 'primary',
  href,
  size = 'md',
  fullWidth = false,
  className = '',
  target,
  rel,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-outfit font-black uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeStyles = {
    sm: "px-6 py-3 text-xs",
    md: "px-10 py-4 text-sm",
    lg: "px-12 py-5 text-lg",
  };

  const variantStyles = {
    primary: "bg-gradient-to-r from-accent-1 via-accent-5 to-accent-2 bg-[length:200%] border-4 border-accent-3 rounded-full text-white shadow-[0_0_20px_rgba(255,58,242,0.4),4px_4px_0_var(--accent-3)] hover:scale-105 hover:shadow-[0_0_30px_rgba(255,58,242,0.6),6px_6px_0_var(--accent-3)] animate-gradient-shift",
    secondary: "bg-transparent border-4 border-dashed border-accent-2 rounded-full text-accent-2 hover:bg-accent-2 hover:text-background hover:border-solid hover:scale-105 shadow-[4px_4px_0_var(--accent-2)]",
    outline: "bg-muted/50 backdrop-blur-sm border-4 border-accent-1 rounded-3xl text-white shadow-[8px_8px_0_var(--accent-3),16px_16px_0_var(--accent-1)] hover:-translate-y-1 hover:shadow-[12px_12px_0_var(--accent-3),24px_24px_0_var(--accent-1)]",
    ghost: "bg-transparent text-white hover:scale-105 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-gradient-to-r after:from-accent-1 after:to-accent-2",
  };

  const combinedStyles = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedStyles} target={target} rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedStyles} {...props}>
      {children}
    </button>
  );
};
