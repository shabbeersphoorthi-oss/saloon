import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Service,
  Customer,
  Appointment,
  Offer,
  BusinessDayHours,
  BusinessSettings,
  BlockedDate,
  SalonNotification,
  AppointmentStatus,
} from '../types/salon';
import { SalonDatabaseService } from '../firebase/storage';
import { calculateEndTime } from '../utils/formatters';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface SalonContextType {
  services: Service[];
  appointments: Appointment[];
  customers: Customer[];
  offers: Offer[];
  businessHours: BusinessDayHours[];
  blockedDates: BlockedDate[];
  settings: BusinessSettings;
  notifications: SalonNotification[];
  isLoading: boolean;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Services
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (service: Service) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  toggleServiceActive: (id: string) => Promise<void>;

  // Appointments
  createAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; message: string; appointment?: Appointment }>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus, notes?: string) => Promise<void>;
  rescheduleAppointment: (id: string, newDate: string, newStartTime: string) => Promise<{ success: boolean; message: string }>;
  cancelAppointment: (id: string, reason?: string) => Promise<void>;

  // Offers
  addOffer: (offer: Omit<Offer, 'id' | 'usedCount'>) => Promise<void>;
  updateOffer: (offer: Offer) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  toggleOfferActive: (id: string) => Promise<void>;

  // Customers
  updateCustomer: (customer: Customer) => Promise<void>;

  // Settings & Hours
  updateBusinessHours: (hours: BusinessDayHours[]) => Promise<void>;
  addBlockedDate: (date: string, reason: string) => Promise<void>;
  removeBlockedDate: (id: string) => Promise<void>;
  updateSettings: (settings: BusinessSettings) => Promise<void>;

  // Notifications
  markNotificationRead: (id: string) => Promise<void>;

  // Reset
  resetDemoData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const SalonContext = createContext<SalonContextType | undefined>(undefined);

