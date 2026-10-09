import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { Appointment, AppointmentStatus } from '../../types/salon';
import { AppointmentTable } from '../../components/admin/AppointmentTable';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { BookingCalendar } from '../../components/customer/BookingCalendar';
import { TimeSlotPicker } from '../../components/customer/TimeSlotPicker';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  RotateCcw,
  CheckCheck,
  AlertCircle,
} from 'lucide-react';

export const AdminAppointmentsPage: React.FC = () => {
  const {
    appointments,
    businessHours,
    blockedDates,
    updateAppointmentStatus,
    rescheduleAppointment,
    showToast,
  } = useSalon();

  // Selected appointment for details modal
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Reschedule state
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('');

  const handleUpdateStatus = async (id: string, status: AppointmentStatus) => {
    await updateAppointmentStatus(id, status);
    if (selectedAppointment && selectedAppointment.id === id) {
      setSelectedAppointment(prev => (prev ? { ...prev, status } : null));
    }
  };

  const handleStartReschedule = (app: Appointment) => {
    setRescheduleTarget(app);
    setNewDate(app.appointmentDate);
    setNewTime(app.startTime);
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleTarget || !newDate || !newTime) return;
    const res = await rescheduleAppointment(rescheduleTarget.id, newDate, newTime);
    if (res.success) {
      setRescheduleTarget(null);
      if (selectedAppointment && selectedAppointment.id === rescheduleTarget.id) {
        setSelectedAppointment(null);
      }
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 font-luxury">
            Appointments Management
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Monitor client arrivals, confirm bookings, and manage stylist availability.
          </p>
        </div>
      </div>

      {/* Main Appointment Table with filters */}
      <AppointmentTable
        appointments={appointments}
        onUpdateStatus={handleUpdateStatus}
        onRescheduleClick={handleStartReschedule}
        onViewDetails={app => setSelectedAppointment(app)}
      />

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <Modal
          isOpen={Boolean(selectedAppointment)}
          onClose={() => setSelectedAppointment(null)}
          title={`Booking ${selectedAppointment.bookingId}`}
          subtitle={`Status: ${selectedAppointment.status}`}
          maxWidth="md"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl border">
              <div>
                <span className="text-[11px] text-stone-400 font-bold uppercase block">
                  Status
                </span>
                <div className="mt-1">
                  <StatusBadge status={selectedAppointment.status} />
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-stone-400 font-bold uppercase block">
                  Total Amount
                </span>
                <span className="text-lg font-bold text-stone-950 font-luxury">
                  {formatCurrency(selectedAppointment.total)}
                </span>
              </div>
            </div>

            {/* Customer info */}
            <div className="space-y-2 text-xs text-stone-700 bg-[#FAF8F5] p-3.5 rounded-2xl border">
              <div className="font-bold text-stone-900 text-sm">
                {selectedAppointment.customerName}
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-[#C59B27]" />
                <span>{selectedAppointment.customerPhone}</span>
              </div>
              {selectedAppointment.customerEmail && (
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-[#C59B27]" />
                  <span>{selectedAppointment.customerEmail}</span>
                </div>
              )}
              {selectedAppointment.notes && (
                <div className="pt-2 border-t border-stone-200/60 italic text-stone-500">
                  Note: &ldquo;{selectedAppointment.notes}&rdquo;
                </div>
              )}
              {selectedAppointment.isHomeVisit && (
                <div className="pt-2 border-t border-amber-200 text-amber-900 bg-amber-50 p-2.5 rounded-xl font-medium">
                  <div className="font-bold flex items-center gap-1.5 text-xs text-amber-950">
                    <span>🏠 Doorstep Home Visit (+₹400)</span>
                  </div>
                  <div className="text-xs text-stone-800 mt-1">
                    <strong>Address:</strong> {selectedAppointment.homeAddress || 'Not specified'}
                  </div>
                </div>
              )}
            </div>

            {/* Services & Timing */}
            <div className="space-y-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-stone-400 block">
                Appointment Schedule
              </span>
              <div className="p-3 rounded-xl border space-y-1">
                <div>
                  <strong>Location:</strong> {selectedAppointment.isHomeVisit ? '🏠 Customer Home Visit' : '🪑 In-Saloon Chair (107/P, 3-13-94/11/A, Ramanthapur)'}
                </div>
                <div>
                  <strong>Date:</strong> {formatDate(selectedAppointment.appointmentDate)}
                </div>
                <div>
                  <strong>Time:</strong> {selectedAppointment.startTime} – {selectedAppointment.endTime} ({selectedAppointment.duration} mins)
                </div>
                <div>
                  <strong>Services:</strong> {selectedAppointment.serviceNames.join(', ')}
                </div>
                {selectedAppointment.isHomeVisit && (
                  <div className="text-amber-800">
                    <strong>Home Visit Fee:</strong> ₹400 included
                  </div>
                )}
              </div>
            </div>

            {/* Status Change Buttons */}
            <div className="pt-3 border-t border-stone-100 flex flex-wrap gap-2 justify-end">
              {selectedAppointment.status === 'Pending' && (
                <button
                  onClick={() => handleUpdateStatus(selectedAppointment.id, 'Confirmed')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle size={14} />
                  <span>Confirm</span>
                </button>
              )}

              {selectedAppointment.status === 'Confirmed' && (
                <button
                  onClick={() => handleUpdateStatus(selectedAppointment.id, 'Completed')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                >
                  <CheckCheck size={14} />
                  <span>Mark Completed</span>
                </button>
              )}

              {(selectedAppointment.status === 'Confirmed' || selectedAppointment.status === 'Pending') && (
                <>
                  <button
                    onClick={() => {
                      handleStartReschedule(selectedAppointment);
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw size={14} />
                    <span>Reschedule</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedAppointment.id, 'Cancelled')}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
                  >
                    <XCircle size={14} />
                    <span>Cancel</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedAppointment.id, 'No Show')}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors flex items-center gap-1.5"
                  >
                    <AlertCircle size={14} />
                    <span>No Show</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <Modal
          isOpen={Boolean(rescheduleTarget)}
          onClose={() => setRescheduleTarget(null)}
          title={`Reschedule Booking (${rescheduleTarget.bookingId})`}
          maxWidth="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
                1. Select New Date
              </label>
              <BookingCalendar
                selectedDate={newDate}
                onSelectDate={d => setNewDate(d)}
                hoursList={businessHours}
                blockedDates={blockedDates}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
                2. Select Available Time
              </label>
              <TimeSlotPicker
                selectedDate={newDate}
                totalDurationMinutes={rescheduleTarget.duration}
                selectedTime={newTime}
                onSelectTime={t => setNewTime(t)}
                hoursList={businessHours}
                existingAppointments={appointments.filter(a => a.id !== rescheduleTarget.id)}
                blockedDates={blockedDates}
              />
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setRescheduleTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-stone-900 text-[#E2B755] hover:bg-black transition-colors"
              >
                Save New Time
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
