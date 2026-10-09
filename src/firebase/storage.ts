import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import {
  Service,
  Customer,
  Appointment,
  Offer,
  BusinessDayHours,
  BusinessSettings,
  BlockedDate,
  SalonNotification,
} from '../types/salon';
import {
  INITIAL_SERVICES,
  INITIAL_CUSTOMERS,
  INITIAL_APPOINTMENTS,
  INITIAL_OFFERS,
  INITIAL_HOURS,
  INITIAL_SETTINGS,
  INITIAL_BLOCKED_DATES,
  INITIAL_NOTIFICATIONS,
} from '../data/demoData';
import { timeToMinutes } from '../utils/formatters';
import { checkTimeOverlap } from '../utils/bookingLogic';

// Storage keys for local persistence
const STORAGE_KEYS = {
  SERVICES: 'bloom_saloon_services_v8',
  CUSTOMERS: 'bloom_saloon_customers_v8',
  APPOINTMENTS: 'bloom_saloon_appointments_v8',
  OFFERS: 'bloom_saloon_offers_v8',
  HOURS: 'bloom_saloon_hours_v8',
  SETTINGS: 'bloom_saloon_settings_v8',
  BLOCKED_DATES: 'bloom_saloon_blocked_dates_v8',
  NOTIFICATIONS: 'bloom_saloon_notifications_v8',
};

// Helper to safely read from LocalStorage with fallback and sample-data purge
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    // Sanitize any lingering legacy sample appointments or customers
    if (Array.isArray(parsed)) {
      const sanitized = parsed.filter((entry: any) => {
        if (!entry || typeof entry !== 'object') return false;
        if (entry.id && (entry.id.startsWith('app-00') || entry.id.startsWith('cust-') || entry.id.startsWith('off-') || entry.id.startsWith('notif-'))) {
          return false;
        }
        return true;
      });
      return sanitized as unknown as T;
    }
    return parsed;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

// Helper to safely write to LocalStorage
function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

