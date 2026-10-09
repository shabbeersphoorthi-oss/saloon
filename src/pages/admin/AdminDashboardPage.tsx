import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSalon } from '../../context/SalonContext';
import { DashboardCard } from '../../components/admin/DashboardCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Appointment } from '../../types/salon';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Calendar,
  Clock,
  IndianRupee,
  Users,
  Scissors,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigateTab: (tab: string) => void;
  onSelectAppointment: (appointment: Appointment) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigateTab,
  onSelectAppointment,
}) => {
  const { adminUser } = useAuth();
  const { appointments, customers, services } = useSalon();

  const todayStr = new Date().toISOString().split('T')[0];

  // Metrics
  const todayAppointments = useMemo(() => {
    return appointments.filter(a => a.appointmentDate === todayStr);
  }, [appointments, todayStr]);

  const upcomingBookings = useMemo(() => {
    return appointments.filter(
      a =>
        a.appointmentDate >= todayStr &&
        (a.status === 'Confirmed' || a.status === 'Pending')
    );
  }, [appointments, todayStr]);

  const todayRevenue = useMemo(() => {
    return todayAppointments
      .filter(a => a.status === 'Completed' || a.status === 'Confirmed')
      .reduce((sum, a) => sum + a.total, 0);
  }, [todayAppointments]);

  // Popular Services aggregation
  const popularServicesRanked = useMemo(() => {
    const counts: Record<string, { name: string; count: number; revenue: number }> = {};
    appointments.forEach(app => {
      app.serviceNames.forEach(srvName => {
        if (!counts[srvName]) {
          counts[srvName] = { name: srvName, count: 0, revenue: 0 };
        }
        counts[srvName].count += 1;
        counts[srvName].revenue += app.total / app.serviceNames.length;
      });
    });
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [appointments]);

  // Last 7 days booking distribution chart simulation
  const last7DaysChart = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const count = appointments.filter(a => a.appointmentDate === dStr).length;
      const rev = appointments
        .filter(a => a.appointmentDate === dStr && a.status !== 'Cancelled')
        .reduce((sum, a) => sum + a.total, 0);
      days.push({
        dateStr: dStr,
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        count,
        revenue: rev,
      });
    }
    return days;
  }, [appointments]);

  const maxChartCount = Math.max(...last7DaysChart.map(d => d.count), 4);
  const maxChartRev = Math.max(...last7DaysChart.map(d => d.revenue), 2500);

  return (
    <div className="space-y-8 p-4 sm:p-8">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Today's Appointments"
          value={todayAppointments.length}
          subtitle={`${todayAppointments.filter(a => a.status === 'Confirmed').length} confirmed today`}
          icon={Calendar}
          accentColor="#B88728"
        />

        <DashboardCard
          title="Upcoming Bookings"
          value={upcomingBookings.length}
          subtitle="Next 7 days schedule"
          icon={Clock}
          accentColor="#2563EB"
        />

        <DashboardCard
          title="Today's Revenue"
          value={formatCurrency(todayRevenue)}
          subtitle="Estimated from confirmed seats"
          icon={IndianRupee}
          accentColor="#059669"
        />

        <DashboardCard
          title="Total Customers"
          value={customers.length}
          subtitle="Registered clientele base"
          icon={Users}
          accentColor="#7C3AED"
        />
      </div>

      {/* Visual Booking & Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Volume Chart */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900 font-luxury">
                Booking Activity (Last 7 Days)
              </h3>
              <p className="text-xs text-stone-500">Volume of client reservations</p>
            </div>
            <span className="text-xs font-bold text-[#9C7A28] px-2.5 py-1 rounded-full bg-[#FAF2DC]">
              Real-time
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {last7DaysChart.map(d => {
              const heightPercent = Math.max(15, (d.count / maxChartCount) * 100);
              const isToday = d.dateStr === todayStr;

              return (
                <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[11px] font-bold text-stone-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.count}
                  </span>
                  <div className="w-full max-w-[36px] bg-stone-100 rounded-t-xl overflow-hidden h-32 flex items-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-xl transition-all ${
                        isToday
                          ? 'bg-gradient-to-t from-[#B38722] to-[#E2B755]'
                          : 'bg-stone-800 group-hover:bg-[#C59B27]'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isToday ? 'text-[#9C7A28] font-bold' : 'text-stone-400'
                    }`}
                  >
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Performance Chart */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900 font-luxury">
                Revenue Trajectory (₹ INR)
              </h3>
              <p className="text-xs text-stone-500">Daily salon income</p>
            </div>
            <TrendingUp size={18} className="text-emerald-600" />
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {last7DaysChart.map(d => {
              const heightPercent = Math.max(12, (d.revenue / maxChartRev) * 100);
              const isToday = d.dateStr === todayStr;

              return (
                <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{d.revenue}
                  </span>
                  <div className="w-full max-w-[36px] bg-stone-100 rounded-t-xl overflow-hidden h-32 flex items-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-xl transition-all ${
                        isToday
                          ? 'bg-emerald-600'
                          : 'bg-stone-300 group-hover:bg-emerald-500'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isToday ? 'text-emerald-700 font-bold' : 'text-stone-400'
                    }`}
                  >
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two columns: Today's Appointments & Popular Services */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Appointments list */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-stone-900 font-luxury">
                Today&apos;s Appointments ({todayAppointments.length})
              </h3>
              <p className="text-xs text-stone-500">
                Chairs managed by Bloom Saloon Master Stylists
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('admin-appointments')}
              className="text-xs font-bold text-[#9C7A28] hover:text-stone-900 flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-sm">
              No appointments scheduled for today yet.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {todayAppointments.map(app => (
                <div
                  key={app.id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-stone-50/60 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center font-bold text-xs">
                      {app.startTime.split(' ')[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">{app.customerName}</span>
                        <StatusBadge status={app.status} size="sm" />
                      </div>
                      <div className="text-xs text-stone-500">
                        {app.serviceNames.join(', ')} • {app.duration} mins
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-stone-900 text-sm">
                      {formatCurrency(app.total)}
                    </span>
                    <button
                      onClick={() => onSelectAppointment(app)}
                      className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-200/50 rounded-lg transition-colors"
                      title="View Appointment"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Services & Top Customers */}
        <div className="lg:col-span-4 space-y-6">
          {/* Popular Services card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-stone-900 font-luxury flex items-center gap-2">
              <Scissors size={16} className="text-[#C59B27]" />
              <span>Popular Services</span>
            </h3>

            <div className="space-y-3">
              {popularServicesRanked.length === 0 ? (
                <div className="text-xs text-stone-400 py-4 text-center">
                  No service bookings yet.
                </div>
              ) : (
                popularServicesRanked.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-stone-100 font-bold text-stone-700 flex items-center justify-center text-[10px]">
                        {index + 1}
                      </span>
                      <span className="font-medium text-stone-800 truncate max-w-[150px]">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-bold text-stone-900">{item.count} bookings</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Customers card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 font-luxury flex items-center gap-2">
                <Users size={16} className="text-[#C59B27]" />
                <span>Recent Clients</span>
              </h3>
              <button
                onClick={() => onNavigateTab('admin-customers')}
                className="text-[11px] font-bold text-[#9C7A28]"
              >
                All
              </button>
            </div>

            <div className="divide-y divide-stone-100 text-xs">
              {customers.length === 0 ? (
                <div className="text-xs text-stone-400 py-4 text-center">
                  No client records yet.
                </div>
              ) : (
                customers.slice(0, 4).map(c => (
                  <div key={c.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-stone-900 block">{c.name}</span>
                      <span className="text-stone-400 text-[10px]">{c.phone}</span>
                    </div>
                    <span className="font-semibold text-stone-700 bg-stone-50 px-2 py-0.5 rounded-lg border">
                      {c.totalVisits} visits
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
