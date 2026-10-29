import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Phone,
  Mail,
  Layers,
  PackageCheck,
  FileText,
  Sparkles,
  Building2
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useLanguage } from '../context/LanguageContext';
import { SEOHead } from '../components/SEOHead';
import { MineralImage } from '../components/MineralImage';
import { ProductCard } from '../components/ProductCard';

interface VerifiedProductMeta {
  physicalForm: string;
  usageScope: string;
  supplyGuidance: string;
  relatedSlugs: string[];
  relatedSectionTitle: string;
  relatedSectionSubtitle: string;
}

const VERIFIED_PRODUCT_METADATA: Record<string, VerifiedProductMeta> = {
  'limestone-powder': {
    physicalForm: 'Processed fine pale-white to light-grey mineral powder',
    usageScope: 'Construction-Material Manufacturing & Selected Industrial Filler Applications',
    supplyGuidance:
      'Supplied according to customer enquiry. Suitability for specific cement, putty, or industrial formulations is confirmed based on your required material grade and process parameters.',
    relatedSlugs: ['calcite-powder', 'dolomite-powder', 'stone-grit'],
    relatedSectionTitle: 'Related Industrial & Construction Minerals',
    relatedSectionSubtitle:
      'Explore other processed mineral powders and stone materials used in construction compounds and industrial manufacturing.'
  },
  'calcite-powder': {
    physicalForm: 'Processed fine bright-white mineral powder',
    usageScope: 'Industrial Manufacturing, Coatings, Polymers & Suitable Filler Applications',
    supplyGuidance:
      'Supplied as a functional mineral filler and extender. Contact our team with your intended coating, plastic, rubber, or building-material application to discuss suitable supply.',
    relatedSlugs: ['limestone-powder', 'dolomite-powder', 'feldspar-powder'],
    relatedSectionTitle: 'Related Industrial Mineral Powders',
    relatedSectionSubtitle:
      'Compare other fine mineral powders supplied by Naveen Minerals for industrial filler and manufacturing processes.'
  },
  'dolomite-powder': {
    physicalForm: 'Processed fine off-white to pale-grey carbonate mineral powder',
    usageScope: 'Industrial, Manufacturing & Construction-Material Applications',
    supplyGuidance:
      'Supplied for construction compounds, selected ceramic or glass batches, and general industrial filler uses depending on your process requirements.',
    relatedSlugs: ['limestone-powder', 'calcite-powder', 'feldspar-powder'],
    relatedSectionTitle: 'Related Industrial Mineral Powders',
    relatedSectionSubtitle:
      'View other carbonate and fluxing mineral powders available for construction, ceramic, and industrial applications.'
  },
  'feldspar-powder': {
    physicalForm: 'Processed fine warm off-white / cream-toned mineral powder',
    usageScope: 'Ceramic, Tile, Sanitaryware, Glaze & Glass Manufacturing',
    supplyGuidance:
      'Used as a raw material in ceramic bodies, glazes, and glass batch formulations. Share your manufacturing application when requesting a quotation.',
    relatedSlugs: ['quartz-chips', 'dolomite-powder', 'calcite-powder'],
    relatedSectionTitle: 'Related Ceramic, Glass & Industrial Minerals',
    relatedSectionSubtitle:
      'Explore complementary mineral raw materials used across ceramic tile, sanitaryware, glaze, and glass production.'
  },
  'stone-grit': {
    physicalForm: 'Graded angular crushed stone granules',
    usageScope: 'Construction, Industrial Flooring & Selected Decorative Stone Applications',
    supplyGuidance:
      'Actual composition and granule sizing depend on the material supplied. Specify your intended construction, flooring, or decorative application when requesting a quote.',
    relatedSlugs: ['quartz-chips', 'limestone-powder', 'dolomite-powder'],
    relatedSectionTitle: 'Related Crushed Stone & Construction Minerals',
    relatedSectionSubtitle:
      'Discover other crushed mineral chips and construction-grade mineral powders in the Naveen Minerals catalogue.'
  },
  'quartz-chips': {
    physicalForm: 'Processed angular white / semi-translucent crushed quartz pieces',
    usageScope: 'Glass, Ceramic, Engineered-Stone & Selected Decorative Applications',
    supplyGuidance:
      'Supplied as crushed quartz pieces for manufacturing and engineered-stone processes where the supplied material grade matches your production requirements.',
    relatedSlugs: ['feldspar-powder', 'stone-grit', 'dolomite-powder'],
    relatedSectionTitle: 'Related Quartz, Ceramic & Stone Materials',
    relatedSectionSubtitle:
      'Browse related mineral raw materials for glass, ceramic, engineered-stone, and aggregate applications.'
  },
  'kolam-powder': {
    physicalForm: 'Fine bright-white traditional decorative powder',
    usageScope: 'Traditional Decorative Floor Designs (Kolam, Rangoli & Cultural Patterns)',
    supplyGuidance:
      'Dedicated strictly to traditional decorative floor drawings at homes, entrances, temples, and cultural events. Kept separate from industrial mineral applications.',
    relatedSlugs: ['stone-grit', 'quartz-chips'],
    relatedSectionTitle: 'Other Products with Selected Decorative Applications',
    relatedSectionSubtitle:
      'Kolam Powder is our dedicated traditional floor-art powder. For architectural landscaping or decorative stone finishes, explore our crushed stone and quartz materials below.'
  }
};

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { products, settings } = useAppData();
  const { t } = useLanguage();

  const product = products.find((p) => p.slug === slug);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  if (!product) {
    return (
      <div className="bg-[#FFFFFF] min-h-[70vh] flex items-center justify-center px-4 py-16">
        <SEOHead
          title="Product Not Found | Naveen Minerals"
          description="The requested mineral product could not be found in our catalogue."
        />
        <div className="max-w-md w-full bg-[#FFF7ED] border border-[#F3F4F6] rounded-2xl p-8 text-center">
          <h1 className="font-display text-2xl font-bold text-[#0F172A] mb-3">
            {t('productDetail.notFound', 'Product Not Found')}
          </h1>
          <p className="text-sm text-[#1F2937] mb-6">
            {t('productDetail.notFoundDesc', 'The mineral product you are looking for is not available or may have been moved. Explore our seven-product catalogue below.')}
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#FFFFFF] bg-[#0F172A] hover:bg-[#1E293B] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('productDetail.backToCatalogue', 'Back to All Products')}</span>
          </Link>
        </div>
      </div>
    );
  }

  const isKolam = product.slug === 'kolam-powder';
  const meta: VerifiedProductMeta = VERIFIED_PRODUCT_METADATA[product.slug] || {
    physicalForm: isKolam
      ? 'Fine decorative powder'
      : 'Processed mineral material',
    usageScope: isKolam
      ? 'Traditional Decorative Use'
      : 'Industrial & Manufacturing Applications',
    supplyGuidance:
      'Supplied based on customer quotation enquiry. Contact our team to discuss your application requirements.',
    relatedSlugs: products
      .filter((p) => p.slug !== product.slug && (isKolam ? true : p.slug !== 'kolam-powder'))
      .slice(0, 3)
      .map((p) => p.slug),
    relatedSectionTitle: 'Related Products in Our Catalogue',
    relatedSectionSubtitle: 'Explore other materials supplied by Naveen Minerals.'
  };

  const galleryImages = [
    product.mainImage,
    ...(product.additionalImages || []).filter((img) => img !== product.mainImage)
  ];
  const displayedImage = activeImage || product.mainImage;

  const relatedProducts = meta.relatedSlugs
    .map((relSlug) => products.find((p) => p.slug === relSlug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const quoteUrl = `/request-quote?product=${encodeURIComponent(product.slug)}`;

  return (
    <div className="min-h-screen">
      <SEOHead
        title={`${t(`prod.${product.slug}.name`, product.name)} | ${settings.companyName}`}
        description={t(`prod.${product.slug}.shortDesc`, product.shortDescription)}
      />

      {/* Breadcrumb Bar */}
      <nav
        aria-label={t('productDetail.jumpOverview', 'Breadcrumb')}
        className="bg-[#FFF7ED]/90 border-b border-[#F3F4F6]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 text-xs text-[#1F2937]">
          <ol className="flex items-center gap-2 truncate">
            <li>
              <Link to="/" className="hover:text-[#0F172A] transition-colors">
                {t('nav.home', 'Home')}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to="/products" className="hover:text-[#0F172A] transition-colors">
                {t('nav.products', 'Products')}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-semibold text-[#0F172A] truncate" aria-current="page">
              {t(`prod.${product.slug}.name`, product.name)}
            </li>
          </ol>

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 font-semibold text-[#0F172A] hover:text-[#DC2626] whitespace-nowrap shrink-0 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('productDetail.all7', 'All 7 Products')}</span>
          </Link>
        </div>
      </nav>

      {/* Section Jump Bar */}
      <div className="bg-[#FFFFFF]/95 backdrop-blur-xs border-b border-[#F3F4F6] sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-5 sm:gap-7 text-xs font-semibold text-[#1F2937] whitespace-nowrap">
            <a href="#overview" className="hover:text-[#DC2626] transition-colors">
              {t('productDetail.jumpOverview', '01. Overview')}
            </a>
            <a href="#common-applications" className="hover:text-[#DC2626] transition-colors">
              {t('productDetail.jumpApps', '02. Common Applications')}
            </a>
            <a href="#product-information" className="hover:text-[#DC2626] transition-colors">
              {t('productDetail.jumpInfo', '03. Product Information')}
            </a>
            <a href="#related-products" className="hover:text-[#DC2626] transition-colors">
              {t('productDetail.jumpRelated', '04. Related Products')}
            </a>
          </div>

          <Link
            to={quoteUrl}
            className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 text-xs font-semibold text-[#FFFFFF] bg-[#DC2626] hover:bg-[#B91C1C] rounded-md transition-colors shrink-0"
          >
            {t('productDetail.requestQuote', 'Request a Quote')}
          </Link>
        </div>
      </div>

      {/* SECTION 1: OVERVIEW */}
      <section
        id="overview"
        className="relative overflow-hidden py-12 lg:py-16 border-b border-[#F3F4F6] scroll-mt-32"
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Column: Realistic Mountain-Shaped Product Photograph (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-2xl overflow-hidden border border-[#1E293B] shadow-xs bg-[#111318]">
                <MineralImage
                  src={displayedImage}
                  productSlug={product.slug}
                  alt={`${t(`prod.${product.slug}.name`, product.name)} – supplied by Naveen Minerals`}
                  title={t(`prod.${product.slug}.name`, product.name)}
                  aspectClassName="aspect-[4/3]"
                  priority
                />
              </div>

              <div className="flex items-center justify-between px-3 py-2 bg-[#FFF7ED]/80 border border-[#F3F4F6] rounded-lg text-xs text-[#1F2937]">
                <span className="font-semibold text-[#0F172A]">{t('productDetail.materialPresentation', 'Material Presentation:')}</span>
                <span>{t('productDetail.photoBg', 'Original mineral photography container')}</span>
              </div>

              {galleryImages.length > 1 && (
                <div className="flex items-center gap-3">
                  {galleryImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(imgUrl)}
                      className={`w-24 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        displayedImage === imgUrl
                          ? 'border-[#0F172A] shadow-xs'
                          : 'border-[#F3F4F6] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <MineralImage
                        src={imgUrl}
                        alt={`${t(`prod.${product.slug}.name`, product.name)} view ${idx + 1}`}
                        aspectClassName="aspect-[4/3]"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Overview, Detailed Description & Primary Quote CTA (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#D97706] mb-2.5">
                  <span>{t('productDetail.overview', '01. Product Overview')}</span>
                  <span aria-hidden="true" className="text-[#1F2937]/40">·</span>
                  <span className="text-[#0F172A]">{t(`prod.${product.slug}.cat`, product.category)}</span>
                  {isKolam && (
                    <>
                      <span aria-hidden="true" className="text-[#1F2937]/40">·</span>
                      <span className="text-[#D97706]">{t('productDetail.traditionalUse', 'Traditional Decorative Use')}</span>
                    </>
                  )}
                </div>

                <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
                  {t(`prod.${product.slug}.name`, product.name)}
                </h1>
              </div>

              {/* Concise Product Overview */}
              <div className="bg-[#FFF7ED] border-l-4 border-[#D97706] rounded-r-xl p-4 sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#0F172A] mb-1">
                  {t('productDetail.overviewSummary', 'Overview Summary')}
                </p>
                <p className="text-sm sm:text-base font-medium text-[#0F172A] leading-relaxed">
                  {t(`prod.${product.slug}.shortDesc`, product.shortDescription)}
                </p>
              </div>

              {/* Detailed Product Description */}
              <div className="space-y-3">
                <h2 className="font-display text-lg font-bold text-[#0F172A]">
                  {t('productDetail.detailedDesc', 'Detailed Description')}
                </h2>
                <p className="text-sm sm:text-base text-[#1F2937] leading-relaxed">
                  {t(`prod.${product.slug}.fullDesc`, product.fullDescription)}
                </p>
                <p className="text-xs sm:text-sm text-[#1F2937]/85 leading-relaxed">
                  {meta.supplyGuidance}
                </p>
              </div>

              {/* Quick Summary Strip: Units & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 bg-[#FFFFFF] border border-[#F3F4F6] rounded-xl">
                  <p className="text-xs text-[#1F2937]/75 mb-1">{t('productDetail.enquiryUnits', 'Enquiry Quantity Units')}</p>
                  <p className="text-sm font-semibold text-[#0F172A]">
                    {product.allowedUnits.join(' · ')}
                  </p>
                </div>
                <div className="p-3.5 bg-[#FFFFFF] border border-[#F3F4F6] rounded-xl">
                  <p className="text-xs text-[#1F2937]/75 mb-1">{t('productDetail.appClassification', 'Application Classification')}</p>
                  <p className="text-sm font-semibold text-[#0F172A]">
                    {isKolam ? t('productDetail.traditionalFloor', 'Traditional Floor Decoration') : product.category}
                  </p>
                </div>
              </div>

              {/* Prominent Enquire About Pricing Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  to={`/customer/enquire/${product.slug}`}
                  className="inline-flex items-center justify-center px-7 py-4 text-sm font-semibold text-[#FFFFFF] bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
                >
                  {t('productDetail.enquirePricing', 'Enquire About Pricing')}
                </Link>
                <Link
                  to={quoteUrl}
                  className="inline-flex items-center justify-center px-5 py-4 text-sm font-semibold text-[#0F172A] bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  {t('nav.requestQuote', 'Request Quote')}
                </Link>
              </div>

              {/* Direct Contact Assistance */}
              <div className="pt-4 border-t border-[#F3F4F6] flex flex-wrap items-center gap-6 text-xs text-[#1F2937]">
                <span className="font-semibold text-[#0F172A]">{t('productDetail.directLine', 'Direct Enquiry Line:')}</span>
                <a
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-1.5 hover:text-[#DC2626] font-mono-tabular font-semibold transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>{settings.phone}</span>
                </a>
                <a
                  href={`mailto:${settings.email}`}
                  className="inline-flex items-center gap-1.5 hover:text-[#DC2626] font-semibold transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>{settings.email}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: COMMON APPLICATIONS */}
      <section
        id="common-applications"
        className="py-14 lg:py-16 bg-[#FFF7ED]/75 border-b border-[#F3F4F6] scroll-mt-32"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <p className="text-xs font-semibold text-[#D97706] mb-2">
              {t('productDetail.jumpApps', '02. Common Applications')}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0F172A] mb-3">
              {t('productDetail.whereUsed', 'Where {name} Is Commonly Used').replace('{name}', product.name)}
            </h2>
            <p className="text-sm sm:text-base text-[#1F2937] leading-relaxed">
              {isKolam
                ? t('productDetail.kolamAppsNote', 'Kolam Powder (Rangoli Powder) is specifically prepared for traditional decorative floor artistry and cultural celebrations.')
                : t('productDetail.industrialAppsNote', 'Below are the primary industrial, manufacturing, and construction applications for {name}.').replace('{name}', product.name)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {product.commonApplications.map((app, index) => (
              <div
                key={index}
                className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-xl p-5 flex items-start gap-4 shadow-2xs"
              >
                <div className="w-9 h-9 rounded-lg bg-[#FFF7ED] border border-[#D97706]/30 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5 text-[#D97706]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#D97706] mb-1">
                    {t('productDetail.appPrefix', 'Application 0')}{index + 1}
                  </p>
                  <h3 className="font-display text-base font-bold text-[#0F172A]">
                    {t(`prod.${product.slug}.app${index+1}`, app)}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-[#FFFFFF] border border-[#F3F4F6] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              {isKolam ? (
                <Sparkles className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
              ) : (
                <Building2 className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
              )}
              <p className="text-xs sm:text-sm text-[#1F2937] leading-relaxed">
                {isKolam
                  ? t('productDetail.kolamNote', 'Traditional Decorative Use Only: Kolam Powder is supplied for drawing traditional kolam and rangoli floor designs at homes, entrances, and cultural venues. It is not an industrial filler mineral.')
                  : t('productDetail.suitabilityNote', 'Application Suitability Note: Industrial and manufacturing requirements vary by process. Please share your intended application in your quotation request so our team can confirm suitable supply.')}
              </p>
            </div>
            <Link
              to="/applications"
              className="text-xs font-semibold text-[#0F172A] hover:text-[#DC2626] whitespace-nowrap shrink-0 transition-colors"
            >
              {t('productDetail.viewAllApps', 'View All Industry Applications →')}
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 3: PRODUCT INFORMATION */}
      <section
        id="product-information"
        className="py-14 lg:py-16 bg-transparent border-b border-[#F3F4F6] scroll-mt-32"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <p className="text-xs font-semibold text-[#D97706] mb-2">
              {t('productDetail.jumpInfo', '03. Product Information')}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0F172A] mb-3">
              {t('productDetail.verifiedDetails', 'Verified Product & Supply Details')}
            </h2>
            <p className="text-sm sm:text-base text-[#1F2937] leading-relaxed">
              {t('productDetail.verifiedDesc', 'Review verified catalogue information and ordering units for {name}. For specific application requirements or bulk delivery schedules, request a direct quotation.').replace('{name}', product.name)}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Specification Table Card (8 cols) */}
            <div className="lg:col-span-8 bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl overflow-hidden shadow-xs">
              <div className="bg-[#0F172A] px-6 py-4 flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-[#FFFFFF]">
                  {product.name} — {t('productDetail.catInfo', 'Catalogue Information')}
                </h3>
                <span className="text-xs font-semibold text-[#D97706]">
                  {settings.companyName}
                </span>
              </div>

              <dl className="divide-y divide-[#F3F4F6] text-sm">
                <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <dt className="font-semibold text-[#0F172A] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#D97706] shrink-0" />
                    <span>{t('productDetail.nameLabel', 'Product Name')}</span>
                  </dt>
                  <dd className="sm:col-span-2 text-[#1F2937]">{t(`prod.${product.slug}.name`, product.name)}</dd>
                </div>

                <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <dt className="font-semibold text-[#0F172A] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#D97706] shrink-0" />
                    <span>{t('productDetail.catLabel', 'Catalogue Category')}</span>
                  </dt>
                  <dd className="sm:col-span-2 text-[#1F2937]">{t(`prod.${product.slug}.cat`, product.category)}</dd>
                </div>

                <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <dt className="font-semibold text-[#0F172A] flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-[#D97706] shrink-0" />
                    <span>{t('productDetail.formLabel', 'Physical Form & Appearance')}</span>
                  </dt>
                  <dd className="sm:col-span-2 text-[#1F2937]">{meta.physicalForm}</dd>
                </div>

                <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <dt className="font-semibold text-[#0F172A]">{t('productDetail.scopeLabel', 'Primary Usage Scope')}</dt>
                  <dd className="sm:col-span-2 text-[#1F2937]">{meta.usageScope}</dd>
                </div>

                <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <dt className="font-semibold text-[#0F172A]">{t('productDetail.supportedUnitsLabel', 'Supported Enquiry Units')}</dt>
                  <dd className="sm:col-span-2 text-[#1F2937] font-medium">
                    {product.allowedUnits.join(', ')}
                  </dd>
                </div>

                <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <dt className="font-semibold text-[#0F172A]">{t('productDetail.dispatchLabel', 'Dispatch & Origin')}</dt>
                  <dd className="sm:col-span-2 text-[#1F2937]">
                    {settings.companyName}, {settings.address}
                  </dd>
                </div>

                <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#FFF7ED]/50">
                  <dt className="font-semibold text-[#0F172A]">{t('productDetail.guidanceLabel', 'Quotation & Supply Guidance')}</dt>
                  <dd className="sm:col-span-2 text-xs sm:text-sm text-[#1F2937] leading-relaxed">
                    {meta.supplyGuidance}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Direct Quote Callout Card (4 cols) */}
            <div className="lg:col-span-4 bg-[#FFF7ED] border border-[#D97706]/30 rounded-2xl p-6 space-y-5">
              <div>
                <p className="text-xs font-semibold text-[#D97706] mb-1">
                  {t('productDetail.enquirySupply', 'Enquiry-Based Supply')}
                </p>
                <h3 className="font-display text-xl font-bold text-[#0F172A]">
                  {t('productDetail.needQuote', 'Need a Quotation for {name}?').replace('{name}', product.name)}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-[#1F2937] leading-relaxed">
                {t('productDetail.quoteCardDesc', 'Select your required quantity in {units} and share your delivery location. Our team will prepare a tailored quotation for your requirement.').replace('{units}', product.allowedUnits.join(', '))}
              </p>

              <Link
                to={quoteUrl}
                className="w-full inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-[#FFFFFF] bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg shadow-xs transition-colors"
              >
                {t('nav.requestQuote', 'Request a Quote')}
              </Link>

              <div className="pt-4 border-t border-[#0F172A]/10 space-y-2 text-xs text-[#1F2937]">
                <p className="font-semibold text-[#0F172A]">{t('productDetail.directContact', 'Direct Contact:')}</p>
                <p className="font-mono-tabular">Phone: {settings.phone}</p>
                <p>Email: {settings.email}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: RELATED PRODUCTS */}
      <section
        id="related-products"
        className="py-14 lg:py-16 bg-transparent scroll-mt-32"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold text-[#D97706] mb-2">
                {t('productDetail.relatedTitle', '04. Related Products')}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0F172A] mb-2">
                {meta.relatedSectionTitle}
              </h2>
              <p className="text-sm text-[#1F2937] leading-relaxed">
                {meta.relatedSectionSubtitle}
              </p>
            </div>
            <Link
              to="/products"
              className="text-sm font-semibold text-[#0F172A] hover:text-[#DC2626] whitespace-nowrap shrink-0 transition-colors"
            >
              {t('productDetail.viewAll7', 'View All 7 Products →')}
            </Link>
          </div>

          <div
            className={`grid grid-cols-1 ${
              relatedProducts.length === 2 ? 'md:grid-cols-2 max-w-4xl' : 'md:grid-cols-3'
            } gap-8`}
          >
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

