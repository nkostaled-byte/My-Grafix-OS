import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Plus, FileText, Send, 
  Trash2
} from 'lucide-react';
import { db } from '../lib/supabase';
import { Client, Order, OrderItem, Product } from '../types';

interface OrdersViewProps {
  client: Client;
  onRefreshMetrics?: () => void;
}

export default function OrdersView({ client, onRefreshMetrics }: OrdersViewProps) {
  const [activeTab, setActiveTab] = useState<'All' | 'paid' | 'pending' | 'cancelled'>('All');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(null);

  // POS Form States
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [cartItems, setCartItems] = useState<{ productId: string; qty: number }[]>([]);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [currentOrders, setCurrentOrders] = useState<Order[]>([]);

  // Load data asynchronously from Worker
  useEffect(() => {
    (async () => {
      const [loadedOrders, loadedProducts] = await Promise.all([
        db.getOrders(client.id),
        db.getProducts(client.id),
      ]);
      setCurrentOrders(loadedOrders as Order[]);
      setProducts(loadedProducts as Product[]);
    })();
  }, [client.id]);

  const reloadOrders = async () => {
    const loaded = await db.getOrders(client.id);
    setCurrentOrders(loaded as Order[]);
  };

  const getOrderItems = (_orderId: string): OrderItem[] => {
    return [];
  };

  const filteredOrders = currentOrders.filter(o => {
    const matchesTab = activeTab === 'All' || o.status === activeTab;
    const matchesSearch = o.customer_name.toLowerCase().includes(search.toLowerCase()) || 
                          o.order_number.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const addToCart = (prodId: string) => {
    const existing = cartItems.find(c => c.productId === prodId);
    if (existing) {
      setCartItems(cartItems.map(c => c.productId === prodId ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCartItems([...cartItems, { productId: prodId, qty: 1 }]);
    }
  };

  const removeFromCart = (prodId: string) => {
    setCartItems(cartItems.filter(c => c.productId !== prodId));
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0 || !custName || !custEmail) return;

    const res = await db.createOrderAction(client.id, {
      customer: { name: custName, email: custEmail, phone: custPhone || undefined },
      items: cartItems,
      notes: notes || undefined
    });

    if (res.success) {
      await reloadOrders();
      setIsCheckoutOpen(false);
      setCartItems([]);
      setCustName('');
      setCustEmail('');
      setCustPhone('');
      setNotes('');
      onRefreshMetrics?.();
    }
  };

  const handleSendInvoice = async (order: Order) => {
    setSendingInvoiceId(order.id);
    try {
      await db.createInvoiceAction(client.id, {
        customer: { name: order.customer_name, email: order.customer_email, phone: order.customer_phone },
        items: getOrderItems(order.id).map(oi => ({ description: oi.product_name, quantity: oi.qty, price: oi.price })),
        tax: 20,
        orderId: order.id
      });
      alert(`Invoice and receipt sent to ${order.customer_email} successfully!`);
    } catch (err: any) {
      alert(`Failed to send invoice: ${err.message}`);
    } finally {
      setSendingInvoiceId(null);
    }
  };

  const handleDownloadCsv = async () => {
    const res = await db.exportCsvAction(client.id, 'orders');
    const blob = new Blob([res.csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', res.fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="orders-view-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-gray-900">POS & Customer Orders</h1>
          <p className="text-xs text-gray-500 mt-1">Review eCommerce receipts, walk-in checkouts, and dispatch digital customer receipts.</p>
        </div>
        <div className="flex gap-2.5 w-full sm:w-auto">
          <button 
            onClick={handleDownloadCsv}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-semibold transition-all"
          >
            Export CSV
          </button>
          <button 
            id="register-sale-btn"
            onClick={() => setIsCheckoutOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Walk-in Sale (POS)
          </button>
        </div>
      </div>

      {/* Tabs / Filter Navigation */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="flex border-b border-gray-100 pb-px gap-6 overflow-x-auto">
          {(['All', 'paid', 'pending', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap capitalize ${
                activeTab === tab 
                  ? 'border-gray-900 text-gray-900' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === 'All' ? 'All Orders' : `${tab} Receipts`}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search customer name, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-lg text-xs placeholder-gray-400 focus:outline-none focus:border-gray-300 w-full sm:w-60"
          />
        </div>
      </div>

      {/* Orders split view (Table left, detailed drawer right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${selectedOrder ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="py-3.5 px-5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-mono">Order Ref</th>
                  <th className="py-3.5 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-mono">Customer</th>
                  <th className="py-3.5 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-mono">Date / Time</th>
                  <th className="py-3.5 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-mono text-center">Status</th>
                  <th className="py-3.5 px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-mono text-right">Total</th>
                  <th className="py-3.5 px-5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-mono text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                      No customer orders found in this category.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr 
                      key={o.id} 
                      onClick={() => setSelectedOrder(o)}
                      className={`hover:bg-gray-50/45 cursor-pointer transition-colors ${selectedOrder?.id === o.id ? 'bg-gray-50/75' : ''}`}
                    >
                      <td className="py-4 px-5 font-mono text-xs font-semibold text-gray-900">
                        {o.order_number}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-semibold text-gray-800 block">{o.customer_name}</span>
                        <span className="text-[10px] text-gray-400 block font-mono">{o.customer_email}</span>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-500 font-sans">
                        {new Date(o.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold tracking-wide uppercase font-mono ${
                          o.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          o.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          'bg-gray-50 text-gray-500 border border-gray-200'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-xs font-semibold text-gray-900">
                        R{o.total.toFixed(2)}
                      </td>
                      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1.5 justify-end">
                          <button 
                            onClick={() => handleSendInvoice(o)}
                            disabled={sendingInvoiceId === o.id}
                            className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg border border-gray-100 transition-colors"
                            title="Email Copy Invoice"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed drawer right side */}
        {selectedOrder && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5 animate-slide-left relative h-fit">
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-xs font-semibold"
            >
              ✕
            </button>
            
            <div>
              <span className="text-[9px] uppercase tracking-wider font-mono font-semibold text-gray-400 block">Order ID ref</span>
              <h3 className="text-sm font-semibold text-gray-900 mt-0.5">{selectedOrder.order_number}</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">{new Date(selectedOrder.created_at).toLocaleString()}</p>
            </div>

            <div className="border-t border-b border-gray-50 py-4 space-y-3">
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block">Purchased Products</span>
              <div className="space-y-2.5">
                {getOrderItems(selectedOrder.id).map((item) => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <div className="max-w-[70%]">
                      <span className="font-semibold text-gray-800 block">{item.product_name}</span>
                      <span className="text-gray-400 text-[10px]">Qty: {item.qty} × R{item.price.toFixed(2)}</span>
                    </div>
                    <span className="font-mono text-gray-900 font-semibold">R{(item.qty * item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block">Order Timeline & Billing</span>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Client Contact:</span>
                  <span className="font-semibold text-gray-800">{selectedOrder.customer_name}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Ship Mode:</span>
                  <span className="font-semibold text-gray-800">{selectedOrder.shipping_address || 'Over-the-Counter'}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Payment status:</span>
                  <span className="font-semibold text-emerald-600 uppercase tracking-wide text-[10px]">{selectedOrder.status}</span>
                </div>
                <div className="border-t border-gray-200/50 pt-1.5 flex justify-between font-semibold text-gray-900">
                  <span>Total Gross:</span>
                  <span className="font-mono">R{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handleSendInvoice(selectedOrder)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-600 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch Email
              </button>
            </div>
          </div>
        )}
      </div>

      {/* POS Point of Sale checkout Drawer */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col justify-between animate-slide-left border-l border-gray-100">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-900">POS Checkout Terminal</h3>
              </div>
              <button onClick={() => { setIsCheckoutOpen(false); setCartItems([]); }} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            {/* Split content */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product list catalog left */}
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block mb-1">Stock Catalog</span>
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {products.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => p.stock_qty > 0 && addToCart(p.id)}
                      className={`p-2.5 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-100 cursor-pointer transition-colors flex justify-between items-center ${p.stock_qty === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div>
                        <span className="text-xs font-semibold text-gray-800 block">{p.name}</span>
                        <span className="text-[9px] font-mono text-gray-400">SKU: {p.sku} • Stock: {p.stock_qty}</span>
                      </div>
                      <span className="text-xs font-mono font-semibold text-gray-900">R{p.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart details & Customer right */}
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block mb-1">Selected Cart Items</span>
                <div className="space-y-2 border border-gray-100 p-3 bg-gray-50/30 rounded-xl max-h-[160px] overflow-y-auto">
                  {cartItems.length === 0 ? (
                    <p className="text-[10px] text-gray-400 text-center py-6">Cart is empty. Tap products to add.</p>
                  ) : (
                    cartItems.map(c => {
                      const p = products.find(prod => prod.id === c.productId);
                      if (!p) return null;
                      return (
                        <div key={c.productId} className="flex justify-between items-center text-xs">
                          <span className="text-gray-800 truncate max-w-[50%]">{p.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">×{c.qty}</span>
                            <button 
                              type="button" 
                              onClick={() => removeFromCart(p.id)}
                              className="text-rose-500 p-1 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="space-y-2.5 pt-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block mb-1">Walk-in Customer Contact</span>
                  <input 
                    type="text" 
                    required 
                    placeholder="Customer Name"
                    value={custName}
                    onChange={e => setCustName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/50"
                  />
                  <input 
                    type="email" 
                    required 
                    placeholder="Customer Email"
                    value={custEmail}
                    onChange={e => setCustEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/50"
                  />
                  <input 
                    type="text" 
                    placeholder="Customer Phone (Optional)"
                    value={custPhone}
                    onChange={e => setCustPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/50"
                  />
                </div>
              </form>
            </div>

            {/* Total Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold text-gray-500">Gross Sale Value:</span>
                <span className="text-lg font-mono font-semibold text-gray-950">
                  R{cartItems.reduce((acc, c) => acc + (products.find(p => p.id === c.productId)?.price || 0) * c.qty, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => { setIsCheckoutOpen(false); setCartItems([]); }}
                  className="flex-1 py-2 text-xs font-semibold text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg"
                >
                  Clear Cart
                </button>
                <button 
                  type="button"
                  disabled={cartItems.length === 0 || !custName || !custEmail}
                  onClick={handleCheckoutSubmit}
                  className="flex-1 py-2 text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-lg disabled:opacity-40 shadow-xs"
                >
                  Register POS Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
