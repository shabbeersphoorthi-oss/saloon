import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Scissors,
  Lock,
  Mail,
  ArrowRight,
  AlertTriangle,
  UserCheck,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome,
}) => {
  const { loginAdmin } = useAuth();

  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!ownerEmail.trim()) {
      setErrorMessage('Please enter your registered Gmail ID.');
      return;
    }

    if (!ownerPassword.trim()) {
      setErrorMessage('Please enter your password to access the Owner Portal.');
      return;
    }

    setLoading(true);
    const res = await loginAdmin(ownerEmail.trim(), ownerPassword.trim());
    setLoading(false);

    if (res.success) {
      onLoginSuccess();
    } else {
      setErrorMessage(res.error || 'Invalid Gmail ID or password. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 sm:py-14">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-9 border border-[#E5DECF] shadow-xl space-y-6">
        {/* Salon Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#292622] to-[#141311] text-[#E2B755] flex items-center justify-center mx-auto shadow-md border border-[#E2B755]/30">
            <Scissors size={26} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-900 font-luxury">
              Owner Management Portal
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Sign in with your registered Gmail ID and password
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/60 flex items-start gap-2.5">
          <UserCheck size={16} className="text-[#9C7A28] shrink-0 mt-0.5" />
          <div className="text-xs text-stone-700 leading-relaxed">
            <span className="font-bold text-stone-900 block">Restricted Salon Owner Access</span>
            Please enter your Gmail ID and password to access appointments, customer lists, and business records.
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 animate-in fade-in">
            <AlertTriangle size={15} className="shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Salon Owner Gmail ID
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                required
                value={ownerEmail}
                onChange={e => {
                  setOwnerEmail(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Enter Gmail ID"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40 font-medium text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={ownerPassword}
                onChange={e => {
                  setOwnerPassword(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40 text-stone-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Golden Color Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#F0D58C] via-[#E2B755] to-[#D4A137] hover:brightness-105 active:scale-98 text-stone-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
          >
            {loading ? <span>Verifying Credentials...</span> : <span>Login to Owner Dashboard</span>}
            <ArrowRight size={16} className="text-stone-950" />
          </button>
        </form>

        <div className="pt-1 text-center">
          <button
            type="button"
            onClick={onNavigateHome}
            className="text-xs text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
          >
            ← Return to Customer Booking App
          </button>
        </div>
      </div>
    </div>
  );
};
