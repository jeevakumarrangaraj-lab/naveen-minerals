import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useLanguage } from '../context/LanguageContext';
import { SEOHead } from '../components/SEOHead';
import { MineralImage } from '../components/MineralImage';
import { GauzeBlaze } from '../components/GauzeBlaze';
import CoverflowGallery from '../components/CoverflowGallery';
import { APPLICATION_CATEGORIES } from '../data/initialCatalogue';

export const HomePage: React.FC = () => {
  const { settings, products } = useAppData();
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="text-[#1F2937]">
      <SEOHead
        title={`${settings.companyName} – ${settings.tagline}`}
        description={settings.introText}
      />

      {/* UNIFIED HERO & PRODUCTS SHOWCASE — Single Continuous GauzeBlaze Background */}
      <div className="relative overflow-hidden bg-[#030a1c]">
        {/* Single background layer for both sections */}
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
              coreColor: '#ffffff',
              hazeColor: '#0a2a6b',
              haze: 55,
              vignette: 15,
              exposure: 300,
              lineOpacity: 60,
              centerY: 50,
              lineCount: 36,
            }}
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#030a1c]/70 via-[#030a1c]/25 to-transparent" />
        </div>

        {/* 1. HERO SECTION */}
        <section className="relative z-10">
          {/* Content layer */}
          <div className="relative z-10 pointer-events-none max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Side (7 cols on desktop) */}
              <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
                <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#F59E0B]">
                  <span>{t('home.badge', 'NAMAKKAL, TAMIL NADU · MINERAL PRODUCTS')}</span>
                </div>

                <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-[#FFFFFF] leading-[1.12]">
                  {t('home.title', 'NAVEEN MINERALS')}
                </h1>

                <p className="font-display text-xl sm:text-2xl font-semibold text-[#F59E0B]">
                  {settings.tagline || t('footer.tagline', 'Quality Materials. Reliable Supply.')}
                </p>

                <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-xl">
                  {t('footer.description', 'Explore our range of mineral powders, stone grit and quartz products. Contact our team for product information and quotations.')}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4 pointer-events-auto">
                  <Link
                    to="/products"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#0F172A] bg-[#FFFFFF] hover:bg-[#FFF7ED] rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFFFFF]"
                  >
                    <span>{t('home.exploreProducts', 'Explore Our Products')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/request-quote"
                    className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-[#FFFFFF] bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DC2626]"
                  >
                    {t('nav.requestQuote', 'Request a Quote')}
                  </Link>
                </div>
              </div>

              {/* Right Side (5 cols on desktop) — Medium-Sized Real Mineral Processing & Stockpile Photograph */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[500px] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-[#1E293B]">
                  <MineralImage
                    src="/assets/aistudio/image_3e17f07c.png"
                    alt={t('home.yardAlt', 'Naveen Minerals Industrial Processing Yard & Mineral Stockpile in Namakkal')}
                    className="w-full h-[320px] sm:h-[350px] lg:h-[360px] object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030a1c]/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <span className="inline-block px-2.5 py-1 rounded bg-[#D97706] text-white text-[11px] font-semibold tracking-wider uppercase mb-1">
                      {t('home.facilityTag', 'Namakkal Facility')}
                    </span>
                    <p className="font-display text-sm font-medium text-slate-100">
                      {t('home.facilityDesc', 'Industrial Grinding, Sorting & Direct Dispatch Yard')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3D Coverflow Gallery Showcase */}
        <section className="relative z-10 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-16">
            <div className="text-center max-w-3xl mx-auto mb-8 lg:mb-10">
              <p className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wider mb-2">
                {t('home.mineralProductsLabel', 'MINERAL PRODUCTS')}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#FFFFFF] mb-3">
                {t('home.exploreMineralRange', 'Explore Our Mineral Range')}
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                {t('home.exploreRangeSubtitle', 'Quality powders, grit and chips supplied from Namakkal, Tamil Nadu.')}
              </p>
            </div>

            <div className="w-full max-w-[1160px] mx-auto min-h-[420px] lg:h-[430px] overflow-hidden rounded-2xl border border-white/10 bg-[#030a1c]/40 backdrop-blur-sm p-3 sm:p-6 shadow-2xl flex items-center justify-center">
              <CoverflowGallery
                autoplay={true}
                autoplayDirection="rightToLeft"
                transition={{ duration: 0.7, delay: 3 }}
                cardWidth={460}
                cardHeight={320}
                tilt={7}
                sideTilt={1.5}
                radius={16}
                titleColor="#ffffff"
                titleFont={{ fontFamily: "inherit", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: "1.25em", textAlign: "center" }}
                slides={[
                  { image: { src: "/assets/aistudio/limestone-powder_0e00f61c.png" }, title: t('prod.limestone-powder.name', 'Limestone Powder') },
                  { image: { src: "/assets/aistudio/calcite-powder_31a66b0b.png" }, title: t('prod.calcite-powder.name', 'Calcite Powder') },
                  { image: { src: "/assets/aistudio/dolomite-powder_c221f136.png" }, title: t('prod.dolomite-powder.name', 'Dolomite Powder') },
                  { image: { src: "/assets/aistudio/feldspar-powder_ba2e11f3.png" }, title: t('prod.feldspar-powder.name', 'Feldspar Powder') },
                  { image: { src: "/assets/aistudio/stone-grit_6e5e324b.png" }, title: t('prod.stone-grit.name', 'Stone Grit') },
                  { image: { src: "/assets/aistudio/quartz-chips_26c3984d.png" }, title: t('prod.quartz-chips.name', 'Quartz Chips') },
                  { image: { src: "/assets/aistudio/kolam-powder_45805643.png" }, title: t('prod.kolam-powder.name', 'Kolam Powder (Rangoli Powder)') }
                ]}
              />
            </div>

            <div className="mt-8 text-center pointer-events-auto">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#0F172A] bg-[#FFFFFF] hover:bg-[#FFF7ED] rounded-lg shadow-sm transition-colors"
              >
                <span>{t('home.viewFullCatalogue', 'View Full Catalogue')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* 4. COMMON APPLICATIONS AND INDUSTRIES — Pure White with Soft Cream highlights */}
      <section className="bg-transparent py-16 lg:py-20 border-b border-[#F3F4F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-semibold text-[#D97706] mb-1.5">
              {t('home.appsSubtitle', 'Industry Usage')}
            </p>
            <h2 className="font-display text-3xl font-bold text-[#0F172A]">
              {t('home.appsTitle', 'Common Applications and Industries')}
            </h2>
            <p className="text-sm text-[#1F2937] mt-2">
              {t('home.appsDesc', 'Each mineral product in our catalogue is associated with specific manufacturing, construction, or decorative uses.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {APPLICATION_CATEGORIES.slice(0, 6).map((app, index) => (
              <div
                key={app.id}
                className={`rounded-xl p-6 border border-[#F3F4F6] transition-colors ${
                  index % 2 === 1 ? 'bg-[#FFF7ED]' : 'bg-[#FFFFFF]'
                }`}
              >
                <h3 className="font-display text-lg font-bold text-[#0F172A] mb-2">
                  {t(`app.${app.id}.title`, app.title)}
                </h3>
                <p className="text-sm text-[#1F2937] leading-relaxed mb-4">
                  {t(`app.${app.id}.summary`, app.summary)}
                </p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#0F172A] font-medium">
                  <span className="text-[#D97706] font-semibold">{t('home.relevantProducts', 'Relevant Products:')}</span>
                  {app.relatedProductSlugs.map((slug, idx) => {
                    const match = products.find((p) => p.slug === slug);
                    if (!match) return null;
                    return (
                      <React.Fragment key={slug}>
                        <Link
                          to={`/products/${slug}`}
                          className="underline decoration-[#0F172A]/30 hover:text-[#DC2626] transition-colors"
                        >
                          {t(`prod.${slug}.name`, match.name)}
                        </Link>
                        {idx < app.relatedProductSlugs.length - 1 && (
                          <span aria-hidden="true" className="text-[#1F2937]/40">·</span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link
              to="/applications"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F172A] hover:text-[#DC2626] transition-colors"
            >
              <span>{t('home.exploreAllApps', 'Explore All Industrial & Decorative Applications')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE NAVEEN MINERALS — Soft Cream #FFF7ED */}
      <section className="relative overflow-hidden bg-[#FFF7ED]/85 py-16 lg:py-20 border-b border-[#F3F4F6]">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <p className="text-xs font-semibold text-[#D97706]">
                {t('home.whySubtitle', 'Practical & Direct Service')}
              </p>
              <h2 className="font-display text-3xl font-bold text-[#0F172A]">
                {t('home.whyTitle', 'Why Choose Naveen Minerals')}
              </h2>
              <p className="text-sm text-[#1F2937] leading-relaxed">
                {t('home.whyDesc', 'We focus on clear product information, straightforward communication, and dependable quotation support for buyers in Tamil Nadu and across India.')}
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                {
                  title: t('home.why1Title', 'Consistent High Purity'),
                  desc: t('home.why1Desc', 'Rigorous grinding and grading processes ensure uniform chemical and physical properties.')
                },
                {
                  title: t('home.why2Title', 'Direct Namakkal Supply'),
                  desc: t('home.why2Desc', 'Eliminating intermediaries ensures competitive pricing and transparent freight scheduling.')
                },
                {
                  title: t('home.why3Title', 'Prompt Quotation Support'),
                  desc: t('home.why3Desc', 'Direct digital enquiries and quotation responses tailored to your tonnage and destination.')
                },
                {
                  title: t('home.why4Title', 'Reliable Packaging & Logistics'),
                  desc: t('home.why4Desc', 'Secure HDPE bags, jumbo sacks, and bulk dispatch options for safe transit across India.')
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-xl p-5 shadow-xs">
                  <div className="flex items-center gap-2.5 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-[#D97706] shrink-0" />
                    <h3 className="font-display text-base font-bold text-[#0F172A]">{item.title}</h3>
                  </div>
                  <p className="text-xs text-[#1F2937] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
