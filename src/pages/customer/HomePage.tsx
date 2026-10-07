import React from 'react';
import { useSalon } from '../../context/SalonContext';
import { ServiceCard } from '../../components/customer/ServiceCard';
import { Tilt3D } from '../../components/cinematic/Tilt3D';
import { HeroHeadline3D } from '../../components/cinematic/HeroHeadline3D';
import { Service } from '../../types/salon';
import { formatCurrency } from '../../utils/formatters';
import {
  Scissors,
  Sparkles,
  Calendar,
  ShieldCheck,
  Award,
  HeartHandshake,
  Clock,
  ArrowRight,
  Star,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onSelectServiceToBook: (service: Service) => void;
  onOpenBooking: () => void;
  onOpenInstallApp?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectServiceToBook,
  onOpenBooking,
  onOpenInstallApp,
}) => {
  const { services, businessHours, settings } = useSalon();

  // Popular / featured services
  const popularServices = services.filter(s => s.featured && s.active).slice(0, 6);

  return (
    <div className="space-y-20 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#F4EFE6] to-[#FAF8F5] pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-[#E8DFD0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900 text-[#E2B755] text-xs font-semibold tracking-wide shadow-sm">
                <Scissors size={14} />
                <span>Bloom Saloon • Official Rate Card Services</span>
              </div>

              {/* 3D Extruded Heading with Parallax Tilt */}
              <HeroHeadline3D />

              <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Welcome to <strong>Bloom Saloon</strong>. Book your next appointment online for haircuts, foam shaving, facials, d-tan, hair spas, and styling at transparent rates.
              </p>

              {/* Owners tag */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs sm:text-sm text-stone-700">
                <a
                  href="tel:8309578606"
                  className="flex items-center gap-2 bg-[#FAF2DC] border border-[#E4D1A0] text-[#8F6C1E] font-bold px-3.5 py-1.5 rounded-xl shadow-xs hover:bg-[#faebd0]"
                >
                  <span>📞 Call: <strong>8309578606</strong></span>
                </a>
                <div className="flex items-center gap-1.5 text-stone-600">
                  <Star size={15} className="text-amber-500 fill-amber-500" />
                  <span className="font-bold text-stone-900">4.9 / 5</span>
                  <span>(107/P, 3-13-94/11/A, Ramanthapur)</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <button
                  onClick={onOpenBooking}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-stone-900 bg-gradient-to-r from-[#F0D58C] via-[#E2B755] to-[#D4A137] hover:shadow-xl hover:shadow-amber-500/25 active:scale-95 transition-all shadow-md font-luxury cursor-pointer"
                >
                  <Calendar size={18} />
                  <span>Book an Appointment</span>
                </button>

                <button
                  onClick={() => onNavigate('services')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-base font-semibold text-stone-800 bg-white border border-stone-200/90 hover:bg-stone-50 hover:text-stone-950 transition-all shadow-xs cursor-pointer"
                >
                  <span>Explore Services</span>
                  <ArrowRight size={17} />
                </button>

                {onOpenInstallApp && (
                  <button
                    onClick={onOpenInstallApp}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-base font-bold text-stone-900 bg-[#FAF2DC] border border-[#E2B755] hover:bg-[#faebd0] transition-all shadow-xs cursor-pointer"
                  >
                    <Smartphone size={18} className="text-[#8F6C1E]" />
                    <span>Download Android APK</span>
                  </button>
                )}
              </div>

              {/* Micro highlights */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-stone-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>No Waiting Time</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>Instant Confirmation</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#FAF2DC] px-2.5 py-1 rounded-full text-[#8F6C1E] font-bold border border-[#E8DFC9]">
                  <span>🏠 Home Visit Available (₹400)</span>
                </div>
              </div>
            </div>

            {/* Right Visual Image Showcase with 3D Cinematic Depth */}
            <div className="lg:col-span-5 relative">
              <Tilt3D maxTilt={10} scale={1.03} depth={15}>
                <div className="relative mx-auto max-w-md lg:max-w-none preserve-3d">
                  {/* Main Hero Photo */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/90 aspect-[4/5] bg-stone-200 cinematic-glow translate-z-10">
                    <img
                      src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=80"
                      alt="Bloom Saloon Grooming"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white translate-z-20">
                      <span className="text-xs uppercase tracking-widest text-[#E2B755] font-bold">
                        Master Stylist Chair
                      </span>
                      <h3 className="text-xl font-bold font-luxury mt-1">
                        Bloom Saloon Signature Care
                      </h3>
                      <p className="text-xs text-stone-300 mt-1">
                        107/P, 3-13-94/11/A, Ramanthapur, Hyderabad • Call: 8309578606
                      </p>
                    </div>
                  </div>

                  {/* Floating promo badge */}
                  <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-stone-200 hidden sm:flex items-center gap-3 translate-z-30">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 text-[#9C7A28] flex items-center justify-center font-bold text-sm">
                      10%
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-900 block font-luxury">WELCOME10</span>
                      <span className="text-[11px] text-stone-500">10% OFF on 1st Appointment</span>
                    </div>
                  </div>
                </div>
              </Tilt3D>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-[#9C7A28]">
            Excellence & Precision
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-luxury">
            Why Choose Us
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            At Bloom Saloon, we combine decades of classic barbering mastery with modern aesthetic styling techniques.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#9C7A28] flex items-center justify-center">
              <Award size={24} />
            </div>
            <h3 className="text-lg font-bold text-stone-900 font-luxury">Experienced Professionals</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Every haircut, beard contour, and facial is personally curated by master barbers with deep aesthetic expertise.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#9C7A28] flex items-center justify-center">
              <Scissors size={24} />
            </div>
            <h3 className="text-lg font-bold text-stone-900 font-luxury">Premium Salon Services</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              From ammonia-free hair colors to restorative keratin spas and gold facials, we use only top-tier organic salon products.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#9C7A28] flex items-center justify-center">
              <Calendar size={24} />
            </div>
            <h3 className="text-lg font-bold text-stone-900 font-luxury">Easy Online Booking</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Reserve your preferred chair in under 60 seconds. Real-time availability, zero wait lines, and instant confirmation.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#9C7A28] flex items-center justify-center">
              <HeartHandshake size={24} />
            </div>
            <h3 className="text-lg font-bold text-stone-900 font-luxury">Personalized Care</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Tailored consultations suited to your face shape, scalp health, lifestyle, and individual grooming habits.
            </p>
          </div>
        </div>
      </section>

      {/* POPULAR SERVICES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-[#9C7A28]">
              Client Favorites
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-luxury mt-1">
              Popular Services
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Hand-picked styling and therapy experiences most loved by our Hyderabad clientele.
            </p>
          </div>

          <button
            onClick={() => onNavigate('services')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#9C7A28] hover:text-stone-900 transition-colors"
          >
            <span>View All Services & Home Visits ({services.length})</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularServices.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              onBookNow={onSelectServiceToBook}
            />
          ))}
        </div>
      </section>

      {/* OPENING HOURS & SALON PROFILE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1C1B20] text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-stone-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs uppercase tracking-widest text-[#E2B755] font-bold">
                Visit Bloom Saloon
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-luxury">
                Opening Hours & Location
              </h3>
              <p className="text-sm text-stone-300 leading-relaxed">
                Step into Bloom Saloon at 107/P, 3-13-94/11/A, Ramanthapur, Hyderabad. We operate seven days a week from 7:00 AM to 9:30 PM to accommodate busy professionals and weekend grooming routines.
              </p>
              <div className="pt-2 text-xs text-stone-400 space-y-1">
                <p><strong>Saloon Name:</strong> Bloom Saloon</p>
                <p><strong>Address:</strong> 107/P, 3-13-94/11/A, Ramanthapur, Hyderabad, Telangana</p>
                <p><strong>Phone:</strong> <a href="tel:8309578606" className="text-[#E2B755] font-bold hover:underline">8309578606</a></p>
              </div>
              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={onOpenBooking}
                  className="px-6 py-3 rounded-xl bg-[#E2B755] text-stone-900 font-bold text-sm hover:bg-[#fad886] transition-colors"
                >
                  Book Appointment Online
                </button>
                <a
                  href="tel:8309578606"
                  className="px-5 py-3 rounded-xl bg-stone-800 text-stone-200 font-bold text-xs hover:bg-stone-700 transition-colors"
                >
                  Call: 8309578606
                </a>
              </div>
            </div>

            <div className="lg:col-span-6 bg-stone-900/80 rounded-2xl p-6 border border-stone-800 space-y-2.5">
              <div className="text-xs uppercase tracking-wider text-[#E2B755] font-bold mb-3 flex items-center gap-1.5">
                <Clock size={14} />
                <span>Operating Timings</span>
              </div>
              <div className="divide-y divide-stone-800 text-sm">
                <div className="py-2 flex justify-between">
                  <span className="text-stone-400 font-medium">Monday</span>
                  <span className="font-bold text-stone-200">7:00 AM – 9:30 PM</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-stone-400 font-medium">Tuesday</span>
                  <span className="font-bold text-stone-200">7:00 AM – 9:30 PM</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-stone-400 font-medium">Wednesday</span>
                  <span className="font-bold text-stone-200">7:00 AM – 9:30 PM</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-stone-400 font-medium">Thursday</span>
                  <span className="font-bold text-stone-200">7:00 AM – 9:30 PM</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-stone-400 font-medium">Friday</span>
                  <span className="font-bold text-stone-200">7:00 AM – 9:30 PM</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-stone-400 font-medium">Saturday</span>
                  <span className="font-bold text-stone-200">7:00 AM – 9:30 PM</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-stone-400 font-medium">Sunday</span>
                  <span className="font-bold text-stone-200">7:00 AM – 9:30 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
