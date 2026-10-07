import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = '#B88728',
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
          {title}
        </span>
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xs"
          style={{
            backgroundColor: `${accentColor}12`,
            borderColor: `${accentColor}30`,
            color: accentColor,
          }}
        >
          <Icon size={20} />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-luxury tracking-tight">
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-1 text-xs">
            {trend && (
              <span
                className={`font-semibold ${
                  trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
            {subtitle && <span className="text-stone-500">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
