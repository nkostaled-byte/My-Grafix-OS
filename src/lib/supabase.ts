import { createClient } from '@supabase/supabase-js';
import { 
  Client, TeamMember, Customer, Submission, Product, 
  InventoryMovement, Order, OrderItem, Service, Staff, 
  Booking, Invoice, InvoiceItem, EmailLog, DailySale, MonthlyRevenue,
  BusinessType
} from '../types';

// Access Environment Variables Safely
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
export const workerBaseUrl = (import.meta as any).env?.VITE_WORKER_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

// Initialize Supabase Client ONLY if credentials are provided and valid
export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'MY_SUPABASE_URL' && 
  supabaseAnonKey !== 'MY_SUPABASE_ANON_KEY';

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Initial Multi-Tenant Seeding for Mock Database Fallback
const DEFAULT_CLIENTS: Client[] = [
  {
    id: 'client-barbershop-1',
    name: 'Blade & Barrel Barbershop',
    logo_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=120&h=120&q=80',
    business_type: 'barbershop',
    primary_color: '#0f172a', // Slate 900
    secondary_color: '#b45309', // Amber 700
    banking_details: 'Barclays Bank • Sort Code: 20-45-78 • Account: 83920192',
    address: '42 Savile Row, London, W1S 3PG',
    phone: '+44 20 7946 0912',
    email: 'hello@bladeandbarrel.co',
    website_hero_title: 'Premium Grooming for the Modern Gentleman',
    website_hero_subtitle: 'Artisanal haircuts, hot towel shaves, and top-tier styling in the heart of London.',
    website_seo_keywords: 'barber, london barbershop, mens haircut, hot towel shave, beard trim'
  },
  {
    id: 'client-cafe-2',
    name: 'The Daily Grind Coffee',
    logo_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=120&h=120&q=80',
    business_type: 'cafe',
    primary_color: '#451a03', // Warm Brown 900
    secondary_color: '#d97706', // Amber 600
    banking_details: 'Lloyds Bank • Sort Code: 30-91-25 • Account: 10482938',
    address: '18 Espresso Lane, Shoreditch, E1 6JJ',
    phone: '+44 20 8123 4567',
    email: 'brew@dailygrind.coffee',
    website_hero_title: 'Sustainably Sourced, Expertly Brewed',
    website_hero_subtitle: 'Fresh single-origin espresso and artisanal organic pastries baked fresh daily.',
    website_seo_keywords: 'coffee shop, shoreditch espresso, single origin, organic cafe, pastry'
  },
  {
    id: 'client-construction-3',
    name: 'Apex Construction',
    logo_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=120&h=120&q=80',
    business_type: 'construction',
    primary_color: '#1e3a8a', // Blue 900
    secondary_color: '#e11d48', // Rose 600
    banking_details: 'HSBC Bank • Sort Code: 40-12-88 • Account: 77284910',
    address: 'Enterprise House, Industrial Way, Manchester, M17 1BR',
    phone: '+44 161 496 0194',
    email: 'projects@apexconstruction.build',
    website_hero_title: 'Building Tomorrow, Restoring Today',
    website_hero_subtitle: 'Residential developments, high-end renovations, and commercial construction projects.',
    website_seo_keywords: 'builder manchester, home renovation, civil engineering, commercial building'
  }
];

const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'tm-1',
    client_id: 'client-barbershop-1',
    auth_user_id: 'user-barbershop-owner',
    name: 'Julian Carter',
    email: 'julian@bladeandbarrel.co',
    role: 'owner',
    status: 'active',
    permissions: { manage_billing: true, manage_inventory: true, manage_team: true }
  },
  {
    id: 'tm-2',
    client_id: 'client-barbershop-1',
    auth_user_id: 'user-barbershop-staff',
    name: 'Marcus Vance',
    email: 'marcus@bladeandbarrel.co',
    role: 'staff',
    status: 'active',
    permissions: { manage_billing: false, manage_inventory: true, manage_team: false }
  },
  {
    id: 'tm-3',
    client_id: 'client-cafe-2',
    auth_user_id: 'user-cafe-owner',
    name: 'Sophia Chen',
    email: 'sophia@dailygrind.coffee',
    role: 'owner',
    status: 'active',
    permissions: { manage_billing: true, manage_inventory: true, manage_team: true }
  },
  {
    id: 'tm-4',
    client_id: 'client-construction-3',
    auth_user_id: 'user-construction-owner',
    name: 'Robert Vance',
    email: 'vance@apexconstruction.build',
    role: 'owner',
    status: 'active',
    permissions: { manage_billing: true, manage_inventory: true, manage_team: true }
  }
];

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    client_id: 'client-barbershop-1',
    name: 'Alexander Sterling',
    email: 'alexander@sterling.com',
    phone: '+44 7700 900077',
    notes: 'Prefers scissors-only on top, clay wax styling. Regular client.',
    tags: ['VIP', 'Regular'],
    created_at: '2026-05-10T10:00:00Z'
  },
  {
    id: 'cust-2',
    client_id: 'client-barbershop-1',
    name: 'Liam Neeson',
    email: 'liam@taken.com',
    phone: '+44 7700 900188',
    notes: 'Very specific beard trim requirements. Be punctual.',
    tags: ['Punctual'],
    created_at: '2026-06-15T14:30:00Z'
  },
  {
    id: 'cust-3',
    client_id: 'client-cafe-2',
    name: 'Emma Watson',
    email: 'emma@watson.com',
    phone: '+44 7700 900222',
    notes: 'Always orders Oat Flat White + Vegan Croissant.',
    tags: ['Local', 'Vegan'],
    created_at: '2026-06-20T08:15:00Z'
  },
  {
    id: 'cust-4',
    client_id: 'client-construction-3',
    name: 'Heritage Trust London',
    email: 'contracts@heritagetrust.org',
    phone: '+44 20 7946 0033',
    notes: 'Commercial restoration client. Generates substantial repeat business.',
    tags: ['Corporate', 'High-Value'],
    created_at: '2026-01-14T09:00:00Z'
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  // Barbershop Products
  {
    id: 'prod-barber-1',
    client_id: 'client-barbershop-1',
    name: 'Classic Pomade (Strong Hold)',
    category: 'Styling',
    sku: 'POM-STR-01',
    barcode: '5012345678901',
    price: 18.00,
    cost_price: 6.50,
    stock_qty: 45,
    low_stock_warning: 10,
    image_url: 'https://images.unsplash.com/photo-1590156546746-c224029006c9?auto=format&fit=crop&w=150&h=150&q=80',
    variants: ['100ml', '200ml']
  },
  {
    id: 'prod-barber-2',
    client_id: 'client-barbershop-1',
    name: 'Sandalwood Beard Balm',
    category: 'Beard Care',
    sku: 'BALM-SAN-02',
    barcode: '5012345678918',
    price: 22.00,
    cost_price: 8.00,
    stock_qty: 8,
    low_stock_warning: 15, // Low stock!
    image_url: 'https://images.unsplash.com/photo-1626479138314-a0945a12db7a?auto=format&fit=crop&w=150&h=150&q=80',
    variants: ['50g']
  },
  {
    id: 'prod-barber-3',
    client_id: 'client-barbershop-1',
    name: 'Menthol Shave Cream',
    category: 'Shaving',
    sku: 'SHV-CRM-03',
    barcode: '5012345678925',
    price: 15.00,
    cost_price: 5.00,
    stock_qty: 0,
    low_stock_warning: 5, // Out of stock!
    image_url: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?auto=format&fit=crop&w=150&h=150&q=80',
    variants: ['150ml']
  },

  // Cafe Products
  {
    id: 'prod-cafe-1',
    client_id: 'client-cafe-2',
    name: 'Signature House Blend (Whole Bean)',
    category: 'Coffee Beans',
    sku: 'BEAN-HOUSE-01',
    barcode: '5022345678902',
    price: 12.50,
    cost_price: 4.20,
    stock_qty: 60,
    low_stock_warning: 15,
    image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=150&h=150&q=80',
    variants: ['250g', '1kg']
  },
  {
    id: 'prod-cafe-2',
    client_id: 'client-cafe-2',
    name: 'Ethiopian Yirgacheffe Beans',
    category: 'Coffee Beans',
    sku: 'BEAN-ETH-02',
    barcode: '5022345678919',
    price: 14.90,
    cost_price: 5.10,
    stock_qty: 4,
    low_stock_warning: 10, // Low Stock!
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=150&h=150&q=80',
    variants: ['250g']
  },

  // Construction Products
  {
    id: 'prod-const-1',
    client_id: 'client-construction-3',
    name: 'Heavy Duty Structural Timber 4x4',
    category: 'Materials',
    sku: 'TIM-HD-44',
    price: 24.50,
    cost_price: 11.00,
    stock_qty: 150,
    low_stock_warning: 20,
    image_url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 'prod-const-2',
    client_id: 'client-construction-3',
    name: 'Premium Waterproof Sealant Gray',
    category: 'Adhesives',
    sku: 'SEAL-WP-GY',
    price: 9.80,
    cost_price: 3.50,
    stock_qty: 12,
    low_stock_warning: 25, // Low stock!
    image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=150&h=150&q=80'
  }
];

const DEFAULT_INVENTORY_MOVEMENTS: InventoryMovement[] = [
  {
    id: 'mov-1',
    client_id: 'client-barbershop-1',
    product_id: 'prod-barber-1',
    product_name: 'Classic Pomade (Strong Hold)',
    qty: 20,
    type: 'in',
    reason: 'Monthly restock shipment from supplier',
    created_at: '2026-07-10T11:00:00Z'
  },
  {
    id: 'mov-2',
    client_id: 'client-barbershop-1',
    product_id: 'prod-barber-2',
    product_name: 'Sandalwood Beard Balm',
    qty: -2,
    type: 'out',
    reason: 'Over-the-counter walk-in sale checkout',
    created_at: '2026-07-17T15:20:00Z'
  },
  {
    id: 'mov-3',
    client_id: 'client-barbershop-1',
    product_id: 'prod-barber-3',
    product_name: 'Menthol Shave Cream',
    qty: -5,
    type: 'adjustment',
    reason: 'Damaged item disposal audit adjustment',
    created_at: '2026-07-12T09:45:00Z'
  }
];

