import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, Send, Package, ShieldCheck } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useLanguage } from '../context/LanguageContext';
import { SEOHead } from '../components/SEOHead';
import { MineralImage } from '../components/MineralImage';

export const CustomerEnquiryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, products, submitCustomerEnquiry } = useAppData();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const product = products.find((p) => p.slug === slug);

  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [quantityUnit, setQuantityUnit] = useState(product?.allowedUnits?.[0] || 'tonne');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [message, setMessage] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successReference, setSuccessReference] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      if (slug) {
        localStorage.setItem('pending_enquiry_product', slug);
      }
      navigate('/customer/login');
    }
  }, [user, slug, navigate]);

  useEffect(() => {
    if (product?.allowedUnits && product.allowedUnits.length > 0) {
      setQuantityUnit(product.allowedUnits[0]);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <SEOHead title="Product Not Found | Naveen Minerals" description="Product not found." />
        <div className="max-w-md w-full bg-[#FFF7ED] border border-[#F3F4F6] rounded-2xl p-8 text-center">
          <h1 className="font-display text-2xl font-bold text-[#0F172A] mb-3">{t('enquiry.productNotFound', 'Product Not Found')}</h1>
          <p className="text-sm text-[#1F2937] mb-6">{t('enquiry.notFoundDesc', 'The product you are trying to enquire about could not be found.')}</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#FFFFFF] bg-[#0F172A] rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('enquiry.viewAll', 'View All Products')}</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName || !phone || !quantity || !deliveryLocation) {
      setError(t('enquiry.errRequired', 'Please fill in all required contact and delivery fields.'));
      return;
    }
    if (!privacyConsent) {
      setError(t('enquiry.errConsent', 'Please accept the privacy consent to submit your enquiry.'));
      return;
    }

    setSubmitting(true);
    try {
      const refCode = await submitCustomerEnquiry({
        productSlug: product.slug,
        productName: product.name,
        customerName,
        companyName,
        phone,
        quantity,
        quantityUnit,
        deliveryLocation,
        message,
        privacyConsent
      });
      setSuccessReference(refCode);
      localStorage.removeItem('pending_enquiry_product');
    } catch (err: any) {
      setError(err?.message || 'Failed to submit enquiry. Please check your inputs and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successReference) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#FFF7ED]/50">
        <SEOHead title="Enquiry Submitted | Naveen Minerals" description="Your quotation enquiry has been submitted successfully." />
        <div className="max-w-lg w-full bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl p-8 sm:p-10 text-center shadow-md">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A] mb-2">
            {t('enquiry.submittedTitle', 'Quotation Enquiry Submitted!')}
          </h1>
          <p className="text-sm text-[#1F2937] mb-6">
            {t('enquiry.submittedThanks', 'Thank you, {name}. Your enquiry for {product} has been saved securely to your account.').replace('{name}', customerName).replace('{product}', product.name)}
          </p>

          <div className="p-4 bg-[#FFF7ED] border border-[#D97706]/30 rounded-xl mb-6 text-left space-y-1">
            <p className="text-xs text-[#1F2937]/75">{t('enquiry.refNumber', 'Enquiry Reference Number:')}</p>
            <p className="font-mono font-bold text-[#0F172A] text-lg">{successReference}</p>
            <p className="text-xs text-[#1F2937]/75 pt-1">{t('enquiry.statusLabel', 'Status:')} <span className="font-semibold text-amber-700">{t('enquiry.statusNew', 'NEW')}</span></p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/customer/my-enquiries"
              className="flex-1 py-3 px-4 bg-[#0F172A] hover:bg-[#1E293B] text-[#FFFFFF] font-semibold rounded-xl text-sm transition-colors text-center"
            >
              {t('enquiry.viewMyEnquiries', 'View My Enquiries')}
            </Link>
            <Link
              to="/products"
              className="flex-1 py-3 px-4 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#0F172A] font-semibold rounded-xl text-sm transition-colors text-center"
            >
              {t('enquiry.browseMore', 'Browse More Products')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 bg-[#FFF7ED]/40">
      <SEOHead
        title={`Enquire: ${t(`prod.${product.slug}.name`, product.name)} | Naveen Minerals`}
        description={`Request a quotation and supply details for ${t(`prod.${product.slug}.name`, product.name)}.`}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to={`/products/${product.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] hover:text-[#DC2626] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('enquiry.backTo', 'Back to {product}').replace('{product}', t(`prod.${product.slug}.name`, product.name))}</span>
          </Link>
          <span className="text-xs font-mono text-[#D97706] bg-[#D97706]/10 px-3 py-1 rounded-full">
            {t('enquiry.portal', 'Customer Portal')}
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Product Summary (5 cols) */}
          <div className="md:col-span-5 bg-[#0F172A] text-[#FFFFFF] p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wider block mb-1">
                  {t('enquiry.pageTitle', 'Product Quotation Enquiry')}
                </span>
                <h1 className="font-display text-2xl font-bold text-white mb-2">
                  {t(`prod.${product.slug}.name`, product.name)}
                </h1>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {t(`prod.${product.slug}.shortDesc`, product.shortDescription)}
                </p>
              </div>

              <div className="rounded-xl overflow-hidden border border-white/10 bg-[#111318]">
                <MineralImage
                  src={product.mainImage}
                  alt={t(`prod.${product.slug}.name`, product.name)}
                  aspectClassName="aspect-[4/3]"
                />
              </div>

              <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-white/10">
                <div className="flex justify-between">
                  <span>{t('enquiry.category', 'Category:')}</span>
                  <span className="font-semibold text-white">{t(`prod.${product.slug}.cat`, product.category)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('enquiry.signedInAs', 'Signed in as:')}</span>
                  <span className="font-semibold text-[#F59E0B] truncate max-w-[180px]">{user?.email}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 text-xs text-slate-400">
              Naveen Minerals · Namakkal, Tamil Nadu
            </div>
          </div>

          {/* Right Column: Enquiry Form (7 cols) */}
          <div className="md:col-span-7 p-8">
            <h2 className="font-display text-xl font-bold text-[#0F172A] mb-1">
              {t('enquiry.pricingTitle', 'Pricing & Quotation Enquiry')}
            </h2>
            <p className="text-xs text-[#1F2937]/75 mb-6">
              {t('enquiry.pricingDesc', 'Provide your delivery requirements below. Our sales team will respond with availability and quotation details.')}
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    {t('enquiry.nameLabel', 'Your Name *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={t('enquiry.namePlaceholder', 'Enter full name')}
                    className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    {t('enquiry.companyLabel', 'Company Name')} <span className="font-normal text-slate-400">({t('enquiry.optional', 'Optional')})</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={t('enquiry.companyPlaceholder', 'Business / Enterprise Ltd.')}
                    className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  {t('enquiry.phoneLabel', 'Contact Phone Number *')}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t('enquiry.phonePlaceholder', '+91 98765 43210')}
                  className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    {t('enquiry.quantityLabel', 'Required Quantity *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder={t('enquiry.quantityPlaceholder', 'e.g. 50')}
                    className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    {t('enquiry.unitLabel', 'Unit of Measurement *')}
                  </label>
                  <select
                    value={quantityUnit}
                    onChange={(e) => setQuantityUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
                  >
                    {product.allowedUnits.map((u, i) => (
                      <option key={i} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  {t('enquiry.deliveryLabel', 'Delivery Location / Destination *')}
                </label>
                <input
                  type="text"
                  required
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder={t('enquiry.deliveryPlaceholder', 'City, State or Plant Address')}
                  className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  {t('enquiry.notesLabel', 'Additional Requirements / Message')} <span className="font-normal text-slate-400">({t('enquiry.optional', 'Optional')})</span>
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('enquiry.notesPlaceholder', 'Specify grade, packaging, or delivery schedule requirements...')}
                  className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
                />
              </div>

              <div className="flex items-start gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="privacyConsent"
                  checked={privacyConsent}
                  onChange={(e) => setPrivacyConsent(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-[#DC2626] focus:ring-[#DC2626]"
                />
                <label htmlFor="privacyConsent" className="text-xs text-[#1F2937] leading-relaxed">
                  {t('enquiry.consent', 'I agree to Naveen Minerals processing my contact details and quotation requirements for business correspondence. *')}
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 bg-[#DC2626] hover:bg-[#B91C1C] text-[#FFFFFF] font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-4"
              >
                {submitting ? (
                  <span>{t('enquiry.submitting', 'Submitting Enquiry...')}</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t('enquiry.submitBtn', 'Submit Pricing Enquiry')}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
