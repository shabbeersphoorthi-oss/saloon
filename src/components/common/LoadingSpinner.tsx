import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading salon details...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
      <div
        className={`${sizeClasses} border-amber-200 border-t-[#C59B27] rounded-full animate-spin mb-3`}
      />
      {label && <p className="text-sm font-medium text-stone-500 animate-pulse">{label}</p>}
    </div>
  );
};

export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm animate-pulse space-y-4">
    <div className="h-44 bg-stone-200/70 rounded-xl w-full" />
    <div className="h-5 bg-stone-200/80 rounded w-3/4" />
    <div className="h-3 bg-stone-200/60 rounded w-full" />
    <div className="h-3 bg-stone-200/60 rounded w-2/3" />
    <div className="flex justify-between items-center pt-2">
      <div className="h-6 bg-stone-200 rounded w-20" />
      <div className="h-9 bg-stone-200 rounded-lg w-28" />
    </div>
  </div>
);
