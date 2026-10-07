import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SalonProvider, useSalon } from './context/SalonContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/Toast';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Customer Pages
import { HomePage } from './pages/customer/HomePage';
import { ServicesPage } from './pages/customer/ServicesPage';
import { PriceListPage } from './pages/customer/PriceListPage';
import { BookingPage } from './pages/customer/BookingPage';
import { AppointmentsPage } from './pages/customer/AppointmentsPage';
import { ProfilePage } from './pages/customer/ProfilePage';
import { ContactPage } from './pages/customer/ContactPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminAppointmentsPage } from './pages/admin/AdminAppointmentsPage';
import { AdminCalendarPage } from './pages/admin/AdminCalendarPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminOffersPage } from './pages/admin/AdminOffersPage';
import { AdminAvailabilityPage } from './pages/admin/AdminAvailabilityPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Admin Components
import { AdminSidebar } from './components/admin/AdminSidebar';
import { AdminHeader } from './components/admin/AdminHeader';
import { Service, Appointment } from './types/salon';
import { CinematicBackground3D } from './components/cinematic/CinematicBackground3D';
import { InstallAppModal } from './components/common/InstallAppModal';
import { MobileAppBanner } from './components/common/MobileAppBanner';

function MainApp() {
  const { isLoading } = useSalon();
  const { isAdminLoggedIn, adminUser } = useAuth();
  const [isInstallAppOpen, setIsInstallAppOpen] = useState(false);

  // Route state
  const [currentTab, setCurrentTab] = useState<string>(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (hash === 'admin' || hash.startsWith('admin-')) {
      return hash === 'admin' ? 'admin-dashboard' : hash;
    }
    return hash || 'home';
  });

  // Selected service or coupon passed to booking
  const [bookingService, setBookingService] = useState<Service | null>(null);
  const [bookingCoupon, setBookingCoupon] = useState<string>('');

  // Mobile sidebar toggle for admin
  const [adminMobileOpen, setAdminMobileOpen] = useState(false);

  // Sync route with URL hash for navigation & bookmarking
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash) {
        const target = hash === 'admin' ? 'admin-dashboard' : hash === 'offers' ? 'services' : hash;
        setCurrentTab(target);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigateTo = (tab: string) => {
    setCurrentTab(tab);
    window.location.hash = `#/${tab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectServiceToBook = (service: Service) => {
    setBookingService(service);
    navigateTo('book');
  };

  const handleApplyCouponToBooking = (couponCode: string) => {
    setBookingCoupon(couponCode);
    navigateTo('book');
  };

  const handleOpenBooking = () => {
    navigateTo('book');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <LoadingSpinner label="Preparing Bloom Saloon..." size="lg" />
      </div>
    );
  }

  const isAdminTab = currentTab.startsWith('admin-') || currentTab === 'admin';

  // Handle protected admin routes
  if (isAdminTab) {
    if (!isAdminLoggedIn) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between">
          <Navbar
            currentTab={currentTab}
            onNavigate={navigateTo}
            onOpenBooking={handleOpenBooking}
          />
          <main className="flex-1">
            <AdminLoginPage
              onLoginSuccess={() => navigateTo('admin-dashboard')}
              onNavigateHome={() => navigateTo('home')}
            />
          </main>
          <Footer onNavigate={navigateTo} onOpenBooking={handleOpenBooking} />
          <ToastContainer />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#FAF8F5] flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar currentTab={currentTab} onNavigate={navigateTo} />
        </div>

        {/* Mobile Slide-out Drawer */}
        {adminMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setAdminMobileOpen(false)}
            />
            <div className="relative z-10">
              <AdminSidebar
                currentTab={currentTab}
                onNavigate={navigateTo}
                onCloseMobile={() => setAdminMobileOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Admin Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader
            onToggleMobileMenu={() => setAdminMobileOpen(true)}
            onNavigateToNotifications={() => navigateTo('admin-notifications')}
            onNavigateToCustomer={() => navigateTo('home')}
          />

          <main className="flex-1">
            {currentTab === 'admin-dashboard' && (
              <AdminDashboardPage
                onNavigateTab={navigateTo}
                onSelectAppointment={() => navigateTo('admin-appointments')}
              />
            )}
            {currentTab === 'admin-appointments' && <AdminAppointmentsPage />}
            {currentTab === 'admin-calendar' && <AdminCalendarPage />}
            {currentTab === 'admin-customers' && <AdminCustomersPage />}
            {currentTab === 'admin-services' && <AdminServicesPage />}
            {currentTab === 'admin-offers' && <AdminOffersPage />}
            {currentTab === 'admin-availability' && <AdminAvailabilityPage />}
            {currentTab === 'admin-analytics' && <AdminAnalyticsPage />}
            {currentTab === 'admin-notifications' && <AdminNotificationsPage />}
            {currentTab === 'admin-settings' && <AdminSettingsPage />}
          </main>
        </div>
        <ToastContainer />
      </div>
    );
  }

  // Customer Facing Layout
  return (
    <div className="relative min-h-screen bg-[#FAF8F5]/92 backdrop-blur-xs flex flex-col justify-between overflow-x-hidden">
      {/* Global 3D Spatial Canvas Layer */}
      <CinematicBackground3D />

      <div className="relative z-10 flex flex-col min-h-screen justify-between">
        <MobileAppBanner onOpenModal={() => setIsInstallAppOpen(true)} />

        <Navbar
          currentTab={currentTab}
          onNavigate={navigateTo}
          onOpenBooking={handleOpenBooking}
          onOpenInstallApp={() => setIsInstallAppOpen(true)}
        />

        <main className="flex-1">
          {currentTab === 'home' && (
            <HomePage
              onNavigate={navigateTo}
              onSelectServiceToBook={handleSelectServiceToBook}
              onOpenBooking={handleOpenBooking}
              onOpenInstallApp={() => setIsInstallAppOpen(true)}
            />
          )}
          {currentTab === 'services' && (
            <ServicesPage onSelectServiceToBook={handleSelectServiceToBook} />
          )}
          {currentTab === 'price-list' && (
            <PriceListPage onSelectServiceToBook={handleSelectServiceToBook} />
          )}
          {currentTab === 'book' && (
            <BookingPage
              initialService={bookingService}
              initialCouponCode={bookingCoupon}
              onNavigate={navigateTo}
              onClearInitialService={() => {
                setBookingService(null);
                setBookingCoupon('');
              }}
            />
          )}
          {currentTab === 'appointments' && (
            <AppointmentsPage onOpenBooking={handleOpenBooking} />
          )}
          {currentTab === 'profile' && <ProfilePage />}
          {currentTab === 'contact' && <ContactPage />}
        </main>

        <Footer
          onNavigate={navigateTo}
          onOpenBooking={handleOpenBooking}
          onOpenInstallApp={() => setIsInstallAppOpen(true)}
        />
      </div>

      <InstallAppModal
        isOpen={isInstallAppOpen}
        onClose={() => setIsInstallAppOpen(false)}
      />

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SalonProvider>
        <MainApp />
      </SalonProvider>
    </AuthProvider>
  );
}
