import React from 'react';
import { Appointment } from '../../types/salon';
import { StatusBadge } from '../common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Calendar, Clock, Scissors, CalendarPlus, XCircle, RotateCcw } from 'lucide-react';

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (appointment: Appointment) => void;
  onReschedule?: (appointment: Appointment) => void;
  onAddToCalendar?: (appointment: Appointment) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onCancel,
  onReschedule,
  onAddToCalendar,
}) => {
  const isUpcoming =
    appointment.status === 'Confirmed' || appointment.status === 'Pending';
  const canModify =
    appointment.status === 'Confirmed' || appointment.status === 'Pending';

  const handleGoogleCalendar = () => {
    const title = encodeURIComponent(`Bloom Saloon: ${appointment.serviceNames.join(', ')}`);
    const details = encodeURIComponent(
      `Appointment at Bloom Saloon\nBooking ID: ${appointment.bookingId}\nServices: ${appointment.serviceNames.join(', ')}\nTotal: ${formatCurrency(appointment.total)}\nContact: 8309578606`
    );
    const location = encodeURIComponent('Bloom Saloon, 107/P, 3-13-94/11/A, Ramanthapur, Hyderabad, Telangana • Phone: 8309578606');
    
    // Construct Google Calendar URL
    const dateFormatted = appointment.appointmentDate.replace(/-/g, '');
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dateFormatted}T090000Z/${dateFormatted}T100000Z`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
        <div>
          <span className="text-[11px] font-mono tracking-wider font-bold text-stone-500 block">
            {appointment.bookingId}
          </span>
          <h4 className="text-base sm:text-lg font-bold text-stone-900 font-luxury mt-0.5">
            {appointment.serviceNames.join(' + ')}
          </h4>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      {/* Date, Time & Salon Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600 bg-[#FAF8F5] p-3.5 rounded-2xl border border-stone-200/60">
        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-[#B88728] shrink-0" />
          <span>{formatDate(appointment.appointmentDate)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={15} className="text-[#B88728] shrink-0" />
          <span>
            {appointment.startTime} – {appointment.endTime} ({appointment.duration} mins)
          </span>
        </div>
        <div className="flex items-center justify-between col-span-1 sm:col-span-2">
          <div className="flex items-center gap-2">
            <Scissors size={14} className="text-[#B88728] shrink-0" />
            <span>Master Stylists: <strong>Bloom Saloon Experts</strong></span>
          </div>
          {appointment.isHomeVisit && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              🏠 Home Visit
            </span>
          )}
        </div>
      </div>

      {/* Financials & Notes */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11px] text-stone-400 block">Total Amount</span>
          <span className="text-lg font-extrabold text-stone-900">
            {formatCurrency(appointment.total)}
          </span>
        </div>

        {appointment.couponCode && (
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
            Coupon: {appointment.couponCode} (-{formatCurrency(appointment.discount)})
          </span>
        )}
      </div>

      {/* Action buttons */}
      {canModify && (
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-stone-100">
          <button
            onClick={handleGoogleCalendar}
            className="flex-1 min-w-[120px] py-2 px-3 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <CalendarPlus size={14} className="text-[#B88728]" />
            <span>Add to Calendar</span>
          </button>

          {onReschedule && (
            <button
              onClick={() => onReschedule(appointment)}
              className="py-2 px-3 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>Reschedule</span>
            </button>
          )}

          {onCancel && (
            <button
              onClick={() => onCancel(appointment)}
              className="py-2 px-3 rounded-xl border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <XCircle size={14} />
              <span>Cancel</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
