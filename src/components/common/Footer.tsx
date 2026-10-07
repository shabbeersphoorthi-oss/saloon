import React from 'react';
import { Scissors, MapPin, Phone, Mail, Clock, Shield, Smartphone } from 'lucide-react';
import { useSalon } from '../../context/SalonContext';
import { formatDisplayTime } from '../../utils/formatters';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenBooking: () => void;
  onOpenInstallApp?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenBooking, onOpenInstallApp }) => {
  const { settings, businessHours } = useSalon();

  return (
    <footer className="bg-[#18181C] text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800/80">
          {/* Brand & Phone */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#282622] text-[#E2B755] flex items-center justify-center border border-[#E2B755]/30">
                <Scissors size={20} />
              </div>
              <div>
                <span className="text-xl font-bold text-white font-luxury block">
                  {settings.salonName}
                </span>
                <span className="text-xs text-[#E2B755] tracking-wider uppercase font-semibold">
                  Ramanthapur, Greater Hyderabad
                </span>
              </div>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              Greater Hyderabad’s trusted grooming sanctuary for hair cutting, foam shaving, facials, d-tan, hair spas, and styling.
            </p>
            <div className="pt-2">
              <a
                href="tel:8309578606"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-stone-900 bg-[#E2B755] hover:bg-[#ebd083] transition-colors"
              >
                <Phone size={14} />
                <span>Call 8309578606</span>
              </a>
            </div>
          </div>

          {/* Customer Links (No Bookings listing here) */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4 font-luxury">
              Customer Portal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#E2B755] transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-[#E2B755] transition-colors"
                >
                  All Services & Home Visit
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('price-list')}
                  className="hover:text-[#E2B755] transition-colors"
                >
                  Official Rate Card
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenBooking}
                  className="hover:text-[#E2B755] transition-colors font-semibold"
                >
                  Book Appointment Now
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#E2B755] transition-colors"
                >
                  Location & Contact
                </button>
              </li>
              {onOpenInstallApp && (
                <li>
                  <button
                    onClick={onOpenInstallApp}
                    className="text-[#E2B755] hover:text-white font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Smartphone size={14} />
                    <span>Android App (.APK)</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4 font-luxury flex items-center gap-2">
              <Clock size={16} className="text-[#E2B755]" />
              Saloon Timings
            </h4>
            <div className="space-y-1.5 text-xs text-stone-300">
              {businessHours.map(bh => (
                <div key={bh.day} className="flex justify-between py-1 border-b border-stone-800/40">
                  <span className="font-medium text-stone-400">{bh.day}</span>
                  <span className="text-stone-200">
                    {bh.isOpen ? `${formatDisplayTime(bh.openTime)} – ${formatDisplayTime(bh.closeTime)}` : 'Closed'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact & Admin Portal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4 font-luxury">
              Contact & Admin
            </h4>
            <div className="flex items-start gap-2.5 text-sm text-stone-400">
              <MapPin size={18} className="text-[#E2B755] shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-stone-400">
              <Phone size={16} className="text-[#E2B755] shrink-0" />
              <a href="tel:8309578606" className="hover:text-white font-bold transition-colors">
                8309578606
              </a>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-stone-400">
              <Mail size={16} className="text-[#E2B755] shrink-0" />
              <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">
                {settings.email}
              </a>
            </div>

            <div className="pt-3">
              <button
                onClick={() => onNavigate('admin-login')}
                className="inline-flex items-center gap-2 text-xs font-bold text-stone-950 hover:brightness-105 transition-all py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#F0D58C] via-[#E2B755] to-[#D4A137] shadow-sm border border-amber-400/40 cursor-pointer"
              >
                <Shield size={14} className="text-stone-950" />
                <span>Owner Portal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <div>
            © {new Date().getFullYear()} Bloom Saloon • 107/P, 3-13-94/11/A, Ramanthapur, Hyderabad.
          </div>

          <div className="flex items-center gap-6">
            <span>Contact: <strong>8309578606</strong></span>
            <span className="text-[#E2B755] font-medium">Currency: ₹ INR</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
