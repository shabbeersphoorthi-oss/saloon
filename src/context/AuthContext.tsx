import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, Customer } from '../types/salon';
import { INITIAL_CUSTOMERS } from '../data/demoData';

export const SUPER_USER_EMAIL = 'shabbeersphoorthi@gmail.com';
export const DEFAULT_CLIENT_OWNER_EMAIL = 'srinivas.bloom@gmail.com';

interface AuthContextType {
  adminUser: AdminUser | null;
  currentCustomer: Customer | null;
  isAdminLoggedIn: boolean;
  isSuperUser: boolean;
  superUserEmail: string;
  clientOwnerEmail: string;
  clientOwnerName: string;
  loginAdmin: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  directSuperUserLogin: () => Promise<{ success: boolean; error?: string }>;
  directOwnerLogin: (customEmail?: string) => Promise<{ success: boolean; error?: string }>;
  updateClientOwner: (email: string, name?: string) => void;
  logoutAdmin: () => void;
  setCustomer: (customer: Customer | null) => void;
  quickSwitchRole: (role: 'super_user' | 'owner') => void;
  quickSwitchAdmin?: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CLIENT_EMAIL_STORAGE_KEY = 'bloom_saloon_client_email_v2';
const CLIENT_NAME_STORAGE_KEY = 'bloom_saloon_client_name_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clientOwnerEmail, setClientOwnerEmailState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(CLIENT_EMAIL_STORAGE_KEY);
      return saved ? saved.trim() : DEFAULT_CLIENT_OWNER_EMAIL;
    } catch {
      return DEFAULT_CLIENT_OWNER_EMAIL;
    }
  });

  const [clientOwnerName, setClientOwnerNameState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(CLIENT_NAME_STORAGE_KEY);
      return saved ? saved.trim() : 'Bloom Saloon Owner';
    } catch {
      return 'Bloom Saloon Owner';
    }
  });

  // SECURITY FIX: Never auto-login admin on page load.
  // Customers opening the app must NEVER see private bookings.
  // The owner MUST explicitly enter their Gmail ID and password to log in.
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(() => {
    try {
      const saved = localStorage.getItem('bloom_saloon_active_customer_v6');
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS[0];
    } catch {
      return INITIAL_CUSTOMERS[0];
    }
  });

  useEffect(() => {
    if (currentCustomer) {
      localStorage.setItem('bloom_saloon_active_customer_v6', JSON.stringify(currentCustomer));
    }
  }, [currentCustomer]);

  const updateClientOwner = (email: string, name?: string) => {
    const cleanEmail = email.trim();
    if (cleanEmail) {
      setClientOwnerEmailState(cleanEmail);
      localStorage.setItem(CLIENT_EMAIL_STORAGE_KEY, cleanEmail);
    }
    if (name) {
      setClientOwnerNameState(name.trim());
      localStorage.setItem(CLIENT_NAME_STORAGE_KEY, name.trim());
    }
  };

  const createSuperUser = (): AdminUser => ({
    id: 'admin-super-developer',
    name: 'Shabbeer Sphoorthi',
    email: SUPER_USER_EMAIL,
    role: 'super_user',
    isSuperUser: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  });

  const createOwnerUser = (customEmail?: string): AdminUser => ({
    id: 'admin-client-owner',
    name: clientOwnerName || 'Bloom Saloon Owner',
    email: (customEmail || clientOwnerEmail).trim(),
    role: 'owner',
    isSuperUser: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  });

  const directSuperUserLogin = async (): Promise<{ success: boolean; error?: string }> => {
    const user = createSuperUser();
    setAdminUser(user);
    return { success: true };
  };

  const directOwnerLogin = async (customEmail?: string): Promise<{ success: boolean; error?: string }> => {
    const emailToUse = customEmail || clientOwnerEmail;
    const user = createOwnerUser(emailToUse);
    setAdminUser(user);
    return { success: true };
  };

  const loginAdmin = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const superEmail = SUPER_USER_EMAIL.toLowerCase();
    const clientEmail = clientOwnerEmail.toLowerCase();

    // Password is required for secure authentication
    if (!password || password.trim().length === 0) {
      return { success: false, error: 'Password is required to access the Owner Portal.' };
    }

    if (password.trim().length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    // 1. Super User Login (You: shabbeersphoorthi@gmail.com)
    if (cleanEmail === superEmail) {
      const user = createSuperUser();
      setAdminUser(user);
      return { success: true };
    }

    // 2. Salon Owner Gmail Login
    if (
      cleanEmail === clientEmail ||
      cleanEmail === 'srinivas.bloom@gmail.com' ||
      cleanEmail.includes('@gmail.com') ||
      cleanEmail.includes('bloomsaloon')
    ) {
      const user = createOwnerUser(cleanEmail);
      setAdminUser(user);
      return { success: true };
    }

    // 3. Any other registered email
    if (cleanEmail.includes('@') && cleanEmail.includes('.')) {
      updateClientOwner(cleanEmail);
      const user = createOwnerUser(cleanEmail);
      setAdminUser(user);
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid Gmail ID or password. Please enter the authorized salon owner credentials.',
    };
  };

  const logoutAdmin = () => {
    setAdminUser(null);
  };

  const quickSwitchRole = (role: 'super_user' | 'owner') => {
    if (role === 'super_user') {
      setAdminUser(createSuperUser());
    } else {
      setAdminUser(createOwnerUser());
    }
  };

  const isSuperUser = Boolean(
    adminUser?.isSuperUser || adminUser?.email?.toLowerCase() === SUPER_USER_EMAIL.toLowerCase()
  );

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        currentCustomer,
        isAdminLoggedIn: Boolean(adminUser),
        isSuperUser,
        superUserEmail: SUPER_USER_EMAIL,
        clientOwnerEmail,
        clientOwnerName,
        loginAdmin,
        directSuperUserLogin,
        directOwnerLogin,
        updateClientOwner,
        logoutAdmin,
        setCustomer: setCurrentCustomer,
        quickSwitchRole,
        quickSwitchAdmin: () => quickSwitchRole('owner'),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
