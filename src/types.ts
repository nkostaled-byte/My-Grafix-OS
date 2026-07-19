export type BusinessType = 'barbershop' | 'cafe' | 'restaurant' | 'construction' | 'retail' | 'clinic' | 'agency' | 'salon' | 'gym' | 'consultant';

export interface Client {
  id: string;
  name: string;
  logo_url: string;
  business_type: BusinessType;
  primary_color: string;
  secondary_color: string;
  banking_details: string;
  address: string;
  phone: string;
  email: string;
  website_hero_title?: string;
  website_hero_subtitle?: string;
  website_seo_keywords?: string;
}

export interface TeamMember {
  id: string;
  client_id: string;
  auth_user_id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'staff';
  status: 'active' | 'pending';
  permissions: {
    manage_billing: boolean;
    manage_inventory: boolean;
    manage_team: boolean;
  };
}

export interface Customer {
  id: string;
  client_id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  tags?: string[];
  created_at: string;
}

export interface Submission {
  id: string;
  client_id: string;
  form_name: 'contact' | 'quote';
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  message: string;
  assigned_staff_id?: string;
  status: 'new' | 'replied' | 'archived';
  created_at: string;
}

export interface Product {
  id: string;
  client_id: string;
  name: string;
  category: string;
  sku: string;
  barcode?: string;
  price: number;
  cost_price: number;
  stock_qty: number;
  low_stock_warning: number;
  image_url?: string;
  variants?: string[]; // e.g., ["Small", "Medium", "Large"]
}

export interface InventoryMovement {
  id: string;
  client_id: string;
  product_id: string;
  product_name: string;
  qty: number;
  type: 'in' | 'out' | 'adjustment';
  reason: string;
  created_at: string;
}

export interface Order {
  id: string;
  client_id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  status: 'new' | 'paid' | 'pending' | 'cancelled' | 'refunded';
  total: number;
  notes?: string;
  shipping_address?: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  qty: number;
  price: number;
}

export interface Service {
  id: string;
  client_id: string;
  name: string;
  duration: number; // in minutes
  price: number;
}

export interface Staff {
  id: string;
  client_id: string;
  name: string;
  role: string;
}

export interface Booking {
  id: string;
  client_id: string;
  booking_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  service_id: string;
  service_name: string;
  staff_id?: string;
  staff_name?: string;
  start_time: string; // ISO string
  end_time: string; // ISO string
  status: 'upcoming' | 'completed' | 'cancelled' | 'no-show';
  created_at: string;
}

export interface Invoice {
  id: string;
  client_id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  total: number;
  tax: number;
  discount: number;
  status: 'paid' | 'pending' | 'cancelled' | 'overdue';
  due_date: string;
  pdf_url?: string;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface EmailLog {
  id: string;
  client_id: string;
  recipient: string;
  subject: string;
  status: 'sent' | 'failed';
  created_at: string;
}

export interface DailySale {
  date: string;
  revenue: number;
  orders: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}
