import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { BusinessDayHours } from '../../types/salon';
import { Clock, Calendar, Plus, Trash2, Save, AlertCircle } from 'lucide-react';

export const AdminAvailabilityPage: React.FC = () => {
  const {
    businessHours,
    blockedDates,
    updateBusinessHours,
    addBlockedDate,
    removeBlockedDate,
    showToast,
  } = useSalon();

  const [hoursState, setHoursState] = useState<BusinessDayHours[]>(businessHours);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');

  const handleToggleDayOpen = (index: number) => {
    setHoursState(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], isOpen: !copy[index].isOpen };
      return copy;
    });
  };

  const handleTimeChange = (
    index: number,
    field: 'openTime' | 'closeTime' | 'breakStart' | 'breakEnd',
    val: string
  ) => {
    setHoursState(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleSaveAllHours = async () => {
    await updateBusinessHours(hoursState);
  };

  const handleAddBlocked = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedDate) return;
    await addBlockedDate(newBlockedDate, newBlockedReason || 'Salon Closed / Holiday');
    setNewBlockedDate('');
    setNewBlockedReason('');
  };

  return (
    <div className="space-y-8 p-4 sm:p-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-stone-900 font-luxury">
          Availability & Timings Configuration
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Controls the live slot generation in customer booking calendar. Changes prevent overbooking.
        </p>
      </div>

      {/* Salon Operating Hours Table */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-stone-900 font-luxury">
              Weekly Business Schedule
            </h3>
            <p className="text-xs text-stone-500">
              Configure daily opening, closing, and midday staff break intervals.
            </p>
          </div>

          <button
            onClick={handleSaveAllHours}
            className="px-5 py-2.5 rounded-xl bg-stone-900 text-[#E2B755] font-bold text-xs hover:bg-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Save size={15} />
            <span>Save Hours</span>
          </button>
        </div>

        <div className="divide-y divide-stone-100">
          {hoursState.map((dayHour, idx) => (
            <div
              key={dayHour.day}
              className={`py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-colors ${
                !dayHour.isOpen ? 'opacity-50 bg-stone-50/60 p-3 rounded-2xl' : ''
              }`}
            >
              {/* Day & Open Toggle */}
              <div className="flex items-center gap-3 w-40">
                <button
                  type="button"
                  onClick={() => handleToggleDayOpen(idx)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    dayHour.isOpen ? 'bg-emerald-600' : 'bg-stone-300'
                  }`}
                  title={dayHour.isOpen ? 'Open' : 'Closed'}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                      dayHour.isOpen ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="font-bold text-sm text-stone-900 font-luxury">
                  {dayHour.day}
                </span>
              </div>

              {/* Time Inputs */}
              {dayHour.isOpen ? (
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400 font-semibold">Opens:</span>
                    <input
                      type="time"
                      value={dayHour.openTime}
                      onChange={e => handleTimeChange(idx, 'openTime', e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-800 bg-stone-50 font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-stone-400 font-semibold">Closes:</span>
                    <input
                      type="time"
                      value={dayHour.closeTime}
                      onChange={e => handleTimeChange(idx, 'closeTime', e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-800 bg-stone-50 font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                    <span className="text-stone-400 font-semibold">Break:</span>
                    <input
                      type="time"
                      value={dayHour.breakStart || ''}
                      onChange={e => handleTimeChange(idx, 'breakStart', e.target.value)}
                      className="px-2 py-1.5 rounded-lg border border-stone-200 text-stone-800 bg-stone-50 font-mono"
                    />
                    <span className="text-stone-400">to</span>
                    <input
                      type="time"
                      value={dayHour.breakEnd || ''}
                      onChange={e => handleTimeChange(idx, 'breakEnd', e.target.value)}
                      className="px-2 py-1.5 rounded-lg border border-stone-200 text-stone-800 bg-stone-50 font-mono"
                    />
                  </div>
                </div>
              ) : (
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg">
                  Salon Closed for Customers
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Blocked Dates (Holidays / Maintenance) */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-stone-900 font-luxury">
            Blocked Dates & Salon Closures
          </h3>
          <p className="text-xs text-stone-500">
            Block specific calendar dates for festivals, annual maintenance, or staff off-sites.
          </p>
        </div>

        {/* Add blocked date form */}
        <form
          onSubmit={handleAddBlocked}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-stone-50 rounded-2xl border"
        >
          <input
            type="date"
            required
            value={newBlockedDate}
            onChange={e => setNewBlockedDate(e.target.value)}
            className="px-3 py-2 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
          />

          <input
            type="text"
            placeholder="Reason (e.g. Diwali Cleaning, Staff Retreat)"
            value={newBlockedReason}
            onChange={e => setNewBlockedReason(e.target.value)}
            className="flex-1 px-3 py-2 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
          />

          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 text-[#E2B755] hover:bg-black transition-colors whitespace-nowrap flex items-center justify-center gap-1.5"
          >
            <Plus size={14} />
            <span>Block Date</span>
          </button>
        </form>

        {/* Blocked Dates List */}
        <div className="divide-y divide-stone-100">
          {blockedDates.length === 0 ? (
            <p className="text-xs text-stone-400 py-3">No upcoming blocked dates.</p>
          ) : (
            blockedDates.map(b => (
              <div key={b.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <Calendar size={15} />
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 block">{b.date}</span>
                    <span className="text-stone-500">{b.reason}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeBlockedDate(b.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                  title="Remove block"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
