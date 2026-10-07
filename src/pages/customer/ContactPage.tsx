import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { MapPin, Phone, Mail, Clock, Scissors, Send, CheckCircle2 } from 'lucide-react';
import { formatDisplayTime } from '../../utils/formatters';

export const ContactPage: React.FC = () => {
  const { settings, businessHours, showToast } = useSalon();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Your message has been delivered to Bloom Saloon!', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold tracking-widest uppercase text-[#9C7A28]">
          Find Bloom Saloon
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 font-luxury">
          Location & Contact
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          107/P, 3-13-94/11/A, Ramanthapur, Hyderabad • Call: <strong>8309578606</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-900 text-[#E2B755] flex items-center justify-center">
                <Scissors size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900 font-luxury">
                  Bloom Saloon
                </h3>
                <span className="text-xs font-semibold text-[#9C7A28] uppercase tracking-wider">
                  107/P, 3-13-94/11/A, Ramanthapur
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#9C7A28] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                    Saloon Address
                  </span>
                  <p className="text-sm font-medium text-stone-800 mt-0.5 leading-relaxed">
                    107/P, 3-13-94/11/A, Ramanthapur, Hyderabad, Telangana
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#9C7A28] flex items-center justify-center shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                    Mobile Number
                  </span>
                  <a
                    href="tel:8309578606"
                    className="text-base font-bold text-stone-900 hover:text-[#9C7A28] transition-colors"
                  >
                    8309578606
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#9C7A28] flex items-center justify-center shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                    Email
                  </span>
                  <a
                    href="mailto:contact@bloomsaloon.in"
                    className="text-sm font-medium text-stone-900 hover:text-[#9C7A28] transition-colors"
                  >
                    contact@bloomsaloon.in
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Timings */}
          <div className="bg-[#1C1B20] text-white p-6 sm:p-8 rounded-3xl border border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#E2B755]">
              <Clock size={16} />
              <span>Salon Working Schedule</span>
            </div>
            <div className="divide-y divide-stone-800 text-xs">
              {businessHours.map(bh => (
                <div key={bh.day} className="py-2 flex justify-between">
                  <span className="text-stone-400">{bh.day}</span>
                  <span className="font-semibold text-stone-200">
                    {bh.isOpen ? `${formatDisplayTime(bh.openTime)} – ${formatDisplayTime(bh.closeTime)}` : 'Closed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Message / Consultation Form */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h3 className="text-xl font-bold text-stone-900 font-luxury">
              Send a Note to R & S Srinivas
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Have questions regarding bridal packages, beard contouring, or private appointments?
            </p>
          </div>

          {submitted ? (
            <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
              <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
              <h4 className="font-bold text-stone-900 text-base font-luxury">Message Delivered!</h4>
              <p className="text-xs text-stone-600">
                Thank you, {name || 'guest'}. The Bloom Saloon desk will call you back shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs font-bold text-stone-900 underline pt-2"
              >
                Send another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Reddy"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98450 12345"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                  Message / Inquiry *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us about the service you are interested in..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-stone-900 text-[#E2B755] font-bold text-xs hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Send size={15} />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
