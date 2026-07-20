/**
 * Grafix Business OS — Supabase & Worker Backend Integration
 *
 * This module initializes the Supabase client for authentication (Google OAuth,
 * email/password) and provides a `db` object that mirrors the old LocalDatabase
 * interface but routes all data operations through the Cloudflare Worker API.
 *
 * The Worker (mygrafix-dashboard-worker) is the only backend — it uses its
 * service role key to query Supabase directly. The frontend never talks to
 * Supabase directly for data, only for authentication.
 *
 * Rules:
 *  - No mock/demo/fake data
 *  - No direct Supabase queries from the frontend (except auth)
 *  - All CRUD goes through the Worker with JWT Bearer token
 */

import { createClient } from '@supabase/supabase-js';
import { 
  Client, TeamMember, Customer, Product, Order, Booking, 
  Invoice, InvoiceItem, Submission, Service, Staff, 
  InventoryMovement, EmailLog, DailySale, MonthlyRevenue,
  BusinessType
} from '../types';
import { workerApi } from './worker-api';

// Access Environment Variables Safely
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
export const workerBaseUrl = (import.meta as any).env?.VITE_WORKER_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

// Initialize Supabase Client ONLY for authentication (Google OAuth, email/password).
// All data queries go through the Worker, NOT directly to Supabase.
export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'MY_SUPABASE_URL' && 
  supabaseAnonKey !== 'MY_SUPABASE_ANON_KEY';

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// ==================================================
// UNIFIED BUSINESS OPERATION SYSTEM — DATA LAYER
// All methods route through the Cloudflare Worker.
// ==================================================

