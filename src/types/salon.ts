export type ServiceCategory = 'Hair' | 'Grooming' | 'Skin & Facial' | 'Packages';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  duration: number; // in minutes
  price: number; // in INR
  priceRange?: string; // e.g. "150/- to 200" or "800/- to 3000/-"
  discountPrice?: number;
  image: string;
  active: boolean;
  featured?: boolean;
  homeVisitAvailable?: boolean;
  availableDays?: string[]; // e.g. ['Wednesday']
  dayRestrictionNote?: string; // e.g. "Available only on Wednesdays"
}

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No Show';

export interface Appointment {
  id: string;
  bookingId: string; // e.g. SAL-20261001-0001
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceIds: string[];
  serviceNames: string[];
  appointmentDate: string; // YYYY-MM-DD
  startTime: string; // e.g. "10:30 AM" or "10:30"
  endTime: string; // e.g. "11:30 AM" or "11:30"
  duration: number; // total minutes
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  stylistPreference?: string;
  isHomeVisit?: boolean;
  homeVisitFee?: number;
  homeAddress?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalVisits: number;
  lastVisit?: string;
  totalSpending: number;
  upcomingAppointment?: string;
  notes?: string;
  offersUsed?: string[];
  createdAt: string;
}

export type DiscountType = 'percentage' | 'fixed';

export interface Offer {
  id: string;
  name: string;
  couponCode: string;
  description: string;
  discountType: DiscountType;
  discountAmount: number; // % or ₹
  minBookingAmount: number;
  maxDiscount: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  eligibleServices?: string[]; // service IDs or empty for all
  usageLimit: number;
  usedCount: number;
  active: boolean;
}

export interface BusinessDayHours {
  day: string; // Monday, Tuesday, etc.
  isOpen: boolean;
  openTime: string; // "09:00"
  closeTime: string; // "20:00"
  breakStart?: string; // e.g. "13:30"
  breakEnd?: string; // e.g. "14:00"
}

export interface BlockedDate {
  id: string;
  date: string; // YYYY-MM-DD
  reason: string;
}

export interface BlockedTimeSlot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "14:00"
  endTime: string; // "15:30"
  reason: string;
}

export interface SalonNotification {
  id: string;
  recipientType: 'admin' | 'customer';
  customerId?: string;
  title: string;
  message: string;
  type: 'booking_confirmed' | 'booking_cancelled' | 'booking_rescheduled' | 'appointment_reminder' | 'new_booking' | 'new_customer' | 'general';
  read: boolean;
  createdAt: string;
  bookingId?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_user' | 'super_admin' | 'owner';
  avatar?: string;
  isSuperUser?: boolean;
}

export interface BusinessSettings {
  salonName: string;
  owners: string[];
  phone: string;
  email: string;
  address: string;
  currency: string;
  taxRate: number;
  allowOnlineCancellation: boolean;
  minAdvanceBookingHours: number;
  maxAdvanceBookingDays: number;
  clientOwnerEmail?: string;
  clientOwnerName?: string;
  superUserEmail?: string;
}
