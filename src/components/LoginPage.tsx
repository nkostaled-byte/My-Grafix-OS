import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Sparkles, Building, Briefcase, Play, Mail, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { db, supabase, isSupabaseConfigured, workerBaseUrl } from '../lib/supabase';

interface LoginPageProps {
  onLoginSuccess: (user: { email: string; name: string; avatar?: string; client_id?: string }) => void;
  onNavigateHome: () => void;
}

export default function LoginPage({ onLoginSuccess, onNavigateHome }: LoginPageProps) {
  const [loading, setLoading] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [claimStatus, setClaimStatus] = useState<{ status: 'linked' | 'created' | 'already_linked'; businessName: string; clientId: string } | null>(null);

  const [claimCode, setClaimCode] = useState('');
  const [relinkLoading, setRelinkLoading] = useState(false);
  const [relinkError, setRelinkError] = useState('');
  const [showClaimCodeForm, setShowClaimCodeForm] = useState(false);

  const handleRelink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimCode.trim()) return;
    setRelinkLoading(true);
    setRelinkError('');

    try {
      let token = '';
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token || '';
      } else {
        const payload = { sub: 'user-mock-relink', email: email.trim() || 'guest@example.com' };
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
        setClaimStatus({
          status: 'linked',
          businessName: data.client?.business_name || 'Your Business',
          clientId: data.client?.client_id,
        });
      } else {
        throw new Error(data.error || 'Failed to relink account');
      }
    } catch (err: any) {
      setRelinkError(err.message || 'Failed to relink business profile.');
    } finally {
      setRelinkLoading(false);
    }
  };

  // Demo enterprise workspaces
  const demoAccounts = [
    {
      name: 'Julian Carter',
      business: 'Blade & Barrel Barbershop',
      email: 'julian@bladeandbarrel.co',
      clientId: 'client-barbershop-1',
      industry: 'barbershop',
      color: 'bg-slate-900 border-slate-900',
    },
    {
      name: 'Sophia Chen',
      business: 'The Daily Grind Coffee',
      email: 'sophia@dailygrind.coffee',
      clientId: 'client-cafe-2',
      industry: 'cafe',
      color: 'bg-amber-900 border-amber-950',
    },
    {
      name: 'Robert Vance',
      business: 'Apex Construction',
      email: 'vance@apexconstruction.build',
      clientId: 'client-construction-3',
      industry: 'construction',
      color: 'bg-blue-900 border-blue-950',
    },
  ];

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage('');
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) throw error;
      } catch (err: any) {
        setErrorMessage(err.message || 'Google Auth failed');
        setLoading(false);
      }
    } else {
      // Standard delay to look like an authentic OAuth handshake
      setTimeout(() => {
        setLoading(false);
        onLoginSuccess({
          email: customEmail.trim() || 'business.founder@google.com',
          name: customEmail.trim() ? customEmail.split('@')[0] : 'Winston Churchill',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          client_id: undefined // Signals that onboarding is required
        });
      }, 1200);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setErrorMessage('');

    if (isSupabaseConfigured && supabase) {
      try {
        if (isSignUp) {
          // 1. SignUp through Supabase auth
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });
          if (error) throw error;

          const session = data.session;
          const token = session?.access_token;

          if (token) {
            // 2. Call /api/claim-account
            const claimResponse = await fetch(`${workerBaseUrl}/api/claim-account`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ businessName: businessName.trim() || undefined }),
            });

            if (!claimResponse.ok) {
              const errText = await claimResponse.text();
              throw new Error(`Workspace claim failed: ${errText}`);
            }

            const claimData = await claimResponse.json();
            if (claimData.success) {
              setClaimStatus({
                status: claimData.status,
                businessName: claimData.client?.business_name || businessName || 'My Business',
                clientId: claimData.client?.client_id,
              });
            } else {
              throw new Error(claimData.error || 'Failed to claim business account');
            }
          } else {
            // standard signup fallback if email confirmation required
            alert('Registration successful! Please check your email inbox to confirm your account, then sign in.');
            setIsSignUp(false);
          }
        } else {
          // Normal Login
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          
          if (data.user) {
            const clientId = await db.getClientIdForUser(data.user.id);
            onLoginSuccess({
              email: data.user.email || email,
              name: data.user.user_metadata?.full_name || email.split('@')[0],
              client_id: clientId || undefined
            });
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
      } finally {
        setLoading(false);
      }
    } else {
      // Simulation login fallback / simulation claim account
      setTimeout(async () => {
        try {
          if (isSignUp) {
            // Generate mock JWT token so server verifySupabaseJwt can parse it
            const payload = { sub: 'user-mock-' + Math.random().toString(36).substr(2, 5), email: email.trim() };
            const base64Payload = btoa(JSON.stringify(payload));
            const mockToken = `mockHeader.${base64Payload}.mockSignature`;

            const claimResponse = await fetch(`${window.location.origin}/api/claim-account`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${mockToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ businessName: businessName.trim() || undefined }),
            });

            if (!claimResponse.ok) {
              const errText = await claimResponse.text();
              throw new Error(`Simulation claim failed: ${errText}`);
            }

            const claimData = await claimResponse.json();
            if (claimData.success) {
              setClaimStatus({
                status: claimData.status,
                businessName: claimData.client?.business_name || businessName || 'My Business',
                clientId: claimData.client?.client_id,
              });
            } else {
              throw new Error(claimData.error || 'Failed to claim simulated workspace');
            }
          } else {
            onLoginSuccess({
              email: email.trim(),
              name: email.split('@')[0],
              client_id: undefined // prompt onboarding
            });
          }
        } catch (err: any) {
          setErrorMessage(err.message || 'Simulation Auth failed.');
        } finally {
          setLoading(false);
        }
      }, 1000);
    }
  };

  const handleDemoSignIn = (account: typeof demoAccounts[0]) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        email: account.email,
        name: account.name,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        client_id: account.clientId // Pre-bind to existing tenant, skipping onboarding!
      });
    }, 600);
  };

  const handleProceedAfterClaim = () => {
    if (!claimStatus) return;
    onLoginSuccess({
      email: email.trim() || 'business.founder@google.com',
      name: email.trim() ? email.split('@')[0] : 'Owner',
      client_id: claimStatus.clientId
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row" id="login-page-container">
      
      {/* LEFT COLUMN: Auth Interface */}
      <div className="flex-1 flex flex-col justify-between p-8 sm:p-12 lg:p-16 max-w-xl mx-auto w-full">
        {/* Header Back */}
        <div className="flex items-center justify-between">
          <button 
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-900 transition-colors text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to website</span>
          </button>
          <div className="w-8 h-8 rounded-lg bg-gray-950 flex items-center justify-center text-white font-black tracking-tighter text-sm">
            G
          </div>
        </div>

        {/* Center Card */}
        <div className="my-12">
          {claimStatus ? (
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-950 shadow-xs">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              
              <div>
                <h1 className="text-2xl font-sans font-medium tracking-tight text-gray-950">
                  {claimStatus.status === 'linked' ? 'Workspace Connected!' : 'Workspace Created!'}
                </h1>
                
                <p className="text-gray-500 text-xs mt-2.5 leading-relaxed font-sans">
                  {claimStatus.status === 'linked' ? (
                    <span>
                      Welcome back — we've connected your existing account for <strong className="text-gray-950 font-semibold">{claimStatus.businessName}</strong>. Your dashboard will already be populated with your products, bookings, past orders, and invoices.
                    </span>
                  ) : (
                    <span>
                      Welcome! Let's get your business <strong className="text-gray-950 font-semibold">{claimStatus.businessName}</strong> set up. Feel free to explore your brand new workspace and add your first product!
                    </span>
                  )}
                </p>
              </div>

              <button
                onClick={handleProceedAfterClaim}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-3 bg-gray-950 hover:bg-gray-900 active:bg-black text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <span>{claimStatus.status === 'linked' ? 'Enter Workspace' : 'Get Started'}</span>
              </button>

              {claimStatus.status === 'created' && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  {!showClaimCodeForm ? (
                    <button
                      type="button"
                      onClick={() => setShowClaimCodeForm(true)}
                      className="text-[11px] text-gray-500 hover:text-gray-900 transition-colors font-semibold underline underline-offset-4"
                    >
                      Already have a website built with us? Enter a claim code
                    </button>
                  ) : (
                    <form onSubmit={handleRelink} className="space-y-3">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 block">
                        Enterprise Claim Code
                      </span>
                      <p className="text-[11px] text-gray-400 leading-relaxed font-sans mb-1">
                        Enter the manual authorization code received from your project manager to pull existing inventory, customer database, and bookings.
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="e.g. XQBZ4821"
                          value={claimCode}
                          onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 transition-all text-gray-800 font-mono uppercase"
                        />
                        <button
                          type="submit"
                          disabled={relinkLoading}
                          className="px-4 py-2 bg-gray-950 hover:bg-gray-900 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          {relinkLoading ? 'Linking...' : 'Submit'}
                        </button>
                      </div>
                      {relinkError && (
                        <p className="text-rose-600 text-[10px] font-semibold mt-1 bg-rose-50/50 p-2 rounded-lg border border-rose-100/30">
                          {relinkError}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowClaimCodeForm(false)}
                        className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors block mt-1"
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-sans font-medium tracking-tight text-gray-950">
                  Welcome to Grafix
                </h1>
                <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                  Sign in to manage your bookings, inventory, customers, and invoices from one unified business workspace.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-100">
                  {errorMessage}
                </div>
              )}

              {/* Email / Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 block">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="name@business.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 transition-all text-gray-800 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 block">Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 transition-all text-gray-800 font-medium"
                    />
                  </div>
                </div>

                {isSignUp && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 block">Business Name (Optional)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <Building className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. Blade & Barrel Co"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 transition-all text-gray-800 font-medium"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-3 bg-gray-950 hover:bg-gray-900 active:bg-black text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  {loading ? (
                    <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>{isSignUp ? 'Create Workspace Account' : 'Sign In with Email'}</span>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-[11px] text-gray-400 hover:text-gray-950 transition-colors font-semibold"
                  >
                    {isSignUp ? 'Already have an account? Sign In' : 'Need a new business profile? Sign Up'}
                  </button>
                </div>
              </form>

              {/* Social Sign-In */}
              <div className="space-y-4">
                {!email && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 block">Test Account Email Fallback (Optional)</label>
                    <input
                      type="email"
                      placeholder="defaults to business.founder@google.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 transition-all text-gray-800 font-medium"
                    />
                  </div>
                )}

                {/* Google Authentication Trigger */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer relative"
                >
                  {loading ? (
                    <div className="w-4.5 h-4.5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4.5 h-4.5 flex-shrink-0" viewBox="0 0 48 48" width="100%" height="100%">
                      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                    </svg>
                  )}
                  <span>{loading ? 'Authenticating...' : 'Continue with Google'}</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-widest">
                  <span className="bg-white px-3 text-gray-400">Or Demo Workspaces</span>
                </div>
              </div>
            </>
          )}

          {/* Quick Demo Access */}
          <div className="space-y-2.5">
            {demoAccounts.map((account) => (
              <button
                key={account.clientId}
                onClick={() => handleDemoSignIn(account)}
                disabled={loading}
                className="w-full flex items-center justify-between p-3.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl transition-all cursor-pointer group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${account.color} text-xs font-bold font-mono shadow-xs uppercase`}>
                    {account.industry[0]}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 text-xs block leading-snug group-hover:text-gray-950">{account.business}</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Role: Owner • {account.name}</span>
                  </div>
                </div>
                <div className="p-1.5 bg-white border border-gray-100 rounded-lg group-hover:border-gray-200 transition-colors flex items-center justify-center">
                  <Play className="w-3 h-3 text-gray-400 fill-gray-400 group-hover:text-gray-800 group-hover:fill-gray-800 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="border-t border-gray-100 pt-6 flex items-center justify-between text-[10px] font-mono text-gray-400 uppercase tracking-widest">
          <span>Secure OAuth 2.0</span>
          <span>© 2026 Grafix Inc</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Mockup Visual */}
      <div className="hidden md:flex flex-1 bg-gray-50 border-l border-gray-100 flex-col justify-center items-center p-12 overflow-hidden relative">
        <div className="absolute inset-0 bg-radial-gradient from-white/50 to-transparent pointer-events-none" />
        
        {/* Floating Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-200/20 blur-[80px] rounded-full pointer-events-none" />

        {/* Browser Frame */}
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden relative z-10"
        >
          {/* Top Bar */}
          <div className="h-10 bg-gray-50 border-b border-gray-100 flex items-center justify-between px-4">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
            </div>
            <div className="px-5 py-1 bg-white border border-gray-100 rounded-lg text-[9px] font-mono text-gray-400 tracking-tight w-48 text-center truncate">
              dashboard.grafix.io/blade-barrel
            </div>
            <div className="w-4 h-4" />
          </div>

          {/* Canvas Preview */}
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400">July Revenue Analysis</span>
                <span className="text-lg font-sans font-medium text-gray-950 block mt-0.5">R14,892.40</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg">
                <span>+24.8%</span>
              </div>
            </div>

            {/* Simple Graphic Bar Representing Sales */}
            <div className="h-28 flex items-end gap-3.5 pt-4 border-b border-gray-100">
              {[35, 45, 30, 60, 75, 55, 90].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.6 }}
                    className="w-full bg-gray-900 rounded-t-md" 
                  />
                  <span className="text-[9px] font-mono text-gray-400">M{i+1}</span>
                </div>
              ))}
            </div>

            {/* Quick Stats list */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 border border-gray-100/50 rounded-xl">
                <span className="text-[9px] font-mono text-gray-400 block uppercase">Bookings</span>
                <span className="text-xs font-semibold text-gray-900 block mt-1">48 Appointments</span>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-100/50 rounded-xl">
                <span className="text-[9px] font-mono text-gray-400 block uppercase">Invoices</span>
                <span className="text-xs font-semibold text-gray-900 block mt-1">94% Paid Rate</span>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-100/50 rounded-xl">
                <span className="text-[9px] font-mono text-gray-400 block uppercase">Outlets</span>
                <span className="text-xs font-semibold text-gray-900 block mt-1">3 Isolated Zones</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
