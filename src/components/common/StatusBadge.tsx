import React from 'react';
import { AppointmentStatus } from '../../types/salon';
import { CheckCircle2, Clock, CheckCheck, XCircle, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: AppointmentStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';
  const sizeClasses = isSm ? 'text-xs px-2 py-0.5' : 'text-xs font-medium px-2.5 py-1';
  const iconSize = isSm ? 12 : 14;

  switch (status) {
    case 'Confirmed':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-medium ${sizeClasses}`}>
          <CheckCircle2 size={iconSize} className="text-emerald-600" />
          Confirmed
        </span>
      );
    case 'Pending':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 font-medium ${sizeClasses}`}>
          <Clock size={iconSize} className="text-amber-600" />
          Pending
        </span>
      );
    case 'Completed':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 font-medium ${sizeClasses}`}>
          <CheckCheck size={iconSize} className="text-blue-600" />
          Completed
        </span>
      );
    case 'Cancelled':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 font-medium ${sizeClasses}`}>
          <XCircle size={iconSize} className="text-rose-600" />
          Cancelled
        </span>
      );
    case 'No Show':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200 font-medium ${sizeClasses}`}>
          <AlertCircle size={iconSize} className="text-neutral-500" />
          No Show
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-stone-100 text-stone-700 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};
