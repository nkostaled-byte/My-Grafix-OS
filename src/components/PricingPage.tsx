import React, { useState } from 'react';
import { Check, HelpCircle, ArrowRight, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface PricingPageProps {
  onSelectTier: (tier: string) => void;
}

export default function PricingPage({ onSelectTier }: PricingPageProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const tiers = [
    {
      name: 'Starter',
      description: 'Essential customer tracking and inquiry tools for modern freelancers and early merchants.',
      priceMonthly: 19,
      priceYearly: 15,
      features: [
        'Contact Forms Management',
        'Interactive Client Dashboard',
        'Customer Relationship CRM',
        'Basic Financial Reports',
        'Up to 100 Customers',
        '1 Active Business Tenant',
        'Email Notification Logs',
      ],
      cta: 'Start with Starter',
      popular: false,
      color: 'gray',
    },
    {
      name: 'Business',
      description: 'The all-in-one Business Operating System containing orders, bookings, and complete catalogs.',
      priceMonthly: 49,
      priceYearly: 39,
      features: [
        'Everything in Starter',
        'Real-time Products & Inventory',
        'Instant Checkout & Orders',
        'Unified Booking Calendar & Staff',
        'Automatic Invoice PDF Generation',
        'AI-Powered Business Assistant',
        'Deep Historical Multi-Tenant Analytics',
        'Up to 1,000 Customers & 5 Team Members',
      ],
      cta: 'Upgrade to Business',
      popular: true,
      color: 'slate',
    },
    {
      name: 'Enterprise',
      description: 'Bespoke high-performance workspace configuration for multi-location companies and franchises.',
      priceMonthly: 199,
      priceYearly: 159,
      features: [
        'Everything in Business',
        'Unlimited Customers & Multi-Tenants',
        'Advanced Shared Team Permissions',
        'Export CSV Data Hubs',
        'Dedicated Priority SLA Support',
        'Custom Domain API Integration',
        '24/7 Technical Support Manager',
      ],
      cta: 'Inquire for Enterprise',
      popular: false,
      color: 'black',
    },
  ];

  const faqs = [
    {
      q: 'How does multi-tenant business isolation work?',
      a: 'Every business you register receives a completely isolated data layer inside the system (tied to its unique client_id). Team members, customers, invoices, and inventories do not mix. You can switch between active businesses instantly from your dropdown menu.',
    },
    {
      q: 'Can I migrate my existing store data easily?',
      a: 'Yes, our Business and Enterprise plans support direct bulk CSV importing for customers and product catalogs. Contact our support team if you need assistance during onboarding.',
    },
    {
      q: 'Are there any hidden transaction fees on orders?',
      a: 'None at all. We do not charge transaction commissions or cuts on orders or invoices processed through Grafix. You only pay the flat subscription rate.',
    },
    {
      q: 'Can I cancel or change plans at any time?',
      a: 'Absolutely. You can upgrade, downgrade, or cancel your subscription at any time directly through your billing portal. If you cancel, your access will remain active until the end of your billing cycle.',
    },
  ];

  return (
    <div className="py-20 bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Text */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-gray-800 text-xs font-semibold mb-4"
          >
            <Star className="w-3.5 h-3.5 text-gray-900 fill-gray-900" />
            <span>Transparent, Honest Pricing</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-sans font-medium tracking-tight text-gray-900 mb-4"
          >
            One platform, unlimited potential
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg leading-relaxed"
          >
            Choose a plan designed to streamline your business operations, eliminate redundant tools, and elevate your customer experience.
          </motion.p>

          {/* Pricing Period Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4 mt-10"
          >
            <span className={`text-sm font-semibold transition-colors ${billingPeriod === 'monthly' ? 'text-gray-950' : 'text-gray-400'}`}>Monthly</span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className="w-12 h-6.5 rounded-full bg-gray-200 p-0.5 transition-colors focus:outline-none relative"
            >
              <div
                className={`w-5.5 h-5.5 rounded-full bg-white shadow-sm transition-transform ${billingPeriod === 'yearly' ? 'translate-x-5.5' : 'translate-x-0'}`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold transition-colors ${billingPeriod === 'yearly' ? 'text-gray-950' : 'text-gray-400'}`}>Yearly</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full uppercase tracking-wider">Save 20%</span>
            </div>
          </motion.div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 items-start mb-24">
          {tiers.map((tier, idx) => {
            const price = billingPeriod === 'monthly' ? tier.priceMonthly : tier.priceYearly;
            
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                id={`pricing-card-${tier.name.toLowerCase()}`}
                className={`bg-white rounded-2xl border p-8 shadow-xs flex flex-col relative transition-all ${
                  tier.popular 
                    ? 'border-gray-950 ring-1 ring-gray-950' 
                    : 'border-gray-100 hover:border-gray-200 hover:shadow-lg'
                }`}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-950 text-white text-[10px] font-bold rounded-full uppercase tracking-widest flex items-center gap-1">
                    <Star className="w-3 h-3 text-white fill-white" />
                    <span>Most Popular</span>
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-sans font-semibold text-gray-900 mb-2">{tier.name}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed min-h-[40px]">{tier.description}</p>
                </div>

                <div className="flex items-baseline gap-1 mb-8 border-b border-gray-100 pb-6">
                  <span className="text-4xl font-sans font-medium text-gray-950">R{price}</span>
                  <span className="text-gray-400 text-sm">/ month</span>
                  {billingPeriod === 'yearly' && (
                    <span className="text-[10px] font-mono font-bold text-emerald-600 block ml-2">billed annually</span>
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-8 flex-1">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-xs text-gray-600 leading-tight">
                      <div className="p-0.5 bg-gray-50 border border-gray-100 rounded-md flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-gray-800" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => onSelectTier(tier.name)}
                  className={`w-full py-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    tier.popular
                      ? 'bg-gray-950 hover:bg-gray-800 text-white shadow-md'
                      : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* FAQs */}
        <div className="border-t border-gray-100 pt-20 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-sans font-medium tracking-tight text-gray-900 mb-2">Pricing & License FAQs</h2>
            <p className="text-gray-500 text-xs">Everything you need to know about Grafix subscription licensing.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100/70 shadow-2xs">
                <h4 className="text-sm font-semibold text-gray-950 mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-gray-500 text-xs leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