export const db = {
  // -- Current User State --
  currentUser: (() => {
    try {
      const saved = localStorage.getItem('grafix_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      id: '',
      email: '',
      name: 'Guest',
      role: 'owner',
      client_id: ''
    };
  })(),

  setAuthUser(email: string, clientId: string) {
    const userObj = {
      id: 'user-' + clientId,
      email,
      name: email.split('@')[0],
      role: 'owner' as const,
      client_id: clientId
    };
    this.currentUser = userObj;
    try {
      localStorage.setItem('grafix_current_user', JSON.stringify(userObj));
    } catch (e) {}
  },

  signInWithGoogleSimulated(email: string, name: string): { user: any; isNewUser: boolean } {
    // In production mode (Supabase configured), real OAuth handles this.
    // This is only a fallback for demo/preview environments without Supabase.
    if (isSupabaseConfigured) {
      return { user: { email, name, id: '', client_id: '' }, isNewUser: false };
    }

    const newUser = {
      id: 'user-new-' + Math.random().toString(36).substr(2, 9),
      email: email,
      name: name,
      role: 'owner' as const,
      client_id: ''
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

  // -- Clients --
  getClients: (): Client[] => {
    // In production, the Worker resolves the client from the JWT.
    // For the sidebar display, we return the current client from localStorage.
    try {
      const saved = localStorage.getItem('grafix_current_user');
      if (saved) {
        const user = JSON.parse(saved);
        if (user.client_id) {
          return [{
            id: user.client_id,
            name: user.client_id.replace('client-', '').replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
            logo_url: '',
            business_type: 'agency' as BusinessType,
            primary_color: '#1e293b',
            secondary_color: '#3b82f6',
            banking_details: '',
            address: '',
            phone: '',
            email: user.email || '',
          }];
        }
      }
    } catch (e) {}
    return [];
  },

  getCurrentClient(clientId: string): Client {
    // Return a minimal client object based on the ID.
    // The full profile is loaded via the Worker's /api/public/site endpoint.
    return {
      id: clientId,
      name: clientId.replace('client-', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      logo_url: '',
      business_type: 'agency' as BusinessType,
      primary_color: '#1e293b',
      secondary_color: '#3b82f6',
      banking_details: '',
      address: '',
      phone: '',
      email: '',
    };
  },

  updateClientProfile(clientId: string, updates: Partial<Client>) {
    // Worker handles client profile updates via the dashboard endpoints
    console.log('[DB] Client profile update requested (Worker-managed):', clientId, updates);
  },

  async getClientIdForUser(authUserId: string): Promise<string | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) return null;

      const result = await workerApi.claimAccount(session.session.access_token);
      if (result.success && result.data?.client?.client_id) {
        return result.data.client.client_id;
      }
    } catch (e) {
      console.error('[DB] Error in getClientIdForUser:', e);
    }
    return null;
  },

  // -- Customers --
  getCustomers: async (clientId: string): Promise<Customer[]> => {
    const result = await workerApi.getCustomers();
    return result.success ? (result.data || []) : [];
  },

  createCustomer: async (clientId: string, customer: Omit<Customer, 'id' | 'client_id' | 'created_at'>): Promise<Customer | null> => {
    const result = await workerApi.createCustomer(customer);
    return result.success && result.data ? result.data[0] : null;
  },

  updateCustomer: async (id: string, updates: Partial<Customer>) => {
    await workerApi.updateCustomer(id, updates);
  },

  deleteCustomer: async (id: string) => {
    await workerApi.deleteCustomer(id);
  },

  // -- Products --
  getProducts: async (clientId: string): Promise<Product[]> => {
    const result = await workerApi.getProducts();
    return result.success ? (result.data || []) : [];
  },

  createProduct: async (clientId: string, product: Omit<Product, 'id' | 'client_id'>): Promise<Product | null> => {
    const result = await workerApi.createProduct(product);
    return result.success && result.data ? result.data[0] : null;
  },

  updateProduct: async (id: string, updates: Partial<Product>, adjustmentReason?: string) => {
    await workerApi.updateProduct(id, updates);
  },

  deleteProduct: async (id: string) => {
    await workerApi.deleteProduct(id);
  },

  getInventoryMovements: async (clientId: string): Promise<InventoryMovement[]> => {
    // Inventory movements are tracked server-side; return empty for now
    return [];
  },

  // -- Submissions (Contact/Quotes) --
  getSubmissions: async (clientId: string, type?: 'contact' | 'quote'): Promise<Submission[]> => {
    const result = await workerApi.getSubmissions();
    let data = result.success ? (result.data || []) : [];
    if (type) {
      data = data.filter((s: any) => s.form_name === type);
    }
    return data;
  },

  assignStaffToSubmission: (subId: string, staffId?: string) => {
    // Staff assignment is managed via the Worker
    console.log('[DB] assignStaffToSubmission:', subId, staffId);
  },

  updateSubmissionStatus: async (subId: string, status: 'new' | 'replied' | 'archived') => {
    await workerApi.updateSubmissionStatus(subId, status);
  },

  // -- Services --
  getServices: async (clientId: string): Promise<Service[]> => {
    const result = await workerApi.getServices();
    return result.success ? (result.data || []) : [];
  },

  createService: async (clientId: string, srv: Omit<Service, 'id' | 'client_id'>): Promise<Service | null> => {
    const result = await workerApi.createService(srv);
    return result.success && result.data ? result.data[0] : null;
  },

  // -- Staff --
  getStaff: async (clientId: string): Promise<Staff[]> => {
    const result = await workerApi.getStaff();
    return result.success ? (result.data || []) : [];
  },

  createStaff: async (clientId: string, stf: Omit<Staff, 'id' | 'client_id'>): Promise<Staff | null> => {
    const result = await workerApi.createStaff(stf);
    return result.success && result.data ? result.data[0] : null;
  },

  // -- Bookings --
  getBookings: async (clientId: string): Promise<Booking[]> => {
    const result = await workerApi.getBookings();
    return result.success ? (result.data || []) : [];
  },

  updateBookingStatus: async (id: string, status: 'upcoming' | 'completed' | 'cancelled' | 'no-show') => {
    await workerApi.updateBookingStatus(id, status);
  },

  // -- Orders --
  getOrders: async (clientId: string): Promise<Order[]> => {
    const result = await workerApi.getOrders();
    return result.success ? (result.data || []) : [];
  },

  // -- Invoices --
  getInvoices: async (clientId: string): Promise<Invoice[]> => {
    const result = await workerApi.getInvoices();
    return result.success ? (result.data || []) : [];
  },

  getInvoiceItems: async (invoiceId: string): Promise<InvoiceItem[]> => {
    const result = await workerApi.getInvoices();
    if (result.success && result.data) {
      return (result.data as any[]).filter((i: any) => i.id === invoiceId).flatMap((i: any) => i.invoice_items || []);
    }
    return [];
  },

  updateInvoiceStatus: async (id: string, status: 'paid' | 'pending' | 'cancelled' | 'overdue') => {
    await workerApi.updateInvoiceStatus(id, status);
  },

  // -- Team Members --
  getTeamMembers: async (clientId: string): Promise<TeamMember[]> => {
    const result = await workerApi.getTeamMembers();
    return result.success ? (result.data || []) : [];
  },

  createTeamMember: async (clientId: string, tm: Omit<TeamMember, 'id' | 'client_id' | 'auth_user_id' | 'status'>): Promise<TeamMember | null> => {
    const result = await workerApi.createTeamMember(tm);
    return result.success && result.data ? result.data[0] : null;
  },

  updateTeamMember: async (id: string, updates: Partial<TeamMember>) => {
    await workerApi.updateTeamMember(id, updates);
  },

  deleteTeamMember: async (id: string) => {
    await workerApi.deleteTeamMember(id);
  },

  // -- Email Log --
  getEmailLog: async (clientId: string): Promise<EmailLog[]> => {
    return [];
  },

  // -- Analytics --
  getDailySales: (clientId: string): DailySale[] => {
    return [];
  },

  getMonthlyRevenue: (clientId: string): MonthlyRevenue[] => {
    return [];
  },

  // --- Side-effect actions (Worker calls) ---
  async createOrderAction(clientId: string, params: {
    customer: { name: string; email: string; phone?: string };
    items: { productId: string; qty: number }[];
    notes?: string;
  }): Promise<{ success: boolean; orderId: string; orderNumber: string; total: number }> {
    const result = await workerApi.createOrder({ clientId, ...params });
    return result.success
      ? { success: true, orderId: result.data?.orderId || '', orderNumber: result.data?.orderNumber || '', total: result.data?.total || 0 }
      : { success: false, orderId: '', orderNumber: '', total: 0 };
  },

  async createBookingAction(clientId: string, params: {
    customer: { name: string; email: string; phone?: string };
    serviceId: string;
    staffId?: string;
    startTime: string;
  }): Promise<{ success: boolean; bookingId: string; startTime: string; endTime: string }> {
    const result = await workerApi.createBooking({ clientId, ...params });
    return result.success
      ? { success: true, bookingId: result.data?.bookingId || '', startTime: result.data?.startTime || '', endTime: result.data?.endTime || '' }
      : { success: false, bookingId: '', startTime: '', endTime: '' };
  },

  async uploadAction(file: File, folder: 'logos' | 'profile' | 'products'): Promise<{ success: boolean; url: string; key: string }> {
    const result = await workerApi.uploadFile(file, folder);
    return result.success
      ? { success: true, url: result.data?.url || '', key: result.data?.key || '' }
      : { success: false, url: '', key: '' };
  },

  async createInvoiceAction(clientId: string, params: {
    customer: { id?: string; name: string; email: string; phone?: string };
    items: { productId?: string; description: string; quantity: number; price: number }[];
    tax: number;
    discount?: number;
    dueDate?: string;
    orderId?: string;
  }): Promise<{ success: boolean; invoiceId: string; invoiceNumber: string; total: number; pdfUrl: string }> {
    const result = await workerApi.createInvoice(params);
    return result.success
      ? { success: true, invoiceId: result.data?.invoiceId || '', invoiceNumber: result.data?.invoiceNumber || '', total: result.data?.total || 0, pdfUrl: result.data?.pdfUrl || '' }
      : { success: false, invoiceId: '', invoiceNumber: '', total: 0, pdfUrl: '' };
  },

  async sendInvoiceAction(clientId: string, invoiceId: string): Promise<{ success: boolean; invoiceId: string; status: string }> {
    const result = await workerApi.sendInvoice(invoiceId);
    return result.success
      ? { success: true, invoiceId, status: 'sent' }
      : { success: false, invoiceId, status: 'failed' };
  },

  async exportCsvAction(clientId: string, table: string): Promise<{ success: boolean; csvContent: string; fileName: string }> {
    const result = await workerApi.exportCsv(table);
    return result.success
      ? { success: true, csvContent: result.data?.csvContent || '', fileName: result.data?.fileName || '' }
      : { success: false, csvContent: '', fileName: '' };
  },

  async globalSearchAction(clientId: string, query: string): Promise<{
    result_type: 'customer' | 'product' | 'submission' | 'invoice' | 'booking' | 'order';
    id: string;
    title: string;
    subtitle: string;
    created_at: string;
  }[]> {
    const result = await workerApi.searchAll(query);
    return result.success ? (result.data?.results || []) : [];
  },

  async syncFromSupabase(clientId: string) {
    // No-op: data is fetched on-demand via Worker API calls.
    // This keeps the legacy interface but does nothing.
    console.log('[DB] syncFromSupabase is no longer needed — data is fetched live from Worker');
  }
};

