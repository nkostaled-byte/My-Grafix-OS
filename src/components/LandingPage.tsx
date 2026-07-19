import React, { useState } from 'react';
import { 
  ArrowRight, ShieldCheck, Check, Sparkles, Coffee, 
  Scissors, Heart, ShoppingBag, BarChart3, Users, FileText, 
  MessageSquare, Star, ChevronDown, Monitor, Cpu, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LandingPageProps {
  onGetStarted: () => void;
  onGoogleSignIn: () => void;
  onNavigateToPricing: () => void;
}

export default function LandingPage({ onGetStarted, onGoogleSignIn, onNavigateToPricing }: LandingPageProps) {
  const [activeIndustryTab, setActiveIndustryTab] = useState('cafe');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      title: 'Inventory Management',
      desc: 'Real-time stock catalog tracking, low-inventory triggers, and automated movement auditing.',
      icon: ShoppingBag,
      color: 'from-blue-50 to-indigo-50/50 text-blue-600',
    },
    {
      title: 'Ecommerce Orders',
      desc: 'Seamless walk-in and online cart checkout, instant receipt emails, and custom order tracking.',
      icon: ShoppingBag,
      color: 'from-amber-50 to-orange-50/50 text-amber-600',
    },
    {
      title: 'Booking Management',
      desc: 'Interactive calendars, custom service durations, staff allocations, and client reminders.',
      icon: Check,
      color: 'from-emerald-50 to-teal-50/50 text-emerald-600',
    },
    {
      title: 'Contact Form Leads',
      desc: 'Manage contact forms and quote submissions directly with automated email responses.',
      icon: MessageSquare,
      color: 'from-rose-50 to-pink-50/50 text-rose-600',
    },
    {
      title: 'Customer CRM',
      desc: 'Isolated client files, personalized appointment logs, notes, and loyalty tag management.',
      icon: Users,
      color: 'from-violet-50 to-purple-50/50 text-violet-600',
    },
    {
      title: 'Invoice Generation',
      desc: 'Construct beautifully structured invoice PDFs with taxes, discounts, and dispatch details.',
      icon: FileText,
      color: 'from-cyan-50 to-sky-50/50 text-cyan-600',
    },
    {
      title: 'Analytics & Reports',
      desc: 'Real-time daily sales, monthly revenue margins, and product performance charts.',
      icon: BarChart3,
      color: 'from-yellow-50 to-amber-50/50 text-yellow-600',
    },
    {
      title: 'Team Permissions',
      desc: 'Add unlimited team members, assign custom roles, and restrict billing access.',
      icon: ShieldCheck,
      color: 'from-purple-50 to-indigo-50/50 text-purple-600',
    },
    {
      title: 'AI Business Assistant',
      desc: 'Powered by Gemini, automatically summarize inquiries, analyze sales trends, and write copy.',
      icon: Sparkles,
      color: 'from-emerald-50 to-cyan-50/50 text-emerald-600',
    }
  ];

  const industries = [
    { id: 'cafe', name: 'Coffee Shops', icon: Coffee, title: 'Keep the single-origin flowing', subtitle: 'Manage beans inventory, barista masterclass bookings, and sales metrics in one place.' },
    { id: 'restaurant', name: 'Restaurants', icon: Sparkles, title: 'From kitchen to checkouts', subtitle: 'Audit food supply levels, catering consultations, and process instant card orders.' },
    { id: 'barbershop', name: 'Barbershops', icon: Scissors, title: 'Premium grooming masterclass', subtitle: 'Manage hair stylists calendars, record walk-in product sales, and auto-email receipt copies.' },
    { id: 'salon', name: 'Beauty Salons', icon: Heart, title: 'Elevated client experiences', subtitle: 'Allow online treatment bookings, tracking individual customer styling notes, and invoices.' },
    { id: 'gym', name: 'Fitness Gyms', icon: Star, title: 'Slam personal training targets', subtitle: 'Track whey protein stock, coordinate physical coaching schedules, and monitor monthly revenues.' },
  ];

  const testimonials = [
    {
      quote: "Before Grafix, we were switching between four different apps to handle haircuts booking, shampoo inventory, and invoices. Now everything happens under one clean dashboard, saving us hours of manual data entry every single week.",
      author: "Julian Carter",
      role: "Owner, Blade & Barrel Barbershop",
      stat: "+34% Sales Growth",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
    },
    {
      quote: "The multi-tenant isolation is a game changer. We manage three separate Shoreditch cafe outlets from a single login, tracking isolated cash registers, staff rosters, and single-origin coffee shipments flawlessly.",
      author: "Sophia Chen",
      role: "Co-Founder, The Daily Grind Coffee",
      stat: "4.9/5 Star Bookings",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
    }
  ];

  const faqs = [
    {
      q: "What makes Grafix different from other management tools?",
      a: "Unlike generic SaaS which forces you to use third-party connectors, Grafix integrates inventory, checkouts, calendars, invoices, CRM, and reports in a single cohesive workspace. It is fully multi-tenant, meaning you can manage multiple businesses separately."
    },
    {
      q: "Does it support real-world payment processing?",
      a: "Yes. Our Express and Cloudflare Workers architecture handles standard webhooks, checkout tokens, and secure transaction receipts out-of-the-box. We can also integrate Stripe and custom banking APIs on Enterprise accounts."
    },
    {
      q: "Can I manage permissions for different employees?",
      a: "Absolutely. You can designate staff as 'owner' or 'staff', custom-restrict access to sensitive billing analytics, assign staff to specific service bookings, and track individual order checkouts."
    },
    {
      q: "How secure is my business client data?",
      a: "Extremely secure. All business records are rigidly isolated using row-level security (RLS) policies based on your unique business_id. Your customer lists, financials, and logs are inaccessible to other tenants on the platform."
    }
  ];

  return (
    <div className="bg-white" id="marketing-landing-container">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-24 overflow-hidden bg-radial from-gray-50/50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Announcement Pill */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-gray-800 text-[11px] font-semibold mb-6 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-gray-900" />
              <span>Introducing Grafix Business OS v2.1</span>
            </motion.div>

            {/* Display Typography Header */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-sans font-medium tracking-tight text-gray-950 leading-[1.1] mb-6"
            >
              The unified operating system for <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-950 via-gray-700 to-gray-900">scaling modern business</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto mb-10"
            >
              Say goodbye to fragmented SaaS apps. Manage bookings, realtime inventory, customer files, invoices, and automated checkout reports in one premium multi-tenant environment.
            </motion.p>

            {/* Call To Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
            >
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-3.5 bg-gray-950 hover:bg-gray-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              
              <button
                onClick={onGoogleSignIn}
                className="w-full sm:w-auto px-8 py-3.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M21.35,11.1H12v2.7h5.38C16.88,15.75,14.77,17.1,12,17.1c-3.15,0-5.63-2.55-5.63-5.1S8.85,6.9,12,6.9c1.58,0,2.85,0.6,3.75,1.5l2.1-2.1C16.2,4.8,14.25,3.9,12,3.9c-4.95,0-9,4.05-9,9s4.05,9,12,9c6.3,0,9-4.95,9-9A7.26,7.26,0,0,0,21.35,11.1Z" fill="#EA4335" />
                  <path d="M12,21.9c3.15,0,5.63-1.05,7.35-2.85l-2.1-2.1c-1.35,0.9-3.15,1.35-5.25,1.35c-3.6,0-6.6-2.4-7.65-5.55l-2.25,1.8C4.5,18.45,7.95,21.9,12,21.9Z" fill="#34A853" />
                  <path d="M4.35,14.55C4.05,13.65,3.9,12.75,3.9,11.85s0.15-1.8,0.45-2.7l-2.25-1.8C1.5,8.85,1.2,10.2,1.2,11.85s0.3,3,0.9,4.5Z" fill="#FBBC05" />
                  <path d="M12,6.9c1.8,0,3.3,0.6,4.5,1.8l2.1-2.1C16.5,4.65,14.4,3.9,12,3.9,7.95,3.9,4.5,7.35,2.1,9.15l2.25,1.8C5.4,7.8,8.4,6.9,12,6.9Z" fill="#4285F4" />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </motion.div>
          </div>

          {/* Premium Live Mockup Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-5xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-3xl overflow-hidden relative"
          >
            {/* Top window ribbon */}
            <div className="h-11 bg-gray-50 border-b border-gray-100 flex items-center justify-between px-5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gray-200" />
                <div className="w-3 h-3 rounded-full bg-gray-200" />
                <div className="w-3 h-3 rounded-full bg-gray-200" />
              </div>
              <div className="px-6 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-mono text-gray-400 w-64 text-center select-none">
                https://app.grafix.io/dashboard
              </div>
              <div className="w-4 h-4" />
            </div>

            {/* Dashboard Screenshot Graphic */}
            <div className="bg-gray-50/50 p-6 sm:p-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Left Mini Sidebar Mock */}
                <div className="hidden md:block col-span-1 bg-white rounded-xl border border-gray-100 p-4 space-y-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold text-xs">G</div>
                    <span className="font-bold text-xs text-gray-900">Grafix OS</span>
                  </div>
                  <div className="space-y-1">
                    {['Dashboard', 'Orders', 'Bookings', 'Inventory', 'Customers', 'Invoices'].map((v, i) => (
                      <div key={i} className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold ${i === 0 ? 'bg-gray-100 text-gray-950' : 'text-gray-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-gray-950' : 'bg-transparent'}`} />
                        <span>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Content Mock */}
                <div className="col-span-1 md:col-span-3 space-y-6">
                  {/* Cards rows */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { l: 'Revenue today', v: 'R950.00', g: '+18.4%' },
                      { l: 'New Leads', v: '14 inquiries', g: '+8.2%' },
                      { l: 'Active Bookings', v: '12 active', g: 'Normal' }
                    ].map((stat, i) => (
                      <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-3xs">
                        <span className="text-[9px] font-mono font-semibold uppercase text-gray-400 block">{stat.l}</span>
                        <span className="text-sm sm:text-base font-semibold text-gray-900 block mt-1">{stat.v}</span>
                        <span className="text-[9px] font-semibold text-emerald-600 block mt-1.5">{stat.g}</span>
                      </div>
                    ))}
                  </div>

                  {/* Chart and Activity rows split */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="sm:col-span-2 bg-white rounded-xl border border-gray-100 p-4 shadow-3xs">
                      <span className="text-[10px] font-mono font-bold uppercase text-gray-400 block mb-4">Sales Analytics</span>
                      <div className="h-32 flex items-end gap-2.5 pt-4">
                        {[40, 55, 30, 85, 60, 95, 70, 100].map((h, i) => (
                          <div key={i} className="flex-1 bg-gray-950 rounded-t-sm" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-3xs space-y-3">
                      <span className="text-[10px] font-mono font-bold uppercase text-gray-400 block mb-2">Live Logs</span>
                      {[
                        { text: 'Order #729401 paid', time: '2m ago' },
                        { text: 'Booking BKG-19032 added', time: '12m ago' },
                        { text: 'Invoice INV-0048 sent', time: '1h ago' }
                      ].map((log, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px]">
                          <span className="text-gray-800 font-medium truncate">{log.text}</span>
                          <span className="text-gray-400 text-[8px] font-mono ml-2">{log.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. FEATURES GRID */}
      <section id="features-section" className="py-24 border-t border-gray-100/70 bg-gray-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl font-sans font-medium tracking-tight text-gray-950">
              The Complete All-In-One Toolkit
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-3 leading-relaxed">
              Every operation you need to launch, manage, and scale your local services and catalog sales packed into a single modular portal.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="bg-white p-6.5 rounded-2xl border border-gray-100 shadow-2xs hover:shadow-lg hover:border-gray-200 transition-all"
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-5 border border-gray-100`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-950 mb-2">{feat.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works-section" className="py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 block mb-2">Simplicity First</span>
            <h2 className="text-2xl sm:text-3xl font-sans font-medium tracking-tight text-gray-950">
              Three Steps to Operating System Harmony
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {[
              {
                step: '01',
                title: 'Initiate Google Handshake',
                desc: 'Click continue with Google to authenticate in seconds. Safe, standard, and keyless setup.'
              },
              {
                step: '02',
                title: 'Onboard Workspace Profile',
                desc: 'Provide your business name, select your exact industry segment, and let us dynamically seed default inventories.'
              },
              {
                step: '03',
                title: 'Manage Your Enterprise',
                desc: 'Launch directly into your fully hydrated dashboard. Create bookings, checkout orders, and monitor operations instantly.'
              }
            ].map((step, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100/60 shadow-2xs relative">
                <span className="absolute -top-6 left-6 text-4xl font-sans font-black tracking-tight text-gray-950/5 leading-none select-none">
                  {step.step}
                </span>
                <h3 className="text-xs font-semibold text-gray-950 mb-2.5">{step.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. INDUSTRIES SECTION */}
      <section id="industries-section" className="py-24 bg-gray-50/50 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-sans font-medium tracking-tight text-gray-950">
              Custom Tailored to Your Specific Vertical
            </h2>
            <p className="text-gray-500 text-xs mt-3">
              Grafix auto-configures its layout, primary branding accents, and seeding metrics depending on your industry.
            </p>
          </div>

          {/* Interactive tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {industries.map((ind) => {
              const Icon = ind.icon;
              const isSelected = activeIndustryTab === ind.id;
              return (
                <button
                  key={ind.id}
                  onClick={() => setActiveIndustryTab(ind.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gray-950 text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-950 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{ind.name}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Showcase Pane */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-xs max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {industries.map((ind) => {
                if (ind.id !== activeIndustryTab) return null;
                return (
                  <motion.div
                    key={ind.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid md:grid-cols-2 gap-8 items-center"
                  >
                    <div className="space-y-4">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400">Industry Showcase</span>
                      <h3 className="text-lg font-sans font-semibold text-gray-950 leading-tight">{ind.title}</h3>
                      <p className="text-gray-400 text-xs leading-relaxed">{ind.subtitle}</p>
                      <button 
                        onClick={onGetStarted}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-900 hover:text-gray-600 transition-colors"
                      >
                        <span>Build this workspace now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-3">
                      <span className="text-[8px] font-mono uppercase font-bold text-gray-400">Hydrated Catalog Assets</span>
                      {[1, 2, 3].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                          <span className="text-[10px] font-medium text-gray-950">Seeded item #{i + 1}</span>
                          <span className="px-2 py-0.5 bg-gray-100 text-[8px] font-mono font-bold uppercase tracking-wider rounded-md">Status: Live</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-sans font-medium tracking-tight text-gray-950">
              Trusted by Local Store Owners Worldwide
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((test, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-3xs flex flex-col justify-between">
                <div>
                  <div className="flex gap-0.5 mb-5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-6">
                    "{test.quote}"
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-gray-50 pt-5 mt-4">
                  <div className="flex items-center gap-3">
                    <img src={test.image} alt={test.author} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                    <div>
                      <span className="font-semibold text-gray-900 text-xs block">{test.author}</span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">{test.role}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                    {test.stat}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDIONS */}
      <section className="py-24 border-t border-gray-100 bg-gray-50/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-sans font-medium text-gray-950 mb-2">Got Questions?</h2>
            <p className="text-gray-500 text-xs">Everything you need to know about the platform operations.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-white border border-gray-100 rounded-xl overflow-hidden transition-all shadow-3xs">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4.5 text-left flex justify-between items-center hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-gray-950">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-gray-50 bg-gray-50/20"
                      >
                        <p className="px-6 py-4 text-xs text-gray-500 leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="py-24 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-radial from-gray-900 to-transparent -mr-32 -mt-32 rounded-full pointer-events-none opacity-50" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-sans font-medium tracking-tight mb-4">
            Initialize your Business Operating System
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto mb-10 leading-relaxed">
            Consolidate your orders, appointments, inventories, and client communication logs into a singular, beautiful multi-tenant workspace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-gray-950 hover:bg-gray-100 font-semibold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Create Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onNavigateToPricing}
              className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center cursor-pointer"
            >
              View Pricing Tiers
            </button>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer id="footer-section" className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gray-950 flex items-center justify-center text-white font-bold text-[11px] tracking-tighter">G</div>
            <span>Grafix Business OS</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#features-section" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#industries-section" className="hover:text-gray-900 transition-colors">Industries</a>
            <button onClick={onNavigateToPricing} className="hover:text-gray-900 transition-colors uppercase font-mono">Pricing</button>
            <span>Privacy Policy</span>
            <span>Terms of Use</span>
          </div>
          <span>© 2026 Grafix Inc. All rights reserved.</span>
        </div>
      </footer>

    </div>
  );
}
