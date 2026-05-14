import React from 'react';
import { MaxCard } from './ui/MaxCard';

interface MetricCardProps {
  label: string;
  value: string;
  trend?: string;
  subtext?: string;
  accentColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, trend, subtext, accentColor = "var(--accent-1)" }) => {
  return (
    <MaxCard 
      accentColor={accentColor}
      className="flex flex-col gap-2"
      hoverEffect={true}
    >
      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/70">{label}</h3>
      <div className="flex items-end gap-2">
        <span className="text-4xl font-black uppercase headline-shadow text-white leading-none">{value}</span>
        {trend && (
          <span className={`text-xs font-black uppercase tracking-widest ${trend.includes('↑') ? 'text-accent-2' : 'text-accent-4'}`}>
            {trend}
          </span>
        )}
      </div>
      {subtext && <p className="text-xs font-bold uppercase tracking-tight text-white/50 mt-2">{subtext}</p>}
    </MaxCard>
  );
};

