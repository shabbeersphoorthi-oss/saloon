import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { useAuth, SUPER_USER_EMAIL } from '../../context/AuthContext';
import { BusinessSettings } from '../../types/salon';
import { isFirebaseConfigured } from '../../firebase/config';
import {
  Scissors,
  Save,
  RotateCcw,
  Shield,
  CheckCircle2,
  Database,
  Building,
  Phone,
  Mail,
  MapPin,
  Wrench,
  UserCheck,
  Sparkles,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings, resetDemoData, showToast } = useSalon();
  const {
    adminUser,
    isSuperUser,
    superUserEmail,
    clientOwnerEmail,
    clientOwnerName,
    updateClientOwner,
    quickSwitchRole,
  } = useAuth();

  const [form, setForm] = useState<BusinessSettings>(settings);
  const [isResetting, setIsResetting] = useState(false);

  // Client owner email settings
  const [targetClientEmail, setTargetClientEmail] = useState(clientOwnerEmail);
  const [targetClientName, setTargetClientName] = useState(clientOwnerName);
  const [savedClientMsg, setSavedClientMsg] = useState(false);

  const handleSaveClientCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    updateClientOwner(targetClientEmail, targetClientName);
    setSavedClientMsg(true);
    showToast(`Client login credentials set to: ${targetClientEmail}`);
    setTimeout(() => setSavedClientMsg(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(form);
    showToast('Salon settings updated successfully.');
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all appointments, customers, services, and offers to initial demo baseline?')) {
      setIsResetting(true);
      await resetDemoData();
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-5xl">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-stone-900 font-luxury">
          Salon Profile & System Settings
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          General business metadata, owner credentials, and system settings.
        </p>
      </div>

      {/* Owner Account Configuration */}
      <div className="bg-[#1C1B20] text-white rounded-3xl p-6 sm:p-8 border border-[#E2B755]/30 shadow-md space-y-6">
        <div className="flex items-center gap-3 border-b border-stone-800 pb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F0D58C] via-[#E2B755] to-[#D4A137] text-stone-950 flex items-center justify-center font-bold shadow-md">
            <UserCheck size={22} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#E2B755] text-stone-950">
              SALON MANAGEMENT
            </span>
            <h3 className="text-xl font-bold font-luxury mt-0.5 text-white">
              Registered Owner Account
            </h3>
          </div>
        </div>

        <form onSubmit={handleSaveClientCredentials} className="space-y-4 max-w-xl">
          <p className="text-xs text-stone-400">
            Configure the Gmail address and proprietor name used for accessing the Owner Management Portal:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-stone-300 uppercase font-bold block mb-1">
                Owner Login Gmail ID
              </label>
              <input
                type="email"
                required
                value={targetClientEmail}
                onChange={e => setTargetClientEmail(e.target.value)}
                placeholder="srinivas.bloom@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-950 text-white border border-stone-700 focus:outline-none focus:border-[#E2B755] font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-stone-300 uppercase font-bold block mb-1">
                Proprietor Title
              </label>
              <input
                type="text"
                value={targetClientName}
                onChange={e => setTargetClientName(e.target.value)}
                placeholder="Bloom Saloon Proprietor"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-950 text-white border border-stone-700 focus:outline-none focus:border-[#E2B755]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#F0D58C] via-[#E2B755] to-[#D4A137] text-stone-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Save Owner Credentials
            </button>
            {savedClientMsg && (
              <span className="text-xs font-bold text-emerald-400 animate-in fade-in flex items-center gap-1">
                <CheckCircle2 size={13} /> Saved successfully
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Backend & Environment Status Card */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database size={18} className="text-[#C59B27]" />
            <h3 className="text-base font-bold text-stone-900 font-luxury">
              Data Storage & Firebase Engine
            </h3>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isFirebaseConfigured
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {isFirebaseConfigured ? 'Live Firebase Connected' : 'Persistent Storage Mode'}
          </span>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed">
          {isFirebaseConfigured
            ? 'Your application is connected to live Firestore collections (services, customers, appointments, offers, businessSettings, notifications).'
            : 'Running in resilient offline-first mode with local persistence. All bookings, service additions, coupon redemptions, and schedule adjustments persist smoothly.'}
        </p>
      </div>

      {/* Salon Owners Profile Card */}
      <div className="bg-[#1C1B20] text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E2B755] to-[#B38722] text-stone-900 flex items-center justify-center font-bold">
            <Scissors size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold font-luxury">Bloom Saloon</h3>
            <span className="text-xs text-[#E2B755] uppercase font-bold tracking-wider">
              Proprietor: Bloom Saloon Management
            </span>
          </div>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed max-w-2xl">
          Premier gentleman’s salon and aesthetic grooming destination located in Banjara Hills, Hyderabad. Established with a commitment to unhurried, personalized master barbering.
        </p>

        <div className="pt-2 flex flex-wrap gap-4 text-xs text-stone-400">
          <div>Logged in Owner: <strong className="text-white">{adminUser?.name}</strong></div>
          <div>•</div>
          <div>Email: <strong className="text-white">{adminUser?.email}</strong></div>
          <div>•</div>
          <div>Role: <strong className="text-white">Super Admin</strong></div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
        <div className="border-b border-stone-100 pb-4">
          <h3 className="text-lg font-bold text-stone-900 font-luxury">
            Business Details & Policies
          </h3>
          <p className="text-xs text-stone-500">
            Visible on customer footer, booking summaries, and email confirmations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Salon Brand Name
            </label>
            <input
              type="text"
              required
              value={form.salonName}
              onChange={e => setForm({ ...form, salonName: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Owner Names (Comma separated)
            </label>
            <input
              type="text"
              required
              value={form.owners.join(', ')}
              onChange={e =>
                setForm({
                  ...form,
                  owners: e.target.value.split(',').map(s => s.trim()),
                })
              }
              className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Contact Phone
            </label>
            <input
              type="text"
              required
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Contact Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
            Physical Salon Address
          </label>
          <input
            type="text"
            required
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Min. Advance Booking Notice (Hours)
            </label>
            <input
              type="number"
              min={1}
              max={48}
              value={form.minAdvanceBookingHours}
              onChange={e =>
                setForm({ ...form, minAdvanceBookingHours: Number(e.target.value) })
              }
              className="w-full px-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Max. Future Booking Horizon (Days)
            </label>
            <input
              type="number"
              min={7}
              max={90}
              value={form.maxAdvanceBookingDays}
              onChange={e =>
                setForm({ ...form, maxAdvanceBookingDays: Number(e.target.value) })
              }
              className="w-full px-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetData}
            disabled={isResetting}
            className="px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw size={14} />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-stone-900 text-[#E2B755] font-bold text-xs hover:bg-black transition-all shadow-xs flex items-center gap-1.5"
          >
            <Save size={15} />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
