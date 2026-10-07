import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { Customer, Appointment } from '../../types/salon';
import { CustomerTable } from '../../components/admin/CustomerTable';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { User, Phone, Mail, Award, Calendar, Tag, Scissors } from 'lucide-react';

export const AdminCustomersPage: React.FC = () => {
  const { customers, appointments, updateCustomer } = useSalon();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingNotes, setEditingNotes] = useState<string>('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Customer's appointment history
  const customerHistory = selectedCustomer
    ? appointments.filter(
        a =>
          a.customerId === selectedCustomer.id ||
          a.customerPhone === selectedCustomer.phone ||
          a.customerEmail === selectedCustomer.email
      )
    : [];

  const handleOpenCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditingNotes(customer.notes || '');
    setIsEditingNotes(false);
  };

  const handleSaveNotes = async () => {
    if (!selectedCustomer) return;
    const updated = { ...selectedCustomer, notes: editingNotes };
    await updateCustomer(updated);
    setSelectedCustomer(updated);
    setIsEditingNotes(false);
  };

  return (
    <div className="space-y-6 p-4 sm:p-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-stone-900 font-luxury">
          Clientele Directory
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Detailed customer relationship records, past styling history, and loyalty spending.
        </p>
      </div>

      {/* Customer Table */}
      <CustomerTable
        customers={customers}
        onSelectCustomer={handleOpenCustomer}
      />

      {/* Customer Detail Drawer/Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={Boolean(selectedCustomer)}
          onClose={() => setSelectedCustomer(null)}
          title={selectedCustomer.name}
          subtitle={`Client profile • ${selectedCustomer.phone}`}
          maxWidth="lg"
        >
          <div className="space-y-6">
            {/* Highlights banner */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-[#FAF8F5] rounded-2xl border text-center text-xs">
              <div>
                <span className="text-stone-400 block">Total Visits</span>
                <span className="text-xl font-bold text-stone-900 font-luxury">
                  {selectedCustomer.totalVisits}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block">Total Spent</span>
                <span className="text-xl font-bold text-stone-900 font-luxury">
                  {formatCurrency(selectedCustomer.totalSpending)}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block">Last Visit</span>
                <span className="font-semibold text-stone-800 text-xs mt-1 block">
                  {selectedCustomer.lastVisit ? formatDate(selectedCustomer.lastVisit) : '—'}
                </span>
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-2 text-xs text-stone-700 bg-stone-50 p-4 rounded-2xl border">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[#C59B27]" />
                <span className="font-bold text-stone-900">{selectedCustomer.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#C59B27]" />
                <span>{selectedCustomer.email}</span>
              </div>
            </div>

            {/* Stylist Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Stylist Preferences & Medical Notes
                </span>
                {!isEditingNotes && (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="text-xs font-semibold text-[#9C7A28] hover:underline"
                  >
                    Edit Notes
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={editingNotes}
                    onChange={e => setEditingNotes(e.target.value)}
                    className="w-full p-3 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
                    placeholder="e.g. Likes skin fade, organic shampoos only..."
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditingNotes(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-900 text-white"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100/80 text-xs text-stone-700 italic">
                  {selectedCustomer.notes || 'No stylist notes on record for this customer.'}
                </div>
              )}
            </div>

            {/* Booking History */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Calendar size={14} />
                <span>Appointment History ({customerHistory.length})</span>
              </h4>

              <div className="divide-y divide-stone-100 max-h-56 overflow-y-auto pr-1">
                {customerHistory.length === 0 ? (
                  <p className="text-xs text-stone-400 py-3">No bookings recorded yet.</p>
                ) : (
                  customerHistory.map(app => (
                    <div key={app.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-stone-800">
                          {app.serviceNames.join(', ')}
                        </div>
                        <div className="text-stone-400 text-[11px]">
                          {formatDate(app.appointmentDate)} at {app.startTime} • {app.bookingId}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">{formatCurrency(app.total)}</span>
                        <StatusBadge status={app.status} size="sm" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
