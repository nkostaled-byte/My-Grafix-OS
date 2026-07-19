import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Package, Calendar, Users, 
  FileText, ClipboardCheck, MessageSquare, BarChart3, Megaphone, 
  ShieldCheck, Download, Settings, Globe, Search, Menu, X, 
  Briefcase, LogOut, Bell, Sun, Moon
} from 'lucide-react';
import { db, supabase, isSupabaseConfigured, workerBaseUrl } from './lib/supabase';
import { Client } from './types';

// Import Modular Sub-views
import DashboardView from './components/DashboardView';
import ProductsView from './components/ProductsView';
import OrdersView from './components/OrdersView';
import BookingsView from './components/BookingsView';
import { 
  CustomersView, InvoicesView, QuotesView, ContactFormsView, 
  AnalyticsView, MarketingView, TeamView, ReportsView, 
  WebsiteView, SettingsView 
} from './components/SaaSViews';

// Import Public-Facing marketing/onboarding components
import MarketingNav from './components/MarketingNav';
import LandingPage from './components/LandingPage';
import PricingPage from './components/PricingPage';
import LoginPage from './components/LoginPage';
import OnboardingPage from './components/OnboardingPage';

export default function App() {
  const [sessionUser, setSessionUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('grafix_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activePage, setActivePage] = useState<'landing' | 'pricing' | 'login' | 'onboarding' | 'dashboard'>(() => {
    try {
      const saved = localStorage.getItem('grafix_current_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u && u.client_id) {
          return 'dashboard';
        } else if (u) {
          return 'onboarding';
        }
      }
    } catch (e) {}
    return 'landing'; // Starts on Landing Page
  });

  const [activeClient, setActiveClient] = useState<Client>(() => {
    try {
      const saved = localStorage.getItem('grafix_current_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u && u.client_id) {
          return db.getCurrentClient(u.client_id);
        }
      }
    } catch (e) {}
    return db.getCurrentClient('client-barbershop-1');
  });

  // ==================================================
  // DARK MODE
  // ==================================================
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('grafix_theme');
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
    } catch (e) { /* localStorage unavailable — fall through to system preference */ }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    try {
      localStorage.setItem('grafix_theme', isDarkMode ? 'dark' : 'light');
    } catch (e) { /* localStorage unavailable — theme just won't persist across reloads */ }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Keep a ref of sessionUser to avoid stale closures inside the
  // OAuth listener below, which only sets up its subscription once.
  const sessionUserRef = useRef(sessionUser);
  useEffect(() => { sessionUserRef.current = sessionUser; }, [sessionUser]);

  // ==================================================
  // GOOGLE OAUTH REDIRECT HANDLING
  // ==================================================
  // signInWithOAuth() navigates away to Google and back — LoginPage's own
  // code never gets to run a "what happens after" step, because the page
  // reloads. This effect is what actually completes that flow: it detects
  // the real Supabase session (either already present on mount, or
  // appearing via onAuthStateChange shortly after the redirect lands),
  // calls /api/claim-account exactly like LoginPage's email/password path
  // does, and routes to onboarding or the dashboard accordingly.
  //
  // Known overlap: the email/password flow in LoginPage ALSO calls
  // /api/claim-account itself and fires its own SIGNED_IN event when it
  // runs. Both paths can end up calling claim-account for the same
  // sign-in. This is harmless — claim-account is idempotent and returns
  // "already_linked" on a repeat call — but it's a real duplicate call,
  // not a fully deduplicated design. Worth tightening later if it proves
  // costly, not worth the added complexity to fully eliminate now.
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let handledForCurrentSession = false;

    const resolveSession = async (session: any) => {
      if (!session || handledForCurrentSession) return;
      // Already resolved to a real client for this exact user — nothing to do.
      if (sessionUserRef.current?.id === session.user.id && sessionUserRef.current?.client_id) {
        return;
      }
      handledForCurrentSession = true;

      try {
        const claimResponse = await fetch(`${workerBaseUrl}/api/claim-account`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!claimResponse.ok) {
          console.error('[OAuth] claim-account failed:', await claimResponse.text());
          return;
        }

        const claimData = await claimResponse.json();
        const clientId = claimData?.client?.client_id;

        const user = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Owner',
          client_id: clientId || undefined,
        };

        setSessionUser(user);
        try { localStorage.setItem('grafix_current_user', JSON.stringify(user)); } catch (e) {}

        if (clientId) {
          setActiveClient(db.getCurrentClient(clientId));
          setActivePage('dashboard');
        } else {
          setActivePage('onboarding');
        }
      } catch (err) {
        console.error('[OAuth] Failed to resolve session after sign-in:', err);
      }
    };

    // Case 1: the OAuth redirect already completed before this component
    // mounted (Supabase's client parses the URL fragment synchronously).
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) resolveSession(data.session);
    });

    // Case 2: sign-in completes shortly after mount (the more common
    // timing for a fresh redirect landing).
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        resolveSession(session);
      }
      if (event === 'SIGNED_OUT') {
        handledForCurrentSession = false;
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [activeView, setActiveView] = useState<string>('Dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Brand colors custom override variables
  const [primaryColor, setPrimaryColor] = useState(activeClient.primary_color);
  const [secondaryColor, setSecondaryColor] = useState(activeClient.secondary_color);

  // Global Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Keep theme colors aligned when tenant changes
  useEffect(() => {
    setPrimaryColor(activeClient.primary_color);
    setSecondaryColor(activeClient.secondary_color);
    // Align db logged user client
    if (sessionUser) {
      db.setAuthUser(sessionUser.email, activeClient.id);
    } else {
      db.setAuthUser('julian@bladeandbarrel.co', activeClient.id);
    }

    // Async sync from real Supabase database if configured
    const syncData = async () => {
      await db.syncFromSupabase(activeClient.id);
      // Shallow update of primitive layout color triggers or layout state to refresh views
      setActiveClient(current => {
        const freshlySynced = db.getCurrentClient(current.id);
        return { ...freshlySynced };
      });
    };
    syncData();
  }, [activeClient.id, sessionUser]);

  // Handle global search debounce
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const runSearch = async () => {
        const results = await db.globalSearchAction(activeClient.id, searchQuery);
        setSearchResults(results);
      };
      const timer = setTimeout(runSearch, 200);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, activeClient]);

  const handleColorUpdate = (primary: string, secondary: string) => {
    setPrimaryColor(primary);
    setSecondaryColor(secondary);
  };

  const handleLoginSuccess = (user: { email: string; name: string; avatar?: string; client_id?: string }) => {
    setSessionUser(user);
    try {
      localStorage.setItem('grafix_current_user', JSON.stringify(user));
    } catch (e) {}

    if (user.client_id) {
      const client = db.getCurrentClient(user.client_id);
      setActiveClient(client);
      setActivePage('dashboard');
    } else {
      setActivePage('onboarding');
    }
  };

  const handleOnboardingComplete = (client: Client) => {
    setActiveClient(client);
    const updatedUser = {
      ...sessionUser,
      client_id: client.id,
      name: db.currentUser.name,
      role: 'owner'
    };
    setSessionUser(updatedUser);
    try {
      localStorage.setItem('grafix_current_user', JSON.stringify(updatedUser));
    } catch (e) {}
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    db.signOutSimulated();
    setSessionUser(null);
    try {
      localStorage.removeItem('grafix_current_user');
    } catch (e) {}
    setActivePage('landing');
  };

  const handleTriggerQuickAction = (action: string) => {
    if (action === 'order') {
      setActiveView('Orders');
      // Trigger checkout open immediately on order screen
      setTimeout(() => {
        const btn = document.getElementById('register-sale-btn');
        if (btn) btn.click();
      }, 100);
    } else if (action === 'booking') {
      setActiveView('Bookings');
      setTimeout(() => {
        const btn = document.querySelector('[id="bookings-view-container"] button:last-child') as HTMLButtonElement;
        if (btn) btn.click();
      }, 100);
    } else if (action === 'invoice') {
      setActiveView('Invoices');
      setTimeout(() => {
        const btn = document.getElementById('create-invoice-btn');
        if (btn) btn.click();
      }, 100);
    } else if (action === 'product') {
      setActiveView('Products');
      setTimeout(() => {
        const btn = document.getElementById('add-product-btn');
        if (btn) btn.click();
      }, 100);
    } else if (action === 'customer') {
      setActiveView('Customers');
      setTimeout(() => {
        const btn = document.querySelector('[id="customers-panel"] button') as HTMLButtonElement;
        if (btn) btn.click();
      }, 100);
    }
  };

  // Sidebar Menu Configuration
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Orders', icon: ShoppingBag },
    { name: 'Products', icon: Package },
    { name: 'Inventory', icon: Package }, // Share product view with inventory highlights
    { name: 'Bookings', icon: Calendar },
    { name: 'Customers', icon: Users },
    { name: 'Invoices', icon: FileText },
    { name: 'Quotes', icon: ClipboardCheck },
    { name: 'Contact Forms', icon: MessageSquare },
    { name: 'Analytics', icon: BarChart3 },
    { name: 'Marketing', icon: Megaphone },
    { name: 'Team', icon: ShieldCheck },
    { name: 'Reports', icon: Download },
    { name: 'Website', icon: Globe },
    { name: 'Settings', icon: Settings },
  ];

  const renderActiveView = () => {
    switch (activeView) {
      case 'Dashboard':
        return (
          <DashboardView 
            client={activeClient} 
            onNavigate={setActiveView} 
            onTriggerQuickAction={handleTriggerQuickAction} 
          />
        );
      case 'Products':
      case 'Inventory':
        return <ProductsView client={activeClient} onRefreshMetrics={() => {}} />;
      case 'Orders':
        return <OrdersView client={activeClient} onRefreshMetrics={() => {}} />;
      case 'Bookings':
        return <BookingsView client={activeClient} onRefreshMetrics={() => {}} />;
      case 'Customers':
        return <CustomersView client={activeClient} />;
      case 'Invoices':
        return <InvoicesView client={activeClient} />;
      case 'Quotes':
        return <QuotesView client={activeClient} />;
      case 'Contact Forms':
        return <ContactFormsView client={activeClient} />;
      case 'Analytics':
        return <AnalyticsView client={activeClient} />;
      case 'Marketing':
        return <MarketingView client={activeClient} />;
      case 'Team':
        return <TeamView client={activeClient} />;
      case 'Reports':
        return <ReportsView client={activeClient} />;
      case 'Website':
        return <WebsiteView client={activeClient} />;
      case 'Settings':
        return <SettingsView client={activeClient} onColorUpdate={handleColorUpdate} />;
      default:
        return <div className="p-8 text-center text-gray-400">View coming soon</div>;
    }
  };

  if (activePage === 'landing' || activePage === 'pricing' || activePage === 'login') {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between">
        <MarketingNav 
          currentPage={activePage} 
          onNavigate={(page) => {
            if (page === 'dashboard') {
              setActivePage('dashboard');
            } else {
              setActivePage(page as any);
            }
          }}
          isLoggedIn={!!sessionUser}
          onLogout={handleLogout}
        />
        <div className="flex-grow">
          {activePage === 'landing' && (
            <LandingPage 
              onGetStarted={() => setActivePage('login')}
              onGoogleSignIn={() => setActivePage('login')}
              onNavigateToPricing={() => setActivePage('pricing')}
            />
          )}
          {activePage === 'pricing' && (
            <PricingPage 
              onSelectTier={(tier) => setActivePage('login')}
            />
          )}
          {activePage === 'login' && (
            <LoginPage 
              onLoginSuccess={handleLoginSuccess}
              onNavigateHome={() => setActivePage('landing')}
            />
          )}
        </div>
      </div>
    );
  }

  if (activePage === 'onboarding') {
    return (
      <OnboardingPage 
        user={sessionUser}
        onOnboardingComplete={handleOnboardingComplete}
        onCancel={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ '--primary-accent': primaryColor } as React.CSSProperties}>
      
      {/* 1. SIDEBAR (DESKTOP) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 flex-shrink-0 z-20">
        {/* Brand identity */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div 
              style={{ backgroundColor: primaryColor }} 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black tracking-tighter text-sm shadow-xs"
            >
              G
            </div>
            <div>
              <span className="font-semibold text-gray-900 text-xs block">Grafix Business OS</span>
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider">v2.1</span>
            </div>
          </div>
        </div>

        {/* Active business — one business per login, no switching.
            If multi-business support is ever needed, this needs real
            backend changes first (auth_client_id() currently has
            LIMIT 1, and /api/claim-account only ever links one client
            per login) — don't reintroduce a switcher here without that. */}
        <div className="p-4 border-b border-gray-100">
          <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-gray-400 block mb-1.5">Business</label>
          <div className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl px-3 py-2 truncate">
            {activeClient.name}
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveView(item.name)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
                style={isActive ? { backgroundColor: primaryColor } : {}}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* User context footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <img 
              src={activeClient.logo_url} 
              alt={activeClient.name} 
              className="w-8 h-8 rounded-lg object-cover border border-gray-200"
            />
            <div className="min-w-0">
              <span className="font-semibold text-gray-900 text-[11px] block truncate">{sessionUser?.name || db.currentUser.name}</span>
              <span className="text-[9px] text-gray-400 font-mono capitalize tracking-wide">{sessionUser?.role || db.currentUser.role}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-1.5 text-gray-400 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-gray-400 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE SIDEBAR DRAWER */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div onClick={() => setIsMobileSidebarOpen(false)} className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs" />
          
          <aside className="fixed inset-y-0 left-0 w-64 bg-white flex flex-col z-50 shadow-2xl border-r border-gray-100 animate-slide-right">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-gray-900 text-xs">Grafix Business OS</span>
              <button onClick={() => setIsMobileSidebarOpen(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-100">
              <div className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl px-3 py-2 truncate">
                {activeClient.name}
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => { setActiveView(item.name); setIsMobileSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive ? 'text-white' : 'text-gray-500'
                    }`}
                    style={isActive ? { backgroundColor: primaryColor } : {}}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            {/* Mobile User context footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <img 
                  src={activeClient.logo_url} 
                  alt={activeClient.name} 
                  className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                />
                <div className="min-w-0">
                  <span className="font-semibold text-gray-900 text-[11px] block truncate">{sessionUser?.name || db.currentUser.name}</span>
                  <span className="text-[9px] text-gray-400 font-mono capitalize tracking-wide">{sessionUser?.role || db.currentUser.role}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleDarkMode}
                  title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  className="p-1.5 text-gray-400 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => { handleLogout(); setIsMobileSidebarOpen(false); }}
                  title="Sign Out"
                  className="p-1.5 text-gray-400 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* 3. MAIN WORKSPACE CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header navbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 text-gray-500 hover:bg-gray-50 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Interface */}
            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Global instant search (clients, products, invoices, tickets)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-100 rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 transition-all text-gray-800"
              />

              {/* Instant debounced Search Overlay */}
              {isSearchFocused && searchQuery.length >= 2 && (
                <div className="absolute left-0 right-0 top-11 bg-white rounded-xl border border-gray-100 shadow-2xl p-2.5 space-y-1.5 z-50 text-xs animate-fade-in max-h-72 overflow-y-auto">
                  <span className="text-[10px] font-mono font-bold uppercase text-gray-400 tracking-widest px-2.5 block mb-1">Search Results ({searchResults.length})</span>
                  {searchResults.length === 0 ? (
                    <p className="text-center py-4 text-gray-400">No matching records found.</p>
                  ) : (
                    searchResults.map(res => (
                      <div 
                        key={res.id} 
                        onClick={() => {
                          if (res.result_type === 'product') setActiveView('Products');
                          if (res.result_type === 'customer') setActiveView('Customers');
                          if (res.result_type === 'booking') setActiveView('Bookings');
                          if (res.result_type === 'order') setActiveView('Orders');
                          setSearchQuery('');
                        }}
                        className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <span className="font-semibold text-gray-900 block">{res.title}</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5 capitalize">{res.subtitle}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3.5 flex-shrink-0">
            {/* Active Company Quick display badge */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
              <img 
                src={activeClient.logo_url} 
                alt={activeClient.name} 
                className="w-5 h-5 rounded-md object-cover border border-gray-100"
              />
              <span className="text-[11px] font-semibold text-gray-700 hidden md:inline">{activeClient.name}</span>
            </div>

            {/* Notification Alert icon */}
            <button 
              onClick={() => alert(`Operational system notifications all green. No alerts for ${activeClient.name}.`)}
              className="p-2 hover:bg-gray-50 text-gray-500 rounded-xl border border-gray-100 relative transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Scrollable Work canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

    </div>
  );
}