const DEFAULT_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    client_id: 'client-barbershop-1',
    form_name: 'contact',
    customer_name: 'Terence Hill',
    customer_email: 'terence@hill.org',
    customer_phone: '+44 7700 900511',
    message: 'Hello, do you offer student discounts on mid-week hair styling services?',
    assigned_staff_id: 'tm-2',
    status: 'new',
    created_at: '2026-07-16T17:00:00Z'
  },
  {
    id: 'sub-2',
    client_id: 'client-barbershop-1',
    form_name: 'quote',
    customer_name: 'VIP Events London',
    customer_email: 'bookings@vipevents.com',
    customer_phone: '+44 20 7112 0044',
    message: 'Requesting a formal quotation to hire 3 barbers for a corporate styling popup event on September 24th.',
    status: 'new',
    created_at: '2026-07-17T11:15:00Z'
  },
  {
    id: 'sub-3',
    client_id: 'client-cafe-2',
    form_name: 'contact',
    customer_name: 'Alice Cooper',
    customer_email: 'alice@cooper.com',
    message: 'Hi, can I reserve the back table for 15 people for an eco-book club on Tuesday?',
    status: 'replied',
    created_at: '2026-07-12T14:00:00Z'
  },
  {
    id: 'sub-4',
    client_id: 'client-construction-3',
    form_name: 'quote',
    customer_name: 'Sarah Jenkins',
    customer_email: 'sarah@jenkins.me',
    customer_phone: '+44 7700 900999',
    message: 'Hello, I need an estimate to construct a modular cedar garden studio home office (approx 4m x 3m) including wiring and plumbing.',
    status: 'new',
    created_at: '2026-07-18T06:30:00Z'
  }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ord-1',
    client_id: 'client-barbershop-1',
    order_number: 'ORD-729401',
    customer_name: 'Alexander Sterling',
    customer_email: 'alexander@sterling.com',
    customer_phone: '+44 7700 900077',
    status: 'paid',
    total: 36.00,
    notes: 'Picked up in shop.',
    shipping_address: 'In-Store Pickup',
    created_at: '2026-07-18T08:00:00Z'
  },
  {
    id: 'ord-2',
    client_id: 'client-barbershop-1',
    order_number: 'ORD-810293',
    customer_name: 'Sarah Connors',
    customer_email: 'sarah@skynet.net',
    status: 'pending',
    total: 22.00,
    notes: 'Standard residential shipping requested.',
    shipping_address: 'Apartment 101, Resistance Dr, London, EC1N 2HA',
    created_at: '2026-07-17T16:10:00Z'
  },
  {
    id: 'ord-3',
    client_id: 'client-cafe-2',
    order_number: 'ORD-104829',
    customer_name: 'Emma Watson',
    customer_email: 'emma@watson.com',
    status: 'paid',
    total: 25.00,
    created_at: '2026-07-18T09:30:00Z'
  }
];

const DEFAULT_ORDER_ITEMS: OrderItem[] = [
  {
    id: 'oi-1',
    order_id: 'ord-1',
    product_id: 'prod-barber-1',
    product_name: 'Classic Pomade (Strong Hold)',
    qty: 2,
    price: 18.00
  },
  {
    id: 'oi-2',
    order_id: 'ord-2',
    product_id: 'prod-barber-2',
    product_name: 'Sandalwood Beard Balm',
    qty: 1,
    price: 22.00
  },
  {
    id: 'oi-3',
    order_id: 'ord-3',
    product_id: 'prod-cafe-1',
    product_name: 'Signature House Blend (Whole Bean)',
    qty: 2,
    price: 12.50
  }
];

const DEFAULT_SERVICES: Service[] = [
  // Barbershop Services
  { id: 'srv-barber-1', client_id: 'client-barbershop-1', name: 'Signature Haircut', duration: 45, price: 35.00 },
  { id: 'srv-barber-2', client_id: 'client-barbershop-1', name: 'Hot Towel Wet Shave', duration: 30, price: 28.00 },
  { id: 'srv-barber-3', client_id: 'client-barbershop-1', name: 'The Royal Treatment (Cut + Beard)', duration: 75, price: 55.00 },

  // Cafe/Catering Services
  { id: 'srv-cafe-1', client_id: 'client-cafe-2', name: 'Barista Masterclass (Private)', duration: 120, price: 85.00 },
  { id: 'srv-cafe-2', client_id: 'client-cafe-2', name: 'Mobile Coffee Bar Hire (Per Hr)', duration: 60, price: 150.00 },

  // Construction Services
  { id: 'srv-const-1', client_id: 'client-construction-3', name: 'Site Appraisal & Surveying', duration: 180, price: 350.00 },
  { id: 'srv-const-2', client_id: 'client-construction-3', name: 'Architectural Blueprint Review', duration: 120, price: 200.00 }
];

const DEFAULT_STAFF: Staff[] = [
  { id: 'stf-1', client_id: 'client-barbershop-1', name: 'Marcus Vance', role: 'Senior Stylist' },
  { id: 'stf-2', client_id: 'client-barbershop-1', name: 'Julian Carter', role: 'Master Barber & Shop Owner' },
  { id: 'stf-3', client_id: 'client-cafe-2', name: 'David Brewster', role: 'Head Barista' },
  { id: 'stf-4', client_id: 'client-construction-3', name: 'Gordon Block', role: 'Structural Engineer' }
];

const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: 'bk-1',
    client_id: 'client-barbershop-1',
    booking_number: 'BKG-19032',
    customer_name: 'Alexander Sterling',
    customer_email: 'alexander@sterling.com',
    customer_phone: '+44 7700 900077',
    service_id: 'srv-barber-1',
    service_name: 'Signature Haircut',
    staff_id: 'stf-1',
    staff_name: 'Marcus Vance',
    start_time: '2026-07-18T10:00:00',
    end_time: '2026-07-18T10:45:00',
    status: 'upcoming',
    created_at: '2026-07-15T09:00:00Z'
  },
  {
    id: 'bk-2',
    client_id: 'client-barbershop-1',
    booking_number: 'BKG-28103',
    customer_name: 'Gary Oldman',
    customer_email: 'gary@oldman.me',
    service_id: 'srv-barber-3',
    service_name: 'The Royal Treatment (Cut + Beard)',
    staff_id: 'stf-2',
    staff_name: 'Julian Carter',
    start_time: '2026-07-18T14:30:00',
    end_time: '2026-07-18T15:45:00',
    status: 'completed',
    created_at: '2026-07-14T11:00:00Z'
  },
  {
    id: 'bk-3',
    client_id: 'client-barbershop-1',
    booking_number: 'BKG-09381',
    customer_name: 'Christian Bale',
    customer_email: 'bruce@wayne.com',
    service_id: 'srv-barber-2',
    service_name: 'Hot Towel Wet Shave',
    staff_id: 'stf-1',
    staff_name: 'Marcus Vance',
    start_time: '2026-07-18T12:00:00',
    end_time: '2026-07-18T12:30:00',
    status: 'no-show',
    created_at: '2026-07-16T14:00:00Z'
  }
];

const DEFAULT_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    client_id: 'client-barbershop-1',
    invoice_number: 'INV-004812',
    customer_name: 'Alexander Sterling',
    customer_email: 'alexander@sterling.com',
    customer_phone: '+44 7700 900077',
    total: 53.00,
    tax: 8.83,
    discount: 0,
    status: 'paid',
    due_date: '2026-07-18',
    pdf_url: 'https://api.grafixworker.com/api/pdf/inv-004812',
    created_at: '2026-07-18T08:15:00Z'
  },
  {
    id: 'inv-2',
    client_id: 'client-barbershop-1',
    invoice_number: 'INV-004813',
    customer_name: 'Sarah Connors',
    customer_email: 'sarah@skynet.net',
    total: 22.00,
    tax: 3.67,
    discount: 0,
    status: 'pending',
    due_date: '2026-07-25',
    pdf_url: 'https://api.grafixworker.com/api/pdf/inv-004813',
    created_at: '2026-07-17T16:15:00Z'
  },
  {
    id: 'inv-3',
    client_id: 'client-construction-3',
    invoice_number: 'INV-004814',
    customer_name: 'Heritage Trust London',
    customer_email: 'contracts@heritagetrust.org',
    total: 1250.00,
    tax: 208.33,
    discount: 50.00,
    status: 'overdue',
    due_date: '2026-07-10',
    pdf_url: 'https://api.grafixworker.com/api/pdf/inv-004814',
    created_at: '2026-07-01T09:00:00Z'
  }
];

const DEFAULT_INVOICE_ITEMS: InvoiceItem[] = [
  { id: 'ii-1', invoice_id: 'inv-1', product_name: 'Classic Pomade (Strong Hold)', quantity: 1, price: 18.00 },
  { id: 'ii-2', invoice_id: 'inv-1', product_name: 'Signature Haircut Service Charge', quantity: 1, price: 35.00 },
  { id: 'ii-3', invoice_id: 'inv-2', product_name: 'Sandalwood Beard Balm Product', quantity: 1, price: 22.00 },
  { id: 'ii-4', invoice_id: 'inv-3', product_name: 'Historical Site Timber Appraisal', quantity: 1, price: 350.00 },
  { id: 'ii-5', invoice_id: 'inv-3', product_name: 'Apex Timber Construction Supplies', quantity: 36, price: 25.00 }
];

