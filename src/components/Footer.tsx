import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useLanguage } from '../context/LanguageContext';
import { GauzeBlaze } from './GauzeBlaze';

export const Footer: React.FC = () => {
  const { settings, products } = useAppData();
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative overflow-hidden bg-[#030a1c] text-[#FFFFFF]">
      {/* 1. GauzeBlaze Animated Background Layer */}
      <div className="absolute inset-0 z-0">
        <GauzeBlaze
          background="#030a1c"
          baseColor="#e0f2fe"
          midColor="#1e40af"
          accentColor="#38bdf8"
          amplitude={45}
          speed={45}
          particles={isMobile ? 150 : 400}
          advanced={{
            coreColor: "#ffffff",
            hazeColor: "#0a2a6b",
            haze: 55,
            vignette: 15,
            exposure: 300,
            lineOpacity: 60,
            centerY: 50,
            lineCount: isMobile ? 36 : undefined,
          }}
        />
      </div>

      {/* 2. Dark Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#030a1c]/55 via-[#030a1c]/45 to-[#030a1c]/75" />

      {/* 3. Smooth Join Gradient with Section Above */}
      <div className="absolute top-0 inset-x-0 h-20 z-[1] pointer-events-none bg-gradient-to-b from-[#030a1c] to-transparent" />

      {/* 4. Content Wrapper */}
      <div className="relative z-10 pointer-events-none">
        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <span className="inline-block px-3 py-1 rounded bg-[#D97706]/20 text-[#F59E0B] text-xs font-semibold tracking-wider uppercase">
                {t('home.readyDispatch', 'Ready for Dispatch')}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#FFFFFF]">
                {t('home.ctaHeading', 'Need Mineral Supplies or Custom Quotations?')}
              </h2>
              <p className="text-base text-slate-300 leading-relaxed">
                {t('home.ctaDesc', 'Contact our sales and dispatch team in Namakkal directly for product grades, test reports, or bulk pricing.')}
              </p>
              <div className="pt-4 flex flex-wrap items-center justify-center gap-4 pointer-events-auto">
                <Link
                  to="/request-quote"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-[#FFFFFF] bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg shadow-sm transition-colors whitespace-nowrap"
                >
                  {t('nav.requestQuote', 'Request a Quote')}
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#0F172A] bg-[#FFFFFF] hover:bg-[#FFF7ED] rounded-lg transition-colors whitespace-nowrap"
                >
                  <span>{t('nav.contact', 'Contact Us')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Main */}
        <footer className="border-t border-white/10 pt-10 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-8 border-b border-white/10">
              {/* Column 1: Brand & Winged Logo (3 cols) */}
              <div className="lg:col-span-3 space-y-3">
                <Link to="/" className="inline-flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-[#D97706] rounded">
                  <img
                    src="/assets/aistudio/USN_NAVEN_Minerals_Winged_Emblem_f8e368b9.png"
                    alt={`${settings.companyName} Winged Crest Logo`}
                    className="h-12 w-auto object-contain shrink-0"
                  />
                  <div>
                    <span className="block font-display text-xl font-bold tracking-tight text-[#FFFFFF]">
                      {settings.companyName.toUpperCase()}
                    </span>
                    <span className="block text-xs font-medium text-[#F59E0B]">
                      {t('footer.tagline', settings.tagline)}
                    </span>
                  </div>
                </Link>
                <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
                  {t('footer.description', settings.introText)}
                </p>
                {settings.showGstinPublicly && settings.gstinVerified && settings.gstin && (
                  <p className="text-xs text-slate-300 font-mono-tabular">
                    GSTIN: {settings.gstin}
                  </p>
                )}
              </div>

              {/* Column 2: Quick Navigation & Admin Login (2 cols) */}
              <div className="lg:col-span-2 space-y-2">
                <h3 className="font-display text-sm font-semibold tracking-wider text-[#F59E0B]">
                  {t('footer.navigation', 'Navigation')}
                </h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>
                    <Link to="/" className="hover:text-[#FFFFFF] transition-colors">
                      {t('nav.home', 'Home')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/products" className="hover:text-[#FFFFFF] transition-colors">
                      {t('nav.products', 'Products')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/applications" className="hover:text-[#FFFFFF] transition-colors">
                      {t('nav.applications', 'Applications')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" className="hover:text-[#FFFFFF] transition-colors">
                      {t('nav.about', 'About Us')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="hover:text-[#FFFFFF] transition-colors">
                      {t('nav.contact', 'Contact')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/request-quote" className="text-[#F59E0B] hover:text-[#FFFFFF] font-semibold transition-colors">
                      {t('nav.requestQuote', 'Request a Quote')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/login" className="text-[#38BDF8] hover:text-[#FFFFFF] font-semibold transition-colors">
                      {t('footer.adminLogin', 'Admin Login')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: Mineral Catalogue Links (3 cols) */}
              <div className="lg:col-span-3 space-y-2">
                <h3 className="font-display text-sm font-semibold tracking-wider text-[#F59E0B]">
                  {t('footer.ourProducts', 'Our Products')}
                </h3>
                <ul className="space-y-1.5 text-sm text-slate-300">
                  {products.slice(0, 7).map((product) => (
                    <li key={product.id}>
                      <Link
                        to={`/products/${product.slug}`}
                        className="hover:text-[#FFFFFF] transition-colors"
                      >
                        {t(`prod.${product.slug}.name`, product.name)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 4: YUJI Digital Agency Details (2 cols) */}
              <div className="lg:col-span-2 space-y-2.5">
                <h3 className="font-display text-sm font-semibold tracking-wider text-[#F59E0B]">
                  {t('footer.yujiTitle', 'YUJI')}
                </h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  {t('footer.yujiTagline', 'Modern Websites. Smart Marketing. Real Results.')}
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {t('footer.yujiServices', 'Website Development · App Development · Digital Marketing')}
                </p>
                <ul className="space-y-1 text-xs text-slate-300 pt-1">
                  <li>
                    <a href="mailto:info.yuji@mail.com" className="hover:text-white transition-colors truncate">
                      {t('footer.yujiEmail', 'info.yuji@mail.com')}
                    </a>
                  </li>
                  <li>
                    <a href="tel:+918428921250" className="font-mono-tabular hover:text-white transition-colors">
                      {t('footer.yujiPhone', '+91 84289 21250')}
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 5: Business Contact & Location (2 cols) */}
              <div className="lg:col-span-2 space-y-3">
                <h3 className="font-display text-sm font-semibold tracking-wider text-[#F59E0B]">
                  {t('footer.businessContact', 'Business Contact')}
                </h3>
                <ul className="space-y-2.5 text-sm text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#D97706] shrink-0 mt-1" />
                    <span>{settings.address}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#D97706] shrink-0" />
                    <a href={`tel:${settings.phone}`} className="hover:text-white transition-colors">
                      {settings.phone}
                    </a>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[#D97706] shrink-0" />
                    <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors truncate">
                      {settings.email}
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar: Copyright & YUJI Designer Credit */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <p>© {currentYear} {settings.companyName}. {t('footer.allRights', 'All rights reserved. Namakkal, Tamil Nadu.')}</p>
              <div className="flex items-center gap-2 text-slate-300">
                <span>{t('footer.designedBy', 'Designed & Developed by')}</span>
                <span className="font-bold text-[#F59E0B] tracking-wide">YUJI</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
