import React, { useState } from 'react';
import {
  Scissors,
  Calendar,
  Phone,
  Shield,
  Menu,
  X,
  User,
  ExternalLink,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenBooking: () => void;
  onOpenInstallApp?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, onOpenBooking, onOpenInstallApp }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { adminUser } = useAuth();

  const handleNav = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E1D5] transition-all">
      {/* Top Banner with Clear Panel Switcher and Direct Call */}
      <div className="bg-[#18171C] text-white text-xs py-2 px-4 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Brand & Phone */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E2B755] animate-pulse" />
              <span className="font-semibold text-stone-200">Bloom Saloon • 107/P, 3-13-94/11/A, Ramanthapur, Hyderabad</span>
            </div>
            <a
              href="tel:8309578606"
              className="flex items-center gap-1.5 font-bold text-[#E2B755] hover:text-[#f8d98d] transition-colors bg-white/10 px-2.5 py-0.5 rounded-full"
            >
              <Phone size={12} />
              <span>Call: 8309578606</span>
            </a>
          </div>

          {/* Discreet Owner / Staff Access (Only authenticated admins can view bookings) */}
          <div className="flex items-center gap-2">
            {adminUser ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#E2B755] font-semibold flex items-center gap-1">
                  <Shield size={12} />
                  <span>Admin: {adminUser.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleNav('admin-dashboard')}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#E2B755] text-stone-950 hover:bg-white transition-colors"
                >
                  Dashboard
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleNav('admin-login')}
                className="text-stone-400 hover:text-[#E2B755] text-[11px] flex items-center gap-1 transition-colors px-2 py-0.5 rounded hover:bg-white/5"
                title="Salon Proprietors (R & S Srinivas) Only"
              >
                <Shield size={11} />
                <span>Owner Portal</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Name */}
          <div
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2D2A26] to-[#171513] text-[#E2B755] flex items-center justify-center shadow-md shadow-stone-900/10 group-hover:scale-105 transition-transform border border-[#E2B755]/30">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 font-luxury block leading-none">
                Bloom Saloon
              </span>
              <span className="text-[11px] font-medium tracking-widest text-[#9C7A28] uppercase mt-1 block">
                Hair • Grooming • Skin & Facial Care
              </span>
            </div>
          </div>

          {/* Customer Navigation (Strictly NO bookings list in customer panel!) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              onClick={() => handleNav('home')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                currentTab === 'home'
                  ? 'text-stone-950 bg-stone-200/60'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100/80'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNav('services')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                currentTab === 'services'
                  ? 'text-stone-950 bg-stone-200/60'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100/80'
              }`}
            >
              Services
            </button>
            <button
              onClick={() => handleNav('price-list')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                currentTab === 'price-list'
                  ? 'text-stone-950 bg-stone-200/60'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100/80'
              }`}
            >
              Price List & Home Visit
            </button>
            <button
              onClick={() => handleNav('contact')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                currentTab === 'contact'
                  ? 'text-stone-950 bg-stone-200/60'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100/80'
              }`}
            >
              Location & Contact
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {adminUser ? (
              <button
                type="button"
                onClick={() => handleNav('admin-dashboard')}
                className="px-3 py-2 rounded-xl text-stone-950 font-bold bg-gradient-to-r from-[#F0D58C] via-[#E2B755] to-[#D4A137] hover:brightness-105 active:scale-95 transition-all shadow-sm border border-amber-400/50 flex items-center gap-1.5 text-xs cursor-pointer"
                title={`Logged in as ${adminUser.email}`}
              >
                <Shield size={14} className="text-stone-950" />
                <span className="hidden md:inline">Owner Portal</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleNav('admin-login')}
                className="px-3 py-2 rounded-xl text-stone-950 font-bold bg-gradient-to-r from-[#F0D58C] via-[#E2B755] to-[#D4A137] hover:brightness-105 active:scale-95 transition-all shadow-sm border border-amber-400/50 flex items-center gap-1.5 text-xs cursor-pointer"
                title="Salon Owner Portal"
              >
                <Shield size={14} className="text-stone-950" />
                <span className="hidden md:inline">Owner Portal</span>
              </button>
            )}

            {onOpenInstallApp && (
              <button
                type="button"
                onClick={onOpenInstallApp}
                className="p-2.5 rounded-xl text-stone-800 hover:bg-[#FAF2DC] hover:text-[#8F6C1E] transition-colors border border-amber-300/80 flex items-center gap-1.5 text-xs font-bold bg-[#FBF7EE] shadow-xs cursor-pointer"
                title="Install Android App / Download APK"
              >
                <Smartphone size={15} className="text-[#9C7A28]" />
                <span>Android App</span>
              </button>
            )}

            <a
              href="tel:8309578606"
              className="p-2.5 rounded-xl text-stone-700 hover:bg-stone-200/50 hover:text-stone-950 transition-colors border border-stone-200/60 flex items-center gap-1.5 text-xs font-bold"
              title="Call Bloom Saloon directly"
            >
              <Phone size={15} className="text-[#9C7A28]" />
              <span>8309578606</span>
            </a>

            <button
              onClick={onOpenBooking}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-stone-900 bg-gradient-to-r from-[#F0D58C] via-[#E2B755] to-[#D4A137] hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 transition-all shadow-md font-sans"
            >
              <Calendar size={16} />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onOpenBooking}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#E2B755] text-stone-900 shadow-sm"
            >
              Book
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-700 hover:bg-stone-200/60 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-stone-200 bg-[#FAF8F5] px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top-3">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-stone-200">
            <button
              onClick={() => handleNav('home')}
              className={`p-3 rounded-xl text-left text-sm font-semibold ${
                currentTab === 'home' ? 'bg-stone-900 text-white' : 'bg-white text-stone-800'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNav('services')}
              className={`p-3 rounded-xl text-left text-sm font-semibold ${
                currentTab === 'services' ? 'bg-stone-900 text-white' : 'bg-white text-stone-800'
              }`}
            >
              Services
            </button>
            <button
              onClick={() => handleNav('price-list')}
              className={`p-3 rounded-xl text-left text-sm font-semibold ${
                currentTab === 'price-list' ? 'bg-stone-900 text-white' : 'bg-white text-stone-800'
              }`}
            >
              Price List & Home Visit
            </button>
            <button
              onClick={() => handleNav('contact')}
              className={`p-3 rounded-xl text-left text-sm font-semibold ${
                currentTab === 'contact' ? 'bg-stone-900 text-white' : 'bg-white text-stone-800'
              }`}
            >
              Location & Contact
            </button>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {onOpenInstallApp && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenInstallApp();
                }}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-bold bg-[#FAF2DC] text-[#8F6C1E] border border-[#E2B755]/50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone size={16} />
                <span>Install Android App / Download APK</span>
              </button>
            )}

            <a
              href="tel:8309578606"
              className="w-full py-2.5 px-4 rounded-xl text-sm font-bold bg-[#FAF2DC] text-[#8F6C1E] border border-[#E8DFC9] flex items-center justify-center gap-2"
            >
              <Phone size={16} />
              <span>Call: 8309578606</span>
            </a>

            {adminUser ? (
              <button
                onClick={() => handleNav('admin-dashboard')}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-stone-900 text-[#E2B755] flex items-center justify-center gap-2 border border-[#E2B755]/30"
              >
                <Shield size={16} />
                <span>Owner Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => handleNav('admin-login')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-stone-950 bg-gradient-to-r from-[#F0D58C] via-[#E2B755] to-[#D4A137] hover:brightness-105 active:scale-98 flex items-center justify-center gap-1.5 shadow-sm border border-amber-400/40 cursor-pointer"
              >
                <Shield size={14} className="text-stone-950" />
                <span>Owner Portal</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
