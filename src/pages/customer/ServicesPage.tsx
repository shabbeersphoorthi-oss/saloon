import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { ServiceCard } from '../../components/customer/ServiceCard';
import { Service } from '../../types/salon';
import { Search, Scissors, Sparkles } from 'lucide-react';

interface ServicesPageProps {
  onSelectServiceToBook: (service: Service) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onSelectServiceToBook }) => {
  const { services } = useSalon();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['ALL', 'Hair', 'Grooming', 'Skin & Facial', 'Packages'];

  const filteredServices = services.filter(service => {
    if (!service.active) return false;
    const matchesCategory =
      selectedCategory === 'ALL' || service.category === selectedCategory;
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest uppercase text-[#9C7A28]">
          Bloom Saloon • Official Rate Card Menu
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 font-luxury">
          Saloon Services
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed">
          Official rate card services of <strong>Bloom Saloon</strong>. For quick appointments and inquiries, call <a href="tel:8309578606" className="text-[#9C7A28] font-bold hover:underline">8309578606</a>.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200/70 hover:text-stone-900'
              }`}
            >
              {cat === 'ALL' ? 'All Services' : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
          />
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-stone-200 text-stone-500">
          No services match your search or selected category.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              onBookNow={onSelectServiceToBook}
            />
          ))}
        </div>
      )}
    </div>
  );
};
