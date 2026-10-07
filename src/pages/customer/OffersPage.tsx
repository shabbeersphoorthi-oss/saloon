import React from 'react';
import { useSalon } from '../../context/SalonContext';
import { OfferCard } from '../../components/customer/OfferCard';
import { Tag, Sparkles } from 'lucide-react';

interface OffersPageProps {
  onApplyCouponToBooking: (couponCode: string) => void;
}

export const OffersPage: React.FC<OffersPageProps> = ({ onApplyCouponToBooking }) => {
  const { offers } = useSalon();

  const activeOffers = offers.filter(o => o.active);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest uppercase text-[#9C7A28]">
          Salon Privileges & Savings
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 font-luxury">
          Current Offers
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed">
          Exclusive discounts crafted for our first-time guests and loyal patrons of Bloom Saloon. Apply any coupon during your appointment booking.
        </p>
      </div>

      {/* Grid of Offers */}
      {activeOffers.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-stone-200 text-stone-500">
          No promotional coupons are currently running. Check back soon for seasonal specials!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeOffers.map(offer => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onApplyCode={onApplyCouponToBooking}
            />
          ))}
        </div>
      )}
    </div>
  );
};
