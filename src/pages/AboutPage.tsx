import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useLanguage } from '../context/LanguageContext';
import { SEOHead } from '../components/SEOHead';
import { MineralImage } from '../components/MineralImage';

export const AboutPage: React.FC = () => {
  const { settings, products } = useAppData();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <SEOHead
        title={`${t('nav.about', 'About Us')} | ${settings.companyName}`}
        description={t('about.intro', 'Naveen Minerals is a mineral products business based in Namakkal, Tamil Nadu. Our catalogue brings together mineral powders, stone materials and quartz products for customers seeking product information and quotations. Contact us to discuss your requirements and obtain a quotation.')}
      />

      {/* Primary About Section — Soft Cream #FFF7ED per Theme Specification */}
      <section className="relative overflow-hidden bg-[#FFF7ED]/85 border-b border-[#F3F4F6] py-14 lg:py-20">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#D97706]">
                <span>{t('about.badge', 'ABOUT NAVEEN MINERALS · NAMAKKAL, TAMIL NADU')}</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F172A]">
                {settings.companyName}
              </h1>

              <p className="font-display text-lg font-semibold text-[#D97706]">
                {t('about.tagline', 'Quality Materials. Reliable Supply.')}
              </p>

              <p className="text-base sm:text-lg text-[#1F2937] leading-relaxed">
                {t('about.intro', 'Naveen Minerals is a mineral products business based in Namakkal, Tamil Nadu. Our catalogue brings together mineral powders, stone materials and quartz products for customers seeking product information and quotations. Contact us to discuss your requirements and obtain a quotation.')}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/request-quote"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-[#FFFFFF] bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  {t('nav.requestQuote', 'Request a Quote')}
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#0F172A] bg-[#FFFFFF] border border-[#0F172A]/15 hover:bg-[#F3F4F6] rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <span>{t('home.exploreProducts', 'Explore Product Range')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-[#F3F4F6] shadow-md bg-[#FFFFFF]">
                <MineralImage
                  src="/assets/aistudio/image_3e17f07c.png"
                  alt={t('about.yardAlt', 'Naveen Minerals processing yard and mineral stockpile in Namakkal')}
                  title={t('about.facilityTitle', 'Naveen Minerals Namakkal Facility')}
                  aspectClassName="aspect-[4/3]"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Range Overview — Pure White #FFFFFF */}
      <section className="py-14 lg:py-20 bg-transparent border-b border-[#F3F4F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <p className="text-xs font-semibold text-[#D97706] mb-1.5">
              {t('home.overview', 'What We Supply')}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0F172A]">
              {t('about.rangeTitle', 'Our Mineral Product Range')}
            </h2>
            <p className="text-sm text-[#1F2937] mt-2">
              {t('about.rangeDesc', 'Our catalogue brings together seven distinct products across industrial mineral powders, stone materials, quartz chips, and decorative kolam powder.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((prod, idx) => (
              <Link
                key={prod.id}
                to={`/products/${prod.slug}`}
                className="group bg-[#FFFFFF] border border-[#F3F4F6] hover:border-[#0F172A]/30 rounded-xl p-5 transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-mono-tabular font-semibold text-[#D97706]">
                    0{idx + 1}. {t(`prod.${prod.slug}.cat`, prod.category)}
                  </span>
                  <h3 className="font-display text-base font-bold text-[#0F172A] group-hover:text-[#DC2626] mt-1 mb-2 transition-colors">
                    {t(`prod.${prod.slug}.name`, prod.name)}
                  </h3>
                  <p className="text-xs text-[#1F2937] line-clamp-3 mb-4">
                    {t(`prod.${prod.slug}.shortDesc`, prod.shortDescription)}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-[#0F172A] group-hover:text-[#DC2626] transition-colors">
                  <span>{t('productCard.viewDetails', 'View Details')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
