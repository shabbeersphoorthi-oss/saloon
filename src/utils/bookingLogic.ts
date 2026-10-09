import { Appointment, BusinessDayHours, BlockedDate, BlockedTimeSlot, Offer } from '../types/salon';
import { timeToMinutes, minutesToTime } from './formatters';

export interface TimeSlotStatus {
  time: string; // e.g. "10:00 AM"
  isAvailable: boolean;
  isOverdue?: boolean;
  reason?: string;
}

/**
 * Checks if a proposed appointment time range overlaps with another appointment
 */
export function checkTimeOverlap(
  start1Mins: number,
  end1Mins: number,
  start2Mins: number,
  end2Mins: number
): boolean {
  // Overlap condition: start1 < end2 and end1 > start2
  return start1Mins < end2Mins && end1Mins > start2Mins;
}

/**
 * Generates all time slots for a given date, checking salon opening hours,
 * breaks, appointment duration, existing bookings, and blocked periods.
 * Double booking protection is enforced here!
 */
export function getAvailableTimeSlots(
  dateString: string,
  totalDurationMinutes: number,
  hoursList: BusinessDayHours[],
  existingAppointments: Appointment[],
  blockedDates: BlockedDate[] = [],
  blockedTimeSlots: BlockedTimeSlot[] = []
): TimeSlotStatus[] {
  // 1. Check if the entire date is blocked
  const isDateBlocked = blockedDates.some(b => b.date === dateString);
  if (isDateBlocked) {
    return [];
  }

  // 2. Identify day of the week
  const [year, month, day] = dateString.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

  // 3. Find opening hours for this day
  const daySchedule = hoursList.find(h => h.day.toLowerCase() === dayName.toLowerCase());
  if (!daySchedule || !daySchedule.isOpen) {
    return []; // Salon closed
  }

  const openMins = timeToMinutes(daySchedule.openTime);
  const closeMins = timeToMinutes(daySchedule.closeTime);
  const breakStartMins = daySchedule.breakStart ? timeToMinutes(daySchedule.breakStart) : null;
  const breakEndMins = daySchedule.breakEnd ? timeToMinutes(daySchedule.breakEnd) : null;

  // 4. Get active appointments on this date (exclude cancelled / no-show)
  const activeBookings = existingAppointments.filter(
    app => app.appointmentDate === dateString && app.status !== 'Cancelled' && app.status !== 'No Show'
  );

  // 5. Generate slots every 30 minutes
  const slots: TimeSlotStatus[] = [];
  const slotInterval = 30; // 30-minute intervals

  // Current local time reference to identify overdue/past time slots
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isToday = dateString === todayStr;
  const isPastDate = dateString < todayStr;
  const currentMinutesNow = now.getHours() * 60 + now.getMinutes();

  for (let current = openMins; current + totalDurationMinutes <= closeMins; current += slotInterval) {
    const slotEndTime = current + totalDurationMinutes;
    const timeFormatted = minutesToTime(current);

    const isOverdue = isPastDate || (isToday && current < currentMinutesNow);

    let isAvailable = true;
    let reason = '';

    // Check break time overlap
    if (breakStartMins !== null && breakEndMins !== null) {
      if (checkTimeOverlap(current, slotEndTime, breakStartMins, breakEndMins)) {
        isAvailable = false;
        reason = 'Salon staff lunch/tea break';
      }
    }

    // Check blocked slots for this date
    if (isAvailable) {
      const blockedSlot = blockedTimeSlots.find(
        bs => bs.date === dateString && checkTimeOverlap(current, slotEndTime, timeToMinutes(bs.startTime), timeToMinutes(bs.endTime))
      );
      if (blockedSlot) {
        isAvailable = false;
        reason = blockedSlot.reason || 'Slot blocked for salon maintenance';
      }
    }

    // Check existing appointments (Capacity protection: Max simultaneous slots)
    // Bloom Saloon has 2 master stations (R Srinivas & S Srinivas), allowing up to 2 concurrent stylists.
    if (isAvailable) {
      const overlappingBookings = activeBookings.filter(app => {
        const appStart = timeToMinutes(app.startTime);
        const appEnd = timeToMinutes(app.endTime);
        return checkTimeOverlap(current, slotEndTime, appStart, appEnd);
      });

      // If stations are booked, mark slot as unavailable
      if (overlappingBookings.length >= 2) {
        isAvailable = false;
        reason = 'All master stylist stations are reserved for this slot';
      }
    }

    slots.push({
      time: timeFormatted,
      isAvailable,
      isOverdue,
      reason,
    });
  }

  return slots;
}

/**
 * Validates a coupon code against active offers and booking parameters
 */
export interface CouponValidationResult {
  isValid: boolean;
  discount: number;
  message: string;
  appliedOffer?: Offer;
}

export function validateCoupon(
  couponCode: string,
  subtotal: number,
  serviceIds: string[],
  offers: Offer[]
): CouponValidationResult {
  const code = couponCode.trim().toUpperCase();
  if (!code) {
    return { isValid: false, discount: 0, message: 'Please enter a coupon code.' };
  }

  const offer = offers.find(o => o.couponCode.toUpperCase() === code);
  if (!offer) {
    return { isValid: false, discount: 0, message: 'Invalid coupon code.' };
  }

  if (!offer.active) {
    return { isValid: false, discount: 0, message: 'This coupon is no longer active.' };
  }

  // Check validity dates
  const today = new Date().toISOString().split('T')[0];
  if (offer.startDate && today < offer.startDate) {
    return { isValid: false, discount: 0, message: `This coupon will be valid from ${offer.startDate}.` };
  }
  if (offer.endDate && today > offer.endDate) {
    return { isValid: false, discount: 0, message: 'This coupon has expired.' };
  }

  // Check usage limit
  if (offer.usageLimit > 0 && offer.usedCount >= offer.usageLimit) {
    return { isValid: false, discount: 0, message: 'This coupon has reached its maximum usage limit.' };
  }

  // Check minimum booking amount
  if (subtotal < offer.minBookingAmount) {
    return {
      isValid: false,
      discount: 0,
      message: `Minimum booking subtotal of ₹${offer.minBookingAmount} is required for this offer (current: ₹${subtotal}).`,
    };
  }

  // Check eligible services if specified
  if (offer.eligibleServices && offer.eligibleServices.length > 0) {
    const hasEligibleService = serviceIds.some(id => offer.eligibleServices!.includes(id));
    if (!hasEligibleService) {
      return {
        isValid: false,
        discount: 0,
        message: 'This offer is not applicable to the selected services.',
      };
    }
  }

  // Calculate discount
  let calculatedDiscount = 0;
  if (offer.discountType === 'percentage') {
    calculatedDiscount = (subtotal * offer.discountAmount) / 100;
  } else {
    calculatedDiscount = offer.discountAmount;
  }

  // Cap at max discount if specified
  if (offer.maxDiscount > 0 && calculatedDiscount > offer.maxDiscount) {
    calculatedDiscount = offer.maxDiscount;
  }

  // Discount cannot exceed subtotal
  calculatedDiscount = Math.min(calculatedDiscount, subtotal);

  return {
    isValid: true,
    discount: Math.round(calculatedDiscount),
    message: `Coupon "${offer.couponCode}" applied successfully! You saved ₹${Math.round(calculatedDiscount)}.`,
    appliedOffer: offer,
  };
}
