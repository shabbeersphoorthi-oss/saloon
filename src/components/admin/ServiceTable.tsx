import React, { useState } from 'react';
import { Service, ServiceCategory } from '../../types/salon';
import { formatCurrency } from '../../utils/formatters';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Clock,
  Scissors,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

interface ServiceTableProps {
  services: Service[];
  onAddService: () => void;
  onEditService: (service: Service) => void;
  onDeleteService: (service: Service) => void;
  onToggleActive: (id: string) => void;
}

export const ServiceTable: React.FC<ServiceTableProps> = ({
  services,
  onAddService,
  onEditService,
  onDeleteService,
  onToggleActive,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Hair', 'Grooming', 'Skin & Facial', 'Packages'];

  const filtered = services.filter(s =>
    selectedCategory === 'ALL' ? true : s.category === selectedCategory
  );

  return (
    <div className="space-y-4">
      {/* Category Tabs & Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat === 'ALL' ? 'All Services' : cat}
            </button>
          ))}
        </div>

        <button
          onClick={onAddService}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 text-[#E2B755] hover:bg-black transition-all shadow-sm active:scale-95"
        >
          <Plus size={15} />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(srv => {
          const hasDiscount = Boolean(srv.discountPrice && srv.discountPrice < srv.price);

          return (
            <div
              key={srv.id}
              className={`bg-white rounded-3xl border overflow-hidden p-5 flex flex-col justify-between transition-all ${
                srv.active
                  ? 'border-stone-200/80 shadow-xs hover:shadow-md'
                  : 'border-stone-200 bg-stone-50/70 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={srv.image}
                      alt={srv.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-stone-100 shadow-xs shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#FAF2DC] text-[#8F6C1E]">
                          {srv.category}
                        </span>
                        {srv.featured && (
                          <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                            <Sparkles size={11} /> Featured
                          </span>
                        )}
                        {srv.homeVisitAvailable && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            🏠 Home Visit (₹400)
                          </span>
                        )}
                        {srv.availableDays && srv.availableDays.length > 0 && (
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                            🗓️ {srv.availableDays.join(', ')}s Only
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-stone-900 mt-1 font-luxury text-base">
                        {srv.name}
                      </h4>
                    </div>
                  </div>

                  {/* Active Toggle Switch */}
                  <button
                    onClick={() => onToggleActive(srv.id)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      srv.active ? 'bg-emerald-600' : 'bg-stone-300'
                    }`}
                    title={srv.active ? 'Active on booking menu' : 'Disabled'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        srv.active ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-xs text-stone-500 mt-3 line-clamp-2 leading-relaxed">
                  {srv.description}
                </p>

                <div className="flex items-center gap-3 mt-3 text-xs text-stone-600">
                  <div className="flex items-center gap-1 font-medium">
                    <Clock size={13} className="text-[#B88728]" />
                    <span>{srv.duration} mins</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-baseline gap-1.5 font-bold text-stone-900">
                    <span>{formatCurrency(hasDiscount ? srv.discountPrice! : srv.price)}</span>
                    {hasDiscount && (
                      <span className="text-[10px] text-stone-400 line-through">
                        {formatCurrency(srv.price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => onEditService(srv)}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-1"
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDeleteService(srv)}
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
