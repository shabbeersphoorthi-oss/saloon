import React from 'react';
import { LucideIcon, Calendar } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Calendar,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white/60 rounded-3xl border border-stone-200/70 border-dashed my-4">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#B88728] flex items-center justify-center mb-4 shadow-sm border border-amber-100">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-stone-900 mb-1">{title}</h3>
      <p className="text-sm text-stone-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 transition-all shadow-sm hover:shadow"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
