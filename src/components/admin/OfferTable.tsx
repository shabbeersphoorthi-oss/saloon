import React from 'react';
import { Offer } from '../../types/salon';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Plus, Edit2, Trash2, Tag, Calendar, Sparkles } from 'lucide-react';

interface OfferTableProps {
  offers: Offer[];
  onAddOffer: () => void;
  onEditOffer: (offer: Offer) => void;
  onDeleteOffer: (offer: Offer) => void;
  onToggleActive: (id: string) => void;
}

export const OfferTable: React.FC<OfferTableProps> = ({
  offers,
  onAddOffer,
  onEditOffer,
  onDeleteOffer,
  onToggleActive,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-stone-900 font-luxury">Active Promotional Discounts</h3>
          <p className="text-xs text-stone-500">Manage client coupons and holiday promotions.</p>
        </div>
        <button
          onClick={onAddOffer}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 text-[#E2B755] hover:bg-black transition-all shadow-sm"
        >
          <Plus size={15} />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {offers.map(offer => {
          const discountLabel =
            offer.discountType === 'percentage'
              ? `${offer.discountAmount}% OFF`
              : `${formatCurrency(offer.discountAmount)} OFF`;

          return (
            <div
              key={offer.id}
              className={`bg-white rounded-3xl p-5 border flex flex-col justify-between transition-all ${
                offer.active
                  ? 'border-stone-200/80 shadow-xs hover:shadow-md'
                  : 'border-stone-200 bg-stone-50/70 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm tracking-wider px-3 py-1 rounded-xl bg-[#FAF2DC] text-[#8F6C1E] border border-[#E8DFC9]">
                      {offer.couponCode}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-900 text-white">
                      {discountLabel}
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleActive(offer.id)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      offer.active ? 'bg-emerald-600' : 'bg-stone-300'
                    }`}
                    title={offer.active ? 'Active' : 'Disabled'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        offer.active ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <h4 className="font-bold text-stone-900 text-base mt-2 font-luxury">
                  {offer.name}
                </h4>
                <p className="text-xs text-stone-600 mt-1">{offer.description}</p>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-stone-100 text-xs text-stone-500">
                  <div>Min Booking: <strong>{formatCurrency(offer.minBookingAmount)}</strong></div>
                  <div>Max Cap: <strong>{offer.maxDiscount ? formatCurrency(offer.maxDiscount) : 'None'}</strong></div>
                  <div>Usage: <strong>{offer.usedCount}</strong> / {offer.usageLimit || '∞'}</div>
                  <div>Valid to: <strong>{formatDate(offer.endDate)}</strong></div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => onEditOffer(offer)}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-1"
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDeleteOffer(offer)}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
