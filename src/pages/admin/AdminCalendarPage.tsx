import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { Appointment } from '../../types/salon';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Scissors } from 'lucide-react';

export const AdminCalendarPage: React.FC = () => {
  const { appointments, businessHours } = useSalon();

  const [currentDate, setCurrentDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const handlePrevDay = () => {
    const [y, m, d] = currentDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() - 1);
    setCurrentDate(dateObj.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const [y, m, d] = currentDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + 1);
    setCurrentDate(dateObj.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
  };

  // Day's appointments
  const dayAppointments = appointments.filter(a => a.appointmentDate === currentDate);

  // Time grid slots from 07:00 AM to 09:30 PM (Morning 7am to Night 9:30pm)
  const timeLabels = [
    '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM',
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
    '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM',
    '09:00 PM', '09:30 PM',
  ];

  return (
    <div className="space-y-6 p-4 sm:p-8">
      {/* Header & Date Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-stone-900 font-luxury">
            Daily Chair Schedule
          </h2>
          <p className="text-xs text-stone-500">
            Visual day schedule for salon master stations (7:00 AM – 9:30 PM).
          </p>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="px-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-900 flex items-center gap-2">
            <CalendarIcon size={14} className="text-[#C59B27]" />
            <span>{formatDate(currentDate)}</span>
          </div>
          <button
            onClick={handleNextDay}
            className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
            title="Next Day"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-2 rounded-xl bg-stone-900 text-[#E2B755] text-xs font-semibold hover:bg-black transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Timeline Schedule Grid */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-stone-50/80 border-b border-stone-200 flex items-center justify-between text-xs font-bold text-stone-500">
          <span>Time Slot</span>
          <span>Assigned Master Station Bookings ({dayAppointments.length})</span>
        </div>

        <div className="divide-y divide-stone-100">
          {timeLabels.map(time => {
            // Find appointments starting around this time
            const matching = dayAppointments.filter(
              a => a.startTime.trim().toLowerCase() === time.toLowerCase()
            );

            return (
              <div
                key={time}
                className="flex items-start gap-4 p-4 hover:bg-stone-50/50 transition-colors min-h-[70px]"
              >
                <div className="w-24 shrink-0 text-xs font-mono font-bold text-stone-500 pt-1">
                  {time}
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {matching.length === 0 ? (
                    <div className="text-xs text-stone-300 italic pt-1">Open chair</div>
                  ) : (
                    matching.map(app => (
                      <div
                        key={app.id}
                        className="p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200/90 shadow-xs flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 text-xs font-luxury">
                              {app.customerName}
                            </span>
                            <StatusBadge status={app.status} size="sm" />
                          </div>
                          <p className="text-[11px] text-stone-500 mt-1">
                            {app.serviceNames.join(', ')} • {app.duration} mins
                          </p>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {app.bookingId}
                          </span>
                        </div>

                        <span className="text-xs font-bold text-stone-900 whitespace-nowrap">
                          {formatCurrency(app.total)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
