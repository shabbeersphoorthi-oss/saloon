import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { BusinessDayHours, BlockedDate } from '../../types/salon';

interface BookingCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  hoursList: BusinessDayHours[];
  blockedDates: BlockedDate[];
  allowedWeekdays?: string[]; // e.g. ['Wednesday']
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  selectedDate,
  onSelectDate,
  hoursList,
  blockedDates,
  allowedWeekdays,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // We can show the current month or navigate to the next month
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => {
    if (selectedDate) {
      const [y, m, d] = selectedDate.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  });

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  // Check if previous month is before today's month
  const isPrevDisabled =
    year < today.getFullYear() ||
    (year === today.getFullYear() && month <= today.getMonth());

  // Weekday headings
  const weekDayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Days array
  const days = [];
  // Empty slots for days before 1st of month
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-sm">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <CalendarIcon size={18} className="text-[#B88728]" />
          <h4 className="text-base sm:text-lg font-bold text-stone-900 font-luxury">
            {monthNames[month]} {year}
          </h4>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={isPrevDisabled}
            className={`p-2 rounded-xl transition-colors ${
              isPrevDisabled
                ? 'text-stone-300 cursor-not-allowed'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Restricted Weekdays Banner */}
      {allowedWeekdays && allowedWeekdays.length > 0 && (
        <div className="mb-4 p-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base">🗓️</span>
            <span className="font-semibold">
              Restricted to <strong>{allowedWeekdays.join(', ')}s only</strong>
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 px-2 py-0.5 rounded-full text-amber-900">
            Special Schedule
          </span>
        </div>
      )}

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDayHeaders.map((head, idx) => (
          <span
            key={head}
            className={`text-xs font-semibold py-1 ${
              idx === 0 ? 'text-amber-800/80' : 'text-stone-400'
            }`}
          >
            {head}
          </span>
        ))}
      </div>

      {/* Dates Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((dayNum, index) => {
          if (dayNum === null) {
            return <div key={`empty-${index}`} className="h-10 sm:h-11" />;
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const cellDate = new Date(year, month, dayNum);
          cellDate.setHours(0, 0, 0, 0);

          const isPast = cellDate < today;

          // Check if date is blocked in blockedDates
          const blocked = blockedDates.find(b => b.date === dateStr);

          // Check salon hours for day
          const dayName = cellDate.toLocaleDateString('en-US', { weekday: 'long' });
          const dayHours = hoursList.find(h => h.day.toLowerCase() === dayName.toLowerCase());
          const isClosed = !dayHours || !dayHours.isOpen;

          // Check if weekday is restricted by selected service
          const isDayRestricted = Boolean(
            allowedWeekdays &&
            allowedWeekdays.length > 0 &&
            !allowedWeekdays.some(w => w.toLowerCase() === dayName.toLowerCase())
          );

          const isDisabled = isPast || Boolean(blocked) || isClosed || isDayRestricted;
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectDate(dateStr)}
              title={
                isDayRestricted
                  ? `Service only available on ${allowedWeekdays?.join(', ')}s`
                  : blocked
                  ? `Blocked: ${blocked.reason}`
                  : isClosed
                  ? 'Salon closed on this day'
                  : isPast
                  ? 'Past date'
                  : dateStr
              }
              className={`h-10 sm:h-11 rounded-2xl flex flex-col items-center justify-center text-sm font-semibold transition-all relative ${
                isSelected
                  ? 'bg-stone-900 text-[#E2B755] shadow-md shadow-stone-900/20 scale-105 z-10'
                  : isDisabled
                  ? 'text-stone-300 bg-stone-50/50 cursor-not-allowed line-through'
                  : 'text-stone-800 hover:bg-[#FAF2DC] hover:text-[#8F6C1E] active:scale-95'
              }`}
            >
              <span>{dayNum}</span>
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#E2B755] absolute bottom-1.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-center gap-6 text-[11px] text-stone-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-stone-900" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-stone-100 border border-stone-300" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-stone-200 line-through text-stone-400" />
          <span>Closed / Unavailable</span>
        </div>
      </div>
    </div>
  );
};
