import React, { useState } from 'react';
import { Offer } from '../../types/salon';
import { Tag, Copy, Check, ArrowRight, Sparkles } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Tilt3D } from '../cinematic/Tilt3D';

interface OfferCardProps {
  offer: Offer;
  onApplyCode?: (code: string) => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer, onApplyCode }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(offer.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const discountText =
    offer.discountType === 'percentage'
      ? `${offer.discountAmount}% OFF`
      : `${formatCurrency(offer.discountAmount)} OFF`;

  return (
    <Tilt3D maxTilt={7} scale={1.02} depth={10} className="h-full">
      <div className="relative bg-gradient-to-br from-white to-[#FDFBF7] rounded-3xl p-6 border border-[#E8DFC9] shadow-sm hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden group h-full preserve-3d">
        {/* Decorative background accent */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#F5E6BE]/30 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform" />

        <div>
          {/* Top Tag & Discount banner */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FAF2DC] text-[#8F6C1E] border border-[#E4D1A0]">
              <Sparkles size={12} />
              {discountText}
            </span>
            <span className="text-[11px] font-medium text-stone-500">
              Valid till {formatDate(offer.endDate)}
            </span>
          </div>

          <h3 className="text-lg font-bold text-stone-900 font-luxury">{offer.name}</h3>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
            {offer.description}
          </p>

          {/* Requirements */}
          <div className="mt-4 pt-3 border-t border-stone-200/60 flex flex-wrap gap-y-1 gap-x-4 text-[11px] text-stone-500">
            <span>Min. Booking: <strong>{formatCurrency(offer.minBookingAmount)}</strong></span>
            {offer.maxDiscount > 0 && (
              <span>Max Discount: <strong>{formatCurrency(offer.maxDiscount)}</strong></span>
            )}
          </div>
        </div>

        {/* Coupon box & Actions */}
        <div className="mt-5 pt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center border border-dashed border-[#B88728] rounded-xl px-3 py-1.5 bg-[#FDF9EE]">
            <Tag size={13} className="text-[#B88728] mr-2" />
            <span className="font-mono font-bold text-sm tracking-wider text-stone-900 uppercase">
              {offer.couponCode}
            </span>
            <button
              onClick={handleCopy}
              className="ml-2.5 p-1 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
              title="Copy coupon code"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            </button>
          </div>

          {onApplyCode && (
            <button
              onClick={() => onApplyCode(offer.couponCode)}
              className="inline-flex items-center gap-1 text-xs font-bold text-stone-900 hover:text-[#9C7A28] transition-colors cursor-pointer"
            >
              <span>Book with this code</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    </Tilt3D>
  );
};
