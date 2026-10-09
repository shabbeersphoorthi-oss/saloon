import { Service, Customer, Appointment, Offer, BusinessDayHours, BusinessSettings, BlockedDate, SalonNotification } from '../types/salon';

export const INITIAL_SERVICES: Service[] = [
  // 1. HAIR CUTTING & SHAVING — 250/-
  {
    id: 'srv-1',
    name: 'Hair Cutting & Shaving',
    category: 'Packages',
    description: 'Classic combo: Precision hair cut styled to your preference paired with a smooth clean shave.',
    duration: 40,
    price: 250,
    priceRange: '₹250',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
    active: true,
    featured: true,
  },
  // 2. LATEST HAIR CUTTING ONLY — 150/- to 200
  {
    id: 'srv-2',
    name: 'Latest Hair Cutting Only',
    category: 'Hair',
    description: 'Trendy modern styles, crop fades, buzz cuts, pompadour and textured volume cuts.',
    duration: 30,
    price: 180,
    priceRange: '₹150 to ₹200',
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80',
    active: true,
    featured: true,
  },
  // 3. HAIR CUTTING ONLY — 150/-
  {
    id: 'srv-3',
    name: 'Hair Cutting Only',
    category: 'Hair',
    description: 'Traditional standard gentleman haircut with neat scissor trimming and neckline taper.',
    duration: 25,
    price: 150,
    priceRange: '₹150',
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80',
    active: true,
    homeVisitAvailable: true,
    featured: true,
  },
  // 4. SHAVING ONLY — 80/-
  {
    id: 'srv-4',
    name: 'Shaving Only',
    category: 'Grooming',
    description: 'Clean classic straight razor shave with warm lather and fresh towel wipe.',
    duration: 15,
    price: 80,
    priceRange: '₹80',
    image: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  // 5. FOAM SHAVING — 100/-
  {
    id: 'srv-5',
    name: 'Foam Shaving',
    category: 'Grooming',
    description: 'Rich moisturizing foam shave with skin-soothing glide and antiseptic after-splash.',
    duration: 20,
    price: 100,
    priceRange: '₹100',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  // 6. BABY CUTTING — 150/-
  {
    id: 'srv-6',
    name: 'Baby Cutting',
    category: 'Hair',
    description: 'Gentle, patient, and tear-free haircut specially designed for toddlers and infants.',
    duration: 25,
    price: 150,
    priceRange: '₹150',
    image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  // 7. BOYS CUTTING — 150/-
  {
    id: 'srv-7',
    name: 'Boys Cutting',
    category: 'Hair',
    description: 'Smart school cuts and cool trendy styling for young boys and students.',
    duration: 25,
    price: 150,
    priceRange: '₹150',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  // 8. FRENCH SHAVING ONLY — 100/-
  {
    id: 'srv-8',
    name: 'French Shaving Only',
    category: 'Grooming',
    description: 'Precision French beard styling, crisp mustache sculpting and sharp cheek contours.',
    duration: 20,
    price: 100,
    priceRange: '₹100',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  // 9. TRIMMING — 100/-
  {
    id: 'srv-9',
    name: 'Trimming',
    category: 'Grooming',
    description: 'Machine clipper trimming to your desired guard length for beard and mustache.',
    duration: 15,
    price: 100,
    priceRange: '₹100',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  // 10. FACIAL — 800/- to 3000/-
  {
    id: 'srv-10',
    name: 'Facial',
    category: 'Skin & Facial',
    description: 'Revitalizing deep skin treatment, cleansing, pore extraction, fruit/gold massage and glow mask.',
    duration: 50,
    price: 800,
    priceRange: '₹800 to ₹3,000',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
    active: true,
    featured: true,
  },
  // 11. HAIR DYE ONLY — 150/- to 500/-
  {
    id: 'srv-11',
    name: 'Hair Dye Only',
    category: 'Hair',
    description: 'Quality grey coverage and natural black/brown shade application for hair.',
    duration: 35,
    price: 250,
    priceRange: '₹150 to ₹500',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  // 12. D-TAN — 400/- to 600/-
  {
    id: 'srv-12',
    name: 'D-Tan',
    category: 'Skin & Facial',
    description: 'Effective sun tan removal cream pack to brighten skin tone and clear dark spots.',
    duration: 35,
    price: 450,
    priceRange: '₹400 to ₹600',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
    active: true,
    featured: true,
  },
  // 13. FACE MASSAGE — 150/- to 200/-
  {
    id: 'srv-13',
    name: 'Face Massage',
    category: 'Skin & Facial',
    description: 'Relaxing facial muscle acupressure massage using nourishing herbal massage cream.',
    duration: 20,
    price: 150,
    priceRange: '₹150 to ₹200',
    image: 'https://images.unsplash.com/photo-1512290900672-1f02f928e469?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  // 14. FACE SCRUB — 300/- to 400/-
  {
    id: 'srv-14',
    name: 'Face Scrub',
    category: 'Skin & Facial',
    description: 'Exfoliating micro-bead walnut scrub to remove dead cells, blackheads and excess oil.',
    duration: 25,
    price: 300,
    priceRange: '₹300 to ₹400',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  // 15. FACE MILK CLEANING — 150/-
  {
    id: 'srv-15',
    name: 'Face Milk Cleaning',
    category: 'Skin & Facial',
    description: 'Gentle raw milk and cleansing milk treatment to hydrate and wash impurities from face.',
    duration: 20,
    price: 150,
    priceRange: '₹150',
    image: 'https://images.unsplash.com/photo-1512290900672-1f02f928e469?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  // 16. HEAD MASSAGE WITH OIL ONLY — 100/-
  {
    id: 'srv-16',
    name: 'Head Massage With Oil Only',
    category: 'Grooming',
    description: 'Traditional cooling herbal oil head massage for instant stress relief and blood circulation.',
    duration: 20,
    price: 100,
    priceRange: '₹100',
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=600&q=80',
    active: true,
    featured: true,
  },
  // 17. HAIR STRAIGHTEN — 2000/- to 2500/-
  {
    id: 'srv-17',
    name: 'Hair Straighten',
    category: 'Hair',
    description: 'Permanent thermal hair straightening and smoothening treatment with glossy finish.',
    duration: 100,
    price: 2000,
    priceRange: '₹2,000 to ₹2,500',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  // 18. HAIR SPA — 400/- to 600/-
  {
    id: 'srv-18',
    name: 'Hair Spa',
    category: 'Hair',
    description: 'Deep conditioning cream therapy with warm steam towel wrap to revive dry hair.',
    duration: 45,
    price: 450,
    priceRange: '₹400 to ₹600',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    active: true,
    featured: true,
  },
  // 19. ARM PITS Only Disposable Razor — 25/-
  {
    id: 'srv-19',
    name: 'Arm Pits Only Disposable Razor',
    category: 'Grooming',
    description: 'Hygienic single-use disposable blade hair removal for armpits with antiseptic wipe.',
    duration: 10,
    price: 25,
    priceRange: '₹25',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  // 20. HAIR DYE CHARGES — 100/-
  {
    id: 'srv-20',
    name: 'Hair Dye Charges',
    category: 'Hair',
    description: 'Application and hair wash service charge when client brings their own color/dye.',
    duration: 25,
    price: 100,
    priceRange: '₹100',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80',
    active: true,
  },
  // 21. HOME VISIT / DOORSTEP SALON SERVICE — ₹400
  {
    id: 'srv-21',
    name: 'Home Visit (Doorstep Salon Service)',
    category: 'Packages',
    description: 'Professional salon grooming at your home or doorstep. Stylist arrives with sanitized equipment and styling kit.',
    duration: 45,
    price: 400,
    priceRange: '₹400',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
    active: true,
    featured: true,
  },
  // 22. BABY HAIR CUTTING (WEDNESDAYS ONLY) — ₹1000
  {
    id: 'srv-22',
    name: 'Baby Hair Cutting',
    category: 'Hair',
    description: 'Exclusive Wednesday specialty: Ultra-gentle, patient, and tear-free haircutting for toddlers & infants with sterilized equipment and dedicated calm stylist.',
    duration: 30,
    price: 1000,
    priceRange: '₹1000',
    image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=600&q=80',
    active: true,
    featured: true,
    availableDays: ['Wednesday'],
    dayRestrictionNote: 'Available only on Wednesdays',
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_OFFERS: Offer[] = [];

export const INITIAL_APPOINTMENTS: Appointment[] = [];

export const INITIAL_HOURS: BusinessDayHours[] = [
  { day: "Monday", isOpen: true, openTime: "07:00", closeTime: "21:30", breakStart: "13:30", breakEnd: "14:00" },
  { day: "Tuesday", isOpen: true, openTime: "07:00", closeTime: "21:30", breakStart: "13:30", breakEnd: "14:00" },
  { day: "Wednesday", isOpen: true, openTime: "07:00", closeTime: "21:30", breakStart: "13:30", breakEnd: "14:00" },
  { day: "Thursday", isOpen: true, openTime: "07:00", closeTime: "21:30", breakStart: "13:30", breakEnd: "14:00" },
  { day: "Friday", isOpen: true, openTime: "07:00", closeTime: "21:30", breakStart: "13:30", breakEnd: "14:00" },
  { day: "Saturday", isOpen: true, openTime: "07:00", closeTime: "21:30", breakStart: "14:00", breakEnd: "14:30" },
  { day: "Sunday", isOpen: true, openTime: "07:00", closeTime: "21:30", breakStart: "13:30", breakEnd: "14:00" },
];

export const INITIAL_SETTINGS: BusinessSettings = {
  salonName: "Bloom Saloon",
  owners: ["Bloom Saloon Management"],
  phone: "8309578606",
  email: "contact@bloomsaloon.in",
  address: "107/P, 3-13-94/11/A, Ramanthapur, Hyderabad, Telangana",
  currency: "INR (₹)",
  taxRate: 0,
  allowOnlineCancellation: true,
  minAdvanceBookingHours: 1,
  maxAdvanceBookingDays: 30,
  superUserEmail: "shabbeersphoorthi@gmail.com",
  clientOwnerEmail: "srinivas.bloom@gmail.com",
  clientOwnerName: "Bloom Saloon Owner",
};

export const INITIAL_BLOCKED_DATES: BlockedDate[] = [];

export const INITIAL_NOTIFICATIONS: SalonNotification[] = [];
