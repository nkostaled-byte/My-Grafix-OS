import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Plus, Search, Check, 
  MapPin, Phone, Mail, FileText, CheckSquare, AlertTriangle 
} from 'lucide-react';
import { db } from '../lib/supabase';
import { Client, Booking, Service, Staff } from '../types';

interface BookingsViewProps {
  client: Client;
  onRefreshMetrics?: () => void;
}

export default function BookingsView({ client, onRefreshMetrics }: BookingsViewProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'calendar'>('list');

  // Form states
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');

  // Load data asynchronously from Worker
  useEffect(() => {
    (async () => {
      const [loadedBookings, loadedServices, loadedStaff] = await Promise.all([
        db.getBookings(client.id),
        db.getServices(client.id),
        db.getStaff(client.id),
      ]);
      setBookings(loadedBookings as Booking[]);
      setServices(loadedServices as Service[]);
      setStaffList(loadedStaff as Staff[]);
    })();
  }, [client.id]);

  const reloadBookings = async () => {
    const loaded = await db.getBookings(client.id);
    setBookings(loaded as Booking[]);
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custEmail || !serviceId) return;

    const startIso = `${startDate}T${startTime}:00`;
    const res = await db.createBookingAction(client.id, {
      customer: { name: custName, email: custEmail, phone: custPhone || undefined },
      serviceId,
      staffId: staffId || undefined,
      startTime: startIso
    });

    if (res.success) {
      await reloadBookings();
      setIsAddOpen(false);
      // Reset form
      setCustName('');
      setCustEmail('');
      setCustPhone('');
      setServiceId('');
      setStaffId('');
      onRefreshMetrics?.();
    }
  };

  const handleUpdateStatus = async (id: string, status: 'upcoming' | 'completed' | 'cancelled' | 'no-show') => {
    await db.updateBookingStatus(id, status);
    await reloadBookings();
    if (selectedBooking?.id === id) {
      setSelectedBooking(prev => prev ? { ...prev, status } : null);
    }
    onRefreshMetrics?.();
  };

  const exportBookings = async () => {
    const res = await db.exportCsvAction(client.id, 'bookings');
    const blob = new Blob([res.csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', res.fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="bookings-view-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-gray-900">Appointment Scheduler</h1>
          <p className="text-xs text-gray-500 mt-1">Manage scheduled client sessions, track staff attendance, and dispatch reminders.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={exportBookings}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-semibold transition-all"
          >
            Export CSV
          </button>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Book Slot
          </button>
        </div>
      </div>

      {/* Grid Split split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-xs">
            <div className="flex rounded-lg bg-gray-50 p-1 border border-gray-100">
              <button 
                onClick={() => setActiveView('list')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeView === 'list' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-400 hover:text-gray-700'}`}
              >
                List Agenda
              </button>
              <button 
                onClick={() => setActiveView('calendar')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeView === 'calendar' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-400 hover:text-gray-700'}`}
              >
                Calendar Board
              </button>
            </div>
            <span className="text-xs text-gray-400 font-mono">Today: {new Date().toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
          </div>

          {activeView === 'list' ? (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block">Upcoming Agenda</span>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">{bookings.length} Registered</span>
              </div>
              <div className="divide-y divide-gray-50">
                {bookings.length === 0 ? (
                  <p className="p-8 text-center text-xs text-gray-400">No scheduled sessions recorded.</p>
                ) : (
                  bookings.map(b => (
                    <div 
                      key={b.id} 
                      onClick={() => setSelectedBooking(b)}
                      className={`p-4 hover:bg-gray-50/50 cursor-pointer transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${selectedBooking?.id === b.id ? 'bg-gray-50/75' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl flex flex-col items-center justify-center min-w-[55px]">
                          <Clock className="w-3.5 h-3.5 text-gray-400 mb-0.5" />
                          <span className="text-[10px] font-mono font-semibold text-gray-800">
                            {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-900 block">{b.customer_name}</span>
                          <span className="text-[10px] text-gray-400 flex flex-wrap gap-2 items-center mt-1">
                            <span className="bg-white border border-gray-100 px-1.5 py-0.2 rounded font-sans text-gray-600 font-medium">{b.service_name}</span>
                            <span>• Staff: <b className="text-gray-700">{b.staff_name}</b></span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold tracking-wider uppercase font-mono ${
                          b.status === 'upcoming' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                          b.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          b.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                          'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            // Custom high-fidelity mini calendar grid
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block">Weekly Staff Rota</span>
              <div className="grid grid-cols-7 gap-2 text-center text-xs">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <span key={day} className="font-mono font-semibold text-gray-400 uppercase text-[9px]">{day}</span>
                ))}
                {Array.from({ length: 31 }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const hasBooking = dayNum === 18; // July 18th has bookings
                  return (
                    <div 
                      key={idx} 
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-between min-h-[50px] transition-all ${
                        dayNum === 18 
                          ? 'border-indigo-200 bg-indigo-50/50 text-indigo-950 font-semibold' 
                          : 'border-gray-50 bg-gray-50/30 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xs">{dayNum}</span>
                      {hasBooking && <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Selected Booking Drawer */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs h-fit space-y-5">
          {selectedBooking ? (
            <div className="space-y-4 animate-fade-in">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-mono font-semibold text-gray-400 block">Booking Reference</span>
                <h3 className="text-sm font-semibold text-gray-900 mt-0.5">{selectedBooking.booking_number}</h3>
              </div>

              <div className="space-y-2.5 border-t border-b border-gray-50 py-4">
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block">Session Particulars</span>
                <div className="text-xs space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Service Offered:</span>
                    <span className="font-semibold text-gray-800">{selectedBooking.service_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Staff Assigned:</span>
                    <span className="font-semibold text-gray-800">{selectedBooking.staff_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Scheduled Time:</span>
                    <span className="font-semibold text-gray-800">
                      {new Date(selectedBooking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-semibold text-gray-800">
                      {new Date(selectedBooking.start_time).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block">Customer Information</span>
                <div className="text-xs space-y-1.5 text-gray-500">
                  <p className="font-semibold text-gray-800 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-gray-400" /> {selectedBooking.customer_name}</p>
                  <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" /> {selectedBooking.customer_email}</p>
                  {selectedBooking.customer_phone && <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {selectedBooking.customer_phone}</p>}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block mb-1">Update Status</span>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'completed')}
                    className="py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 text-[10px] font-semibold rounded-lg transition-colors"
                  >
                    Completed
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'cancelled')}
                    className="py-1.5 bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 text-[10px] font-semibold rounded-lg transition-colors"
                  >
                    Cancelled
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'no-show')}
                    className="col-span-2 py-1.5 bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100 text-[10px] font-semibold rounded-lg transition-colors"
                  >
                    Mark No-Show
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 text-xs">
              <Calendar className="w-7 h-7 text-gray-300 mx-auto mb-2" />
              Select an appointment from the list to view particulars, check customer notes, or manage attendance status.
            </div>
          )}
        </div>
      </div>

      {/* Add Booking Modal Dialog */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-900">Register Scheduled Appointment</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleCreateBooking} className="p-6 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block mb-1">Customer Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Winston Churchill"
                    value={custName}
                    onChange={e => setCustName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block mb-1">Customer Email *</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="winston@cabinet.gov.uk"
                    value={custEmail}
                    onChange={e => setCustEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block mb-1">Customer Phone</label>
                  <input 
                    type="text" 
                    placeholder="+44 7700 900500"
                    value={custPhone}
                    onChange={e => setCustPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block mb-1">Select Service *</label>
                    <select 
                      value={serviceId} 
                      onChange={e => setServiceId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/50"
                      required
                    >
                      <option value="">Choose Service</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{s.name} (R{s.price})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block mb-1">Assign Staff</label>
                    <select 
                      value={staffId} 
                      onChange={e => setStaffId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/50"
                    >
                      <option value="">Any Staff</option>
                      {staffList.map(st => (
                        <option key={st.id} value={st.id}>{st.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block mb-1">Booking Date *</label>
                    <input 
                      type="date" 
                      required 
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-400 block mb-1">Start Time *</label>
                    <input 
                      type="time" 
                      required 
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/50 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-lg shadow-xs"
                >
                  Confirm Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
