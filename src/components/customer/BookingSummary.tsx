import React from 'react';
import { Service } from '../../types/salon';
import { formatCurrency, formatDate, calculateEndTime } from '../../utils/formatters';
import { Scissors, Calendar, Clock, User, Phone, Mail, ShieldCheck, X } from 'lucide-react';

interface BookingSummaryProps {
  services: Service[];
  selectedDate: string;
  selectedTime: string;
  totalDuration: number;
  subtotal: number;
  finalTotal: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
  isHomeVisit?: boolean;
  homeVisitFee?: number;
  homeAddress?: string;
  onConfirm: () => void;
  isSubmitting?: boolean;
  onDeselectService?: (serviceId: string) => void;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  services,
  selectedDate,
  selectedTime,
  totalDuration,
  subtotal,
  finalTotal,
  customerName,
  customerPhone,
  customerEmail,
  notes,
  isHomeVisit = false,
  homeVisitFee = 400,
  homeAddress = '',
  onConfirm,
  isSubmitting = false,
  onDeselectService,
}) => {
  const endTime = selectedTime ? calculateEndTime(selectedTime, totalDuration) : '';

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#E5DECF] shadow-sm space-y-6">
      <div className="border-b border-stone-100 pb-4">
        <span className="text-xs uppercase tracking-wider text-[#9C7A28] font-bold">
          Bloom Saloon • Appointment Review
        </span>
        <h3 className="text-xl font-bold text-stone-900 font-luxury mt-1">
          Booking Summary
        </h3>
      </div>

      {/* Appointment Date & Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFE9DF]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-[#B88728] flex items-center justify-center border border-stone-200 shadow-xs">
            <Calendar size={18} />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 font-medium block">Appointment Date</span>
            <span className="text-sm font-bold text-stone-900">{formatDate(selectedDate)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-[#B88728] flex items-center justify-center border border-stone-200 shadow-xs">
            <Clock size={18} />
          </div>
          <div>
            <span className="text-[11px] text-stone-500 font-medium block">Time & Duration</span>
            <span className="text-sm font-bold text-stone-900">
              {selectedTime} – {endTime} ({totalDuration} mins)
            </span>
          </div>
        </div>
      </div>

      {/* Selected Services */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
            <Scissors size={13} className="text-[#B88728]" />
            Selected Services ({services.length})
          </h4>
          {services.length > 0 && onDeselectService && (
            <span className="text-[10px] text-stone-400 italic">Click ✕ to deselect</span>
          )}
        </div>
        <div className="divide-y divide-stone-100">
          {services.length === 0 ? (
            <div className="py-4 px-3 text-center text-xs text-stone-400 bg-stone-50 rounded-xl border border-dashed border-stone-200">
              No services selected yet. Choose a service to proceed.
            </div>
          ) : (
            services.map(srv => {
              const price = srv.discountPrice && srv.discountPrice < srv.price ? srv.discountPrice : srv.price;
              return (
                <div key={srv.id} className="py-2.5 flex items-center justify-between text-sm group">
                  <div className="min-w-0 pr-2">
                    <span className="font-semibold text-stone-800 block truncate">{srv.name}</span>
                    <span className="text-xs text-stone-400 block">{srv.category} • {srv.duration} mins</span>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="font-bold text-stone-900">{formatCurrency(price)}</span>
                    {onDeselectService && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onDeselectService(srv.id);
                        }}
                        className="w-6 h-6 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-stone-200/80 hover:border-rose-200 flex items-center justify-center transition-colors cursor-pointer"
                        title={`Deselect ${srv.name}`}
                        aria-label={`Deselect ${srv.name}`}
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Customer Info */}
      <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-100 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-stone-500 flex items-center gap-1.5">
            <User size={13} /> Name:
          </span>
          <span className="font-bold text-stone-900">{customerName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-stone-500 flex items-center gap-1.5">
            <Phone size={13} /> Mobile:
          </span>
          <span className="font-bold text-stone-900">{customerPhone}</span>
        </div>
        {customerEmail && (
          <div className="flex items-center justify-between">
            <span className="text-stone-500 flex items-center gap-1.5">
              <Mail size={13} /> Email:
            </span>
            <span className="font-medium text-stone-800">{customerEmail}</span>
          </div>
        )}
        {notes && (
          <div className="pt-2 border-t border-stone-200/60 text-stone-600 italic">
            Note: &ldquo;{notes}&rdquo;
          </div>
        )}
        {isHomeVisit && (
          <div className="pt-2 border-t border-amber-200/60 text-amber-900 bg-amber-50/70 p-2.5 rounded-xl">
            <span className="font-bold flex items-center gap-1 text-xs">
              🏠 Doorstep Home Visit (+₹{homeVisitFee})
            </span>
            <span className="text-[11px] text-amber-800 block mt-0.5">
              {homeAddress ? `Address: ${homeAddress}` : 'Address required in Step 4'}
            </span>
          </div>
        )}
      </div>

      {/* Financials Breakdown */}
      <div className="space-y-2 pt-2 border-t border-stone-100 text-sm">
        <div className="flex justify-between text-stone-600">
          <span>Services Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        {isHomeVisit && (
          <div className="flex justify-between text-[#8F6C1E] font-semibold">
            <span className="flex items-center gap-1">
              🏠 Home Visit Option
            </span>
            <span>+{formatCurrency(homeVisitFee)}</span>
          </div>
        )}

        <div className="flex justify-between items-baseline pt-3 border-t border-stone-200">
          <div>
            <span className="text-base font-bold text-stone-900 block font-luxury">Total Payable</span>
            <span className="text-[11px] text-stone-400">Pay at the salon after service</span>
          </div>
          <span className="text-2xl font-extrabold text-stone-950 font-luxury">
            {formatCurrency(finalTotal)}
          </span>
        </div>
      </div>

      {/* Salon guarantee */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50/50 border border-amber-100/80 text-[11px] text-[#7A5B12]">
        <ShieldCheck size={16} className="shrink-0 text-[#B88728]" />
        <span>Guaranteed reserved chair at <strong>Bloom Saloon</strong>. For instant queries, call <strong>8309578606</strong>.</span>
      </div>

      {/* Confirm Button */}
      <button
        type="button"
        disabled={isSubmitting || services.length === 0}
        onClick={onConfirm}
        className="w-full py-4 px-6 rounded-2xl bg-stone-900 text-[#E2B755] hover:bg-black font-bold text-base transition-all shadow-md hover:shadow-xl active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer font-luxury"
      >
        {isSubmitting ? (
          <span>Securing Your Chair...</span>
        ) : services.length === 0 ? (
          <span>Please Select a Service</span>
        ) : (
          <span>Confirm Appointment • {formatCurrency(finalTotal)}</span>
        )}
      </button>
    </div>
  );
};
