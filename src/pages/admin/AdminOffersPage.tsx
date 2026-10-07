import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { Offer, DiscountType } from '../../types/salon';
import { OfferTable } from '../../components/admin/OfferTable';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Plus } from 'lucide-react';

export const AdminOffersPage: React.FC = () => {
  const { offers, addOffer, updateOffer, deleteOffer, toggleOfferActive } = useSalon();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [deletingOffer, setDeletingOffer] = useState<Offer | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountAmount, setDiscountAmount] = useState<number>(10);
  const [minBookingAmount, setMinBookingAmount] = useState<number>(500);
  const [maxDiscount, setMaxDiscount] = useState<number>(300);
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [usageLimit, setUsageLimit] = useState<number>(100);
  const [active, setActive] = useState<boolean>(true);

  const handleOpenAdd = () => {
    setEditingOffer(null);
    setName('');
    setCouponCode('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountAmount(15);
    setMinBookingAmount(600);
    setMaxDiscount(300);
    setStartDate('2026-01-01');
    setEndDate('2026-12-31');
    setUsageLimit(200);
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setName(offer.name);
    setCouponCode(offer.couponCode);
    setDescription(offer.description);
    setDiscountType(offer.discountType);
    setDiscountAmount(offer.discountAmount);
    setMinBookingAmount(offer.minBookingAmount);
    setMaxDiscount(offer.maxDiscount);
    setStartDate(offer.startDate);
    setEndDate(offer.endDate);
    setUsageLimit(offer.usageLimit);
    setActive(offer.active);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();

    if (editingOffer) {
      const updated: Offer = {
        ...editingOffer,
        name: name.trim(),
        couponCode: cleanCode,
        description: description.trim(),
        discountType,
        discountAmount: Number(discountAmount),
        minBookingAmount: Number(minBookingAmount),
        maxDiscount: Number(maxDiscount),
        startDate,
        endDate,
        usageLimit: Number(usageLimit),
        active,
      };
      await updateOffer(updated);
    } else {
      await addOffer({
        name: name.trim(),
        couponCode: cleanCode,
        description: description.trim(),
        discountType,
        discountAmount: Number(discountAmount),
        minBookingAmount: Number(minBookingAmount),
        maxDiscount: Number(maxDiscount),
        startDate,
        endDate,
        usageLimit: Number(usageLimit),
        active,
      });
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingOffer) return;
    await deleteOffer(deletingOffer.id);
    setDeletingOffer(null);
  };

  return (
    <div className="space-y-6 p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 font-luxury">
            Offers & Coupons Management
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure promotional discount codes, caps, minimum spend rules, and expiry dates.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl bg-stone-900 text-[#E2B755] font-bold text-xs hover:bg-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
        >
          <Plus size={16} />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Offer Table */}
      <OfferTable
        offers={offers}
        onAddOffer={handleOpenAdd}
        onEditOffer={handleOpenEdit}
        onDeleteOffer={offer => setDeletingOffer(offer)}
        onToggleActive={toggleOfferActive}
      />

      {/* Add / Edit Offer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOffer ? 'Edit Coupon' : 'Create New Coupon'}
        subtitle="Enforced automatically by the booking engine"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Offer Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Festive Grooming"
                className="w-full px-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                required
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                placeholder="e.g. FESTIVE20"
                className="w-full px-4 py-2 text-sm uppercase font-mono font-bold bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Description *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. 15% off haircut and styling services on weekends"
              className="w-full px-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Discount Type *
              </label>
              <select
                value={discountType}
                onChange={e => setDiscountType(e.target.value as DiscountType)}
                className="w-full px-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹ INR)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Discount Value {discountType === 'percentage' ? '(%)' : '(₹)'} *
              </label>
              <input
                type="number"
                min={1}
                required
                value={discountAmount}
                onChange={e => setDiscountAmount(Number(e.target.value))}
                className="w-full px-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Min. Booking Subtotal (₹) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={minBookingAmount}
                onChange={e => setMinBookingAmount(Number(e.target.value))}
                className="w-full px-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Max Discount Cap (₹) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={maxDiscount}
                onChange={e => setMaxDiscount(Number(e.target.value))}
                className="w-full px-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Usage Limit
              </label>
              <input
                type="number"
                min={1}
                value={usageLimit}
                onChange={e => setUsageLimit(Number(e.target.value))}
                className="w-full px-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
              <input
                type="checkbox"
                checked={active}
                onChange={e => setActive(e.target.checked)}
                className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
              <span>Coupon is Active and usable at booking</span>
            </label>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-stone-900 text-[#E2B755] hover:bg-black transition-colors"
            >
              {editingOffer ? 'Update Coupon' : 'Publish Coupon'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingOffer)}
        onClose={() => setDeletingOffer(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Coupon?"
        message={`Are you sure you want to remove offer "${deletingOffer?.couponCode}"?`}
        confirmLabel="Yes, Delete Offer"
        isDestructive={true}
      />
    </div>
  );
};