const DEFAULT_EMAIL_LOG: EmailLog[] = [
  {
    id: 'el-1',
    client_id: 'client-barbershop-1',
    recipient: 'alexander@sterling.com',
    subject: 'Your Booking Confirmation - BKG-19032',
    status: 'sent',
    created_at: '2026-07-15T09:01:12Z'
  },
  {
    id: 'el-2',
    client_id: 'client-barbershop-1',
    recipient: 'alexander@sterling.com',
    subject: 'Your Invoice receipt INV-004812 from Blade & Barrel',
    status: 'sent',
    created_at: '2026-07-18T08:16:04Z'
  }
];

const DEFAULT_DAILY_SALES: DailySale[] = [
  { date: 'Jul 12', revenue: 420, orders: 12 },
  { date: 'Jul 13', revenue: 380, orders: 9 },
  { date: 'Jul 14', revenue: 510, orders: 15 },
  { date: 'Jul 15', revenue: 690, orders: 18 },
  { date: 'Jul 16', revenue: 440, orders: 11 },
  { date: 'Jul 17', revenue: 780, orders: 22 },
  { date: 'Jul 18', revenue: 950, orders: 25 }
];

const DEFAULT_MONTHLY_REVENUE: MonthlyRevenue[] = [
  { month: 'Jan', revenue: 4200 },
  { month: 'Feb', revenue: 4800 },
  { month: 'Mar', revenue: 6100 },
  { month: 'Apr', revenue: 5800 },
  { month: 'May', revenue: 7500 },
  { month: 'Jun', revenue: 9200 },
  { month: 'Jul', revenue: 11500 }
];

class LocalDatabase {
  clients: Client[] = [];
  team_members: TeamMember[] = [];
  customers: Customer[] = [];
  products: Product[] = [];
  inventory_movements: InventoryMovement[] = [];
  submissions: Submission[] = [];
  orders: Order[] = [];
  order_items: OrderItem[] = [];
  services: Service[] = [];
  staff: Staff[] = [];
  bookings: Booking[] = [];
  invoices: Invoice[] = [];
  invoice_items: InvoiceItem[] = [];
  email_log: EmailLog[] = [];
  daily_sales: DailySale[] = [];
  monthly_revenue: MonthlyRevenue[] = [];

  constructor() {
    this.load();
  }

  load() {
    const data = localStorage.getItem('grafix_local_db_v2');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        this.clients = parsed.clients || DEFAULT_CLIENTS;
        this.team_members = parsed.team_members || DEFAULT_TEAM_MEMBERS;
        this.customers = parsed.customers || DEFAULT_CUSTOMERS;
        this.products = parsed.products || DEFAULT_PRODUCTS;
        this.inventory_movements = parsed.inventory_movements || DEFAULT_INVENTORY_MOVEMENTS;
        this.submissions = parsed.submissions || DEFAULT_SUBMISSIONS;
        this.orders = parsed.orders || DEFAULT_ORDERS;
        this.order_items = parsed.order_items || DEFAULT_ORDER_ITEMS;
        this.services = parsed.services || DEFAULT_SERVICES;
        this.staff = parsed.staff || DEFAULT_STAFF;
        this.bookings = parsed.bookings || DEFAULT_BOOKINGS;
        this.invoices = parsed.invoices || DEFAULT_INVOICES;
        this.invoice_items = parsed.invoice_items || DEFAULT_INVOICE_ITEMS;
        this.email_log = parsed.email_log || DEFAULT_EMAIL_LOG;
        this.daily_sales = parsed.daily_sales || DEFAULT_DAILY_SALES;
        this.monthly_revenue = parsed.monthly_revenue || DEFAULT_MONTHLY_REVENUE;
      } catch (e) {
        this.resetToDefaults();
      }
    } else {
      this.resetToDefaults();
    }
  }

  resetToDefaults() {
    this.clients = [...DEFAULT_CLIENTS];
    this.team_members = [...DEFAULT_TEAM_MEMBERS];
    this.customers = [...DEFAULT_CUSTOMERS];
    this.products = [...DEFAULT_PRODUCTS];
    this.inventory_movements = [...DEFAULT_INVENTORY_MOVEMENTS];
    this.submissions = [...DEFAULT_SUBMISSIONS];
    this.orders = [...DEFAULT_ORDERS];
    this.order_items = [...DEFAULT_ORDER_ITEMS];
    this.services = [...DEFAULT_SERVICES];
    this.staff = [...DEFAULT_STAFF];
    this.bookings = [...DEFAULT_BOOKINGS];
    this.invoices = [...DEFAULT_INVOICES];
    this.invoice_items = [...DEFAULT_INVOICE_ITEMS];
    this.email_log = [...DEFAULT_EMAIL_LOG];
    this.daily_sales = [...DEFAULT_DAILY_SALES];
    this.monthly_revenue = [...DEFAULT_MONTHLY_REVENUE];
    this.save();
  }

  save() {
    localStorage.setItem('grafix_local_db_v2', JSON.stringify({
      clients: this.clients,
      team_members: this.team_members,
      customers: this.customers,
      products: this.products,
      inventory_movements: this.inventory_movements,
      submissions: this.submissions,
      orders: this.orders,
      order_items: this.order_items,
      services: this.services,
      staff: this.staff,
      bookings: this.bookings,
      invoices: this.invoices,
      invoice_items: this.invoice_items,
      email_log: this.email_log,
      daily_sales: this.daily_sales,
      monthly_revenue: this.monthly_revenue,
    }));
  }
}

const localDb = new LocalDatabase();

// ==================================================
// REAL SUPABASE PERSISTENCE (fire-and-forget writes)
// ==================================================
// Every mutating function below updates the local mirror immediately for
// instant UI feedback, AND fires a real write to Supabase in the
// background. This keeps every existing call site's synchronous API
// working unchanged while making writes actually persist.
//
// Known limitation: an item created in the current session gets a
// temporary local id (e.g. "cust-abc123") until the next sync pulls the
// real Supabase-generated id. Editing/deleting that exact item again
// before a resync happens will locally update fine but won't find a
// matching row in Supabase to update (harmless no-op, not a crash) —
// a page reload (which re-syncs) resolves this. Awaiting these writes
// properly end-to-end is the natural next improvement once this is
// confirmed working.
function persistWrite(
  table: string,
  action: 'insert' | 'update' | 'delete',
  payload: Record<string, any>,
  matchColumn?: string,
  matchValue?: any
) {
  if (!isSupabaseConfigured || !supabase) return;
  (async () => {
    try {
      let query: any = supabase!.from(table);
      if (action === 'insert') {
        query = query.insert(payload);
      } else if (action === 'update') {
        query = query.update(payload).eq(matchColumn!, matchValue);
      } else {
        query = query.delete().eq(matchColumn!, matchValue);
      }
      const { error } = await query;
      if (error) console.error(`[Supabase] ${action} on ${table} failed:`, error.message);
    } catch (e) {
      console.error(`[Supabase] ${action} on ${table} threw:`, e);
    }
  })();
}

// The UI historically used friendlier status words than the real schema's
// CHECK constraints allow. These maps translate at the persistence
// boundary only — the UI can keep showing whatever label it wants.
const ORDER_STATUS_TO_SCHEMA: Record<string, string> = {
  paid: 'completed', pending: 'pending', confirmed: 'confirmed',
  preparing: 'preparing', ready: 'ready', completed: 'completed',
  cancelled: 'cancelled', refunded: 'cancelled',
};
const BOOKING_STATUS_TO_SCHEMA: Record<string, string> = {
  upcoming: 'confirmed', confirmed: 'confirmed', completed: 'completed',
  cancelled: 'cancelled', 'no-show': 'no_show', no_show: 'no_show',
};
const INVOICE_STATUS_TO_SCHEMA: Record<string, string> = {
  draft: 'draft', pending: 'sent', sent: 'sent', paid: 'paid',
  overdue: 'overdue', cancelled: 'void', void: 'void',
};
const SUBMISSION_STATUS_TO_SCHEMA: Record<string, string> = {
  new: 'received', received: 'received', pending: 'pending',
  replied: 'completed', completed: 'completed',
  archived: 'cancelled', cancelled: 'cancelled',
};
// Reverse of the above, used when reading real rows back for display.
const SUBMISSION_STATUS_TO_UI: Record<string, 'new' | 'replied' | 'archived'> = {
  received: 'new', pending: 'new',
  completed: 'replied',
  cancelled: 'archived',
};

