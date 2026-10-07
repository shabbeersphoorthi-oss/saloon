import React, { useState, useEffect, useMemo } from 'react';
import { useSalon } from '../../context/SalonContext';
import { useAuth } from '../../context/AuthContext';
import { Service, Offer, Appointment } from '../../types/salon';
import { BookingCalendar } from '../../components/customer/BookingCalendar';
import { TimeSlotPicker } from '../../components/customer/TimeSlotPicker';
import { BookingSummary } from '../../components/customer/BookingSummary';
import { Tilt3D } from '../../components/cinematic/Tilt3D';
import { validateCoupon } from '../../utils/bookingLogic';
import { formatCurrency, formatDate, generateBookingId, calculateEndTime } from '../../utils/formatters';
import {
  Scissors,
  Calendar,
  Clock,
  User,
  Tag,
  CheckCircle2,
  CalendarPlus,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  ShieldCheck,
  Check,
  AlertCircle,
  HelpCircle,
  X,
} from 'lucide-react';

interface BookingPageProps {
  initialService?: Service | null;
  initialCouponCode?: string;
  onNavigate: (tab: string) => void;
  onClearInitialService?: () => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  initialService,
  initialCouponCode = '',
  onNavigate,
  onClearInitialService,
}) => {
  const {
    services,
    offers,
    appointments,
    businessHours,
    blockedDates,
    settings,
    createAppointment,
    showToast,
  } = useSalon();
  const { currentCustomer } = useAuth();

  // Multi-step indicator: 1 = Services, 2 = Date, 3 = Time, 4 = Details, 5 = Discount & Review
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Booking selections
  const [selectedServices, setSelectedServices] = useState<Service[]>(() => {
    if (initialService) return [initialService];
    const defaultSrv = services.find(s => s.id === 'srv-haircut') || services[0];
    return defaultSrv ? [defaultSrv] : [];
  });

  // If initialService prop changes, update selection
  useEffect(() => {
    if (initialService) {
      setSelectedServices(prev => {
        const exists = prev.some(s => s.id === initialService.id);
        return exists ? prev : [...prev, initialService];
      });
    }
  }, [initialService]);

  // Date selection
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Default to tomorrow's date or today if salon is open
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  // Time selection
  const [selectedTime, setSelectedTime] = useState<string>('10:00 AM');

  // Customer details
  const [fullName, setFullName] = useState<string>(currentCustomer?.name || 'Rahul Kumar');
  const [mobileNumber, setMobileNumber] = useState<string>(currentCustomer?.phone || '8309578606');
  const [email, setEmail] = useState<string>(currentCustomer?.email || 'customer@example.com');
  const [notes, setNotes] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');

  // Home Visit Option (strictly for Hair Cutting Only)
  const [isHomeVisit, setIsHomeVisit] = useState<boolean>(() => {
    return initialService?.name.toLowerCase().includes('home visit') || false;
  });
  const [homeAddress, setHomeAddress] = useState<string>('');
  const [addressError, setAddressError] = useState<string>('');
  const homeVisitFee = isHomeVisit ? 400 : 0;

  // Check if Hair Cutting Only is among the selected services
  const isHomeVisitEligible = useMemo(() => {
    return selectedServices.some(
      s => s.homeVisitAvailable || s.name.toLowerCase() === 'hair cutting only' || s.id === 'srv-3'
    );
  }, [selectedServices]);

  // If home visit is checked but user removes Hair Cutting Only, auto-reset isHomeVisit
  useEffect(() => {
    if (isHomeVisit && !isHomeVisitEligible) {
      setIsHomeVisit(false);
      showToast('Home visit was removed: only available with Hair Cutting Only.', 'info');
    }
  }, [isHomeVisit, isHomeVisitEligible, showToast]);

  // Check if any selected service has specific allowed weekdays (e.g. Baby Hair Cutting on Wednesdays only)
  const allowedWeekdays = useMemo(() => {
    const restricted = selectedServices.filter(s => s.availableDays && s.availableDays.length > 0);
    if (restricted.length === 0) return undefined;
    return restricted[0].availableDays;
  }, [selectedServices]);

  // Helper to get next Wednesday date (YYYY-MM-DD)
  const getNextWednesdayDate = (): string => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday
    const dayOfWeek = d.getDay();
    const diff = (3 - dayOfWeek + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
  };

  // If a weekday-restricted service is selected (Baby Hair Cutting) and selectedDate is not a Wednesday, auto-adjust
  useEffect(() => {
    if (allowedWeekdays && allowedWeekdays.length > 0 && selectedDate) {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      if (!allowedWeekdays.some(w => w.toLowerCase() === dayName.toLowerCase())) {
        const nextWed = getNextWednesdayDate();
        setSelectedDate(nextWed);
        showToast('Baby Hair Cutting is available only on Wednesdays. Date set to upcoming Wednesday.', 'info');
      }
    }
  }, [allowedWeekdays, selectedDate, showToast]);

  const handleToggleHomeVisit = (checked: boolean) => {
    if (checked) {
      if (!isHomeVisitEligible) {
        const hairCuttingSrv = services.find(
          s => s.id === 'srv-3' || s.name.toLowerCase() === 'hair cutting only'
        );
        if (hairCuttingSrv && !selectedServices.some(s => s.id === hairCuttingSrv.id)) {
          setSelectedServices(prev => [...prev, hairCuttingSrv]);
          showToast('Added "Hair Cutting Only" to your booking for Home Visit!', 'success');
        }
      }
      setIsHomeVisit(true);
    } else {
      setIsHomeVisit(false);
    }
  };

  // Discount & Coupon
  const [couponInput, setCouponInput] = useState<string>(initialCouponCode || 'BLOOM10');
  const [appliedCoupon, setAppliedCoupon] = useState<Offer | undefined>(undefined);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string>('');
  const [couponError, setCouponError] = useState<string>('');

  // Submission & Confirmed state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);

  // Calculations
  const totalDuration = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.duration, 0);
  }, [selectedServices]);

  const subtotal = useMemo(() => {
    return selectedServices.reduce((sum, s) => {
      const price = s.discountPrice && s.discountPrice < s.price ? s.discountPrice : s.price;
      return sum + price;
    }, 0);
  }, [selectedServices]);

  // Recalculate coupon discount whenever subtotal or coupon changes
  useEffect(() => {
    if (couponInput && subtotal > 0) {
      const res = validateCoupon(
        couponInput,
        subtotal,
        selectedServices.map(s => s.id),
        offers
      );
      if (res.isValid) {
        setAppliedCoupon(res.appliedOffer);
        setCouponDiscount(res.discount);
        setCouponMessage(res.message);
        setCouponError('');
      } else {
        setAppliedCoupon(undefined);
        setCouponDiscount(0);
        setCouponMessage('');
        // Don't show hard error unless user explicitly verified
      }
    }
  }, [couponInput, subtotal, selectedServices, offers]);

  const finalTotal = Math.max(0, subtotal + homeVisitFee - couponDiscount);

  // Service toggling & deselecting
  const handleToggleService = (srv: Service) => {
    const exists = selectedServices.some(s => s.id === srv.id);
    if (exists) {
      setSelectedServices(prev => prev.filter(s => s.id !== srv.id));
      showToast(`Deselected "${srv.name}"`, 'info');
    } else {
      setSelectedServices(prev => [...prev, srv]);
      showToast(`Added "${srv.name}"`, 'success');
    }
  };

  const handleDeselectService = (serviceId: string) => {
    const target = selectedServices.find(s => s.id === serviceId);
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
    if (target) {
      showToast(`Deselected "${target.name}"`, 'info');
    }
  };

  const handleApplyCouponManually = () => {
    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code.');
      setCouponDiscount(0);
      setAppliedCoupon(undefined);
      return;
    }

    const res = validateCoupon(
      couponInput,
      subtotal,
      selectedServices.map(s => s.id),
      offers
    );

    if (res.isValid) {
      setAppliedCoupon(res.appliedOffer);
      setCouponDiscount(res.discount);
      setCouponMessage(res.message);
      setCouponError('');
      showToast(`Coupon "${couponInput.toUpperCase()}" applied!`, 'success');
    } else {
      setAppliedCoupon(undefined);
      setCouponDiscount(0);
      setCouponMessage('');
      setCouponError(res.message);
      showToast(res.message, 'error');
    }
  };

  // Validation before going to next step
  const handleNext = () => {
    if (currentStep === 1) {
      if (selectedServices.length === 0) {
        showToast('Please select at least one salon service.', 'error');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedDate) {
        showToast('Please choose an appointment date.', 'error');
        return;
      }
      if (allowedWeekdays && allowedWeekdays.length > 0) {
        const [y, m, d] = selectedDate.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        if (!allowedWeekdays.some(w => w.toLowerCase() === dayName.toLowerCase())) {
          showToast(`This service is available only on ${allowedWeekdays.join(', ')}s. Please choose a Wednesday.`, 'error');
          return;
        }
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!selectedTime) {
        showToast('Please pick an available time slot.', 'error');
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      // Validate customer form
      if (!fullName.trim()) {
        showToast('Please enter your full name.', 'error');
        return;
      }
      const cleanPhone = mobileNumber.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        setPhoneError('Please enter a valid 10-digit mobile number.');
        showToast('Please enter a valid mobile number.', 'error');
        return;
      }
      setPhoneError('');

      if (isHomeVisit && !homeAddress.trim()) {
        setAddressError('Please enter your complete doorstep address and landmark.');
        showToast('Please enter your home visit address.', 'error');
        return;
      }
      setAddressError('');
      setCurrentStep(5);
    }
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  // Final Confirmation Submit
  const handleConfirmAppointment = async () => {
    setIsSubmitting(true);
    const bookingId = generateBookingId(selectedDate);
    const endTime = calculateEndTime(selectedTime, totalDuration);

    const bookingPayload = {
      bookingId,
      customerId: currentCustomer?.id || `cust-${Date.now()}`,
      customerName: fullName.trim(),
      customerPhone: mobileNumber.trim(),
      customerEmail: email.trim(),
      serviceIds: selectedServices.map(s => s.id),
      serviceNames: isHomeVisit && !selectedServices.some(s => s.name.toLowerCase().includes('home visit'))
        ? [...selectedServices.map(s => s.name), 'Home Visit Service Option']
        : selectedServices.map(s => s.name),
      appointmentDate: selectedDate,
      startTime: selectedTime,
      endTime,
      duration: totalDuration + (isHomeVisit ? 15 : 0),
      subtotal: subtotal + homeVisitFee,
      discount: couponDiscount,
      total: finalTotal,
      couponCode: appliedCoupon ? appliedCoupon.couponCode : undefined,
      status: 'Confirmed' as const,
      isHomeVisit,
      homeVisitFee,
      homeAddress: isHomeVisit ? homeAddress.trim() : undefined,
      notes: isHomeVisit
        ? `${notes ? notes + ' | ' : ''}DOORSTEP HOME ADDRESS: ${homeAddress.trim()}`
        : notes.trim() || undefined,
    };

    const res = await createAppointment(bookingPayload);
    setIsSubmitting(false);

    if (res.success && res.appointment) {
      setConfirmedBooking(res.appointment);
      if (onClearInitialService) onClearInitialService();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Google Calendar Link generator for confirmed screen
  const getGoogleCalendarUrl = (booking: Appointment) => {
    const title = encodeURIComponent(`Bloom Saloon: ${booking.serviceNames.join(', ')}`);
    const details = encodeURIComponent(
      `Appointment at Bloom Saloon (107/P, 3-13-94/11/A, Ramanthapur, Hyderabad)\nBooking ID: ${booking.bookingId}\nServices: ${booking.serviceNames.join(', ')}\nTotal: ${formatCurrency(booking.total)}\nPhone: 8309578606`
    );
    const location = encodeURIComponent(settings.address);
    const dateFormatted = booking.appointmentDate.replace(/-/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dateFormatted}T090000Z/${dateFormatted}T100000Z`;
  };

  // ===============================
  // CONFIRMATION SUCCESS SCREEN
  // ===============================
  if (confirmedBooking) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8DFC9] shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
          {/* Success Check Icon */}
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 size={42} />
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest text-[#9C7A28] font-bold">
              Chair Reserved Successfully
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-luxury mt-1">
              Appointment Confirmed!
            </h1>
            <p className="text-sm text-stone-600 mt-2 max-w-md mx-auto">
              Your appointment has been registered and sent directly to <strong>Bloom Saloon Admin</strong>. The salon team is expecting you.
            </p>
          </div>

          {/* Ticket Card */}
          <div className="bg-[#FAF8F5] rounded-2xl p-6 border border-stone-200/80 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200/60 pb-3">
              <div>
                <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block">
                  Booking ID
                </span>
                <span className="text-base font-mono font-extrabold text-stone-900">
                  {confirmedBooking.bookingId}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Confirmed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-stone-400 block">Customer</span>
                <span className="font-bold text-stone-900 text-sm">{confirmedBooking.customerName}</span>
                <div className="text-stone-500">{confirmedBooking.customerPhone}</div>
              </div>

              <div>
                <span className="text-stone-400 block">Saloon & Contact</span>
                <span className="font-bold text-stone-900 text-sm">Bloom Saloon</span>
                <div className="text-stone-500">Call: 8309578606</div>
              </div>

              <div>
                <span className="text-stone-400 block">Service Location & Format</span>
                <span className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  {confirmedBooking.isHomeVisit ? (
                    <span className="text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full text-xs font-bold border border-amber-300">
                      🏠 Doorstep Home Visit (+₹400)
                    </span>
                  ) : (
                    <span>🪑 In-Saloon Chair</span>
                  )}
                </span>
                <div className="text-stone-500 mt-0.5">
                  {confirmedBooking.isHomeVisit
                    ? `Address: ${confirmedBooking.homeAddress || 'At customer premises'}`
                    : 'Bloom Saloon, 107/P, 3-13-94/11/A, Ramanthapur, Hyderabad'}
                </div>
              </div>

              <div>
                <span className="text-stone-400 block">Date & Time</span>
                <span className="font-bold text-stone-900 text-sm">
                  {formatDate(confirmedBooking.appointmentDate)}
                </span>
                <div className="text-stone-500">
                  {confirmedBooking.startTime} – {confirmedBooking.endTime} ({confirmedBooking.duration} mins)
                </div>
              </div>

              <div>
                <span className="text-stone-400 block">Amount Payable</span>
                <span className="text-xl font-extrabold text-stone-950 font-luxury">
                  {formatCurrency(confirmedBooking.total)}
                </span>
                {confirmedBooking.isHomeVisit && (
                  <div className="text-[#8F6C1E] text-[11px] font-semibold">
                    Includes ₹400 Home Visit fee
                  </div>
                )}
                {confirmedBooking.couponCode && (
                  <div className="text-emerald-700 font-semibold">
                    Saved {formatCurrency(confirmedBooking.discount)} via {confirmedBooking.couponCode}
                  </div>
                )}
              </div>

              <div className="col-span-1 sm:col-span-2 pt-2 border-t border-stone-200/60">
                <span className="text-stone-400 block">Booked Services</span>
                <span className="font-semibold text-stone-800">
                  {confirmedBooking.serviceNames.join(' • ')}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs text-[#8F6C1E]">
            ℹ️ <strong>Note:</strong> All bookings are managed directly inside the <strong>Bloom Saloon Admin Panel</strong>. Need to change your time? Call <strong>8309578606</strong>.
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={getGoogleCalendarUrl(confirmedBooking)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-stone-900 text-[#E2B755] font-semibold text-xs hover:bg-black transition-all shadow-sm"
            >
              <CalendarPlus size={16} />
              <span>Add to Google Calendar</span>
            </a>

            <button
              onClick={() => {
                setConfirmedBooking(null);
                setCurrentStep(1);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-100 text-stone-800 font-semibold text-xs hover:bg-stone-200 transition-colors"
            >
              Book Another Service
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-stone-200 text-stone-600 font-semibold text-xs hover:bg-stone-50 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===============================
  // MULTI-STEP BOOKING FLOW
  // ===============================
  const stepTitles = [
    'Select Services',
    'Choose Date',
    'Pick Time Slot',
    'Your Details',
    'Coupons & Summary',
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold tracking-widest uppercase text-[#9C7A28]">
          Bloom Saloon Booking Engine
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 font-luxury">
          Reserve Your Chair
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Bloom Saloon • 107/P, 3-13-94/11/A, Ramanthapur, Hyderabad • Call: <strong>8309578606</strong>
        </p>
      </div>

      {/* Progress Steps Header */}
      <div className="bg-white p-3 sm:p-4 rounded-3xl border border-stone-200/80 shadow-xs">
        <div className="grid grid-cols-5 gap-1 text-center">
          {stepTitles.map((title, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div key={title} className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-stone-900 text-[#E2B755] ring-2 ring-[#E2B755]/40 shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-100 text-stone-400'
                  }`}
                >
                  {isCompleted ? <Check size={14} /> : stepNum}
                </div>
                <span
                  className={`text-[10px] sm:text-xs mt-1.5 hidden sm:block font-semibold truncate ${
                    isCurrent ? 'text-stone-900' : 'text-stone-400'
                  }`}
                >
                  {title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN STEP PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Area (Steps 1 to 5) */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: Select Services */}
          {currentStep === 1 && (
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-stone-900 font-luxury">
                    Step 1: Choose Service(s)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Select one or combine multiple services (Haircut, Beard, Facial, Spa).
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FAF2DC] text-[#8F6C1E]">
                  {selectedServices.length} Selected
                </span>
              </div>

              {/* Selected Services Active Pills with 1-click Deselect */}
              {selectedServices.length > 0 ? (
                <div className="bg-[#FAF8F3] p-3.5 rounded-2xl border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-900 flex items-center gap-1.5">
                      <Scissors size={14} className="text-[#9C7A28]" />
                      <span>Added to Your Booking ({selectedServices.length})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedServices([]);
                        showToast('All services deselected.', 'info');
                      }}
                      className="text-[11px] font-semibold text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {selectedServices.map(srv => (
                      <span
                        key={srv.id}
                        className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-xl bg-white border border-amber-300 text-xs font-semibold text-stone-900 shadow-xs"
                      >
                        <span>{srv.name}</span>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleDeselectService(srv.id);
                          }}
                          className="w-4 h-4 rounded-full bg-stone-100 hover:bg-rose-100 hover:text-rose-700 text-stone-400 flex items-center justify-center transition-colors cursor-pointer"
                          title={`Deselect ${srv.name}`}
                          aria-label={`Deselect ${srv.name}`}
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-dashed border-stone-200 text-center text-xs text-stone-500">
                  No services selected. Tap any service below to add it to your appointment.
                </div>
              )}

              {/* Home Visit option callout & toggle in services step (Exclusively for Hair Cutting Only) */}
              <div className="bg-[#F0FAF4] border border-emerald-200/90 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🏠</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-950 block">
                        Home Visit Available Option (+₹400)
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        Hair Cutting Only
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-800 block mt-0.5">
                      Doorstep haircutting service by Bloom Saloon stylists at your home across Ramanthapur & Hyderabad.
                    </span>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-emerald-300 text-xs font-bold text-emerald-800 shrink-0 hover:bg-emerald-50 transition-colors shadow-xs">
                  <input
                    type="checkbox"
                    checked={isHomeVisit}
                    onChange={e => handleToggleHomeVisit(e.target.checked)}
                    className="rounded border-emerald-400 text-emerald-700 focus:ring-emerald-600"
                  />
                  <span>Select Home Visit</span>
                </label>
              </div>

              {/* Service Selection List */}
              <div className="divide-y divide-stone-100 max-h-[460px] overflow-y-auto pr-1">
                {services
                  .filter(s => s.active)
                  .map(srv => {
                    const isSelected = selectedServices.some(s => s.id === srv.id);
                    const price =
                      srv.discountPrice && srv.discountPrice < srv.price
                        ? srv.discountPrice
                        : srv.price;

                    return (
                      <div
                        key={srv.id}
                        onClick={() => handleToggleService(srv)}
                        className={`py-3 px-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#FAF6EC] border border-[#E5D7B1]'
                            : 'hover:bg-stone-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={srv.image}
                            alt={srv.name}
                            className="w-12 h-12 rounded-xl object-cover border shrink-0"
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-bold text-stone-900 text-sm font-luxury">
                                {srv.name}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-medium">
                                {srv.category}
                              </span>
                              {srv.homeVisitAvailable && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                                  🏠 Home Visit Available
                                </span>
                              )}
                              {srv.availableDays && srv.availableDays.length > 0 && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                                  🗓️ {srv.dayRestrictionNote || `Wednesdays Only • ₹1000`}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-stone-400 mt-0.5 flex items-center gap-2">
                              <span>{srv.duration} mins</span>
                              <span>•</span>
                              <span className="font-bold text-stone-800">
                                {formatCurrency(price)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-1 rounded-xl border border-amber-300 flex items-center gap-1">
                              <Check size={12} />
                              <span>Added</span>
                            </span>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleDeselectService(srv.id);
                              }}
                              className="py-1 px-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                              title={`Deselect ${srv.name}`}
                            >
                              <X size={12} />
                              <span>Deselect</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              handleToggleService(srv);
                            }}
                            className="py-1 px-3 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-900 hover:text-[#E2B755] text-stone-700 border border-stone-200 flex items-center gap-1 transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
                          >
                            <Plus size={13} />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* STEP 2: Select Date */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs mb-2">
                <h3 className="text-lg font-bold text-stone-900 font-luxury">
                  Step 2: Select Appointment Date
                </h3>
                <p className="text-xs text-stone-500">
                  {allowedWeekdays && allowedWeekdays.length > 0
                    ? `Selected service requires appointment on ${allowedWeekdays.join(', ')}s only.`
                    : 'Salon open Monday to Sunday. Past dates and maintenance holidays are disabled.'}
                </p>
              </div>

              {allowedWeekdays && allowedWeekdays.length > 0 && (
                <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-amber-950 mb-2 shadow-xs">
                  <span className="text-xl shrink-0">🗓️</span>
                  <div className="text-xs space-y-1">
                    <strong className="block text-sm font-bold text-amber-900 font-luxury">
                      Wednesday Schedule Active
                    </strong>
                    <p className="text-amber-800 leading-relaxed">
                      Your booking includes <strong>Baby Hair Cutting (₹1000)</strong>, which is exclusively available on <strong>Wednesdays</strong>. All non-Wednesday dates on the calendar are automatically locked.
                    </p>
                  </div>
                </div>
              )}

              <BookingCalendar
                selectedDate={selectedDate}
                onSelectDate={date => setSelectedDate(date)}
                hoursList={businessHours}
                blockedDates={blockedDates}
                allowedWeekdays={allowedWeekdays}
              />
            </div>
          )}

          {/* STEP 3: Select Time Slot */}
          {currentStep === 3 && (
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-5 animate-in fade-in">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-lg font-bold text-stone-900 font-luxury">
                  Step 3: Select Time Slot
                </h3>
                <p className="text-xs text-stone-500">
                  Available chairs on <strong>{formatDate(selectedDate)}</strong> for a{' '}
                  <strong>{totalDuration}-minute</strong> session with R & S Srinivas (7:00 AM – 9:30 PM).
                </p>
              </div>

              <TimeSlotPicker
                selectedDate={selectedDate}
                totalDurationMinutes={totalDuration}
                selectedTime={selectedTime}
                onSelectTime={time => setSelectedTime(time)}
                hoursList={businessHours}
                existingAppointments={appointments}
                blockedDates={blockedDates}
              />
            </div>
          )}

          {/* STEP 4: Customer Details & Service Location */}
          {currentStep === 4 && (
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-5 animate-in fade-in">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-lg font-bold text-stone-900 font-luxury">
                  Step 4: Location & Contact Details
                </h3>
                <p className="text-xs text-stone-500">
                  Choose between in-saloon appointment or doorstep home visit (₹400), and enter contact details.
                </p>
              </div>

              {/* Service Location Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  Service Format / Location *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsHomeVisit(false);
                      setAddressError('');
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      !isHomeVisit
                        ? 'border-[#C59B27] bg-[#FAF8F5] shadow-xs ring-2 ring-[#C59B27]/30'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                        <span>🪑 In-Saloon Chair</span>
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Included
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1.5">
                      Visit Bloom Saloon at 107/P, 3-13-94/11/A, Ramanthapur, Hyderabad.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isHomeVisitEligible) {
                        showToast('Home Visit is only available when "Hair Cutting Only" is selected.', 'error');
                        return;
                      }
                      setIsHomeVisit(true);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      !isHomeVisitEligible
                        ? 'border-stone-200 bg-stone-50/80 opacity-70 cursor-not-allowed'
                        : isHomeVisit
                        ? 'border-[#C59B27] bg-[#FAF8F5] shadow-xs ring-2 ring-[#C59B27]/30'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                        <span>🏠 Home Visit Option</span>
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        !isHomeVisitEligible
                          ? 'bg-stone-100 text-stone-500 border-stone-200'
                          : 'bg-[#FAF2DC] text-[#8F6C1E] border-[#E8DFC9]'
                      }`}>
                        {isHomeVisitEligible ? '+₹400' : 'Hair Cut Only'}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1.5">
                      {isHomeVisitEligible
                        ? 'Doorstep haircutting visit at your home with sanitized tools.'
                        : 'Exclusively available when "Hair Cutting Only" is selected.'}
                    </p>
                  </button>
                </div>
              </div>

              {/* If Home Visit selected: prompt for Address */}
              {isHomeVisit && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2 animate-in fade-in">
                  <label className="text-xs font-bold text-amber-950 uppercase tracking-wider block">
                    Your Complete Doorstep Home Address *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Flat 302, Sri Sai Nilayam, Road No. 4, Ramanthapur, Hyderabad"
                    value={homeAddress}
                    onChange={e => {
                      setHomeAddress(e.target.value);
                      if (addressError) setAddressError('');
                    }}
                    className={`w-full px-4 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 ${
                      addressError
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-amber-300 focus:ring-[#C59B27]/40'
                    }`}
                  />
                  {addressError && (
                    <span className="text-xs text-rose-600 font-semibold block">{addressError}</span>
                  )}
                  <p className="text-[11px] text-amber-800">
                    📍 Our master stylist will arrive at this address with sanitized styling and grooming tools.
                  </p>
                </div>
              )}

              <div className="space-y-4 pt-2 border-t border-stone-100">
                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Kumar"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 8309578606"
                    value={mobileNumber}
                    onChange={e => {
                      setMobileNumber(e.target.value);
                      if (phoneError) setPhoneError('');
                    }}
                    className={`w-full px-4 py-2.5 text-sm bg-stone-50 border rounded-xl focus:outline-none focus:ring-2 ${
                      phoneError
                        ? 'border-rose-300 focus:ring-rose-200'
                        : 'border-stone-200 focus:ring-[#C59B27]/40'
                    }`}
                  />
                  {phoneError && (
                    <span className="text-xs text-rose-600 mt-1 block">{phoneError}</span>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. rahul.kumar@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    Styling Notes / Preferences
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Any specific hairstyle, fade preference, skin allergies, or requests for your master barber..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Discount Coupon & Final Verification */}
          {currentStep === 5 && (
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-6 animate-in fade-in">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-lg font-bold text-stone-900 font-luxury">
                  Step 5: Apply Salon Offers & Discounts
                </h3>
                <p className="text-xs text-stone-500">
                  Have a promotional code? Enter it below for instant deduction.
                </p>
              </div>

              {/* Coupon Box */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 space-y-3">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  Promo / Coupon Code
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                    />
                    <input
                      type="text"
                      placeholder="e.g. WELCOME10, SAVE200"
                      value={couponInput}
                      onChange={e => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponError('');
                      }}
                      className="w-full pl-10 pr-4 py-2 text-sm uppercase font-mono font-bold bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCouponManually}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 text-[#E2B755] hover:bg-black transition-colors"
                  >
                    Apply
                  </button>
                </div>

                {couponMessage && (
                  <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 size={15} />
                    <span>{couponMessage}</span>
                  </div>
                )}

                {couponError && (
                  <div className="text-xs font-semibold text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 flex items-center gap-1.5">
                    <AlertCircle size={15} />
                    <span>{couponError}</span>
                  </div>
                )}

                {/* Quick select from available active offers */}
                <div className="pt-2">
                  <span className="text-[11px] text-stone-400 block mb-1.5">Quick Suggestions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {offers
                      .filter(o => o.active)
                      .slice(0, 3)
                      .map(o => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => {
                            setCouponInput(o.couponCode);
                            const res = validateCoupon(
                              o.couponCode,
                              subtotal,
                              selectedServices.map(s => s.id),
                              offers
                            );
                            if (res.isValid) {
                              setAppliedCoupon(res.appliedOffer);
                              setCouponDiscount(res.discount);
                              setCouponMessage(res.message);
                              setCouponError('');
                            } else {
                              setCouponError(res.message);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-white border border-stone-200 hover:border-amber-400 text-stone-700 transition-colors"
                        >
                          {o.couponCode}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 transition-colors"
              >
                <ArrowLeft size={15} />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 && (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-stone-900 bg-[#E2B755] hover:bg-[#ebd083] transition-colors shadow-sm"
              >
                <span>Continue</span>
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Right Summary Sidebar (Always visible) */}
        <div className="lg:col-span-5 sticky top-28 space-y-4">
          <Tilt3D maxTilt={5} scale={1.01} depth={8}>
            <BookingSummary
              services={selectedServices}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              totalDuration={totalDuration}
              subtotal={subtotal}
              discount={couponDiscount}
              finalTotal={finalTotal}
              appliedCoupon={appliedCoupon}
              customerName={fullName}
              customerPhone={mobileNumber}
              customerEmail={email}
              notes={notes}
              isHomeVisit={isHomeVisit}
              homeVisitFee={homeVisitFee}
              homeAddress={homeAddress}
              onConfirm={handleConfirmAppointment}
              isSubmitting={isSubmitting}
              onDeselectService={handleDeselectService}
            />
          </Tilt3D>
        </div>
      </div>
    </div>
  );
};
