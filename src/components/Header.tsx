import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, UserCircle } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

export const Header: React.FC = () => {
  const { settings, user } = useAppData();
  const { t } = useLanguage();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NAV_ITEMS = [
    { label: t('nav.home', 'Home'), path: '/' },
    { label: t('nav.products', 'Products'), path: '/products' },
    { label: t('nav.applications', 'Applications'), path: '/applications' },
    { label: t('nav.about', 'About'), path: '/about' },
    { label: t('nav.contact', 'Contact'), path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#F3F4F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand lockup with original winged crest logo + single text wordmark */}
        <Link
          to="/"
          className="flex items-center gap-3 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F172A] rounded"
          onClick={() => setMobileOpen(false)}
        >
          <img
            src="/assets/aistudio/USN_NAVEN_Minerals_Winged_Emblem_f8e368b9.png"
            alt={`${settings.companyName} Winged Crest Logo`}
            className="h-10 sm:h-11 w-auto object-contain shrink-0"
          />
          <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#0F172A] whitespace-nowrap shrink-0">
            {settings.companyName.toUpperCase()}
          </span>
        </Link>

        {/* Zone 2: 5 clean single-line text navigation links */}
        <nav
          aria-label={t('header.primaryNav', 'Primary Navigation')}
          className="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F172A] ${
                  active
                    ? 'border-[#DC2626] text-[#0F172A] font-semibold'
                    : 'border-transparent text-[#1F2937] hover:text-[#0F172A]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Language Selector + Login + Request a Quote CTA + Mobile menu toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>

          <Link
            to={user ? "/customer/my-enquiries" : "/customer/login"}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-[#FFFFFF] bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg shadow-xs transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DC2626]"
            title={user ? t('nav.myEnquiries', 'My Enquiries') : t('nav.login', 'Login')}
          >
            <UserCircle className="w-4 h-4 text-[#FFFFFF]" />
            <span>{user ? t('nav.myEnquiries', 'My Enquiries') : t('nav.login', 'Login')}</span>
          </Link>

          <Link
            to="/request-quote"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-[#FFFFFF] bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg shadow-xs transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DC2626]"
          >
            {t('nav.requestQuote', 'Request a Quote')}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-[#0F172A] border border-[#0F172A]/20 hover:bg-[#FFF7ED] transition-colors focus-visible:outline-2 focus-visible:outline-[#0F172A]"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? t('header.closeNav', 'Close navigation menu') : t('header.openNav', 'Open navigation menu')}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#FFFFFF] border-t border-[#0F172A]/15 border-b-2 border-b-[#D97706] px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <div className="pb-2 border-b border-[#F3F4F6]">
            <LanguageSelector isMobile={true} />
          </div>
          <nav aria-label={t('header.mobileNav', 'Mobile Navigation')} className="flex flex-col space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-base font-semibold transition-colors ${
                    active
                      ? 'bg-[#FFF7ED] text-[#0F172A] underline decoration-[#DC2626] decoration-2 underline-offset-4'
                      : 'text-[#1F2937] hover:bg-[#F3F4F6] hover:text-[#0F172A]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="pt-2 space-y-2">
            <Link
              to={user ? "/customer/my-enquiries" : "/customer/login"}
              onClick={() => setMobileOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-[#FFFFFF] bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <UserCircle className="w-4 h-4 text-[#FFFFFF]" />
              <span>{user ? t('nav.myEnquiries', 'My Enquiries') : t('nav.login', 'Login')}</span>
            </Link>
            <Link
              to="/request-quote"
              onClick={() => setMobileOpen(false)}
              className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-[#FFFFFF] bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg transition-colors whitespace-nowrap"
            >
              {t('nav.requestQuote', 'Request a Quote')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
