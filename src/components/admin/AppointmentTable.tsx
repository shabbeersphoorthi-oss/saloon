import React, { useState, useMemo } from 'react';
import { Appointment, AppointmentStatus } from '../../types/salon';
import { StatusBadge } from '../common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  CheckCheck,
  AlertCircle,
  Calendar,
  RotateCcw,
  Eye,
  Phone,
  User,
  Scissors,
} from 'lucide-react';

interface AppointmentTableProps {
  appointments: Appointment[];
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onRescheduleClick: (appointment: Appointment) => void;
  onViewDetails: (appointment: Appointment) => void;
}

export const AppointmentTable: React.FC<AppointmentTableProps> = ({
  appointments,
  onUpdateStatus,
  onRescheduleClick,
  onViewDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL'); // ALL, TODAY, UPCOMING, PAST
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredAppointments = useMemo(() => {
    return appointments.filter(app => {
      // Search
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        app.bookingId.toLowerCase().includes(term) ||
        app.customerName.toLowerCase().includes(term) ||
        app.customerPhone.toLowerCase().includes(term) ||
        app.serviceNames.some(s => s.toLowerCase().includes(term));

      if (!matchesSearch) return false;

      // Status
      if (statusFilter !== 'ALL' && app.status !== statusFilter) {
        return false;
      }

      // Date
      if (dateFilter === 'TODAY' && app.appointmentDate !== todayStr) {
        return false;
      }
      if (dateFilter === 'UPCOMING' && app.appointmentDate < todayStr) {
        return false;
      }
      if (dateFilter === 'PAST' && app.appointmentDate >= todayStr) {
        return false;
      }

      return true;
    });
  }, [appointments, searchTerm, statusFilter, dateFilter, todayStr]);

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search booking ID, customer name, phone, or service..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="No Show">No Show</option>
          </select>

          {/* Date filter */}
          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
          >
            <option value="ALL">All Dates</option>
            <option value="TODAY">Today Only</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="PAST">Past History</option>
          </select>
        </div>
      </div>

      {/* Appointment Count Banner */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-2">
        <span>
          Showing <strong>{filteredAppointments.length}</strong> of {appointments.length} appointments
        </span>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <th className="py-3.5 px-4">Booking ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Services</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-400">
                    No appointments match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map(app => (
                  <tr key={app.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-stone-800">
                      {app.bookingId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{app.customerName}</div>
                      <div className="text-xs text-stone-400">{app.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="font-medium text-stone-800 truncate" title={app.serviceNames.join(', ')}>
                        {app.serviceNames.join(', ')}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        <span className="text-xs text-stone-400">{app.duration} mins</span>
                        {app.isHomeVisit && (
                          <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            🏠 Home Visit (₹400)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-stone-800">{formatDate(app.appointmentDate)}</div>
                      <div className="text-xs text-stone-500">{app.startTime} – {app.endTime}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      {formatCurrency(app.total)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewDetails(app)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>

                        {app.status === 'Pending' && (
                          <button
                            onClick={() => onUpdateStatus(app.id, 'Confirmed')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Confirm Booking"
                          >
                            <CheckCircle size={15} />
                          </button>
                        )}

                        {app.status === 'Confirmed' && (
                          <button
                            onClick={() => onUpdateStatus(app.id, 'Completed')}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Mark as Completed"
                          >
                            <CheckCheck size={15} />
                          </button>
                        )}

                        {(app.status === 'Pending' || app.status === 'Confirmed') && (
                          <>
                            <button
                              onClick={() => onRescheduleClick(app)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Reschedule"
                            >
                              <RotateCcw size={15} />
                            </button>
                            <button
                              onClick={() => onUpdateStatus(app.id, 'Cancelled')}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Cancel"
                            >
                              <XCircle size={15} />
                            </button>
                            <button
                              onClick={() => onUpdateStatus(app.id, 'No Show')}
                              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                              title="Mark No Show"
                            >
                              <AlertCircle size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border text-stone-400 text-sm">
            No appointments match your filters.
          </div>
        ) : (
          filteredAppointments.map(app => (
            <div
              key={app.id}
              className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono font-bold text-stone-400">
                    {app.bookingId}
                  </span>
                  <h4 className="font-bold text-stone-900">{app.customerName}</h4>
                  <div className="text-xs text-stone-500">{app.customerPhone}</div>
                </div>
                <StatusBadge status={app.status} size="sm" />
              </div>

              <div className="text-xs text-stone-600 space-y-1 bg-stone-50 p-2.5 rounded-xl">
                <div><strong>Services:</strong> {app.serviceNames.join(', ')}</div>
                {app.isHomeVisit && (
                  <div className="text-amber-900 font-bold bg-amber-100/80 p-1.5 rounded-lg border border-amber-200">
                    🏠 Home Visit Service (+₹400)
                    {app.homeAddress && <div className="text-[10px] font-normal text-amber-800">Address: {app.homeAddress}</div>}
                  </div>
                )}
                <div><strong>When:</strong> {formatDate(app.appointmentDate)} at {app.startTime} ({app.duration} mins)</div>
                <div><strong>Amount:</strong> <span className="font-bold text-stone-900">{formatCurrency(app.total)}</span></div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-stone-100">
                <button
                  onClick={() => onViewDetails(app)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-100 text-stone-700"
                >
                  Details
                </button>
                {app.status === 'Pending' && (
                  <button
                    onClick={() => onUpdateStatus(app.id, 'Confirmed')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-800"
                  >
                    Confirm
                  </button>
                )}
                {app.status === 'Confirmed' && (
                  <button
                    onClick={() => onUpdateStatus(app.id, 'Completed')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-100 text-blue-800"
                  >
                    Complete
                  </button>
                )}
                {(app.status === 'Pending' || app.status === 'Confirmed') && (
                  <>
                    <button
                      onClick={() => onRescheduleClick(app)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-100 text-amber-800"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => onUpdateStatus(app.id, 'Cancelled')}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-100 text-rose-800"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
