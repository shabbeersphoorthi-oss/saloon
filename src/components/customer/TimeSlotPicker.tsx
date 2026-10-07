import React, { useMemo } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { BusinessDayHours, BlockedDate, BlockedTimeSlot, Appointment } from '../../types/salon';
import { getAvailableTimeSlots } from '../../utils/bookingLogic';

interface TimeSlotPickerProps {
  selectedDate: string;
  totalDurationMinutes: number;
  selectedTime: string;
  onSelectTime: (time: string) => void;
  hoursList: BusinessDayHours[];
  existingAppointments: Appointment[];
  blockedDates: BlockedDate[];
  blockedTimeSlots?: BlockedTimeSlot[];
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  selectedDate,
  totalDurationMinutes,
  selectedTime,
  onSelectTime,
  hoursList,
  existingAppointments,
  blockedDates,
  blockedTimeSlots = [],
}) => {
  const slots = useMemo(() => {
    if (!selectedDate) return [];
    return getAvailableTimeSlots(
      selectedDate,
      totalDurationMinutes,
      hoursList,
      existingAppointments,
      blockedDates,
      blockedTimeSlots
    );
  }, [
    selectedDate,
    totalDurationMinutes,
    hoursList,
    existingAppointments,
    blockedDates,
    blockedTimeSlots,
  ]);

  const availableCount = slots.filter(s => s.isAvailable).length;

  if (!selectedDate) {
    return (
      <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-stone-500 text-sm">
        Please select a booking date in Step 2 to view available time slots.
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="p-8 text-center bg-amber-50/60 rounded-3xl border border-amber-200 text-amber-800 text-sm flex flex-col items-center justify-center gap-2">
        <AlertCircle size={22} className="text-amber-600" />
        <span className="font-semibold">No appointment slots on this date.</span>
        <span className="text-xs text-amber-700 max-w-sm">
          Bloom Saloon is either closed or fully booked on {selectedDate}. Please select another date.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-[#B88728]" />
          <span>Duration required: <strong>{totalDurationMinutes} mins</strong></span>
        </div>
        <span>{availableCount} slots available</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto p-1">
        {slots.map(slot => {
          const isSelected = selectedTime === slot.time;
          return (
            <button
              key={slot.time}
              type="button"
              disabled={!slot.isAvailable}
              onClick={() => onSelectTime(slot.time)}
              title={slot.reason || (slot.isAvailable ? 'Available' : 'Booked')}
              className={`p-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all border flex flex-col items-center justify-center gap-1 ${
                isSelected
                  ? 'bg-stone-900 text-[#E2B755] border-stone-900 shadow-md shadow-stone-900/15 scale-102'
                  : !slot.isAvailable
                  ? 'bg-stone-50 text-stone-300 border-stone-200/50 cursor-not-allowed line-through'
                  : 'bg-white text-stone-800 border-stone-200 hover:border-amber-300 hover:bg-[#FAF6EC] hover:text-[#8C6D23]'
              }`}
            >
              <span>{slot.time}</span>
              <span className="text-[10px] font-normal">
                {slot.isAvailable ? (isSelected ? 'Selected' : 'Available') : 'Reserved'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
