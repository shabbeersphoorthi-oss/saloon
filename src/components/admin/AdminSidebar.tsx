import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  CalendarCheck,
  Users,
  Scissors,
  Tag,
  Clock,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSalon } from '../../context/SalonContext';

interface AdminSidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onNavigate,
  onCloseMobile,
}) => {
  const { adminUser, logoutAdmin, isSuperUser, quickSwitchRole } = useAuth();
  const { notifications } = useSalon();

  const unreadCount = notifications.filter(n => !n.read && n.recipientType === 'admin').length;

  const navItems = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-appointments', label: 'Bookings & Appointments', icon: CalendarCheck },
    { id: 'admin-calendar', label: 'Calendar View', icon: CalendarDays },
    { id: 'admin-customers', label: 'Customers', icon: Users },
    { id: 'admin-services', label: 'Rate Card & Services', icon: Scissors },
    { id: 'admin-offers', label: 'Offers & Coupons', icon: Tag },
    { id: 'admin-availability', label: 'Availability & Hours', icon: Clock },
    { id: 'admin-analytics', label: 'Analytics & Revenue', icon: BarChart3 },
    { id: 'admin-notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'admin-settings', label: 'Saloon Settings', icon: Settings },
  ];

  const handleNav = (tabId: string) => {
    onNavigate(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-64 bg-[#141417] text-stone-300 flex flex-col justify-between shrink-0 min-h-screen border-r border-stone-800">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-stone-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E2B755] to-[#B38722] text-stone-900 flex items-center justify-center font-bold shadow-md">
              <Scissors size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-luxury tracking-wide">
                Bloom Saloon
              </h2>
              <span className="text-[10px] text-[#E2B755] tracking-widest uppercase font-bold">
                Admin Panel
              </span>
            </div>
          </div>

          {/* Active Admin Profile */}
          <div className="mt-4 pt-3 border-t border-stone-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full border border-[#E2B755]/40 bg-stone-800 flex items-center justify-center text-[11px] font-black text-[#E2B755] shrink-0">
                BS
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">
                  {adminUser?.name || 'Salon Owner'}
                </span>
                <span className="text-[10px] text-amber-200/90 block truncate font-mono">
                  {adminUser?.email}
                </span>
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#E2B755]/80 block">
                  Salon Owner
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#24211D] to-[#1E1B17] text-[#E2B755] border border-[#E2B755]/40 shadow-sm'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={17}
                    className={isActive ? 'text-[#E2B755]' : 'text-stone-400'}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E2B755] text-stone-900">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer controls: Customer preview & Logout */}
      <div className="p-4 border-t border-stone-800/80 space-y-2">
        <button
          onClick={() => handleNav('home')}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-800/50 hover:bg-stone-800 text-xs font-semibold text-stone-300 transition-colors"
        >
          <ExternalLink size={14} className="text-[#E2B755]" />
          <span>View Customer App</span>
        </button>

        <button
          onClick={logoutAdmin}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl hover:bg-rose-950/40 text-xs font-semibold text-rose-400 transition-colors"
        >
          <LogOut size={14} />
          <span>Logout Owner Session</span>
        </button>
      </div>
    </aside>
  );
};
