import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { Service, ServiceCategory } from '../../types/salon';
import { formatCurrency } from '../../utils/formatters';
import { Clock, Scissors, Phone, ListOrdered, LayoutGrid } from 'lucide-react';

interface PriceListPageProps {
  onSelectServiceToBook: (service: Service) => void;
}

export const PriceListPage: React.FC<PriceListPageProps> = ({ onSelectServiceToBook }) => {
  const { services } = useSalon();
  const [viewMode, setViewMode] = useState<'BOARD' | 'CATEGORIES'>('BOARD');
  const [onlyHomeVisit, setOnlyHomeVisit] = useState(false);

  const categories: ServiceCategory[] = ['Packages', 'Hair', 'Grooming', 'Skin & Facial'];

  const displayedServices = onlyHomeVisit
    ? services.filter(s => s.homeVisitAvailable)
    : services;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest uppercase text-[#9C7A28]">
          Official Rate Card • Telangana Nayee Brahmana Seva Sangam
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 font-luxury">
          Bloom Saloon Price List
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed">
          107/P, 3-13-94/11/A, Ramanthapur, Hyderabad. Approved salon rate card services with standardized pricing. For bookings and questions, call <a href="tel:8309578606" className="text-[#9C7A28] font-bold hover:underline">8309578606</a>.
        </p>

        {/* View Toggle & Home Visit Filter */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex p-1 rounded-2xl bg-white border border-stone-200 text-xs shadow-xs">
            <button
              onClick={() => setViewMode('BOARD')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1.5 ${
                viewMode === 'BOARD'
                  ? 'bg-stone-900 text-[#E2B755]'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ListOrdered size={14} />
              <span>Full Rate Card ({displayedServices.length})</span>
            </button>
            <button
              onClick={() => setViewMode('CATEGORIES')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1.5 ${
                viewMode === 'CATEGORIES'
                  ? 'bg-stone-900 text-[#E2B755]'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <LayoutGrid size={14} />
              <span>By Category</span>
            </button>
          </div>

          <button
            onClick={() => setOnlyHomeVisit(!onlyHomeVisit)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-xs ${
              onlyHomeVisit
                ? 'bg-emerald-700 border-emerald-800 text-white shadow-emerald-900/20'
                : 'bg-white border-stone-200 text-stone-700 hover:border-emerald-500 hover:text-emerald-700'
            }`}
          >
            <span>🏠 Home Visit Available Only</span>
            {onlyHomeVisit && <span className="w-2 h-2 rounded-full bg-emerald-300" />}
          </button>
        </div>
      </div>

      {/* FULL RATE CARD VIEW (Items 1 to 21) */}
      {viewMode === 'BOARD' ? (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-md overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#E2B755] font-bold">
                Bloom Saloon • Official Service Menu
              </span>
              <h3 className="text-lg font-bold font-luxury">
                107/P, 3-13-94/11/A, Ramanthapur — Full Rate Card & Home Visit
              </h3>
            </div>
            <a
              href="tel:8309578606"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#E2B755] text-xs font-bold transition-colors"
            >
              <Phone size={13} />
              <span>Call: 8309578606</span>
            </a>
          </div>

          <div className="divide-y divide-stone-100">
            {displayedServices.map((srv, index) => (
              <div
                key={srv.id}
                className="p-4 sm:px-6 hover:bg-[#FDFBF7] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <span className="w-8 h-8 rounded-xl bg-[#FAF2DC] text-[#8F6C1E] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#E8DFC9]">
                    {index + 1}
                  </span>
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-stone-900 text-base font-luxury uppercase tracking-wide">
                        {srv.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-600">
                        {srv.category}
                      </span>
                      {srv.homeVisitAvailable && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          🏠 Home Visit Available (₹400)
                        </span>
                      )}
                      {srv.availableDays && srv.availableDays.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          🗓️ {srv.dayRestrictionNote || `Wednesdays Only`}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 max-w-xl">
                      {srv.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-stone-400">
                      <Clock size={12} className="text-[#B88728]" />
                      <span>{srv.duration} mins</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-stone-100">
                  <div className="text-left sm:text-right">
                    <span className="text-lg sm:text-xl font-extrabold text-stone-950 font-luxury block">
                      {srv.priceRange || formatCurrency(srv.price)}
                    </span>
                    <span className="text-[10px] text-stone-400 block">Board rate</span>
                  </div>

                  <button
                    onClick={() => onSelectServiceToBook(srv)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 text-[#E2B755] hover:bg-black transition-all active:scale-95 shadow-xs whitespace-nowrap"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* CATEGORY VIEW */
        <div className="space-y-8">
          {categories.map(cat => {
            const catServices = displayedServices.filter(s => s.category === cat && s.active);
            if (catServices.length === 0) return null;

            return (
              <div
                key={cat}
                className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden"
              >
                <div className="bg-[#FAF8F5] px-6 py-4 border-b border-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-stone-900 text-[#E2B755] flex items-center justify-center">
                      <Scissors size={15} />
                    </div>
                    <h3 className="text-lg font-bold text-stone-900 font-luxury tracking-wide">
                      {cat} Services
                    </h3>
                  </div>
                  <span className="text-xs text-stone-500 font-semibold">
                    {catServices.length} items
                  </span>
                </div>

                <div className="divide-y divide-stone-100">
                  {catServices.map(srv => (
                    <div
                      key={srv.id}
                      className="p-5 sm:px-6 hover:bg-[#FDFBF7] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-stone-900 text-base font-luxury uppercase">
                            {srv.name}
                          </h4>
                          {srv.homeVisitAvailable && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              🏠 Home Visit Available (₹400)
                            </span>
                          )}
                          {srv.availableDays && srv.availableDays.length > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              🗓️ {srv.dayRestrictionNote || `Wednesdays Only`}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 max-w-xl">
                          {srv.description}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-stone-400 pt-0.5">
                          <Clock size={12} className="text-[#B88728]" />
                          <span>Duration: {srv.duration} mins</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-stone-100">
                        <div className="text-left sm:text-right">
                          <span className="text-xl font-extrabold text-stone-950 font-luxury block">
                            {srv.priceRange || formatCurrency(srv.price)}
                          </span>
                          <span className="text-[10px] text-stone-400 block">Board rate</span>
                        </div>

                        <button
                          onClick={() => onSelectServiceToBook(srv)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 text-[#E2B755] hover:bg-black transition-all active:scale-95 shadow-xs"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
