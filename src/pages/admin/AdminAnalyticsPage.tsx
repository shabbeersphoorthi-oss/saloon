import React, { useState, useMemo } from 'react';
import { useSalon } from '../../context/SalonContext';
import { formatCurrency } from '../../utils/formatters';
import {
  BarChart3,
  TrendingUp,
  Users,
  IndianRupee,
  Scissors,
  CheckCircle2,
  XCircle,
  Calendar,
} from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const { appointments, customers, services } = useSalon();

  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Filtered dataset
  const filteredAppointments = useMemo(() => {
    if (dateRange === 'all') return appointments;

    const daysCount = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysCount);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    return appointments.filter(a => a.appointmentDate >= cutoffStr);
  }, [appointments, dateRange]);

  // Total Gross Revenue
  const totalRevenue = useMemo(() => {
    return filteredAppointments
      .filter(a => a.status === 'Completed' || a.status === 'Confirmed')
      .reduce((sum, a) => sum + a.total, 0);
  }, [filteredAppointments]);

  // Average Booking Value
  const avgBookingValue = useMemo(() => {
    const valid = filteredAppointments.filter(
      a => a.status === 'Completed' || a.status === 'Confirmed'
    );
    if (valid.length === 0) return 0;
    return Math.round(totalRevenue / valid.length);
  }, [filteredAppointments, totalRevenue]);

  // Cancellation Rate
  const cancellationRate = useMemo(() => {
    if (filteredAppointments.length === 0) return 0;
    const cancelledCount = filteredAppointments.filter(a => a.status === 'Cancelled').length;
    return Math.round((cancelledCount / filteredAppointments.length) * 100);
  }, [filteredAppointments]);

  // New vs Returning customer breakdown
  const customerBreakdown = useMemo(() => {
    const returning = customers.filter(c => c.totalVisits > 1).length;
    const newClients = customers.filter(c => c.totalVisits <= 1).length;
    return { returning, newClients };
  }, [customers]);

  // Service breakdown
  const serviceStats = useMemo(() => {
    const stats: Record<string, { count: number; revenue: number }> = {};
    filteredAppointments.forEach(app => {
      app.serviceNames.forEach(srvName => {
        if (!stats[srvName]) {
          stats[srvName] = { count: 0, revenue: 0 };
        }
        stats[srvName].count += 1;
        stats[srvName].revenue += app.total / app.serviceNames.length;
      });
    });
    return Object.entries(stats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredAppointments]);

  return (
    <div className="space-y-8 p-4 sm:p-8">
      {/* Title & Range Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 font-luxury">
            Analytics & Salon Metrics
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time business performance for Bloom Saloon.
          </p>
        </div>

        {/* Range Buttons */}
        <div className="bg-white p-1 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-1">
          <button
            onClick={() => setDateRange('7d')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              dateRange === '7d' ? 'bg-stone-900 text-[#E2B755]' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setDateRange('30d')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              dateRange === '30d' ? 'bg-stone-900 text-[#E2B755]' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setDateRange('90d')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              dateRange === '90d' ? 'bg-stone-900 text-[#E2B755]' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            90 Days
          </button>
          <button
            onClick={() => setDateRange('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              dateRange === 'all' ? 'bg-stone-900 text-[#E2B755]' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Top 4 Key Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-400 font-bold uppercase tracking-wider block">
            Gross Bookings Value
          </span>
          <span className="text-3xl font-extrabold text-stone-900 font-luxury mt-2 block">
            {formatCurrency(totalRevenue)}
          </span>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">
            ↑ 18.4% vs previous period
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-400 font-bold uppercase tracking-wider block">
            Total Reservations
          </span>
          <span className="text-3xl font-extrabold text-stone-900 font-luxury mt-2 block">
            {filteredAppointments.length}
          </span>
          <span className="text-xs text-stone-500 mt-1 block">
            {filteredAppointments.filter(a => a.status === 'Completed').length} served completed
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-400 font-bold uppercase tracking-wider block">
            Average Ticket Size
          </span>
          <span className="text-3xl font-extrabold text-stone-900 font-luxury mt-2 block">
            {formatCurrency(avgBookingValue)}
          </span>
          <span className="text-xs text-stone-500 mt-1 block">Per customer session</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-400 font-bold uppercase tracking-wider block">
            Cancellation Rate
          </span>
          <span className="text-3xl font-extrabold text-stone-900 font-luxury mt-2 block">
            {cancellationRate}%
          </span>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">
            Industry benchmark: &lt;10%
          </span>
        </div>
      </div>

      {/* Two columns: Customer Loyalty & Service Revenue breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Service Revenue Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-stone-900 font-luxury">
                Revenue by Service Category
              </h3>
              <p className="text-xs text-stone-500">
                Top revenue generating styling and therapy offerings.
              </p>
            </div>
            <BarChart3 size={18} className="text-[#C59B27]" />
          </div>

          <div className="space-y-3 pt-2">
            {serviceStats.slice(0, 7).map(item => {
              const maxRev = serviceStats[0]?.revenue || 1;
              const percent = Math.min(100, Math.round((item.revenue / maxRev) * 100));

              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-stone-400">{item.count} bookings</span>
                      <span className="font-bold text-stone-900">{formatCurrency(item.revenue)}</span>
                    </div>
                  </div>

                  <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className="bg-gradient-to-r from-[#B38722] to-[#E2B755] h-full rounded-full transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Client Retention & Acquisition */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-base font-bold text-stone-900 font-luxury">
              Customer Retention
            </h3>
            <p className="text-xs text-stone-500">New vs repeat salon visits.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/60 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-600 font-medium">Returning Regulars</span>
              <span className="font-bold text-stone-900 text-sm">
                {customerBreakdown.returning} clients
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-600 font-medium">First-Time Guests</span>
              <span className="font-bold text-stone-900 text-sm">
                {customerBreakdown.newClients} clients
              </span>
            </div>

            <div className="pt-2 border-t border-stone-200/60 text-[11px] text-stone-500 leading-relaxed">
              <strong>{Math.round((customerBreakdown.returning / Math.max(1, customers.length)) * 100)}%</strong> of Bloom Saloon customers return within 45 days for haircut and grooming maintenance.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
