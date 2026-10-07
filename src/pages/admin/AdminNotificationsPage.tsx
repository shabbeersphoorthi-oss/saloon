import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { SalonNotification } from '../../types/salon';
import { formatDate } from '../../utils/formatters';
import {
  Bell,
  CheckCircle2,
  Calendar,
  User,
  AlertCircle,
  Clock,
  CheckCheck,
} from 'lucide-react';

export const AdminNotificationsPage: React.FC = () => {
  const { notifications, markNotificationRead, showToast } = useSalon();

  const [filterType, setFilterType] = useState<'ALL' | 'UNREAD' | 'ADMIN' | 'CUSTOMER'>('ALL');

  const filtered = notifications.filter(n => {
    if (filterType === 'UNREAD') return !n.read;
    if (filterType === 'ADMIN') return n.recipientType === 'admin';
    if (filterType === 'CUSTOMER') return n.recipientType === 'customer';
    return true;
  });

  const handleMarkAllRead = async () => {
    for (const notif of notifications) {
      if (!notif.read) {
        await markNotificationRead(notif.id);
      }
    }
    showToast('All notifications marked as read.');
  };

  return (
    <div className="space-y-6 p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 font-luxury">
            Notifications Center
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time triggers for online bookings, client cancellations, and SMS reminders.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors flex items-center gap-1.5"
        >
          <CheckCheck size={15} />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-stone-200 gap-2">
        {(['ALL', 'UNREAD', 'ADMIN', 'CUSTOMER'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors ${
              filterType === tab
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            {tab === 'ALL'
              ? 'All Alerts'
              : tab === 'UNREAD'
              ? 'Unread'
              : tab === 'ADMIN'
              ? 'Admin Triggers'
              : 'Customer Copies'}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden divide-y divide-stone-100">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-stone-400 text-sm">
            No notifications matching this filter.
          </div>
        ) : (
          filtered.map(notif => {
            const isUnread = !notif.read;

            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (isUnread) markNotificationRead(notif.id);
                }}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                  isUnread ? 'bg-[#FAF8F5]' : 'hover:bg-stone-50/60'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                      notif.type === 'new_booking'
                        ? 'bg-amber-50 text-[#C59B27]'
                        : notif.type === 'booking_cancelled'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    {notif.type === 'new_booking' && <Calendar size={18} />}
                    {notif.type === 'booking_cancelled' && <AlertCircle size={18} />}
                    {notif.type === 'new_customer' && <User size={18} />}
                    {notif.type === 'appointment_reminder' && <Clock size={18} />}
                    {notif.type === 'booking_confirmed' && <CheckCircle2 size={18} />}
                    {notif.type === 'general' && <Bell size={18} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-sm font-luxury">
                        {notif.title}
                      </span>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-[#C59B27]" />
                      )}
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-stone-400 mt-1.5 block">
                      {new Date(notif.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold text-stone-400 bg-stone-100 shrink-0">
                  {notif.recipientType}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
