import React from 'react';
import { Menu, Bell, Shield, Scissors } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSalon } from '../../context/SalonContext';

interface AdminHeaderProps {
  onToggleMobileMenu?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToCustomer?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleMobileMenu,
  onNavigateToNotifications,
  onNavigateToCustomer,
}) => {
  const { adminUser } = useAuth();
  const { notifications, businessHours } = useSalon();

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const unreadCount = notifications.filter(n => !n.read && n.recipientType === 'admin').length;

  // Determine today's open status
  const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayHours = businessHours.find(h => h.day.toLowerCase() === todayDayName.toLowerCase());
  const isCurrentlyOpen = todayHours?.isOpen ?? true;

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-200/60"
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 font-luxury leading-tight">
            {greeting}, {adminUser?.name || 'Bloom Saloon Admin'}
          </h1>
          <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
            <span>
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  isCurrentlyOpen ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <strong className={isCurrentlyOpen ? 'text-emerald-700' : 'text-rose-700'}>
                {isCurrentlyOpen ? 'Saloon Open Today' : 'Saloon Closed'}
              </strong>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {onNavigateToCustomer && (
          <button
            onClick={onNavigateToCustomer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 text-[#E2B755] hover:bg-black text-xs font-bold transition-all shadow-xs border border-stone-700"
            title="Switch to Customer Facing App"
          >
            <Scissors size={13} />
            <span className="hidden sm:inline">Switch to</span>
            <span>Customer App</span>
          </button>
        )}

        {onNavigateToNotifications && (
          <button
            onClick={onNavigateToNotifications}
            className="relative p-2.5 rounded-xl bg-white border border-stone-200/80 text-stone-700 hover:bg-stone-50 transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C59B27] text-stone-950 font-extrabold text-[10px] rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-stone-200/80 shadow-xs">
          <Shield size={15} className="text-[#C59B27]" />
          <div className="text-left">
            <span className="text-xs font-bold text-stone-900 block leading-tight">
              Salon Owner
            </span>
            <span className="text-[10px] text-stone-500 font-mono block leading-tight">
              {adminUser?.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
