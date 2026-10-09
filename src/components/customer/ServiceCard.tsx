import React from 'react';
import { Service } from '../../types/salon';
import { Clock, Scissors, Plus, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { Tilt3D } from '../cinematic/Tilt3D';

interface ServiceCardProps {
  service: Service;
  onBookNow: (service: Service) => void;
  isSelected?: boolean;
  onToggleSelect?: (service: Service) => void;
  showSelectMode?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onBookNow,
  isSelected = false,
  onToggleSelect,
  showSelectMode = false,
}) => {
  return (
    <Tilt3D maxTilt={8} scale={1.02} depth={10} className="h-full">
      <div
        className={`group relative bg-white rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col h-full preserve-3d ${
          isSelected
            ? 'border-[#C59B27] ring-2 ring-[#C59B27]/30 shadow-lg shadow-amber-900/5'
            : 'border-stone-200/80 hover:border-amber-300 hover:shadow-xl hover:shadow-stone-900/5'
        }`}
      >
      {/* Service Image with Category & Badge */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-100">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />

        {/* Category badge */}
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-stone-900/80 backdrop-blur-md text-[#E2B755] border border-[#E2B755]/30">
          {service.category}
        </span>

        {service.featured && (
          <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E2B755] text-stone-900 shadow">
            Popular
          </span>
        )}

        {/* Duration badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-white font-medium bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
          <Clock size={13} className="text-[#E2B755]" />
          <span>{service.duration} mins</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-stone-900 group-hover:text-[#9C7A28] transition-colors font-luxury">
            {service.name}
          </h3>
          {service.homeVisitAvailable && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold">
              <span>🏠 Home Visit Available (₹400)</span>
            </div>
          )}
          {service.availableDays && service.availableDays.length > 0 && (
            <div className="mt-2 ml-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-bold">
              <span>🗓️ {service.dayRestrictionNote || `Wednesdays Only`}</span>
            </div>
          )}
          <p className="text-xs sm:text-sm text-stone-500 mt-2 line-clamp-2 leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Price & Action button */}
        <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-stone-900">
                {service.priceRange || formatCurrency(service.price)}
              </span>
            </div>
            <span className="text-[10px] text-stone-400 block">Rate card pricing</span>
          </div>

          {showSelectMode && onToggleSelect ? (
            <button
              onClick={() => onToggleSelect(service)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isSelected
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {isSelected ? (
                <>
                  <Check size={14} className="text-[#E2B755]" />
                  <span>Selected</span>
                </>
              ) : (
                <>
                  <Plus size={14} />
                  <span>Add Service</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => onBookNow(service)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 text-white hover:bg-[#2A2723] hover:text-[#E2B755] transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
            >
              <Scissors size={13} className="text-[#E2B755]" />
              <span>Book Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  </Tilt3D>
);
};
