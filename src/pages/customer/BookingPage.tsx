import React, { useState, useEffect, useMemo } from "react";
import { useSalon } from "../../context/SalonContext";
import { useAuth } from "../../context/AuthContext";
import { Service, Appointment } from "../../types/salon";
import { BookingCalendar } from "../../components/customer/BookingCalendar";
import { TimeSlotPicker } from "../../components/customer/TimeSlotPicker";
import { BookingSummary } from "../../components/customer/BookingSummary";
import { Tilt3D } from "../../components/cinematic/Tilt3D";
import { formatCurrency, formatDate, generateBookingId, calculateEndTime } from "../../utils/formatters";
import {
  Scissors,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  CalendarPlus,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertCircle,
  HelpCircle,
  X,
  Phone,
  Mail,
  Home,
} from "lucide-react";

interface BookingPageProps {
  initialService?: Service | null;
  initialCouponCode?: string;
  onNavigate: (tab: string) => void;
  onClearInitialService?: () => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  initialService,
  onNavigate,
  onClearInitialService,
}) => {
  const {
    services,
    appointments,
    businessHours,
    blockedDates,
    settings,
    createAppointment,
    showToast,
  } = useSalon();
  const { currentCustomer } = useAuth();

  // Multi-step indicator: 1 = Services, 2 = Date, 3 = Time, 4 = Details & Confirm
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Booking selections
  const [selectedServices, setSelectedServices] = useState<Service[]>(() => {
    if (initialService) return [initialService];
    const defaultSrv = services.find(s => s.id === "srv-haircut") || services[0];
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
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });

  // Time selection
  const [selectedTime, setSelectedTime] = useState<string>("10:00 AM");

  // Customer details (clean empty state, no dummy sample data)
  const [fullName, setFullName] = useState<string>(currentCustomer?.name || "");
  const [mobileNumber, setMobileNumber] = useState<string>(currentCustomer?.phone || "");
  const [email, setEmail] = useState<string>(currentCustomer?.email || "");
  const [notes, setNotes] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");

  // Home Visit Option (strictly for Hair Cutting Only)
  const [isHomeVisit, setIsHomeVisit] = useState<boolean>(() => {
    return initialService?.name.toLowerCase().includes("home visit") || false;
  });
  const [homeAddress, setHomeAddress] = useState<string>("");
  const [addressError, setAddressError] = useState<string>("");
  const homeVisitFee = isHomeVisit ? 400 : 0;

  // Check if Hair Cutting Only is among the selected services
  const isHomeVisitEligible = useMemo(() => {
    return selectedServices.some(
      s => s.homeVisitAvailable || s.name.toLowerCase() === "hair cutting only" || s.id === "srv-3"
    );
  }, [selectedServices]);

  // If home visit is checked but user removes Hair Cutting Only, auto-reset isHomeVisit
  useEffect(() => {
    if (isHomeVisit && !isHomeVisitEligible) {
      setIsHomeVisit(false);
      showToast("Home visit was removed: only available with Hair Cutting Only.", "info");
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
    const dayOfWeek = d.getDay();
    const diff = (3 - dayOfWeek + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split("T")[0];
  };

  // If a weekday-restricted service is selected and selectedDate is not a Wednesday, auto-adjust
  useEffect(() => {
    if (allowedWeekdays && allowedWeekdays.length > 0 && selectedDate) {
      const [y, m, d] = selectedDate.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
      if (!allowedWeekdays.some(w => w.toLowerCase() === dayName.toLowerCase())) {
        const nextWed = getNextWednesdayDate();
        setSelectedDate(nextWed);
        showToast(`Baby Hair Cutting is only available on Wednesdays. Date set to ${nextWed}.`, "info");
      }
    }
  }, [allowedWeekdays, selectedDate, showToast]);

  // Handle Home Visit checkbox toggle
  const handleToggleHomeVisit = (checked: boolean) => {
    if (checked) {
      if (!isHomeVisitEligible) {
        const hairCuttingSrv = services.find(
          s => s.id === "srv-3" || s.name.toLowerCase() === "hair cutting only"
        );
        if (hairCuttingSrv && !selectedServices.some(s => s.id === hairCuttingSrv.id)) {
          setSelectedServices(prev => [...prev, hairCuttingSrv]);
          showToast('Added "Hair Cutting Only" to your booking for Home Visit!', "success");
        }
      }
      setIsHomeVisit(true);
    } else {
      setIsHomeVisit(false);
    }
  };

  // Submission & Confirmed state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);

  // Calculations (Pristine: No discounts)
  const totalDuration = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.duration, 0);
  }, [selectedServices]);

  const subtotal = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.price, 0);
  }, [selectedServices]);

  const finalTotal = subtotal + homeVisitFee;

  // Service toggling & deselecting
  const handleToggleService = (srv: Service) => {
    const exists = selectedServices.some(s => s.id === srv.id);
    if (exists) {
      setSelectedServices(prev => prev.filter(s => s.id !== srv.id));
      showToast(`Deselected "${srv.name}"`, "info");
    } else {
      setSelectedServices(prev => [...prev, srv]);
      showToast(`Added "${srv.name}"`, "success");
    }
  };

  const handleDeselectService = (serviceId: string) => {
    const target = selectedServices.find(s => s.id === serviceId);
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
    if (target) {
      showToast(`Deselected "${target.name}"`, "info");
    }
  };

  // Step Validation
  const handleNext = () => {
    if (currentStep === 1) {
      if (selectedServices.length === 0) {
        showToast("Please select at least one salon service.", "error");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedDate) {
        showToast("Please choose an appointment date.", "error");
        return;
      }
      if (allowedWeekdays && allowedWeekdays.length > 0) {
        const [y, m, d] = selectedDate.split("-").map(Number);
        const dateObj = new Date(y, m - 1, d);
        const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
        if (!allowedWeekdays.some(w => w.toLowerCase() === dayName.toLowerCase())) {
          showToast(`This service is available only on ${allowedWeekdays.join(", ")}s. Please choose a Wednesday.`, "error");
          return;
        }
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!selectedTime) {
        showToast("Please pick an available time slot.", "error");
        return;
      }
      setCurrentStep(4);
    }
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  // Validate form details
  const validateForm = (): boolean => {
    if (selectedServices.length === 0) {
      showToast("Please select at least one service.", "error");
      setCurrentStep(1);
      return false;
    }
    if (!selectedDate) {
      showToast("Please pick an appointment date.", "error");
      setCurrentStep(2);
      return false;
    }
    if (!selectedTime) {
      showToast("Please pick an appointment time.", "error");
      setCurrentStep(3);
      return false;
    }
    if (!fullName.trim()) {
      showToast("Please enter your full name.", "error");
      setCurrentStep(4);
      return false;
    }
    const cleanPhone = mobileNumber.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setPhoneError("Please enter a valid 10-digit mobile number.");
      showToast("Please enter a valid 10-digit mobile number.", "error");
      setCurrentStep(4);
      return false;
    }
    setPhoneError("");

    if (isHomeVisit && !homeAddress.trim()) {
      setAddressError("Please enter your doorstep address and landmark.");
      showToast("Please enter your doorstep address for Home Visit.", "error");
      setCurrentStep(4);
      return false;
    }
    setAddressError("");
    return true;
  };

  // Final Confirmation Submit (Direct & Reliable)
  const handleConfirmAppointment = async () => {
    if (!validateForm()) return;

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
      serviceNames: isHomeVisit && !selectedServices.some(s => s.name.toLowerCase().includes("home visit"))
        ? [...selectedServices.map(s => s.name), "Home Visit Service Option"]
        : selectedServices.map(s => s.name),
      appointmentDate: selectedDate,
      startTime: selectedTime,
      endTime,
      duration: totalDuration + (isHomeVisit ? 15 : 0),
      subtotal: subtotal + homeVisitFee,
      discount: 0,
      total: finalTotal,
      status: "Confirmed" as const,
      isHomeVisit,
      homeVisitFee,
      homeAddress: isHomeVisit ? homeAddress.trim() : undefined,
      notes: isHomeVisit
        ? `${notes ? notes + " | " : ""}DOORSTEP HOME ADDRESS: ${homeAddress.trim()}`
        : notes.trim() || undefined,
    };

    const res = await createAppointment(bookingPayload);
    setIsSubmitting(false);

    if (res.success && res.appointment) {
      setConfirmedBooking(res.appointment);
      if (onClearInitialService) onClearInitialService();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Google Calendar Link generator for confirmed screen
  const getGoogleCalendarUrl = (booking: Appointment) => {
    const title = encodeURIComponent(`Bloom Saloon: ${booking.serviceNames.join(", ")}`);
    const details = encodeURIComponent(
      `Appointment at Bloom Saloon (107/P, 3-13-94/11/A, Ramanthapur, Hyderabad)\nBooking ID: ${booking.bookingId}\nServices: ${booking.serviceNames.join(", ")}\nTotal: ${formatCurrency(booking.total)}\nPhone: 8309578606`
    );
    const location = encodeURIComponent(settings.address);
    const dateFormatted = booking.appointmentDate.replace(/-/g, "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dateFormatted}T090000Z/${dateFormatted}T100000Z`;
  };

  // ===============================
  // CONFIRMATION SUCCESS SCREEN
  // ===============================
  if (confirmedBooking) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8DFC9] shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
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
              Your appointment has been registered and sent directly to <strong>Bloom Saloon</strong>. The salon team is expecting you.
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
                    ? `Address: ${confirmedBooking.homeAddress || "At customer premises"}`
                    : "Bloom Saloon, 107/P, 3-13-94/11/A, Ramanthapur, Hyderabad"}
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
                <span className="text-stone-400 block">Total Amount Payable</span>
                <span className="text-xl font-extrabold text-stone-950 font-luxury">
                  {formatCurrency(confirmedBooking.total)}
                </span>
                {confirmedBooking.isHomeVisit && (
                  <div className="text-[#8F6C1E] text-[11px] font-semibold">
                    Includes ₹400 Home Visit fee
                  </div>
                )}
                <div className="text-[11px] text-stone-400">
                  Pay at the salon after service
                </div>
              </div>

              <div className="col-span-1 sm:col-span-2 pt-2 border-t border-stone-200/60">
                <span className="text-stone-400 block">Booked Services</span>
                <span className="font-semibold text-stone-800">
                  {confirmedBooking.serviceNames.join(" • ")}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs text-[#8F6C1E]">
            ℹ️ <strong>Note:</strong> Need to change your appointment time? Call Bloom Saloon directly at <strong>8309578606</strong>.
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
              onClick={() => onNavigate("home")}
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
  // 4-STEP BOOKING FLOW (No discounts)
  // ===============================
  const stepTitles = [
    "Select Services",
    "Choose Date",
    "Pick Time Slot",
    "Details & Confirm",
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
        <div className="grid grid-cols-4 gap-2 text-center">
          {stepTitles.map((title, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div key={title} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-stone-900 text-[#E2B755] ring-2 ring-[#E2B755]/40 shadow-xs"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {isCompleted ? <Check size={14} /> : stepNum}
                </div>
                <span
                  className={`text-[10px] sm:text-xs mt-1.5 font-semibold truncate ${
                    isCurrent ? "text-stone-900 font-bold" : "text-stone-400"
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
        {/* Left Form Area */}
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

              {/* Selected pills with individual deselect button */}
              {selectedServices.length > 0 && (
                <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#8F6C1E]">
                    <span>Current Selection ({selectedServices.length}):</span>
                    <button
                      type="button"
                      onClick={() => setSelectedServices([])}
                      className="text-[11px] text-rose-600 hover:text-rose-800 underline font-semibold cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedServices.map(srv => (
                      <span
                        key={srv.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-stone-900 border border-amber-300 shadow-xs"
                      >
                        <span>{srv.name}</span>
                        <span className="font-bold text-[#9C7A28]">{formatCurrency(srv.price)}</span>
                        <button
                          type="button"
                          onClick={() => handleDeselectService(srv.id)}
                          className="w-4 h-4 rounded-full bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer ml-1"
                          title={`Deselect ${srv.name}`}
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Service list items */}
              <div className="divide-y divide-stone-100 max-h-[460px] overflow-y-auto pr-1 space-y-1">
                {services
                  .filter(s => s.active)
                  .map(srv => {
                    const isSelected = selectedServices.some(s => s.id === srv.id);
                    return (
                      <div
                        key={srv.id}
                        className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#FAF7EE] border border-amber-300/80 shadow-xs"
                            : "hover:bg-stone-50 border border-transparent"
                        }`}
                        onClick={() => handleToggleService(srv)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-stone-900 text-[#E2B755]"
                                : "border border-stone-300 bg-white"
                            }`}
                          >
                            {isSelected && <Check size={14} />}
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-bold text-stone-900 block truncate">
                              {srv.name}
                            </span>
                            <span className="text-xs text-stone-400 block truncate">
                              {srv.category} • {srv.duration} mins {srv.homeVisitAvailable ? "• 🏠 Home Visit" : ""}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-extrabold text-stone-900">
                            {srv.priceRange || formatCurrency(srv.price)}
                          </span>
                          {isSelected ? (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleDeselectService(srv.id);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                              title={`Deselect ${srv.name}`}
                            >
                              <X size={12} />
                              <span>Deselect</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleToggleService(srv);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Doorstep Home Visit toggle (₹400) */}
              <div className="pt-3 border-t border-stone-100">
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-amber-200/80 space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isHomeVisit}
                      onChange={e => handleToggleHomeVisit(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        🏠 Doorstep Home Visit (+₹400 Service Fee)
                      </span>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Master stylist will visit your home with sanitized toolkit.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Choose Date */}
          {currentStep === 2 && (
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4 animate-in fade-in">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-lg font-bold text-stone-900 font-luxury">
                  Step 2: Choose Appointment Date
                </h3>
                <p className="text-xs text-stone-500">
                  Bloom Saloon is open 7 days a week (7:00 AM – 9:30 PM).
                </p>
              </div>

              <BookingCalendar
                selectedDate={selectedDate}
                onSelectDate={d => setSelectedDate(d)}
                hoursList={businessHours}
                blockedDates={blockedDates}
                allowedWeekdays={allowedWeekdays}
              />
            </div>
          )}

          {/* STEP 3: Select Time Slot */}
          {currentStep === 3 && (
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4 animate-in fade-in">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-lg font-bold text-stone-900 font-luxury">
                  Step 3: Pick Available Time Slot
                </h3>
                <p className="text-xs text-stone-500">
                  Select your arrival time on {formatDate(selectedDate)} for {totalDuration} mins.
                </p>
              </div>

              <TimeSlotPicker
                selectedDate={selectedDate}
                totalDurationMinutes={totalDuration}
                selectedTime={selectedTime}
                onSelectTime={t => setSelectedTime(t)}
                hoursList={businessHours}
                existingAppointments={appointments}
                blockedDates={blockedDates}
              />
            </div>
          )}

          {/* STEP 4: Your Details & Final Confirm */}
          {currentStep === 4 && (
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-5 animate-in fade-in">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-lg font-bold text-stone-900 font-luxury">
                  Step 4: Contact Details & Confirm Appointment
                </h3>
                <p className="text-xs text-stone-500">
                  Enter your details to confirm your chair reservation at Bloom Saloon.
                </p>
              </div>

              {/* Doorstep Home Address (if home visit selected) */}
              {isHomeVisit && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                  <label className="text-xs font-bold text-amber-950 uppercase tracking-wider block">
                    🏠 Doorstep Home Address & Landmark *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Enter complete house/flat no., street, landmark in Ramanthapur or nearby..."
                    value={homeAddress}
                    onChange={e => {
                      setHomeAddress(e.target.value);
                      if (addressError) setAddressError("");
                    }}
                    className={`w-full px-4 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 ${
                      addressError
                        ? "border-rose-400 focus:ring-rose-200"
                        : "border-amber-300 focus:ring-[#C59B27]/40"
                    }`}
                  />
                  {addressError && (
                    <span className="text-xs text-rose-600 font-semibold block">{addressError}</span>
                  )}
                  <p className="text-[11px] text-amber-800">
                    📍 Our master stylist will arrive at this address with sanitized styling equipment.
                  </p>
                </div>
              )}

              {/* Form inputs */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shabbeer Ahmed"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40 font-medium text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    Mobile Number (10 Digits) *
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={mobileNumber}
                      onChange={e => {
                        setMobileNumber(e.target.value);
                        if (phoneError) setPhoneError("");
                      }}
                      className={`w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border rounded-xl focus:outline-none focus:ring-2 font-medium text-stone-900 ${
                        phoneError
                          ? "border-rose-300 focus:ring-rose-200"
                          : "border-stone-200 focus:ring-[#C59B27]/40"
                      }`}
                    />
                  </div>
                  {phoneError && (
                    <span className="text-xs text-rose-600 mt-1 block font-medium">{phoneError}</span>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      placeholder="e.g. yourname@gmail.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40 text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                    Styling Notes / Preferences
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Any specific hairstyle, fade preference, skin sensitivities, or styling requests..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40 text-stone-900"
                  />
                </div>
              </div>

              {/* Total & Quick Confirm inside card */}
              <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAF8F5] p-4 rounded-2xl">
                <div>
                  <span className="text-xs text-stone-500 block">Total Amount to Pay at Saloon:</span>
                  <span className="text-2xl font-extrabold text-stone-900 font-luxury">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleConfirmAppointment}
                  disabled={isSubmitting || selectedServices.length === 0}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#F0D58C] via-[#E2B755] to-[#D4A137] hover:brightness-105 active:scale-95 text-stone-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
                >
                  {isSubmitting ? (
                    <span>Securing Your Chair...</span>
                  ) : (
                    <>
                      <span>Confirm Appointment • {formatCurrency(finalTotal)}</span>
                      <CheckCircle2 size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <ArrowLeft size={15} />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-stone-900 bg-[#E2B755] hover:bg-[#ebd083] transition-colors shadow-sm cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmAppointment}
                disabled={isSubmitting || selectedServices.length === 0}
                className="inline-flex items-center gap-1.5 px-7 py-2.5 rounded-xl text-xs font-bold text-stone-950 bg-gradient-to-r from-[#F0D58C] via-[#E2B755] to-[#D4A137] hover:brightness-105 active:scale-95 transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Securing Chair...</span>
                ) : (
                  <>
                    <span>Confirm Appointment • {formatCurrency(finalTotal)}</span>
                    <CheckCircle2 size={15} />
                  </>
                )}
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
              finalTotal={finalTotal}
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