export class SalonDatabaseService {
  // Services
  static async getServices(): Promise<Service[]> {
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'services'));
        if (!querySnapshot.empty) {
          const list: Service[] = [];
          querySnapshot.forEach(docSnap => list.push(docSnap.data() as Service));
          return list;
        }
      } catch (err) {
        console.warn('Failed to fetch services from Firestore, using local fallback:', err);
      }
    }
    return loadFromStorage<Service[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
  }

  static async saveService(service: Service): Promise<void> {
    const services = await this.getServices();
    const index = services.findIndex(s => s.id === service.id);
    if (index >= 0) {
      services[index] = service;
    } else {
      services.unshift(service);
    }
    saveToStorage(STORAGE_KEYS.SERVICES, services);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'services', service.id), service);
      } catch (err) {
        console.error('Firestore saveService error:', err);
      }
    }
  }

  static async deleteService(id: string): Promise<void> {
    const services = await this.getServices();
    const updated = services.filter(s => s.id !== id);
    saveToStorage(STORAGE_KEYS.SERVICES, updated);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'services', id));
      } catch (err) {
        console.error('Firestore deleteService error:', err);
      }
    }
  }

  // Appointments
  static async getAppointments(): Promise<Appointment[]> {
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'appointments'));
        if (!querySnapshot.empty) {
          const list: Appointment[] = [];
          querySnapshot.forEach(docSnap => list.push(docSnap.data() as Appointment));
          return list;
        }
      } catch (err) {
        console.warn('Failed to fetch appointments from Firestore, using local fallback:', err);
      }
    }
    return loadFromStorage<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  }

  /**
   * Creates an appointment with strict double-booking prevention!
   */
  static async createAppointment(appointment: Appointment): Promise<{ success: boolean; message: string }> {
    const existing = await this.getAppointments();

    // Double booking guard
    const sameDateActive = existing.filter(
      app =>
        app.appointmentDate === appointment.appointmentDate &&
        app.status !== 'Cancelled' &&
        app.status !== 'No Show'
    );

    const newStart = timeToMinutes(appointment.startTime);
    const newEnd = timeToMinutes(appointment.endTime);

    const overlaps = sameDateActive.filter(app => {
      const appStart = timeToMinutes(app.startTime);
      const appEnd = timeToMinutes(app.endTime);
      return checkTimeOverlap(newStart, newEnd, appStart, appEnd);
    });

    // 2 master stylists capacity check (R Srinivas & S Srinivas)
    if (overlaps.length >= 2) {
      return {
        success: false,
        message: 'This time slot was just booked by another customer. Please select another time.',
      };
    }

    // Save appointment
    const updated = [appointment, ...existing];
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, updated);

    // Update customer stats
    const customers = await this.getCustomers();
    const customerIdx = customers.findIndex(c => c.id === appointment.customerId || c.phone === appointment.customerPhone);
    if (customerIdx >= 0) {
      customers[customerIdx].totalVisits += 1;
      customers[customerIdx].totalSpending += appointment.total;
      customers[customerIdx].upcomingAppointment = `${appointment.appointmentDate} ${appointment.startTime}`;
      if (appointment.couponCode) {
        customers[customerIdx].offersUsed = Array.from(new Set([...(customers[customerIdx].offersUsed || []), appointment.couponCode]));
      }
      saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
    } else {
      // Create new customer record
      const newCustomer: Customer = {
        id: appointment.customerId || `cust-${Date.now()}`,
        name: appointment.customerName,
        phone: appointment.customerPhone,
        email: appointment.customerEmail,
        totalVisits: 1,
        totalSpending: appointment.total,
        upcomingAppointment: `${appointment.appointmentDate} ${appointment.startTime}`,
        notes: appointment.notes || 'Booked online',
        offersUsed: appointment.couponCode ? [appointment.couponCode] : [],
        createdAt: new Date().toISOString(),
      };
      customers.push(newCustomer);
      saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
    }

    // Add admin notification
    const notif: SalonNotification = {
      id: `notif-${Date.now()}`,
      recipientType: 'admin',
      title: `New Booking ${appointment.bookingId}`,
      message: `${appointment.customerName} booked ${appointment.serviceNames.join(', ')} for ${appointment.appointmentDate} at ${appointment.startTime}.`,
      type: 'new_booking',
      read: false,
      createdAt: new Date().toISOString(),
      bookingId: appointment.bookingId,
    };
    await this.addNotification(notif);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'appointments', appointment.id), appointment);
      } catch (err) {
        console.error('Firestore createAppointment error:', err);
      }
    }

    return { success: true, message: 'Appointment confirmed successfully!' };
  }

  static async updateAppointment(appointment: Appointment): Promise<void> {
    const list = await this.getAppointments();
    const index = list.findIndex(a => a.id === appointment.id);
    if (index >= 0) {
      list[index] = appointment;
      saveToStorage(STORAGE_KEYS.APPOINTMENTS, list);
    }

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'appointments', appointment.id), { ...appointment });
      } catch (err) {
        console.error('Firestore updateAppointment error:', err);
      }
    }
  }

  static async deleteAppointment(id: string): Promise<void> {
    const list = await this.getAppointments();
    const updated = list.filter(a => a.id !== id);
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, updated);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'appointments', id));
      } catch (err) {
        console.error('Firestore deleteAppointment error:', err);
      }
    }
  }

  // Customers
  static async getCustomers(): Promise<Customer[]> {
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'customers'));
        if (!querySnapshot.empty) {
          const list: Customer[] = [];
          querySnapshot.forEach(docSnap => list.push(docSnap.data() as Customer));
          return list;
        }
      } catch (err) {
        console.warn('Failed to fetch customers from Firestore, using local fallback:', err);
      }
    }
    return loadFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  }

  static async saveCustomer(customer: Customer): Promise<void> {
    const list = await this.getCustomers();
    const index = list.findIndex(c => c.id === customer.id);
    if (index >= 0) {
      list[index] = customer;
    } else {
      list.unshift(customer);
    }
    saveToStorage(STORAGE_KEYS.CUSTOMERS, list);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'customers', customer.id), customer);
      } catch (err) {
        console.error('Firestore saveCustomer error:', err);
      }
    }
  }

  // Offers
  static async getOffers(): Promise<Offer[]> {
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'offers'));
        if (!querySnapshot.empty) {
          const list: Offer[] = [];
          querySnapshot.forEach(docSnap => list.push(docSnap.data() as Offer));
          return list;
        }
      } catch (err) {
        console.warn('Failed to fetch offers from Firestore, using local fallback:', err);
      }
    }
    return loadFromStorage<Offer[]>(STORAGE_KEYS.OFFERS, INITIAL_OFFERS);
  }

  static async saveOffer(offer: Offer): Promise<void> {
    const list = await this.getOffers();
    const index = list.findIndex(o => o.id === offer.id);
    if (index >= 0) {
      list[index] = offer;
    } else {
      list.unshift(offer);
    }
    saveToStorage(STORAGE_KEYS.OFFERS, list);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'offers', offer.id), offer);
      } catch (err) {
        console.error('Firestore saveOffer error:', err);
      }
    }
  }

  static async deleteOffer(id: string): Promise<void> {
    const list = await this.getOffers();
    const updated = list.filter(o => o.id !== id);
    saveToStorage(STORAGE_KEYS.OFFERS, updated);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'offers', id));
      } catch (err) {
        console.error('Firestore deleteOffer error:', err);
      }
    }
  }

  // Business Hours
  static async getBusinessHours(): Promise<BusinessDayHours[]> {
    return loadFromStorage<BusinessDayHours[]>(STORAGE_KEYS.HOURS, INITIAL_HOURS);
  }

  static async saveBusinessHours(hours: BusinessDayHours[]): Promise<void> {
    saveToStorage(STORAGE_KEYS.HOURS, hours);
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'businessSettings', 'hours'), { hours });
      } catch (err) {
        console.error('Firestore saveBusinessHours error:', err);
      }
    }
  }

  // Blocked Dates
  static async getBlockedDates(): Promise<BlockedDate[]> {
    return loadFromStorage<BlockedDate[]>(STORAGE_KEYS.BLOCKED_DATES, INITIAL_BLOCKED_DATES);
  }

  static async saveBlockedDates(dates: BlockedDate[]): Promise<void> {
    saveToStorage(STORAGE_KEYS.BLOCKED_DATES, dates);
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'businessSettings', 'blockedDates'), { dates });
      } catch (err) {
        console.error('Firestore saveBlockedDates error:', err);
      }
    }
  }

  // Settings
  static async getSettings(): Promise<BusinessSettings> {
    return loadFromStorage<BusinessSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }

  static async saveSettings(settings: BusinessSettings): Promise<void> {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'businessSettings', 'general'), settings);
      } catch (err) {
        console.error('Firestore saveSettings error:', err);
      }
    }
  }

  // Notifications
  static async getNotifications(): Promise<SalonNotification[]> {
    return loadFromStorage<SalonNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  static async addNotification(notif: SalonNotification): Promise<void> {
    const list = await this.getNotifications();
    const updated = [notif, ...list];
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  static async markNotificationRead(id: string): Promise<void> {
    const list = await this.getNotifications();
    const updated = list.map(n => (n.id === id ? { ...n, read: true } : n));
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  // Reset demo data helper
  static async resetAllData(): Promise<void> {
    saveToStorage(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    saveToStorage(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    saveToStorage(STORAGE_KEYS.OFFERS, INITIAL_OFFERS);
    saveToStorage(STORAGE_KEYS.HOURS, INITIAL_HOURS);
    saveToStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    saveToStorage(STORAGE_KEYS.BLOCKED_DATES, INITIAL_BLOCKED_DATES);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }
}