export const SalonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessDayHours[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>({
    salonName: 'Bloom Saloon',
    owners: ['Bloom Saloon Management'],
    phone: '8309578606',
    email: 'contact@bloomsaloon.in',
    address: '107/P, 3-13-94/11/A, Ramanthapur, Hyderabad, Telangana',
    currency: 'INR (₹)',
    taxRate: 0,
    allowOnlineCancellation: true,
    minAdvanceBookingHours: 1,
    maxAdvanceBookingDays: 30,
  });
  const [notifications, setNotifications] = useState<SalonNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        fetchedServices,
        fetchedAppointments,
        fetchedCustomers,
        fetchedOffers,
        fetchedHours,
        fetchedBlockedDates,
        fetchedSettings,
        fetchedNotifications,
      ] = await Promise.all([
        SalonDatabaseService.getServices(),
        SalonDatabaseService.getAppointments(),
        SalonDatabaseService.getCustomers(),
        SalonDatabaseService.getOffers(),
        SalonDatabaseService.getBusinessHours(),
        SalonDatabaseService.getBlockedDates(),
        SalonDatabaseService.getSettings(),
        SalonDatabaseService.getNotifications(),
      ]);

      setServices(fetchedServices);
      setAppointments(fetchedAppointments);
      setCustomers(fetchedCustomers);
      setOffers(fetchedOffers);
      setBusinessHours(fetchedHours);
      setBlockedDates(fetchedBlockedDates);
      setSettings(fetchedSettings);
      setNotifications(fetchedNotifications);
    } catch (e) {
      console.error('Failed to load salon data:', e);
      showToast('Could not load data. Using demo baseline.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Service Handlers
  const addService = async (newSrv: Omit<Service, 'id'>) => {
    const service: Service = {
      ...newSrv,
      id: `srv-${Date.now()}`,
    };
    await SalonDatabaseService.saveService(service);
    setServices(prev => [service, ...prev]);
    showToast(`Service "${service.name}" added successfully.`);
  };

  const updateService = async (service: Service) => {
    await SalonDatabaseService.saveService(service);
    setServices(prev => prev.map(s => (s.id === service.id ? service : s)));
    showToast(`Service "${service.name}" updated.`);
  };

  const deleteService = async (id: string) => {
    const target = services.find(s => s.id === id);
    await SalonDatabaseService.deleteService(id);
    setServices(prev => prev.filter(s => s.id !== id));
    showToast(`Service "${target?.name || 'Item'}" removed.`, 'info');
  };

  const toggleServiceActive = async (id: string) => {
    const target = services.find(s => s.id === id);
    if (!target) return;
    const updated = { ...target, active: !target.active };
    await updateService(updated);
  };

  // Appointment Handlers
  const createAppointment = async (
    data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; message: string; appointment?: Appointment }> => {
    const nowIso = new Date().toISOString();
    const newAppointment: Appointment = {
      ...data,
      id: `app-${Date.now()}`,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const res = await SalonDatabaseService.createAppointment(newAppointment);
    if (res.success) {
      setAppointments(prev => [newAppointment, ...prev]);
      // Update offer usage if coupon used
      if (newAppointment.couponCode) {
        const offer = offers.find(o => o.couponCode === newAppointment.couponCode);
        if (offer) {
          const updatedOffer = { ...offer, usedCount: offer.usedCount + 1 };
          await updateOffer(updatedOffer);
        }
      }
      // Reload notifications
      const notifs = await SalonDatabaseService.getNotifications();
      setNotifications(notifs);
      showToast('Appointment booked successfully!');
      return { success: true, message: res.message, appointment: newAppointment };
    } else {
      showToast(res.message, 'error');
      return { success: false, message: res.message };
    }
  };

  const updateAppointmentStatus = async (id: string, status: AppointmentStatus, notes?: string) => {
    const target = appointments.find(a => a.id === id);
    if (!target) return;
    const updated: Appointment = {
      ...target,
      status,
      notes: notes !== undefined ? notes : target.notes,
      updatedAt: new Date().toISOString(),
    };
    await SalonDatabaseService.updateAppointment(updated);
    setAppointments(prev => prev.map(a => (a.id === id ? updated : a)));

    // Create notification
    const notif: SalonNotification = {
      id: `notif-${Date.now()}`,
      recipientType: 'customer',
      customerId: target.customerId,
      title: `Appointment ${status}`,
      message: `Your appointment (${target.bookingId}) on ${target.appointmentDate} has been updated to "${status}".`,
      type: status === 'Confirmed' ? 'booking_confirmed' : status === 'Cancelled' ? 'booking_cancelled' : 'general',
      read: false,
      createdAt: new Date().toISOString(),
      bookingId: target.bookingId,
    };
    await SalonDatabaseService.addNotification(notif);
    setNotifications(prev => [notif, ...prev]);

    showToast(`Appointment status updated to "${status}".`);
  };

  const rescheduleAppointment = async (
    id: string,
    newDate: string,
    newStartTime: string
  ): Promise<{ success: boolean; message: string }> => {
    const target = appointments.find(a => a.id === id);
    if (!target) return { success: false, message: 'Appointment not found' };

    const newEndTime = calculateEndTime(newStartTime, target.duration);
    const updated: Appointment = {
      ...target,
      appointmentDate: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      status: 'Confirmed',
      updatedAt: new Date().toISOString(),
    };

    await SalonDatabaseService.updateAppointment(updated);
    setAppointments(prev => prev.map(a => (a.id === id ? updated : a)));

    // Add notification
    const notif: SalonNotification = {
      id: `notif-${Date.now()}`,
      recipientType: 'customer',
      customerId: target.customerId,
      title: 'Appointment Rescheduled',
      message: `Your appointment (${target.bookingId}) has been moved to ${newDate} at ${newStartTime}.`,
      type: 'booking_rescheduled',
      read: false,
      createdAt: new Date().toISOString(),
      bookingId: target.bookingId,
    };
    await SalonDatabaseService.addNotification(notif);
    setNotifications(prev => [notif, ...prev]);

    showToast(`Appointment rescheduled to ${newDate} at ${newStartTime}.`);
    return { success: true, message: 'Appointment rescheduled successfully' };
  };

  const cancelAppointment = async (id: string, reason?: string) => {
    await updateAppointmentStatus(id, 'Cancelled', reason ? `Cancelled by user: ${reason}` : 'Cancelled by customer');
  };

  // Offer Handlers
  const addOffer = async (newOff: Omit<Offer, 'id' | 'usedCount'>) => {
    const offer: Offer = {
      ...newOff,
      id: `off-${Date.now()}`,
      usedCount: 0,
    };
    await SalonDatabaseService.saveOffer(offer);
    setOffers(prev => [offer, ...prev]);
    showToast(`Offer "${offer.name}" (${offer.couponCode}) created.`);
  };

  const updateOffer = async (offer: Offer) => {
    await SalonDatabaseService.saveOffer(offer);
    setOffers(prev => prev.map(o => (o.id === offer.id ? offer : o)));
    showToast(`Offer "${offer.couponCode}" updated.`);
  };

  const deleteOffer = async (id: string) => {
    const target = offers.find(o => o.id === id);
    await SalonDatabaseService.deleteOffer(id);
    setOffers(prev => prev.filter(o => o.id !== id));
    showToast(`Offer "${target?.couponCode || 'Code'}" deleted.`, 'info');
  };

  const toggleOfferActive = async (id: string) => {
    const target = offers.find(o => o.id === id);
    if (!target) return;
    const updated = { ...target, active: !target.active };
    await updateOffer(updated);
  };

  // Customers
  const updateCustomer = async (customer: Customer) => {
    await SalonDatabaseService.saveCustomer(customer);
    setCustomers(prev => prev.map(c => (c.id === customer.id ? customer : c)));
    showToast(`Customer record for ${customer.name} updated.`);
  };

  // Settings & Hours
  const updateBusinessHours = async (hours: BusinessDayHours[]) => {
    await SalonDatabaseService.saveBusinessHours(hours);
    setBusinessHours(hours);
    showToast('Operating business hours saved successfully.');
  };

  const addBlockedDate = async (date: string, reason: string) => {
    const newEntry: BlockedDate = {
      id: `blk-${Date.now()}`,
      date,
      reason,
    };
    const updated = [...blockedDates, newEntry];
    await SalonDatabaseService.saveBlockedDates(updated);
    setBlockedDates(updated);
    showToast(`Date ${date} marked as closed / blocked.`);
  };

  const removeBlockedDate = async (id: string) => {
    const updated = blockedDates.filter(b => b.id !== id);
    await SalonDatabaseService.saveBlockedDates(updated);
    setBlockedDates(updated);
    showToast('Blocked date removed.');
  };

  const updateSettings = async (newSettings: BusinessSettings) => {
    await SalonDatabaseService.saveSettings(newSettings);
    setSettings(newSettings);
    showToast('Salon settings updated.');
  };

  // Notifications
  const markNotificationRead = async (id: string) => {
    await SalonDatabaseService.markNotificationRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  // Reset Demo Data
  const resetDemoData = async () => {
    await SalonDatabaseService.resetAllData();
    await loadAllData();
    showToast('All salon data reset to initial demo state!');
  };

  return (
    <SalonContext.Provider
      value={{
        services,
        appointments,
        customers,
        offers,
        businessHours,
        blockedDates,
        settings,
        notifications,
        isLoading,
        toasts,
        showToast,
        removeToast,
        addService,
        updateService,
        deleteService,
        toggleServiceActive,
        createAppointment,
        updateAppointmentStatus,
        rescheduleAppointment,
        cancelAppointment,
        addOffer,
        updateOffer,
        deleteOffer,
        toggleOfferActive,
        updateCustomer,
        updateBusinessHours,
        addBlockedDate,
        removeBlockedDate,
        updateSettings,
        markNotificationRead,
        resetDemoData,
        refreshData: loadAllData,
      }}
    >
      {children}
    </SalonContext.Provider>
  );
};

export const useSalon = () => {
  const context = useContext(SalonContext);
  if (!context) {
    throw new Error('useSalon must be used within a SalonProvider');
  }
  return context;
};
