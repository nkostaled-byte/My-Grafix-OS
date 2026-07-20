import React, { useState } from 'react';
import { Sparkles, Building, ArrowRight, Shield, Coffee, Hammer, BarChart, User } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase, isSupabaseConfigured, workerBaseUrl } from '../lib/supabase';
import { Client } from '../types';

interface OnboardingPageProps {
  user: { email: string; name: string; avatar?: string };
  onOnboardingComplete: (client: Client) => void;
  onCancel: () => void;
}

export default function OnboardingPage({ user, onOnboardingComplete, onCancel }: OnboardingPageProps) {
  const [businessName, setBusinessName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const industries = [
    { id: 'agency', label: 'Digital Agency', icon: BarChart, desc: 'Design studios, marketing firms & web agencies' },
    { id: 'barbershop', label: 'Barbershop', icon: ScissorsIcon, desc: 'Men\'s grooming, beard trims & hot towel shaves' },
    { id: 'cafe', label: 'Coffee Shop', icon: Coffee, desc: 'Roasteries, espresso bars & organic bakeries' },
    { id: 'construction', label: 'Construction', icon: Hammer, desc: 'Renovators, timber builders & civil engineers' },
    { id: 'consultant', label: 'Consultant', icon: User, desc: 'Financial planners, business advisors & tax coaches' },
    { id: 'clinic', label: 'Medical Clinic', icon: Shield, desc: 'Physiotherapists, dental experts & wellness docs' },
  ];

  const handleCreateWorkspace = async () => {
    if (!businessName.trim()) {
      alert('Please enter a business name.');
      return;
    }

    setIsCreating(true);
    setErrorMessage('');

    try {
      // Get auth token
      let token = '';
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token || '';
      } else {
        // Demo mode: create a mock token
        const payload = { sub: 'user-onboarding-' + Date.now(), email: user.email };
        const base64Payload = btoa(JSON.stringify(payload));
        token = `mockHeader.${base64Payload}.mockSignature`;
      }

      // Call Worker to claim/create account
      const baseUrl = (workerBaseUrl || '').replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/api/claim-account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessName: businessName.trim() }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create workspace');
      }

      const data = await response.json();
      if (data.success && data.client) {
        const clientFromWorker: Client = {
          id: data.client.client_id,
          name: data.client.business_name || businessName.trim(),
          logo_url: data.client.logo_url || '',
          business_type: (selectedIndustry || 'agency') as any,
          primary_color: data.client.primary_color || '#1e293b',
          secondary_color: data.client.secondary_color || '#3b82f6',
          banking_details: '',
          address: '',
          phone: '',
          email: data.client.owner_email || user.email,
        };
        
        // Also update localStorage user with client_id
        try {
          const savedUser = JSON.parse(localStorage.getItem('grafix_current_user') || '{}');
          savedUser.client_id = data.client.client_id;
          localStorage.setItem('grafix_current_user', JSON.stringify(savedUser));
        } catch (e) {}

        setIsCreating(false);
        onOnboardingComplete(clientFromWorker);
      } else {
        throw new Error(data.error || 'Failed to create workspace');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create workspace');
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full">
        
        {/* Progress Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 shadow-sm">
            <Sparkles className="w-3 h-3 text-emerald-400 fill-emerald-400" />
            <span>Setup Workspace</span>
          </div>
          <h1 className="text-3xl font-sans font-medium tracking-tight text-gray-900">
            Configure your enterprise
          </h1>
          <p className="text-gray-500 text-xs mt-2">
            Let's customize your Business Operating System layout and pre-seed professional assets.
          </p>
        </div>

        {/* Setup Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-8">
          
          {/* User profile confirmation info */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-200" />
              )}
              <div>
                <span className="font-semibold text-gray-900 text-xs block">Connected as {user.name}</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">{user.email}</span>
              </div>
            </div>
            <button 
              onClick={onCancel}
              className="text-[10px] font-semibold text-gray-400 hover:text-gray-900 uppercase tracking-widest transition-colors"
            >
              Sign out
            </button>
          </div>

          {/* Form input 1: Business name */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 block">1. Business Name</label>
            <input
              type="text"
              placeholder="e.g. Blue Mountain Cafe, Savile Row Barbers"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 transition-all text-gray-800 font-medium"
            />
          </div>

          {/* Form input 2: Logo (Optional) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 block">2. Custom Logo URL (Optional)</label>
              <span className="text-[9px] text-gray-400 font-mono">Leave blank for default asset</span>
            </div>
            <input
              type="url"
              placeholder="e.g. https://domain.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 transition-all text-gray-800 font-medium"
            />
          </div>

          {/* Form input 3: Industry choices */}
          <div className="space-y-3">
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 block">3. Select Industry Segment</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {industries.map((ind) => {
                const Icon = ind.icon;
                const isSelected = selectedIndustry === ind.id;
                return (
                  <button
                    key={ind.id}
                    onClick={() => setSelectedIndustry(ind.id)}
                    className={`p-4 border text-left rounded-xl transition-all cursor-pointer flex gap-3 ${
                      isSelected
                        ? 'border-gray-950 bg-gray-50/70 ring-1 ring-gray-950 shadow-sm'
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg flex-shrink-0 flex items-center justify-center ${
                      isSelected ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-400'
                    }`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 text-xs block leading-tight">{ind.label}</span>
                      <span className="text-[10px] text-gray-400 block mt-1 leading-normal">{ind.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Create CTA Button */}
          <div className="border-t border-gray-100 pt-6">
            <button
              onClick={handleCreateWorkspace}
              disabled={isCreating}
              className="w-full py-3.5 bg-gray-950 hover:bg-gray-800 disabled:bg-gray-400 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Seeding professional products & calendars...</span>
                </>
              ) : (
                <>
                  <span>Initialize Business Workspace</span>
                  <ArrowRight className="w-4 h-4 animate-pulse" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// Inline fallback ScissorsIcon to make sure everything builds without external dependencies
function ScissorsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="6" cy="6" r="3" />
      <path d="M8.12 8.12 12 12" />
      <circle cx="6" cy="18" r="3" />
      <path d="M14.8 14.8 20 20" />
      <path d="M14.8 9.2 20 4" />
      <path d="m8.12 15.88 3.81-3.81" />
    </svg>
  );
}
