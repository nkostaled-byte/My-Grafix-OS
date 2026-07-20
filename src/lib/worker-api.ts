/**
 * Grafix Business OS — Worker API Client
 *
 * Replaces the old LocalDatabase (mock data) with authenticated API calls
 * to the Cloudflare Worker. All CRUD goes through the Worker, which in
 * turn queries Supabase with its service role key.
 *
 * Authentication: JWT Bearer token from Supabase Auth session.
 */

import { supabase, isSupabaseConfigured, workerBaseUrl } from './supabase';

// ==================================================
// Types
// ==================================================

export interface WorkerResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metrics?: any;
}

// ==================================================
// Helpers
// ==================================================

async function getAuthToken(): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch {
    return null;
  }
}

async function buildHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  const token = await getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function getBaseUrl(): string {
  return (workerBaseUrl || '').replace(/\/$/, '');
}

class WorkerApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'WorkerApiError';
  }
}

async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<WorkerResponse<T>> {
  const baseUrl = getBaseUrl();
  const headers = await buildHeaders();

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        error: body?.error || `Request failed with status ${response.status}`,
      };
    }

    return body || { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error connecting to Worker',
    };
  }
}

// ==================================================
// Resource CRUD (generic — used by all dashboard views)
// ==================================================

function resourcePath(resource: string): string {
  return `/api/dashboard/${resource}`;
}

function resourceItemPath(resource: string, id: string): string {
  return `/api/dashboard/${resource}/${id}`;
}

function resourceStatusPath(resource: string, id: string): string {
  return `/api/dashboard/${resource}/${id}/status`;
}

// ==================================================
// Dashboard API
// ==================================================

export const workerApi = {
  // --- Dashboard Metrics ---
  getMetrics: () => request<{
    totalProducts: number;
    totalCustomers: number;
    totalBookings: number;
    activeBookings: number;
    totalOrders: number;
    totalRevenue: number;
    pendingInvoices: number;
    unreadSubmissions: number;
    todayBookings: any[];
  }>('/api/dashboard/metrics'),

  // --- Products ---
  getProducts: () => request('/api/dashboard/products?order=name.asc'),
  createProduct: (data: any) => request('/api/dashboard/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: any) => request(resourceItemPath('products', id), { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: string) => request(resourceItemPath('products', id), { method: 'DELETE' }),

  // --- Customers ---
  getCustomers: () => request('/api/dashboard/customers?order=created_at.desc'),
  createCustomer: (data: any) => request('/api/dashboard/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id: string, data: any) => request(resourceItemPath('customers', id), { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id: string) => request(resourceItemPath('customers', id), { method: 'DELETE' }),

  // --- Bookings ---
  getBookings: () => request('/api/dashboard/bookings?order=start_time.desc'),
  updateBookingStatus: (id: string, status: string) =>
    request(resourceStatusPath('bookings', id), { method: 'PUT', body: JSON.stringify({ status }) }),

  // --- Orders ---
  getOrders: () => request('/api/dashboard/orders?order=created_at.desc'),

  // --- Invoices ---
  getInvoices: () => request('/api/dashboard/invoices?order=created_at.desc'),
  updateInvoiceStatus: (id: string, status: string) =>
    request(resourceStatusPath('invoices', id), { method: 'PUT', body: JSON.stringify({ status }) }),

  // --- Submissions (Contact Forms / Quotes) ---
  getSubmissions: () => request('/api/dashboard/submissions?order=created_at.desc'),
  updateSubmissionStatus: (id: string, status: string) =>
    request(resourceStatusPath('submissions', id), { method: 'PUT', body: JSON.stringify({ status }) }),

  // --- Services ---
  getServices: () => request('/api/dashboard/services?order=name.asc'),
  createService: (data: any) => request('/api/dashboard/services', { method: 'POST', body: JSON.stringify(data) }),

  // --- Staff ---
  getStaff: () => request('/api/dashboard/staff?order=name.asc'),
  createStaff: (data: any) => request('/api/dashboard/staff', { method: 'POST', body: JSON.stringify(data) }),

  // --- Team Members ---
  getTeamMembers: () => request('/api/dashboard/team_members?order=name.asc'),
  createTeamMember: (data: any) => request('/api/dashboard/team_members', { method: 'POST', body: JSON.stringify(data) }),
  updateTeamMember: (id: string, data: any) => request(resourceItemPath('team_members', id), { method: 'PUT', body: JSON.stringify(data) }),
  deleteTeamMember: (id: string) => request(resourceItemPath('team_members', id), { method: 'DELETE' }),

  // --- Claim Account ---
  claimAccount: (token: string, businessName?: string) =>
    request('/api/claim-account', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessName }),
    }),

  relinkAccount: (token: string, claimCode: string) =>
    request('/api/claim-account/relink', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ claimCode }),
    }),

  // --- Search ---
  searchAll: (q: string) => request(`/api/search?q=${encodeURIComponent(q)}`),

  // --- Upload ---
  uploadFile: async (file: File, folder: 'logos' | 'profile' | 'products'): Promise<WorkerResponse<{ url: string; key: string }>> => {
    const baseUrl = getBaseUrl();
    const token = await getAuthToken();
    const headers: HeadersInit = { 'Content-Type': file.type };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${baseUrl}/api/upload?folder=${folder}`, {
        method: 'POST',
        headers,
        body: file,
      });
      const body = await response.json();
      if (!response.ok) return { success: false, error: body?.error || 'Upload failed' };
      return { success: true, data: { url: body.url, key: body.key } };
    } catch (err: any) {
      return { success: false, error: err.message || 'Upload failed' };
    }
  },

  // --- Orders (create from public checkout) ---
  createOrder: (data: any) => request('/api/orders', { method: 'POST', body: JSON.stringify(data) }),

  // --- Bookings (create from public booking flow) ---
  createBooking: (data: any) => request('/api/bookings', { method: 'POST', body: JSON.stringify(data) }),

  // --- Invoices (create + send) ---
  createInvoice: (data: any) => request('/api/invoices', { method: 'POST', body: JSON.stringify(data) }),
  sendInvoice: (id: string) => request(`/api/invoices/${id}/send`, { method: 'POST' }),

  // --- Export CSV ---
  exportCsv: async (table: string): Promise<WorkerResponse<{ csvContent: string; fileName: string }>> => {
    const baseUrl = getBaseUrl();
    const token = await getAuthToken();
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${baseUrl}/api/export/${table}`, { headers });
      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        return { success: false, error: errText || `Export failed with status ${response.status}` };
      }
      const csvContent = await response.text();
      const fileName = `${table}-${new Date().toISOString().slice(0, 10)}.csv`;
      return { success: true, data: { csvContent, fileName } };
    } catch (err: any) {
      return { success: false, error: err.message || 'Export failed' };
    }
  },

  // --- Contact Form Submission (public) ---
  submitContactForm: (data: any) =>
    request('/api/contact', { method: 'POST', body: JSON.stringify(data) }),
};

export default workerApi;