// UNIFIED BUSINESS OPERATION SYSTEM CLIENT-SIDE DATABASE WRAPPER (Supabase Proxy / Worker Proxy)
export const db = {
  // Authentication Simulated State
  currentUser: (() => {
    try {
      const saved = localStorage.getItem('grafix_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      id: 'user-barbershop-owner',
      email: 'julian@bladeandbarrel.co',
      name: 'Julian Carter',
      role: 'owner',
      client_id: 'client-barbershop-1'
    };
  })(),

  setAuthUser(email: string, clientId: string) {
    const tm = localDb.team_members.find(t => t.client_id === clientId && t.email.toLowerCase() === email.toLowerCase());
    let userObj;
    if (tm) {
      userObj = {
        id: tm.auth_user_id,
        email: tm.email,
        name: tm.name,
        role: tm.role,
        client_id: tm.client_id
      };
    } else {
      // Find client profile
      const cl = localDb.clients.find(c => c.id === clientId);
      userObj = {
        id: 'user-' + clientId,
        email: email,
        name: cl ? `Manager of ${cl.name}` : 'Business User',
        role: 'owner',
        client_id: clientId
      };
    }
    this.currentUser = userObj;
    try {
      localStorage.setItem('grafix_current_user', JSON.stringify(userObj));
    } catch (e) {}
  },

  // Log in as a custom user or mock sign-in
  signInWithGoogleSimulated(email: string, name: string): { user: any; isNewUser: boolean } {
    // Check if there is an existing team member with this email across all clients
    const existingMember = localDb.team_members.find(t => t.email.toLowerCase() === email.toLowerCase());
    
    if (existingMember) {
      const userObj = {
        id: existingMember.auth_user_id,
        email: existingMember.email,
        name: existingMember.name,
        role: existingMember.role,
        client_id: existingMember.client_id
      };
      this.currentUser = userObj;
      try {
        localStorage.setItem('grafix_current_user', JSON.stringify(userObj));
      } catch (e) {}
      return { user: userObj, isNewUser: false };
    }

    // Otherwise, this is a new user who must onboard!
    const newUser = {
      id: 'user-new-' + Math.random().toString(36).substr(2, 9),
      email: email,
      name: name,
      role: 'owner',
      client_id: '' // No business yet
    };
    this.currentUser = newUser;
    try {
      localStorage.setItem('grafix_current_user', JSON.stringify(newUser));
    } catch (e) {}
    return { user: newUser, isNewUser: true };
  },

  signOutSimulated() {
    this.currentUser = null as any;
    try {
      localStorage.removeItem('grafix_current_user');
    } catch (e) {}
  },

  // Create a brand new business profile and seed with beautiful demo data!
  createBusinessProfile(ownerEmail: string, ownerName: string, businessName: string, industry: BusinessType, logoUrl?: string): Client {
    const clientId = 'client-' + industry + '-' + Math.random().toString(36).substr(2, 5);
    
    // Choose professional matching colors
    let primaryColor = '#1e293b'; // Slate 800
    let secondaryColor = '#3b82f6'; // Blue 500
    
    if (industry === 'cafe' || industry === 'restaurant') {
      primaryColor = '#451a03'; // Brown
      secondaryColor = '#f59e0b'; // Amber
    } else if (industry === 'barbershop' || industry === 'salon') {
      primaryColor = '#0f172a'; // Slate
      secondaryColor = '#d97706'; // Gold/Amber
    } else if (industry === 'gym') {
      primaryColor = '#18181b'; // Zinc
      secondaryColor = '#ef4444'; // Red
    } else if (industry === 'retail') {
      primaryColor = '#312e81'; // Indigo
      secondaryColor = '#ec4899'; // Pink
    } else if (industry === 'construction') {
      primaryColor = '#1e3a8a'; // Blue
      secondaryColor = '#ea580c'; // Orange
    } else if (industry === 'agency' || industry === 'consultant') {
      primaryColor = '#4c1d95'; // Purple
      secondaryColor = '#06b6d4'; // Cyan
    } else if (industry === 'clinic') {
      primaryColor = '#134e4a'; // Teal
      secondaryColor = '#06b6d4'; // Cyan
    }

    const defaultLogo = logoUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&h=120&q=80';

    const newClient: Client = {
      id: clientId,
      name: businessName,
      logo_url: defaultLogo,
      business_type: industry,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      banking_details: 'Standard Barclays • Sort Code: 20-30-40 • Account: 12345678',
      address: '100 Innovation Way, Enterprise Zone',
      phone: '+44 20 7946 0888',
      email: `hello@${businessName.toLowerCase().replace(/\s+/g, '')}.co.uk`,
      website_hero_title: `Experience Premier ${businessName}`,
      website_hero_subtitle: `Premium and tailored ${industry} services designed for absolute quality and comfort.`,
      website_seo_keywords: `${industry}, ${businessName.toLowerCase()}, premium local business`
    };

    localDb.clients.push(newClient);

    // Create Team Member
    const ownerMember: TeamMember = {
      id: 'tm-' + Math.random().toString(36).substr(2, 9),
      client_id: clientId,
      auth_user_id: 'user-' + clientId,
      name: ownerName,
      email: ownerEmail,
      role: 'owner',
      status: 'active',
      permissions: { manage_billing: true, manage_inventory: true, manage_team: true }
    };
    localDb.team_members.push(ownerMember);

    // Create a generic staff member
    const assistantMember: Staff = {
      id: 'stf-' + Math.random().toString(36).substr(2, 9),
      client_id: clientId,
      name: 'Taylor Blake',
      role: `Senior ${industry === 'barbershop' || industry === 'salon' ? 'Stylist' : 'Associate'}`
    };
    localDb.staff.push(assistantMember);

    // Create a second staff member as the owner themselves
    const ownerStaff: Staff = {
      id: 'stf-owner-' + clientId,
      client_id: clientId,
      name: ownerName,
      role: 'Managing Director'
    };
    localDb.staff.push(ownerStaff);

    // Seed default products & services
    if (industry === 'cafe' || industry === 'restaurant') {
      localDb.products.push(
        { id: 'prod-seed-1-' + clientId, client_id: clientId, name: 'Artisanal Single-Origin Beans', category: 'Coffee Beans', sku: 'CF-SO-01', price: 14.50, cost_price: 5.00, stock_qty: 40, low_stock_warning: 10, image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=150&h=150&q=80' },
        { id: 'prod-seed-2-' + clientId, client_id: clientId, name: 'Cold Brew Extract Bottle (500ml)', category: 'Beverages', sku: 'CF-CB-02', price: 18.00, cost_price: 6.50, stock_qty: 15, low_stock_warning: 5, image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=150&h=150&q=80' }
      );
      localDb.services.push(
        { id: 'srv-seed-1-' + clientId, client_id: clientId, name: 'Private Roastery Cupping Class', duration: 90, price: 65.00 },
        { id: 'srv-seed-2-' + clientId, client_id: clientId, name: 'Custom Espresso Consultation', duration: 45, price: 30.00 }
      );
    } else if (industry === 'barbershop' || industry === 'salon') {
      localDb.products.push(
        { id: 'prod-seed-1-' + clientId, client_id: clientId, name: 'Organic Beard Nourishing Oil', category: 'Beard Care', sku: 'BB-OIL-01', price: 19.50, cost_price: 6.00, stock_qty: 25, low_stock_warning: 8, image_url: 'https://images.unsplash.com/photo-1626479138314-a0945a12db7a?auto=format&fit=crop&w=150&h=150&q=80' },
        { id: 'prod-seed-2-' + clientId, client_id: clientId, name: 'Matte Clay Strong Hold Pomade', category: 'Styling', sku: 'BB-POM-02', price: 16.00, cost_price: 5.50, stock_qty: 30, low_stock_warning: 10, image_url: 'https://images.unsplash.com/photo-1590156546746-c224029006c9?auto=format&fit=crop&w=150&h=150&q=80' }
      );
      localDb.services.push(
        { id: 'srv-seed-1-' + clientId, client_id: clientId, name: 'Precision Haircut & Style', duration: 45, price: 40.00 },
        { id: 'srv-seed-2-' + clientId, client_id: clientId, name: 'Hot Towel Deluxe Shave', duration: 30, price: 30.00 }
      );
    } else if (industry === 'gym') {
      localDb.products.push(
        { id: 'prod-seed-1-' + clientId, client_id: clientId, name: 'Premium Hydro Whey Protein', category: 'Supplements', sku: 'GYM-WHEY-01', price: 42.00, cost_price: 18.00, stock_qty: 50, low_stock_warning: 15, image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=150&h=150&q=80' },
        { id: 'prod-seed-2-' + clientId, client_id: clientId, name: 'Thermal Insulated Water Flask', category: 'Accessories', sku: 'GYM-BTL-02', price: 15.00, cost_price: 4.50, stock_qty: 100, low_stock_warning: 10, image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&h=120&q=80' }
      );
      localDb.services.push(
        { id: 'srv-seed-1-' + clientId, client_id: clientId, name: '1-on-1 Elite Personal Coaching', duration: 60, price: 75.00 },
        { id: 'srv-seed-2-' + clientId, client_id: clientId, name: 'Body Composition Diagnostics', duration: 30, price: 40.00 }
      );
    } else {
      // General fallbacks
      localDb.products.push(
        { id: 'prod-seed-1-' + clientId, client_id: clientId, name: 'Premium Client Welcome Pack', category: 'Materials', sku: 'GEN-PACK-01', price: 25.00, cost_price: 10.00, stock_qty: 30, low_stock_warning: 5, image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&h=120&q=80' }
      );
      localDb.services.push(
        { id: 'srv-seed-1-' + clientId, client_id: clientId, name: 'In-Depth Initial Strategy Call', duration: 60, price: 120.00 },
        { id: 'srv-seed-2-' + clientId, client_id: clientId, name: 'Standard Project Valuation', duration: 90, price: 180.00 }
      );
    }

    // Seed 1 active Customer
    const activeCustomer: Customer = {
      id: 'cust-seed-' + clientId,
      client_id: clientId,
      name: 'Winston Churchill',
      email: 'winston.churchill@google.com',
      phone: '+44 7700 900331',
      notes: 'Initial high-profile seed client. High attention required.',
      tags: ['VIP', 'Seed Client'],
      created_at: new Date().toISOString()
    };
    localDb.customers.unshift(activeCustomer);

    // Seed 1 booking
    localDb.bookings.unshift({
      id: 'bk-seed-' + clientId,
      client_id: clientId,
      booking_number: 'BKG-' + Math.floor(10000 + Math.random() * 90000),
      customer_name: activeCustomer.name,
      customer_email: activeCustomer.email,
      customer_phone: activeCustomer.phone,
      service_id: 'srv-seed-1-' + clientId,
      service_name: industry === 'cafe' || industry === 'restaurant' ? 'Private Roastery Cupping Class' : industry === 'barbershop' || industry === 'salon' ? 'Precision Haircut & Style' : 'In-Depth Initial Strategy Call',
      staff_id: assistantMember.id,
      staff_name: assistantMember.name,
      start_time: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), // Tomorrow
      end_time: new Date(Date.now() + 24 * 3600 * 1000 + 3600 * 1000).toISOString(),
      status: 'upcoming',
      created_at: new Date().toISOString()
    });

    // Seed 1 order
    localDb.orders.unshift({
      id: 'ord-seed-' + clientId,
      client_id: clientId,
      order_number: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      customer_name: activeCustomer.name,
      customer_email: activeCustomer.email,
      customer_phone: activeCustomer.phone,
      status: 'paid',
      total: 45.00,
      notes: 'First test order processed on system setup.',
      created_at: new Date().toISOString()
    });

    // Seed 1 message submission
    localDb.submissions.unshift({
      id: 'sub-seed-' + clientId,
      client_id: clientId,
      form_name: 'contact',
      customer_name: 'Genevieve Moreau',
      customer_email: 'genevieve@moreau.fr',
      message: 'Hello, I discovered your business website. Are you currently accepting bookings or shipping items outside the local district?',
      status: 'new',
      created_at: new Date().toISOString()
    });

    // Set active user session
    const finalUser = {
      id: ownerMember.auth_user_id,
      email: ownerMember.email,
      name: ownerMember.name,
      role: ownerMember.role,
      client_id: clientId
    };
    this.currentUser = finalUser;
    try {
      localStorage.setItem('grafix_current_user', JSON.stringify(finalUser));
    } catch (e) {}

    localDb.save();
    return newClient;
  },

  // Read Multi-Tenant Configs
  getClients(): Client[] {
    return localDb.clients;
  },

  getCurrentClient(clientId: string): Client {
    return localDb.clients.find(c => c.id === clientId) || localDb.clients[0];
  },

  updateClientProfile(clientId: string, updates: Partial<Client>) {
    const idx = localDb.clients.findIndex(c => c.id === clientId);
    if (idx !== -1) {
      localDb.clients[idx] = { ...localDb.clients[idx], ...updates };
      localDb.save();
    }
    // Only real, existing columns get persisted. address/phone/email/
    // banking_details/website_* have no matching column in the deployed
    // schema — they stay local-display-only until a migration adds them.
    persistWrite('clients', 'update', {
      business_name: updates.name,
      logo_url: updates.logo_url,
      primary_color: updates.primary_color,
      secondary_color: updates.secondary_color,
    }, 'client_id', clientId);
  },

  async getClientIdForUser(authUserId: string): Promise<string | null> {
    if (!isSupabaseConfigured || !supabase) {
      // Fallback: check locally in localDb team_members
      const member = localDb.team_members.find(tm => tm.auth_user_id === authUserId);
      return member ? member.client_id : null;
    }
    try {
      const { data: clientRows } = await supabase.from('clients').select('client_id').eq('auth_user_id', authUserId);
      if (clientRows && clientRows.length) return clientRows[0].client_id;

      const { data: memberRows } = await supabase.from('team_members').select('client_id').eq('auth_user_id', authUserId).eq('active', true);
      if (memberRows && memberRows.length) return memberRows[0].client_id;
    } catch (e) {
      console.error('Error in getClientIdForUser:', e);
    }
    return null;
  },

  // Customers (Filtered by client_id automatically in both RLS and Local proxy)
  getCustomers(clientId: string): Customer[] {
    return localDb.customers.filter(c => c.client_id === clientId);
  },

  createCustomer(clientId: string, customer: Omit<Customer, 'id' | 'client_id' | 'created_at'>): Customer {
    const newCust: Customer = {
      ...customer,
      id: 'cust-' + Math.random().toString(36).substr(2, 9),
      client_id: clientId,
      created_at: new Date().toISOString()
    };
    localDb.customers.unshift(newCust);
    localDb.save();
    // 'tags' has no matching column in the deployed schema — omitted here.
    persistWrite('customers', 'insert', {
      client_id: clientId,
      name: customer.name,
      email: customer.email || null,
      phone: customer.phone || null,
      notes: customer.notes || null,
    });
    return newCust;
  },

  updateCustomer(id: string, updates: Partial<Customer>) {
    const idx = localDb.customers.findIndex(c => c.id === id);
    if (idx !== -1) {
      localDb.customers[idx] = { ...localDb.customers[idx], ...updates };
      localDb.save();
    }
    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (Object.keys(payload).length) persistWrite('customers', 'update', payload, 'id', id);
  },

  deleteCustomer(id: string) {
    localDb.customers = localDb.customers.filter(c => c.id !== id);
    localDb.save();
    persistWrite('customers', 'delete', {}, 'id', id);
  },

  // Products & Inventory
  getProducts(clientId: string): Product[] {
    return localDb.products.filter(p => p.client_id === clientId);
  },

  createProduct(clientId: string, product: Omit<Product, 'id' | 'client_id'>): Product {
    const newProd: Product = {
      ...product,
      id: 'prod-' + Math.random().toString(36).substr(2, 9),
      client_id: clientId
    };
    localDb.products.push(newProd);

    // Initial movement log
    const movement: InventoryMovement = {
      id: 'mov-' + Math.random().toString(36).substr(2, 9),
      client_id: clientId,
      product_id: newProd.id,
      product_name: newProd.name,
      qty: newProd.stock_qty,
      type: 'in',
      reason: 'Initial catalog onboarding stock entry',
      created_at: new Date().toISOString()
    };
    localDb.inventory_movements.unshift(movement);

    localDb.save();
    // barcode/cost_price/low_stock_warning/variants have no matching
    // columns in the deployed schema — omitted here. Add a migration if
    // these should genuinely persist.
    persistWrite('products', 'insert', {
      client_id: clientId,
      name: product.name,
      description: (product as any).description || null,
      sku: product.sku || null,
      category: product.category || null,
      price: product.price,
      stock_qty: product.stock_qty,
      image_url: product.image_url || null,
    });
    return newProd;
  },

  updateProduct(id: string, updates: Partial<Product>, adjustmentReason?: string) {
    const idx = localDb.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      const oldProd = localDb.products[idx];
      const newQty = updates.stock_qty !== undefined ? updates.stock_qty : oldProd.stock_qty;
      const diff = newQty - oldProd.stock_qty;

      localDb.products[idx] = { ...oldProd, ...updates };

      if (diff !== 0) {
        const movement: InventoryMovement = {
          id: 'mov-' + Math.random().toString(36).substr(2, 9),
          client_id: oldProd.client_id,
          product_id: oldProd.id,
          product_name: oldProd.name,
          qty: diff,
          type: diff > 0 ? 'in' : 'out',
          reason: adjustmentReason || 'Manual inventory levels audit adjustment',
          created_at: new Date().toISOString()
        };
        localDb.inventory_movements.unshift(movement);

        // Real audit trail row, matching the deployed inventory_movements table.
        persistWrite('inventory_movements', 'insert', {
          client_id: oldProd.client_id,
          product_id: oldProd.id,
          change_qty: diff,
          reason: adjustmentReason || 'adjustment',
        });
      }

      localDb.save();
    }
    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if ((updates as any).description !== undefined) payload.description = (updates as any).description;
    if (updates.sku !== undefined) payload.sku = updates.sku;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.stock_qty !== undefined) payload.stock_qty = updates.stock_qty;
    if (updates.image_url !== undefined) payload.image_url = updates.image_url;
    if (Object.keys(payload).length) persistWrite('products', 'update', payload, 'id', id);
  },

  deleteProduct(id: string) {
    localDb.products = localDb.products.filter(p => p.id !== id);
    localDb.inventory_movements = localDb.inventory_movements.filter(m => m.product_id !== id);
    localDb.save();
    persistWrite('products', 'delete', {}, 'id', id);
  },

  getInventoryMovements(clientId: string): InventoryMovement[] {
    return localDb.inventory_movements.filter(m => m.client_id === clientId);
  },

  // Submissions (Contact/Quotes)
  getSubmissions(clientId: string, type?: 'contact' | 'quote'): Submission[] {
    const filtered = localDb.submissions.filter(s => s.client_id === clientId);
    if (type) {
      return filtered.filter(s => s.form_name === type);
    }
    return filtered;
  },

  assignStaffToSubmission(subId: string, staffId?: string) {
    const idx = localDb.submissions.findIndex(s => s.id === subId);
    if (idx !== -1) {
      localDb.submissions[idx].assigned_staff_id = staffId;
      localDb.save();
    }
    // No assigned_staff_id column in the deployed schema — local-only
    // until a migration adds it. Flagged, not silently pretending it works.
  },

  updateSubmissionStatus(subId: string, status: 'new' | 'replied' | 'archived') {
    const idx = localDb.submissions.findIndex(s => s.id === subId);
    if (idx !== -1) {
      localDb.submissions[idx].status = status;
      localDb.save();
    }
    persistWrite('submissions', 'update', {
      status: SUBMISSION_STATUS_TO_SCHEMA[status] || 'received',
    }, 'id', subId);
  },

  // Services & Staff Setup for Bookings
  getServices(clientId: string): Service[] {
    return localDb.services.filter(s => s.client_id === clientId);
  },

  createService(clientId: string, srv: Omit<Service, 'id' | 'client_id'>): Service {
    const newSrv = { ...srv, id: 'srv-' + Math.random().toString(36).substr(2, 9), client_id: clientId };
    localDb.services.push(newSrv);
    localDb.save();
    persistWrite('services', 'insert', {
      client_id: clientId,
      name: srv.name,
      duration_minutes: (srv as any).duration,
      price: srv.price,
    });
    return newSrv;
  },

  getStaff(clientId: string): Staff[] {
    return localDb.staff.filter(s => s.client_id === clientId);
  },

  createStaff(clientId: string, stf: Omit<Staff, 'id' | 'client_id'>): Staff {
    const newStf = { ...stf, id: 'stf-' + Math.random().toString(36).substr(2, 9), client_id: clientId };
    localDb.staff.push(newStf);
    localDb.save();
    // 'role' has no matching column on the real 'staff' table (full_name,
    // email, active only) — omitted here, local-display-only until a
    // migration adds a role/title column if that's wanted.
    persistWrite('staff', 'insert', {
      client_id: clientId,
      full_name: stf.name,
    });
    return newStf;
  },

  // Bookings
  getBookings(clientId: string): Booking[] {
    return localDb.bookings.filter(b => b.client_id === clientId);
  },

  updateBookingStatus(id: string, status: 'upcoming' | 'completed' | 'cancelled' | 'no-show') {
    const idx = localDb.bookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      localDb.bookings[idx].status = status;
      localDb.save();
    }
    persistWrite('bookings', 'update', {
      status: BOOKING_STATUS_TO_SCHEMA[status] || 'confirmed',
    }, 'id', id);
  },

  // Invoices
  getInvoices(clientId: string): Invoice[] {
    return localDb.invoices.filter(i => i.client_id === clientId);
  },

  getInvoiceItems(invoiceId: string): InvoiceItem[] {
    return localDb.invoice_items.filter(ii => ii.invoice_id === invoiceId);
  },

  updateInvoiceStatus(id: string, status: 'paid' | 'pending' | 'cancelled' | 'overdue') {
    const idx = localDb.invoices.findIndex(i => i.id === id);
    if (idx !== -1) {
      localDb.invoices[idx].status = status;
      localDb.save();
    }
    persistWrite('invoices', 'update', {
      status: INVOICE_STATUS_TO_SCHEMA[status] || 'sent',
    }, 'id', id);
  },

  // Team
  getTeamMembers(clientId: string): TeamMember[] {
    return localDb.team_members.filter(t => t.client_id === clientId);
  },

  createTeamMember(clientId: string, tm: Omit<TeamMember, 'id' | 'client_id' | 'auth_user_id' | 'status'>): TeamMember {
    const newTm: TeamMember = {
      ...tm,
      id: 'tm-' + Math.random().toString(36).substr(2, 9),
      client_id: clientId,
      auth_user_id: 'user-' + Math.random().toString(36).substr(2, 9),
      status: 'active'
    };
    localDb.team_members.push(newTm);
    localDb.save();
    // IMPORTANT: this does NOT create a real Supabase Auth user, so this
    // team member cannot actually log in yet — team_members.auth_user_id
    // is NOT NULL and must reference a real auth.users row. This is the
    // "team invite flow" gap flagged from the start of this build; a real
    // invite needs a separate email-invite + signup step before this row
    // can be written to Supabase at all. Left local-only on purpose
    // rather than sending a write that would fail its NOT NULL constraint.
    return newTm;
  },

  updateTeamMember(id: string, updates: Partial<TeamMember>) {
    const idx = localDb.team_members.findIndex(t => t.id === id);
    if (idx !== -1) {
      localDb.team_members[idx] = { ...localDb.team_members[idx], ...updates };
      localDb.save();
    }
    const payload: Record<string, any> = {};
    if (updates.role !== undefined) payload.role = updates.role;
    if ((updates as any).status !== undefined) payload.active = (updates as any).status === 'active';
    if (updates.permissions !== undefined) payload.permissions = updates.permissions;
    if (Object.keys(payload).length) persistWrite('team_members', 'update', payload, 'id', id);
  },

  deleteTeamMember(id: string) {
    localDb.team_members = localDb.team_members.filter(t => t.id !== id);
    localDb.save();
    persistWrite('team_members', 'delete', {}, 'id', id);
  },

  // Email Notification Audit Logs
  getEmailLog(clientId: string): EmailLog[] {
    return localDb.email_log.filter(el => el.client_id === clientId);
  },

  // Analytics Reports Views
  getDailySales(clientId: string): DailySale[] {
    // Generate some randomized variations for demo look per tenant
    const seed = clientId === 'client-barbershop-1' ? 1 : clientId === 'client-cafe-2' ? 0.75 : 2.5;
    return localDb.daily_sales.map(ds => ({
      ...ds,
      revenue: Math.round(ds.revenue * seed),
      orders: Math.round(ds.orders * (seed < 1 ? 0.9 : seed > 2 ? 0.3 : 1))
    }));
  },

  getMonthlyRevenue(clientId: string): MonthlyRevenue[] {
    const seed = clientId === 'client-barbershop-1' ? 1 : clientId === 'client-cafe-2' ? 0.75 : 2.5;
    return localDb.monthly_revenue.map(mr => ({
      ...mr,
      revenue: Math.round(mr.revenue * seed)
    }));
  },

  // --- CLOUDFLARE WORKER SIDE EFFECT ACTIONS ---
  // The system mimics Worker side effects beautifully using localStorage fallbacks, 
  // but triggers REAL REST network fetches to workerBaseUrl if keys are set.

  // Returns the real Worker response when Supabase is configured (throws
  // on failure — callers must handle this, NOT silently fall back to fake
  // data in a real deployment). Returns null ONLY when Supabase isn't
  // configured at all, which is the intentional signal to use the local
  // demo/simulation path below.
  async callWorkerApi(path: string, method: 'GET' | 'POST', body?: any) {
    if (!isSupabaseConfigured) return null;

    const token = (await supabase?.auth.getSession())?.data.session?.access_token;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${workerBaseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(errText || `Worker returned error code: ${res.status}`);
    }
    return await res.json();
  },

  // Actions with side effects
  async createOrderAction(clientId: string, params: {
    customer: { name: string; email: string; phone?: string };
    items: { productId: string; qty: number }[];
    notes?: string;
  }): Promise<{ success: boolean; orderId: string; orderNumber: string; total: number }> {
    
    // In real (Supabase-configured) mode, this Worker call is authoritative
    // — a failure here must surface as a real error, not silently pretend
    // success with fake local data (that would mean a customer's order
    // "succeeds" in the UI but was never actually placed).
    if (isSupabaseConfigured) {
      try {
        return await this.callWorkerApi('/api/orders', 'POST', { clientId, ...params });
      } catch (err: any) {
        return { success: false, orderId: '', orderNumber: '', total: 0, error: err.message } as any;
      }
    }

    // Emulated worker behavior (demo mode only, Supabase not configured):
    let runningTotal = 0;
    const orderId = 'ord-' + Math.random().toString(36).substr(2, 9);
    const orderNum = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    const itemsToInsert: OrderItem[] = [];

    params.items.forEach(item => {
      const prod = localDb.products.find(p => p.id === item.productId);
      if (prod) {
        const linePrice = prod.price;
        const lineTotal = linePrice * item.qty;
        runningTotal += lineTotal;

        itemsToInsert.push({
          id: 'oi-' + Math.random().toString(36).substr(2, 9),
          order_id: orderId,
          product_id: item.productId,
          product_name: prod.name,
          qty: item.qty,
          price: linePrice
        });

        // Auto inventory reduction side effect
        this.updateProduct(prod.id, {
          stock_qty: Math.max(0, prod.stock_qty - item.qty)
        }, `Deducted automatically via checkout ${orderNum}`);
      }
    });

    const newOrder: Order = {
      id: orderId,
      client_id: clientId,
      order_number: orderNum,
      customer_name: params.customer.name,
      customer_email: params.customer.email,
      customer_phone: params.customer.phone,
      status: 'paid',
      total: runningTotal,
      notes: params.notes,
      created_at: new Date().toISOString()
    };

    localDb.orders.unshift(newOrder);
    localDb.order_items.push(...itemsToInsert);

    // Auto Email Log side effect
    localDb.email_log.unshift({
      id: 'el-' + Math.random().toString(36).substr(2, 9),
      client_id: clientId,
      recipient: params.customer.email,
      subject: `Order Confirmation receipt ${orderNum} from ${this.getCurrentClient(clientId).name}`,
      status: 'sent',
      created_at: new Date().toISOString()
    });

    localDb.save();

    return {
      success: true,
      orderId,
      orderNumber: orderNum,
      total: runningTotal
    };
  },

  async createBookingAction(clientId: string, params: {
    customer: { name: string; email: string; phone?: string };
    serviceId: string;
    staffId?: string;
    startTime: string;
  }): Promise<{ success: boolean; bookingId: string; startTime: string; endTime: string }> {

    if (isSupabaseConfigured) {
      try {
        return await this.callWorkerApi('/api/bookings', 'POST', { clientId, ...params });
      } catch (err: any) {
        return { success: false, bookingId: '', startTime: '', endTime: '', error: err.message } as any;
      }
    }

    // Emulated worker (demo mode only, Supabase not configured):
    const bookingId = 'bk-' + Math.random().toString(36).substr(2, 9);
    const service = localDb.services.find(s => s.id === params.serviceId);
    const staffMember = localDb.staff.find(st => st.id === params.staffId);
    
    const serviceName = service ? service.name : 'Custom Booking Service';
    const duration = service ? service.duration : 45;

    const start = new Date(params.startTime);
    const end = new Date(start.getTime() + duration * 60000);
    const bookingNum = 'BKG-' + Math.floor(10000 + Math.random() * 90000);

    const newBooking: Booking = {
      id: bookingId,
      client_id: clientId,
      booking_number: bookingNum,
      customer_name: params.customer.name,
      customer_email: params.customer.email,
      customer_phone: params.customer.phone,
      service_id: params.serviceId,
      service_name: serviceName,
      staff_id: params.staffId,
      staff_name: staffMember ? staffMember.name : 'Any Available Staff',
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: 'upcoming',
      created_at: new Date().toISOString()
    };

    localDb.bookings.unshift(newBooking);

    // Auto Customer Creation if they don't exist yet
    const existingCust = localDb.customers.find(c => c.client_id === clientId && c.email.toLowerCase() === params.customer.email.toLowerCase());
    if (!existingCust) {
      this.createCustomer(clientId, {
        name: params.customer.name,
        email: params.customer.email,
        phone: params.customer.phone || '',
        notes: `Auto-onboarded customer from Booking ${bookingNum}`,
        tags: ['New Client']
      });
    }

    // Auto Email Log side effect
    localDb.email_log.unshift({
      id: 'el-' + Math.random().toString(36).substr(2, 9),
      client_id: clientId,
      recipient: params.customer.email,
      subject: `Booking Confirmed: ${serviceName} on ${start.toLocaleDateString()}`,
      status: 'sent',
      created_at: new Date().toISOString()
    });

    localDb.save();

    return {
      success: true,
      bookingId,
      startTime: start.toISOString(),
      endTime: end.toISOString()
    };
  },

  async uploadAction(file: File, folder: 'logos' | 'profile' | 'products'): Promise<{ success: boolean; url: string; key: string }> {
    if (isSupabaseConfigured) {
      try {
        const token = (await supabase?.auth.getSession())?.data.session?.access_token;
        const arrayBuffer = await file.arrayBuffer();
        const res = await fetch(`${workerBaseUrl}/api/upload?folder=${folder}`, {
          method: 'POST',
          headers: {
            'Content-Type': file.type,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: arrayBuffer,
        });
        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          throw new Error(errText || `Upload failed with status ${res.status}`);
        }
        const result = await res.json();
        return { success: true, url: result.url, key: result.key };
      } catch (err: any) {
        return { success: false, url: '', key: '', error: err.message } as any;
      }
    }

    // Demo mode only (Supabase not configured): mock image URLs.
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUrls = {
          logos: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&h=120&q=80',
          profile: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
          products: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=150&h=150&q=80'
        };
        resolve({
          success: true,
          url: mockUrls[folder] || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&h=120&q=80',
          key: `${folder}/${Date.now()}_${file.name}`
        });
      }, 700);
    });
  },

  async createInvoiceAction(clientId: string, params: {
    customer: { id?: string; name: string; email: string; phone?: string };
    items: { productId?: string; description: string; quantity: number; price: number }[];
    tax: number;
    discount?: number;
    dueDate?: string;
    orderId?: string;
  }): Promise<{ success: boolean; invoiceId: string; invoiceNumber: string; total: number; pdfUrl: string }> {

    if (isSupabaseConfigured) {
      try {
        return await this.callWorkerApi('/api/invoices', 'POST', params);
      } catch (err: any) {
        return { success: false, invoiceId: '', invoiceNumber: '', total: 0, pdfUrl: '', error: err.message } as any;
      }
    }

    // Emulated worker invoice builder (demo mode only, Supabase not configured):
    const invoiceId = 'inv-' + Math.random().toString(36).substr(2, 9);
    const invoiceNum = 'INV-' + Math.floor(100000 + Math.random() * 900000);
    
    let subtotal = 0;
    const itemsToInsert: InvoiceItem[] = [];

    params.items.forEach(item => {
      const lineTotal = item.price * item.quantity;
      subtotal += lineTotal;
      itemsToInsert.push({
        id: 'ii-' + Math.random().toString(36).substr(2, 9),
        invoice_id: invoiceId,
        product_name: item.description,
        quantity: item.quantity,
        price: item.price
      });
    });

    const taxAmount = Math.round((subtotal * (params.tax / 100)) * 100) / 100;
    const disc = params.discount || 0;
    const grandTotal = subtotal + taxAmount - disc;

    const newInvoice: Invoice = {
      id: invoiceId,
      client_id: clientId,
      invoice_number: invoiceNum,
      customer_name: params.customer.name,
      customer_email: params.customer.email,
      customer_phone: params.customer.phone,
      total: grandTotal,
      tax: taxAmount,
      discount: disc,
      status: 'pending',
      due_date: params.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      pdf_url: `https://api.grafixworker.com/api/pdf/${invoiceNum}`,
      created_at: new Date().toISOString()
    };

    localDb.invoices.unshift(newInvoice);
    localDb.invoice_items.push(...itemsToInsert);

    // If customer doesn't exist, create profile
    const existingCust = localDb.customers.find(c => c.client_id === clientId && c.email.toLowerCase() === params.customer.email.toLowerCase());
    if (!existingCust) {
      this.createCustomer(clientId, {
        name: params.customer.name,
        email: params.customer.email,
        phone: params.customer.phone || '',
        notes: `Auto-onboarded client from Invoice ${invoiceNum}`,
        tags: ['Invoiced Client']
      });
    }

    localDb.save();

    return {
      success: true,
      invoiceId,
      invoiceNumber: invoiceNum,
      total: grandTotal,
      pdfUrl: newInvoice.pdf_url || ''
    };
  },

  async sendInvoiceAction(clientId: string, invoiceId: string): Promise<{ success: boolean; invoiceId: string; status: string }> {
    if (isSupabaseConfigured) {
      try {
        return await this.callWorkerApi(`/api/invoices/${invoiceId}/send`, 'POST');
      } catch (err: any) {
        return { success: false, invoiceId, status: 'failed', error: err.message } as any;
      }
    }

    // Emulated worker side effect (demo mode only, Supabase not configured):
    const invoice = localDb.invoices.find(i => i.id === invoiceId);
    if (invoice) {
      invoice.status = 'pending'; // or update state to note it was dispatched
      
      localDb.email_log.unshift({
        id: 'el-' + Math.random().toString(36).substr(2, 9),
        client_id: clientId,
        recipient: invoice.customer_email,
        subject: `Emailed Invoice copy: ${invoice.invoice_number}`,
        status: 'sent',
        created_at: new Date().toISOString()
      });

      localDb.save();
    }

    return {
      success: true,
      invoiceId,
      status: 'sent'
    };
  },

  async exportCsvAction(clientId: string, table: string): Promise<{ success: boolean; csvContent: string; fileName: string }> {
    const fileName = `${table}_export_${clientId}.csv`;

    // Real mode: fetch the actual CSV directly from the Worker (it returns
    // text/csv, not JSON, so this can't reuse callWorkerApi as-is).
    if (isSupabaseConfigured) {
      try {
        const token = (await supabase?.auth.getSession())?.data.session?.access_token;
        const res = await fetch(`${workerBaseUrl}/api/export/${table}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          throw new Error(errText || `Export failed with status ${res.status}`);
        }
        const csvContent = await res.text();
        return { success: true, csvContent, fileName };
      } catch (err: any) {
        return { success: false, csvContent: '', fileName, error: err.message } as any;
      }
    }

    // Demo mode only (Supabase not configured): generate CSV from local data.
    let rows: any[] = [];

    switch (table) {
      case 'customers':
        rows = this.getCustomers(clientId).map(c => ({ Name: c.name, Email: c.email, Phone: c.phone, Created: c.created_at }));
        break;
      case 'products':
        rows = this.getProducts(clientId).map(p => ({ SKU: p.sku, Name: p.name, Price: p.price, Stock: p.stock_qty }));
        break;
      case 'orders':
        rows = localDb.orders.filter(o => o.client_id === clientId).map(o => ({ Number: o.order_number, Customer: o.customer_name, Total: o.total, Status: o.status, Date: o.created_at }));
        break;
      case 'bookings':
        rows = this.getBookings(clientId).map(b => ({ Number: b.booking_number, Customer: b.customer_name, Service: b.service_name, Staff: b.staff_name, Start: b.start_time, Status: b.status }));
        break;
      case 'invoices':
        rows = this.getInvoices(clientId).map(i => ({ Number: i.invoice_number, Customer: i.customer_name, Total: i.total, Status: i.status, Due: i.due_date }));
        break;
      case 'submissions':
        rows = this.getSubmissions(clientId).map(s => ({ Name: s.customer_name, Email: s.customer_email, Message: s.message, Status: s.status, Type: s.form_name }));
        break;
      default:
        rows = [{ Message: 'No data exported' }];
    }

    if (rows.length === 0) {
      return { success: true, csvContent: 'No data', fileName };
    }

    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => headers.map(fieldName => JSON.stringify(row[fieldName] || '')).join(','))
    ].join('\r\n');

    return {
      success: true,
      csvContent,
      fileName
    };
  },

  async globalSearchAction(clientId: string, query: string): Promise<{
    result_type: 'customer' | 'product' | 'submission' | 'invoice' | 'booking' | 'order';
    id: string;
    title: string;
    subtitle: string;
    created_at: string;
  }[]> {
    const q = query.toLowerCase().trim();
    if (q.length < 2) return [];

    if (isSupabaseConfigured) {
      try {
        const result = await this.callWorkerApi(`/api/search?q=${encodeURIComponent(query)}`, 'GET');
        return result?.results || [];
      } catch (err) {
        console.error('[Search] Worker search failed:', err);
        return [];
      }
    }

    // Demo mode only (Supabase not configured): local emulated search.
    const results: any[] = [];

    // Search Customers
    this.getCustomers(clientId).forEach(c => {
      if (c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) {
        results.push({
          result_type: 'customer',
          id: c.id,
          title: c.name,
          subtitle: `Customer • ${c.email}`,
          created_at: c.created_at
        });
      }
    });

    // Search Products
    this.getProducts(clientId).forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) {
        results.push({
          result_type: 'product',
          id: p.id,
          title: p.name,
          subtitle: `Product • ${p.sku} • Stock: ${p.stock_qty}`,
          created_at: new Date().toISOString()
        });
      }
    });

    // Search Submissions
    this.getSubmissions(clientId).forEach(s => {
      if (s.customer_name.toLowerCase().includes(q) || s.message.toLowerCase().includes(q)) {
        results.push({
          result_type: 'submission',
          id: s.id,
          title: s.customer_name,
          subtitle: `Submission (${s.form_name}) • "${s.message.substring(0, 40)}..."`,
          created_at: s.created_at
        });
      }
    });

    // Search Bookings
    this.getBookings(clientId).forEach(b => {
      if (b.customer_name.toLowerCase().includes(q) || b.service_name.toLowerCase().includes(q)) {
        results.push({
          result_type: 'booking',
          id: b.id,
          title: `Booking ${b.booking_number} - ${b.customer_name}`,
          subtitle: `Booking • ${b.service_name} • ${b.status}`,
          created_at: b.created_at
        });
      }
    });

    // Search Orders
    localDb.orders.filter(o => o.client_id === clientId).forEach(o => {
      if (o.customer_name.toLowerCase().includes(q) || o.order_number.toLowerCase().includes(q)) {
        results.push({
          result_type: 'order',
          id: o.id,
          title: `Order ${o.order_number}`,
          subtitle: `Order • ${o.customer_name} • R${o.total.toFixed(2)} • ${o.status}`,
          created_at: o.created_at
        });
      }
    });

    return results.slice(0, 10);
  },

  async syncFromSupabase(clientId: string) {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      console.log(`[Sync] Loading data for client ${clientId} from Supabase...`);

      const [
        { data: clients },
        { data: customers },
        { data: products },
        { data: orders },
        { data: orderItemsRaw },
        { data: bookings },
        { data: invoices },
        { data: invoiceItemsRaw },
        { data: submissions },
        { data: teamMembers },
        { data: services },
        { data: staff },
        { data: emailLog },
      ] = await Promise.all([
        supabase.from('clients').select('*').eq('client_id', clientId),
        supabase.from('customers').select('*').eq('client_id', clientId),
        supabase.from('products').select('*').eq('client_id', clientId),
        supabase.from('orders').select('*').eq('client_id', clientId),
        supabase.from('order_items').select('*, orders!inner(client_id)').eq('orders.client_id', clientId),
        supabase.from('bookings').select('*').eq('client_id', clientId),
        supabase.from('invoices').select('*').eq('client_id', clientId),
        supabase.from('invoice_items').select('*, invoices!inner(client_id)').eq('invoices.client_id', clientId),
        supabase.from('submissions').select('*').eq('client_id', clientId),
        supabase.from('team_members').select('*').eq('client_id', clientId),
        supabase.from('services').select('*').eq('client_id', clientId),
        supabase.from('staff').select('*').eq('client_id', clientId),
        supabase.from('email_log').select('*').eq('client_id', clientId),
      ]);

      // --- Clients: real column is business_name, not name. No address/
      // phone/website_hero_* columns exist at all — left blank rather than
      // showing stale demo placeholder text for a real synced business.
      if (clients && clients.length) {
        localDb.clients = localDb.clients.filter(c => c.id !== clientId);
        localDb.clients.push(...clients.map((c: any) => ({
          id: c.client_id,
          name: c.business_name || 'Unnamed Business',
          logo_url: c.logo_url || '',
          business_type: (c.business_type || 'agency') as BusinessType,
          primary_color: c.primary_color || '#1e293b',
          secondary_color: c.secondary_color || '#3b82f6',
          banking_details: c.bank_name
            ? `${c.bank_name} • Account: ${c.bank_account_number || 'N/A'}`
            : '',
          address: '', // no matching column in the deployed schema
          phone: '',   // no matching column in the deployed schema
          email: c.owner_email || '',
          website_hero_title: c.website_hero_title,
          website_hero_subtitle: c.website_hero_subtitle,
          website_seo_keywords: c.website_seo_keywords,
        })));
      }

      // --- Customers: column names already match the UI shape directly.
      let realCustomers: any[] = [];
      if (customers) {
        realCustomers = customers;
        localDb.customers = localDb.customers.filter(c => c.client_id !== clientId);
        localDb.customers.push(...customers);
      }
      const customersById = new Map(realCustomers.map(c => [c.id, c]));

      // --- Products: column names already match the UI shape directly
      // (barcode/cost_price/low_stock_warning/variants just won't be
      // present — components should treat those as optional).
      if (products) {
        localDb.products = localDb.products.filter(p => p.client_id !== clientId);
        localDb.products.push(...products);
      }

      // --- Services & Staff: fetched first so orders/bookings can be
      // denormalized against them below. Staff has no 'role' column in
      // the deployed schema at all — defaulted to a generic label.
      let realServices: any[] = [];
      if (services) {
        realServices = services;
        localDb.services = localDb.services.filter(s => s.client_id !== clientId);
        localDb.services.push(...services.map((s: any) => ({
          id: s.id,
          client_id: s.client_id,
          name: s.name,
          duration: s.duration_minutes,
          price: s.price,
        })));
      }
      const servicesById = new Map(realServices.map(s => [s.id, s]));

      let realStaff: any[] = [];
      if (staff) {
        realStaff = staff;
        localDb.staff = localDb.staff.filter(s => s.client_id !== clientId);
        localDb.staff.push(...staff.map((s: any) => ({
          id: s.id,
          client_id: s.client_id,
          name: s.full_name,
          role: 'Team Member', // no role/title column exists in the deployed schema
        })));
      }
      const staffById = new Map(realStaff.map(s => [s.id, s]));

      // --- Orders: real table links to customers via customer_id, and
      // has no shipping_address column — denormalize the customer's
      // name/email/phone here so every existing component that expects
      // flat fields keeps working unchanged.
      if (orders) {
        localDb.orders = localDb.orders.filter(o => o.client_id !== clientId);
        localDb.orders.push(...orders.map((o: any) => {
          const cust = customersById.get(o.customer_id);
          return {
            id: o.id,
            client_id: o.client_id,
            order_number: o.order_number,
            customer_name: cust?.name || 'Unknown Customer',
            customer_email: cust?.email || '',
            customer_phone: cust?.phone || undefined,
            status: o.status,
            total: o.total,
            notes: o.notes || undefined,
            shipping_address: undefined, // no matching column
            created_at: o.created_at,
          };
        }));
      }

      if (orderItemsRaw) {
        localDb.order_items = localDb.order_items.filter(
          oi => !orders?.some((o: any) => o.id === oi.order_id)
        );
        localDb.order_items.push(...orderItemsRaw.map((oi: any) => ({
          id: oi.id,
          order_id: oi.order_id,
          product_id: oi.product_id,
          product_name: oi.name_snapshot,
          qty: oi.qty,
          price: oi.unit_price,
        })));
      }

      // --- Bookings: real table has no booking_number column — synthesized
      // from the id. Links to customers/services/staff via FK, denormalized
      // here the same way as orders above.
      if (bookings) {
        localDb.bookings = localDb.bookings.filter(b => b.client_id !== clientId);
        localDb.bookings.push(...bookings.map((b: any) => {
          const cust = customersById.get(b.customer_id);
          const svc = servicesById.get(b.service_id);
          const stf = staffById.get(b.staff_id);
          return {
            id: b.id,
            client_id: b.client_id,
            booking_number: 'BKG-' + String(b.id).slice(0, 8).toUpperCase(),
            customer_name: cust?.name || 'Unknown Customer',
            customer_email: cust?.email || '',
            customer_phone: cust?.phone || undefined,
            service_id: b.service_id,
            service_name: svc?.name || 'Unknown Service',
            staff_id: b.staff_id || undefined,
            staff_name: stf?.full_name || undefined,
            start_time: b.start_time,
            end_time: b.end_time,
            status: b.status === 'no_show' ? 'no-show' : b.status,
            created_at: b.created_at,
          };
        }));
      }

      // --- Invoices: real table has no discount column, and links to
      // customers via customer_id the same way orders do.
      if (invoices) {
        localDb.invoices = localDb.invoices.filter(i => i.client_id !== clientId);
        localDb.invoices.push(...invoices.map((i: any) => {
          const cust = customersById.get(i.customer_id);
          return {
            id: i.id,
            client_id: i.client_id,
            invoice_number: i.invoice_number,
            customer_name: cust?.name || 'Unknown Customer',
            customer_email: cust?.email || '',
            customer_phone: cust?.phone || undefined,
            total: i.total,
            tax: i.tax || 0,
            discount: 0, // no matching column in the deployed schema
            status: i.status,
            due_date: i.due_at,
            pdf_url: i.pdf_url || undefined,
            created_at: i.created_at,
          };
        }));
      }

      if (invoiceItemsRaw) {
        localDb.invoice_items = localDb.invoice_items.filter(
          ii => !invoices?.some((i: any) => i.id === ii.invoice_id)
        );
        localDb.invoice_items.push(...invoiceItemsRaw.map((ii: any) => ({
          id: ii.id,
          invoice_id: ii.invoice_id,
          product_name: ii.description,
          quantity: ii.quantity,
          price: ii.unit_price,
        })));
      }

      // --- Submissions: real table stores form fields in submission_json
      // (jsonb), not a flat 'message' column, and has no customer_phone
      // or assigned_staff_id columns at all.
      if (submissions) {
        localDb.submissions = localDb.submissions.filter(s => s.client_id !== clientId);
        localDb.submissions.push(...submissions.map((s: any) => ({
          id: s.id,
          client_id: s.client_id,
          form_name: s.form_name,
          customer_name: s.customer_name,
          customer_email: s.customer_email,
          customer_phone: s.submission_json?.phone || undefined,
          message: s.submission_json?.message || s.submission_json?.notes || JSON.stringify(s.submission_json || {}),
          assigned_staff_id: undefined, // no matching column — assignment is UI-only for now
          status: SUBMISSION_STATUS_TO_UI[s.status] || 'new',
          created_at: s.created_at,
        })));
      }

      // --- Team members: real column is full_name, and status is a plain
      // 'active' boolean rather than an 'active'/'pending' string.
      if (teamMembers) {
        localDb.team_members = localDb.team_members.filter(t => t.client_id !== clientId);
        localDb.team_members.push(...teamMembers.map((t: any) => ({
          id: t.id,
          client_id: t.client_id,
          auth_user_id: t.auth_user_id,
          name: t.full_name,
          email: t.email,
          role: t.role,
          status: (t.active ? 'active' : 'pending') as 'active' | 'pending',
          permissions: t.permissions || { manage_billing: false, manage_inventory: false, manage_team: false },
        })));
      }

      // --- Email log: real column is sent_at, not created_at, and there's
      // no per-row status column (it's only logged after a successful send).
      if (emailLog) {
        localDb.email_log = localDb.email_log.filter(e => e.client_id !== clientId);
        localDb.email_log.push(...emailLog.map((e: any) => ({
          id: e.id,
          client_id: e.client_id,
          recipient: e.recipient,
          subject: e.subject,
          status: 'sent' as const,
          created_at: e.sent_at,
        })));
      }

      localDb.save();
      console.log('[Sync] Data synced successfully.');
    } catch (err) {
      console.error('[Sync] Error loading data from Supabase:', err);
    }
  }
};
