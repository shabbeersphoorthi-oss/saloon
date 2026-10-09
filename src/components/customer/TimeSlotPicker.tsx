import React, { useState, useMemo, useEffect } from "react";
import { Clock, AlertCircle, History, CheckCircle2, Plus, Sparkles } from "lucide-react";
import { BusinessDayHours, BlockedDate, BlockedTimeSlot, Appointment } from "../../types/salon";
import { getAvailableTimeSlots } from "../../utils/bookingLogic";
import { minutesToTime, timeToMinutes, formatDisplayTime } from "../../utils/formatters";

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

  const overdueSlots = useMemo(() => slots.filter(s => s.isOverdue), [slots]);
  const upcomingSlots = useMemo(() => slots.filter(s => !s.isOverdue), [slots]);
  const hasOverdueSlots = overdueSlots.length > 0;
  const allOverdue = upcomingSlots.length === 0 && overdueSlots.length > 0;

  // Filter tab: "ALL", "UPCOMING", "OVERDUE"
  const [activeTab, setActiveTab] = useState<"ALL" | "UPCOMING" | "OVERDUE">(() => {
    if (allOverdue) return "OVERDUE";
    return "ALL";
  });

  // State to allow selecting past/overdue times
  const [allowPastTime, setAllowPastTime] = useState<boolean>(() => {
    return allOverdue || Boolean(selectedTime && overdueSlots.some(s => s.time === selectedTime));
  });

  // Custom past time input state
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customTimeInput, setCustomTimeInput] = useState("");

  // Automatically enable past time if all slots are overdue or an overdue time is currently selected
  useEffect(() => {
    if (allOverdue) {
      setAllowPastTime(true);
      setActiveTab("OVERDUE");
    } else if (selectedTime && overdueSlots.some(s => s.time === selectedTime)) {
      setAllowPastTime(true);
    }
  }, [allOverdue, selectedTime, overdueSlots]);

  // Determine which slots to display
  const displayedSlots = useMemo(() => {
    if (!allowPastTime && upcomingSlots.length > 0) {
      return upcomingSlots;
    }
    if (activeTab === "UPCOMING") return upcomingSlots;
    if (activeTab === "OVERDUE") return overdueSlots;
    return slots;
  }, [slots, upcomingSlots, overdueSlots, allowPastTime, activeTab]);

  const isCurrentTimeSelectedOverdue = useMemo(() => {
    return Boolean(selectedTime && overdueSlots.some(s => s.time === selectedTime));
  }, [selectedTime, overdueSlots]);

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

  // Quick past time chips (e.g. 1 hr ago, 2 hrs ago, or morning)
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const quickPastTimes: string[] = [];
  if (currentMinutes - 60 >= 7 * 60) {
    quickPastTimes.push(minutesToTime(currentMinutes - 60));
  }
  if (currentMinutes - 120 >= 7 * 60) {
    quickPastTimes.push(minutesToTime(currentMinutes - 120));
  }
  if (currentMinutes - 180 >= 7 * 60) {
    quickPastTimes.push(minutesToTime(currentMinutes - 180));
  }

  const handleSelectSlot = (time: string, isOverdue?: boolean) => {
    if (isOverdue && !allowPastTime) {
      setAllowPastTime(true);
    }
    onSelectTime(time);
  };

  const handleApplyCustomTime = () => {
    if (!customTimeInput) return;
    const formatted = formatDisplayTime(customTimeInput);
    if (formatted) {
      setAllowPastTime(true);
      onSelectTime(formatted);
      setShowCustomTime(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Duration & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-500 px-1">
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-[#B88728]" />
          <span>Duration required: <strong>{totalDurationMinutes} mins</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span>{upcomingSlots.filter(s => s.isAvailable).length} upcoming slots</span>
          {hasOverdueSlots && (
            <span className="text-amber-800 font-semibold bg-amber-100/80 px-2 py-0.5 rounded-full text-[10px]">
              {overdueSlots.length} past / overdue
            </span>
          )}
        </div>
      </div>

      {/* OVERDUE OPTION BANNER & TOGGLE */}
      {hasOverdueSlots && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/90 via-[#FAF5E8] to-amber-50/90 border border-amber-200/90 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-200/60 text-amber-900 flex items-center justify-center shrink-0">
                <History size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <span>Option to Select Past / Overdue Time</span>
                  {isCurrentTimeSelectedOverdue && (
                    <span className="text-[10px] font-extrabold text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-amber-900 block leading-tight">
                  {allOverdue
                    ? "All earlier scheduled slots today are overdue. You can select any past time to record your booking."
                    : "Overdue times from earlier today are available for walk-in arrivals or earlier booking records."}
                </span>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={allowPastTime}
                onChange={e => setAllowPastTime(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B88728]"></div>
            </label>
          </div>

          {/* Quick past time shortcuts when enabled */}
          {allowPastTime && quickPastTimes.length > 0 && (
            <div className="pt-2 border-t border-amber-200/60 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-stone-500 font-medium">Quick Past Hours:</span>
              {quickPastTimes.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleSelectSlot(t, true)}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition-all ${
                    selectedTime === t
                      ? "bg-stone-900 text-[#E2B755] border-stone-900 shadow-xs"
                      : "bg-white text-stone-800 border-amber-300/80 hover:bg-amber-100/70"
                  }`}
                >
                  ⏰ {t}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setShowCustomTime(!showCustomTime)}
                className="px-2.5 py-1 rounded-lg font-semibold text-[#8F6C1E] bg-white/80 border border-amber-300 hover:bg-white text-[11px] flex items-center gap-1 ml-auto cursor-pointer"
              >
                <Plus size={12} />
                <span>Custom Past Time</span>
              </button>
            </div>
          )}

          {/* Custom Time Input field */}
          {allowPastTime && showCustomTime && (
            <div className="p-3 bg-white rounded-xl border border-amber-200 flex flex-wrap items-center gap-2 animate-in fade-in">
              <span className="text-xs font-bold text-stone-700">Enter Exact Time:</span>
              <input
                type="time"
                value={customTimeInput}
                onChange={e => setCustomTimeInput(e.target.value)}
                className="px-3 py-1.5 text-xs font-mono font-bold bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
              />
              <button
                type="button"
                onClick={handleApplyCustomTime}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-900 text-[#E2B755] hover:bg-black transition-colors cursor-pointer"
              >
                Apply Time
              </button>
            </div>
          )}
        </div>
      )}

      {/* FILTER TABS (All / Upcoming / Past Overdue) */}
      {hasOverdueSlots && (
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAllowPastTime(true);
              setActiveTab("ALL");
            }}
            className={`flex-1 py-1.5 px-2 rounded-xl transition-all ${
              activeTab === "ALL" && allowPastTime
                ? "bg-white text-stone-900 shadow-xs font-bold"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            All Slots ({slots.length})
          </button>

          {upcomingSlots.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("UPCOMING")}
              className={`flex-1 py-1.5 px-2 rounded-xl transition-all ${
                activeTab === "UPCOMING"
                  ? "bg-white text-stone-900 shadow-xs font-bold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Upcoming ({upcomingSlots.length})
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setAllowPastTime(true);
              setActiveTab("OVERDUE");
            }}
            className={`flex-1 py-1.5 px-2 rounded-xl transition-all ${
              activeTab === "OVERDUE"
                ? "bg-white text-amber-900 shadow-xs font-bold border border-amber-200"
                : "text-amber-800 hover:text-amber-950 font-medium"
            }`}
          >
            Past / Overdue ({overdueSlots.length})
          </button>
        </div>
      )}

      {/* SLOTS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto p-1">
        {displayedSlots.map(slot => {
          const isSelected = selectedTime === slot.time;
          const isOverdue = Boolean(slot.isOverdue);

          return (
            <button
              key={slot.time}
              type="button"
              disabled={!slot.isAvailable}
              onClick={() => handleSelectSlot(slot.time, isOverdue)}
              title={
                slot.reason ||
                (isOverdue
                  ? `Overdue / Past time slot (${slot.time})`
                  : slot.isAvailable
                  ? "Available"
                  : "Booked")
              }
              className={`p-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all border flex flex-col items-center justify-center gap-1 cursor-pointer ${
                isSelected
                  ? "bg-stone-900 text-[#E2B755] border-stone-900 shadow-md shadow-stone-900/15 scale-102 ring-2 ring-[#E2B755]/50"
                  : !slot.isAvailable
                  ? "bg-stone-50 text-stone-300 border-stone-200/50 cursor-not-allowed line-through"
                  : isOverdue
                  ? "bg-[#FAF5E8] text-amber-950 border-amber-300 hover:border-amber-500 hover:bg-[#F6EED8]"
                  : "bg-white text-stone-800 border-stone-200 hover:border-amber-300 hover:bg-[#FAF6EC] hover:text-[#8C6D23]"
              }`}
            >
              <span className="font-bold">{slot.time}</span>
              <span className="text-[10px] font-medium flex items-center gap-1">
                {isSelected ? (
                  <span className="text-[#E2B755] font-bold">
                    ✓ {isOverdue ? "Selected (Past)" : "Selected"}
                  </span>
                ) : isOverdue ? (
                  <span className="text-amber-800 font-semibold flex items-center gap-0.5">
                    <History size={10} /> Overdue
                  </span>
                ) : slot.isAvailable ? (
                  <span className="text-stone-400">Available</span>
                ) : (
                  <span className="text-stone-400">Reserved</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Time Confirmation Bar */}
      {selectedTime && (
        <div className={`p-3 rounded-2xl text-xs flex items-center justify-between gap-2 border ${
          isCurrentTimeSelectedOverdue
            ? "bg-amber-50 text-amber-950 border-amber-300"
            : "bg-emerald-50 text-emerald-950 border-emerald-200"
        }`}>
          <div className="flex items-center gap-2">
            {isCurrentTimeSelectedOverdue ? (
              <History size={16} className="text-amber-700 shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            )}
            <div>
              <span className="font-bold">
                Selected Arrival Time: {selectedTime}
              </span>
              {isCurrentTimeSelectedOverdue && (
                <span className="block text-[11px] text-amber-800">
                  (Past / Overdue Time Slot — Selected and accepted for today)
                </span>
              )}
            </div>
          </div>
          <span className="font-bold text-xs uppercase tracking-wider text-stone-900 bg-white/90 px-2.5 py-1 rounded-xl shadow-xs border">
            Confirmed Slot
          </span>
        </div>
      )}
    </div>
  );
};
