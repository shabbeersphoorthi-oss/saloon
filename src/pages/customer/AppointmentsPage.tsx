import React from 'react';
import { ShieldCheck, Calendar, Phone, Lock, ArrowRight, Scissors } from 'lucide-react';

interface AppointmentsPageProps {
  onOpenBooking: () => void;
}

export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ onOpenBooking }) => {
  const handleGoToAdmin = () => {
    window.location.hash = '#/admin-appointments';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E5DECF] shadow-lg text-center space-y-6">
        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#9C7A28] border border-amber-200/80 flex items-center justify-center mx-auto shadow-sm">
          <Lock size={32} />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <span className="text-xs font-bold tracking-widest uppercase text-[#9C7A28]">
            Client Privacy & Data Security
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 font-luxury">
            Bookings are Visible Only in Admin Panel
          </h1>
          <p className="text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
            In accordance with <strong>Bloom Saloon</strong> client confidentiality policies, master appointment schedules and chair bookings are managed exclusively through the protected <strong>Admin Management Panel</strong>.
          </p>
        </div>

        {/* Policy Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-4">
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 space-y-2">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
              <Calendar size={15} className="text-[#9C7A28]" />
              <span>Confirmed Booking?</span>
            </div>
            <p className="text-xs text-stone-500 leading-normal">
              When you complete an appointment, your unique Booking ID and confirmation summary are displayed immediately.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 space-y-2">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
              <Phone size={15} className="text-[#9C7A28]" />
              <span>Reschedule / Inquire</span>
            </div>
            <p className="text-xs text-stone-500 leading-normal">
              Need to modify or cancel your scheduled chair? Contact our front desk directly at <strong className="text-stone-900">8309578606</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 space-y-2">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
              <ShieldCheck size={15} className="text-[#9C7A28]" />
              <span>Owner & Admin Access</span>
            </div>
            <p className="text-xs text-stone-500 leading-normal">
              Salon management can view, approve, and manage all live bookings inside the secure Owner Portal.
            </p>
          </div>
        </div>

        {/* Action Buttons for Customers */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onOpenBooking}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-stone-900 text-[#E2B755] hover:bg-black font-bold text-xs sm:text-sm transition-all shadow-md active:scale-98 font-luxury"
          >
            <Calendar size={16} />
            <span>Book New Appointment</span>
          </button>

          <a
            href="tel:8309578606"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FAF2DC] text-[#8F6C1E] border border-[#E8DFC9] hover:bg-[#f6ebd0] font-bold text-xs sm:text-sm transition-all"
          >
            <Phone size={15} />
            <span>Call Reception: 8309578606</span>
          </a>
        </div>
      </div>
    </div>
  );
};
