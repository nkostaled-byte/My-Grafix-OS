import React, { useState } from 'react';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MarketingNavProps {
  onNavigate: (page: 'landing' | 'pricing' | 'login' | 'dashboard') => void;
  currentPage: string;
  isLoggedIn: boolean;
  onLogout: () => void;
  onContactClick?: () => void;
}

export default function MarketingNav({
  onNavigate,
  currentPage,
  isLoggedIn,
  onLogout,
  onContactClick
}: MarketingNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: 'Features', action: () => { onNavigate('landing'); setTimeout(() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' }), 100); } },
    { label: 'Industries', action: () => { onNavigate('landing'); setTimeout(() => document.getElementById('industries-section')?.scrollIntoView({ behavior: 'smooth' }), 100); } },
    { label: 'Pricing', action: () => onNavigate('pricing') },
    { label: 'How It Works', action: () => { onNavigate('landing'); setTimeout(() => document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' }), 100); } },
    { label: 'Contact', action: onContactClick || (() => { onNavigate('landing'); setTimeout(() => document.getElementById('footer-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }) },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('landing')}>
            <div className="w-9 h-9 rounded-xl bg-gray-950 flex items-center justify-center text-white font-black tracking-tighter text-base shadow-md">
              G
            </div>
            <div>
              <span className="font-semibold text-gray-900 text-sm block tracking-tight">Grafix Business OS</span>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest leading-none">The Workspace OS</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.action}
                className="text-[13px] font-medium text-gray-500 hover:text-gray-950 transition-colors relative py-1"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="text-[13px] font-semibold text-gray-700 hover:text-gray-950 transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 text-[13px] font-semibold text-white bg-gray-950 hover:bg-gray-800 rounded-xl transition-all shadow-sm"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('login')}
                  className="text-[13px] font-semibold text-gray-500 hover:text-gray-950 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-gray-950 hover:bg-gray-800 rounded-xl transition-all shadow-sm group"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-gray-900 p-2 rounded-lg"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-b border-gray-100 bg-white"
          >
            <div className="px-4 pt-2 pb-4 space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => {
                    link.action();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left py-2.5 px-3 text-[14px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                {isLoggedIn ? (
                  <>
                    <button
                      onClick={() => {
                        onNavigate('dashboard');
                        setIsOpen(false);
                      }}
                      className="w-full text-center py-2.5 text-[14px] font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        setIsOpen(false);
                      }}
                      className="w-full text-center py-2.5 text-[14px] font-medium text-white bg-gray-950 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        onNavigate('login');
                        setIsOpen(false);
                      }}
                      className="w-full text-center py-2.5 text-[14px] font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('login');
                        setIsOpen(false);
                      }}
                      className="w-full text-center py-2.5 text-[14px] font-semibold text-white bg-gray-950 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
