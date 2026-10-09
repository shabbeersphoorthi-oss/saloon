import React, { useState } from 'react';
import { Customer } from '../../types/salon';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Search, Eye, Phone, Mail, Calendar, User, Tag } from 'lucide-react';

interface CustomerTableProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onSelectCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = customers.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.phone.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search customers by name, phone, or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
          />
        </div>
        <span className="text-xs text-stone-500 font-semibold whitespace-nowrap">
          {filtered.length} Customers
        </span>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <th className="py-3.5 px-4">Client Name</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Total Visits</th>
                <th className="py-3.5 px-4">Total Spent</th>
                <th className="py-3.5 px-4">Last Visit</th>
                <th className="py-3.5 px-4">Upcoming</th>
                <th className="py-3.5 px-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-400">
                    No customers registered yet. New customer bookings will be saved here automatically.
                  </td>
                </tr>
              ) : (
                filtered.map(cust => (
                <tr key={cust.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-stone-900">{cust.name}</div>
                    {cust.notes && (
                      <div className="text-xs text-stone-400 truncate max-w-[200px]" title={cust.notes}>
                        {cust.notes}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-stone-800 text-xs font-semibold">{cust.phone}</div>
                    <div className="text-[11px] text-stone-400">{cust.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                      {cust.totalVisits} visits
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-stone-900">
                    {formatCurrency(cust.totalSpending)}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-stone-600">
                    {cust.lastVisit ? formatDate(cust.lastVisit) : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    {cust.upcomingAppointment ? (
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                        {cust.upcomingAppointment}
                      </span>
                    ) : (
                      <span className="text-stone-400">None scheduled</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onSelectCustomer(cust)}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                      title="View Customer Profile"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              )))
            }
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400 bg-white rounded-2xl border border-stone-200">
            No customers registered yet. New customer bookings will be saved here automatically.
          </div>
        ) : (
          filtered.map(cust => (
          <div
            key={cust.id}
            onClick={() => onSelectCustomer(cust)}
            className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-2 cursor-pointer hover:border-amber-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-stone-900">{cust.name}</h4>
                <div className="text-xs text-stone-500">{cust.phone}</div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800">
                {cust.totalVisits} visits
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100 text-stone-600">
              <span>Total Spending: <strong>{formatCurrency(cust.totalSpending)}</strong></span>
              <span className="text-stone-400">Tap to view history →</span>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
};
