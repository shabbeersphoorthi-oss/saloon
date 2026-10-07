import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSalon } from '../../context/SalonContext';
import { INITIAL_CUSTOMERS } from '../../data/demoData';
import { formatCurrency } from '../../utils/formatters';
import { User, Phone, Mail, Award, Calendar, Tag, Check, Users } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentCustomer, setCustomer } = useAuth();
  const { customers, appointments, showToast } = useSalon();

  const [name, setName] = useState(currentCustomer?.name || '');
  const [phone, setPhone] = useState(currentCustomer?.phone || '');
  const [email, setEmail] = useState(currentCustomer?.email || '');

  const activeCustomer =
    customers.find(c => c.id === currentCustomer?.id) || currentCustomer;

  const handleSwitchDemoCustomer = (id: string) => {
    const found = customers.find(c => c.id === id) || INITIAL_CUSTOMERS.find(c => c.id === id);
    if (found) {
      setCustomer(found);
      setName(found.name);
      setPhone(found.phone);
      setEmail(found.email);
      showToast(`Switched active customer to ${found.name}`, 'info');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) return;
    const updated = {
      ...currentCustomer,
      name,
      phone,
      email,
    };
    setCustomer(updated);
    showToast('Customer profile updated successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold tracking-widest uppercase text-[#9C7A28]">
          Client Dashboard
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-luxury">
          Customer Profile
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Manage your personal contact details and loyalty metrics with Bloom Saloon.
        </p>
      </div>

      {/* Demo Customer Quick Switcher Banner */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-[#C59B27]" />
          <h3 className="text-sm font-bold text-stone-900 font-luxury">
            Quick Customer Switcher (Demo Patrons)
          </h3>
        </div>
        <p className="text-xs text-stone-500">
          Switch between verified Hyderabad clientele to test appointment history, discounts, and personalized notes.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {customers.map(c => {
            const isSelected = activeCustomer?.id === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSwitchDemoCustomer(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-stone-900 text-[#E2B755] shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {isSelected && <Check size={13} />}
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-400 font-bold uppercase tracking-wider block">
            Total Salon Visits
          </span>
          <span className="text-3xl font-extrabold text-stone-900 font-luxury mt-1 block">
            {activeCustomer?.totalVisits || 0}
          </span>
          <span className="text-[11px] text-stone-500 mt-1 block">At 107/P, 3-13-94/11/A, Ramanthapur</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-400 font-bold uppercase tracking-wider block">
            Total Grooming Spend
          </span>
          <span className="text-3xl font-extrabold text-stone-900 font-luxury mt-1 block">
            {formatCurrency(activeCustomer?.totalSpending || 0)}
          </span>
          <span className="text-[11px] text-stone-500 mt-1 block">In ₹ (INR)</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-400 font-bold uppercase tracking-wider block">
            Upcoming Appointment
          </span>
          <span className="text-base font-bold text-stone-900 mt-2 block truncate">
            {activeCustomer?.upcomingAppointment || 'None Scheduled'}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            Chair with R & S Srinivas
          </span>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
        <div className="border-b border-stone-100 pb-4">
          <h3 className="text-lg font-bold text-stone-900 font-luxury">Profile Information</h3>
          <p className="text-xs text-stone-500">Update your name, contact phone, and email.</p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
            />
          </div>

          {activeCustomer?.notes && (
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 text-xs text-amber-900 space-y-1">
              <span className="font-bold uppercase tracking-wider text-[10px] text-amber-700 block">
                Stylist Notes on Record:
              </span>
              <p className="italic">&ldquo;{activeCustomer.notes}&rdquo;</p>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-stone-900 text-[#E2B755] text-xs font-bold hover:bg-black transition-colors shadow-xs"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
