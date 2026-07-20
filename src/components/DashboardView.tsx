import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, ShoppingBag, Calendar, AlertCircle, 
  FileText, MessageSquare, ArrowUpRight, ArrowDownRight, 
  Plus, CheckCircle, Package, ArrowRight, ShieldCheck, Clock, X
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, BarChart, Bar, Legend
} from 'recharts';
import { db } from '../lib/supabase';
import { Client, Order, Booking, Product, Invoice, Submission } from '../types';
import { workerApi } from '../lib/worker-api';

interface DashboardViewProps {
  client: Client;
  onNavigate: (view: string) => void;
  onTriggerQuickAction: (action: string) => void;
}

export default function DashboardView({ client, onNavigate, onTriggerQuickAction }: DashboardViewProps) {
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'weekly' | 'monthly'>('weekly');
  
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimCode, setClaimCode] = useState('');
  const [relinkLoading, setRelinkLoading] = useState(false);
  const [relinkError, setRelinkError] = useState('');
  const [relinkSuccess, setRelinkSuccess] = useState(false);

  // Async data states
  const [products, setProducts] = useState<Product[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [dailySales, setDailySales] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);

  // Load data from Worker
  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, bookRes, invRes, subRes, metricsRes] = await Promise.all([
          workerApi.getProducts(),
          workerApi.getBookings(),
          workerApi.getInvoices(),
          workerApi.getSubmissions(),
          workerApi.getMetrics(),
        ]);
        if (prodRes.success) setProducts(prodRes.data || []);
        if (bookRes.success) setBookings(bookRes.data || []);
        if (invRes.success) setInvoices(invRes.data || []);
        if (subRes.success) setSubmissions(subRes.data || []);
        if (metricsRes.success && metricsRes.data) {
          const m = metricsRes.data as any;
          setDailySales(m.daily_sales || []);
          setMonthlyRevenue(m.monthly_revenue || []);
        }
      } catch (err) {
        console.error('[Dashboard] Failed to load data from Worker:', err);
      }
    };
    loadData();
}, [client.id]);

  const handleRelink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimCode.trim()) return;
    setRelinkLoading(true);
    setRelinkError('');

    try {
      let token = '';
      const { isSupabaseConfigured, supabase, workerBaseUrl } = await import('../lib/supabase');
      
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token || '';
      } else {
        const savedUser = localStorage.getItem('grafix_current_user');
        const email = savedUser ? JSON.parse(savedUser).email : 'guest@example.com';
        const payload = { sub: 'user-mock-relink', email };
        token = `mockHeader.${btoa(JSON.stringify(payload))}.mockSignature`;
      }

      const endpoint = isSupabaseConfigured 
        ? `${workerBaseUrl}/api/claim-account/relink`
        : `${window.location.origin}/api/claim-account/relink`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ claimCode: claimCode.trim() }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMessage = errData.error || `Error ${response.status}: Failed to link account.`;
        if (response.status === 404) {
          throw new Error('Invalid claim code. Please check and try again.');
        } else if (response.status === 409) {
          if (errMessage.includes('manual merge')) {
            throw new Error('Your current account already contains active business data. This needs a manual merge — contact support.');
          } else {
            throw new Error('This business is already linked to another account. Please contact support.');
          }
        }
        throw new Error(errMessage);
      }

      const data = await response.json();
      if (data.success) {
        setRelinkSuccess(true);
        const savedUserStr = localStorage.getItem('grafix_current_user');
        if (savedUserStr) {
          const userObj = JSON.parse(savedUserStr);
          userObj.client_id = data.client?.client_id;
          localStorage.setItem('grafix_current_user', JSON.stringify(userObj));
        }
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error(data.error || 'Failed to link workspace.');
      }
    } catch (err: any) {
      setRelinkError(err.message || 'Linking failed.');
    } finally {
      setRelinkLoading(false);
    }
  };

  // Derive dashboard statistics dynamically
  const lowStockProducts = products.filter(p => (p as any).stock_qty <= ((p as any).low_stock_warning || 0));
  const pendingInvoices = invoices.filter((i: any) => i.status === 'pending');
  const unreadMessages = submissions.filter((s: any) => s.status === 'new' || s.status === 'received');
  const activeBookingsCount = bookings.filter(b => b.status === 'upcoming').length;

  const totalRevenueToday = dailySales.length > 0 ? dailySales[dailySales.length - 1]?.revenue || 0 : 0;
  const previousRevenueDay = dailySales.length > 1 ? dailySales[dailySales.length - 2]?.revenue || 0 : 0;
  const revenueGrowth = previousRevenueDay > 0 
    ? Math.round(((totalRevenueToday - previousRevenueDay) / previousRevenueDay) * 100)
    : 0;
  const totalOrdersToday = dailySales.length > 0 ? dailySales[dailySales.length - 1]?.orders || 0 : 0;
  const previousOrdersDay = dailySales.length > 1 ? dailySales[dailySales.length - 2]?.orders || 0 : 0;
  const ordersGrowth = previousOrdersDay > 0 
    ? Math.round(((totalOrdersToday - previousOrdersDay) / previousOrdersDay) * 100)
    : 0;

  // Custom Chart Tooltip styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-3 border border-gray-100 rounded-xl shadow-xl">
          <p className="font-mono text-xs text-gray-500 mb-1">{label}</p>
          <p className="text-sm font-semibold text-gray-900">
            R{payload[0].value.toLocaleString()}
          </p>
          {payload[1] && (
            <p className="text-xs text-gray-500 font-mono mt-1">
              {payload[1].name}: {payload[1].value}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in" id="dashboard-view-container">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-radial from-gray-50 to-transparent -mr-16 -mt-16 rounded-full pointer-events-none" />
        <div className="z-10">
          <h1 className="text-2xl md:text-3xl font-sans font-medium tracking-tight text-gray-900">
            Welcome back, <span className="font-semibold">{db.currentUser.name}</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1.5 flex items-center flex-wrap gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse animate-duration-1000" />
            <span>Your {client.name} operation center is fully operational.</span>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <button 
              onClick={() => {
                setClaimCode('');
                setRelinkError('');
                setRelinkSuccess(false);
                setShowClaimModal(true);
              }}
              className="text-xs text-gray-500 hover:text-gray-900 font-semibold underline underline-offset-4 cursor-pointer transition-colors"
            >
              Already have a website with us?
            </button>
          </p>
        </div>
        <div className="flex gap-3 z-10 w-full md:w-auto">
          <button 
            id="quick-order-btn"
            onClick={() => onTriggerQuickAction('order')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-medium transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Order
          </button>
          <button 
            id="quick-booking-btn"
            onClick={() => onTriggerQuickAction('booking')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-medium transition-all"
          >
            <Calendar className="w-4 h-4" />
            Add Booking
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-gray-400 text-xs font-medium font-sans uppercase tracking-wider">Today's Revenue</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-semibold tracking-tight text-gray-900">
              R{totalRevenueToday.toFixed(2)}
            </span>
            <div className="flex items-center gap-1 mt-1 text-xs">
              <span className={`flex items-center font-medium ${revenueGrowth >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {revenueGrowth >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                {Math.abs(revenueGrowth)}%
              </span>
              <span className="text-gray-400">vs yesterday</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-gray-400 text-xs font-medium font-sans uppercase tracking-wider">Today's Orders</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-semibold tracking-tight text-gray-900">
              {totalOrdersToday}
            </span>
            <div className="flex items-center gap-1 mt-1 text-xs">
              <span className={`flex items-center font-medium ${ordersGrowth >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {ordersGrowth >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                {Math.abs(ordersGrowth)}%
              </span>
              <span className="text-gray-400">vs yesterday</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Upcoming Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-gray-400 text-xs font-medium font-sans uppercase tracking-wider">Active Bookings</span>
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-semibold tracking-tight text-gray-900">
              {activeBookingsCount}
            </span>
            <p className="text-xs text-gray-400 mt-1">Upcoming customer sessions</p>
          </div>
        </div>

        {/* KPI 4: Pending Action Flags */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-gray-400 text-xs font-medium font-sans uppercase tracking-wider">System Alerts</span>
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Low/Out Stock:</span>
              <span className={`font-semibold ${lowStockProducts.length > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                {lowStockProducts.length}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Pending Invoices:</span>
              <span className="font-semibold text-gray-900">{pendingInvoices.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Unread Forms:</span>
              <span className={`font-semibold ${unreadMessages.length > 0 ? 'text-indigo-600' : 'text-gray-900'}`}>
                {unreadMessages.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (Span 2) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Sales Trend & Revenue Stream</h2>
              <p className="text-xs text-gray-400 mt-0.5">Real-time daily flow analytics</p>
            </div>
            <div className="flex rounded-lg bg-gray-50 p-1 border border-gray-100">
              <button 
                onClick={() => setAnalyticsPeriod('weekly')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${analyticsPeriod === 'weekly' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-400 hover:text-gray-700'}`}
              >
                7 Days
              </button>
              <button 
                onClick={() => setAnalyticsPeriod('monthly')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${analyticsPeriod === 'monthly' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-400 hover:text-gray-700'}`}
              >
                Yearly
              </button>
            </div>
          </div>

          <div className="h-72 w-full font-mono text-xs">
            {analyticsPeriod === 'weekly' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySales} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={client.primary_color} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={client.primary_color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Revenue (R)"
                    stroke={client.primary_color} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => [`R${value}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill={client.secondary_color} radius={[4, 4, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Task Hub / Quick Actions (Span 1) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button 
                id="quick-invoice-action"
                onClick={() => onTriggerQuickAction('invoice')}
                className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-100 text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-900 block">Generate Invoice</span>
                    <span className="text-[10px] text-gray-400">Professional draft to client</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button 
                id="quick-product-action"
                onClick={() => onTriggerQuickAction('product')}
                className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-100 text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-100 transition-colors">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-900 block">Add Product Item</span>
                    <span className="text-[10px] text-gray-400">Expand stock catalogue</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button 
                id="quick-customer-action"
                onClick={() => onTriggerQuickAction('customer')}
                className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-100 text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-900 block">Onboard Customer</span>
                    <span className="text-[10px] text-gray-400">Establish user profile card</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-sans">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Direct Supabase RLS Protected
            </span>
          </div>
        </div>
      </div>

      {/* Lists Section: Today's Appointments & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Bookings List (Span 2) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Today's Appointment Schedule</h2>
              <p className="text-xs text-gray-400 mt-0.5">Assigned staff list and customer bookings</p>
            </div>
            <button 
              onClick={() => onNavigate('Bookings')}
              className="text-xs font-semibold text-gray-900 flex items-center gap-1 hover:underline"
            >
              Open Calendar
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
            {bookings.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-gray-100 rounded-xl">
                <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-500">No scheduled sessions today</p>
              </div>
            ) : (
              bookings.map((b) => {
                const startTimeStr = new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={b.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 border border-gray-50 hover:border-gray-100 rounded-xl bg-gray-50/55 transition-colors gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white border border-gray-100 rounded-xl flex flex-col items-center justify-center min-w-[55px]">
                        <Clock className="w-3.5 h-3.5 text-gray-400 mb-0.5" />
                        <span className="text-[10px] font-mono font-medium text-gray-900">{startTimeStr}</span>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-gray-900 block">{b.customer_name}</span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono bg-white border border-gray-100 px-1.5 py-0.5 rounded text-gray-600">{b.service_name}</span>
                          <span>• Assigned to: <b className="text-gray-700 font-medium">{b.staff_name}</b></span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wider uppercase font-mono ${
                        b.status === 'upcoming' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                        b.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        b.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity Timeline (Span 1) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Audit History & Timeline</h2>
          <div className="flow-root max-h-[350px] overflow-y-auto pr-1">
            <ul className="-mb-8">
              {/* Pre-constructed Timeline of Events */}
              {[
                { id: 1, title: 'Invoice INV-004812 Paid', user: 'System Agent', desc: 'Alexander Sterling settled invoice', time: 'Today, 8:15 AM', type: 'payment' },
                { id: 2, title: 'New Customer Profile Added', user: 'Julian C.', desc: 'Alexander Sterling onboarded', time: 'Yesterday, 3:30 PM', type: 'user' },
                { id: 3, title: 'Beard Balm Stock Threshold Warning', user: 'Inventory Alert', desc: 'Sandalwood Beard Balm remaining: 8 units', time: '2 days ago', type: 'stock' },
                { id: 4, title: 'Site Quotation Submitted', user: 'Sarah J.', desc: 'Modular Cedar Studio appraisal requested', time: '3 days ago', type: 'quote' }
              ].map((event, eventIdx) => (
                <li key={event.id}>
                  <div className="relative pb-8">
                    {eventIdx !== 3 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-100" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                          event.type === 'payment' ? 'bg-emerald-50 text-emerald-600' :
                          event.type === 'user' ? 'bg-blue-50 text-blue-600' :
                          event.type === 'stock' ? 'bg-amber-50 text-amber-600' :
                          'bg-indigo-50 text-indigo-600'
                        }`}>
                          {event.type === 'payment' && <CheckCircle className="w-4 h-4" />}
                          {event.type === 'user' && <Users className="w-4 h-4" />}
                          {event.type === 'stock' && <Package className="w-4 h-4" />}
                          {event.type === 'quote' && <FileText className="w-4 h-4" />}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs">
                          <p className="font-semibold text-gray-900">{event.title}</p>
                          <p className="text-gray-400 text-[10px] mt-0.5">By {event.user} • {event.time}</p>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          <p>{event.desc}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Enterprise Claim Code Dialog Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-100">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-sans font-medium text-sm text-gray-950">Link Existing Website</h3>
                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mt-0.5">Authorization Fallback</p>
                </div>
              </div>
              <button 
                onClick={() => setShowClaimModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {relinkSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">Workspace Successfully Linked!</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                  Your existing website products, bookings, past orders, and billing accounts are now connected. Reloading your dashboard...
                </p>
              </div>
            ) : (
              <form onSubmit={handleRelink} className="space-y-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  If your agency-built website's products and booking logs are not appearing on your dashboard, enter your manual **Claim Code** (e.g. <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-950 text-[11px]">XQBZ4821</code>) to link your real-time data immediately.
                </p>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 block">Enterprise Claim Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. XQBZ4821"
                    value={claimCode}
                    onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 transition-all text-gray-800 font-mono uppercase font-semibold"
                  />
                </div>

                {relinkError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl space-y-1">
                    <p className="text-[11px] font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Action Blocked</span>
                    </p>
                    <p className="text-[10px] leading-relaxed text-rose-600 font-sans">
                      {relinkError}
                    </p>
                  </div>
                )}

                <div className="flex gap-2.5 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowClaimModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={relinkLoading || !claimCode.trim()}
                    className="flex-1 px-4 py-2.5 bg-gray-950 hover:bg-gray-900 active:bg-black text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {relinkLoading ? 'Linking Workspace...' : 'Link Account'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
