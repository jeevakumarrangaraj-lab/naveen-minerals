import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  User,
  Package,
  Truck,
  ArrowRight
} from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAppData } from '../context/AppDataContext';
import { useLanguage } from '../context/LanguageContext';
import { SEOHead } from '../components/SEOHead';
import { MineralImage } from '../components/MineralImage';

interface QuoteFieldErrors {
  customerName?: string;
  phone?: string;
  email?: string;
  productSlug?: string;
  quantity?: string;
  quantityUnit?: string;
  deliveryLocation?: string;
  privacyConsent?: string;
}

interface SubmittedQuoteSummary {
  quoteReference: string;
  customerName: string;
  companyName?: string;
  phone: string;
  email: string;
  productName: string;
  productSlug: string;
  quantity: string;
  quantityUnit: string;
  deliveryLocation: string;
  message?: string;
}

export const RequestQuotePage: React.FC = () => {
  const { products, settings } = useAppData();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const preselectedSlug = searchParams.get('product') || '';

  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [productSlug, setProductSlug] = useState<string>(
    preselectedSlug || (products[0]?.slug ?? 'limestone-powder')
  );
  const [quantity, setQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('Tonnes');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [message, setMessage] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<QuoteFieldErrors>({});
  const [submittedQuote, setSubmittedQuote] = useState<SubmittedQuoteSummary | null>(null);

  // Sync preselected product from query string
  useEffect(() => {
    if (preselectedSlug && products.some((p) => p.slug === preselectedSlug)) {
      setProductSlug(preselectedSlug);
    }
  }, [preselectedSlug, products]);

  // Adjust allowed quantity units whenever productSlug changes
  const selectedProduct = products.find((p) => p.slug === productSlug) || products[0];
  const availableUnits = selectedProduct?.allowedUnits?.length
    ? selectedProduct.allowedUnits
    : productSlug === 'kolam-powder'
    ? ['kg', 'Bags', 'Packets']
    : ['Tonnes', 'Bags', 'kg'];

  useEffect(() => {
    if (!availableUnits.includes(quantityUnit)) {
      setQuantityUnit(availableUnits[0]);
    }
  }, [productSlug, availableUnits, quantityUnit]);

  const clearFieldError = (field: keyof QuoteFieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateFields = (): QuoteFieldErrors => {
    const errors: QuoteFieldErrors = {};

    if (customerName.trim().length < 2) {
      errors.customerName = t('quote.errName');
    }
    if (!/^[0-9+\-\s()]{8,25}$/.test(phone.trim())) {
      errors.phone = t('quote.errPhone');
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      errors.email = t('quote.errEmail');
    }
    if (!selectedProduct) {
      errors.productSlug = t('quote.errProduct');
    }
    const parsedQty = Number(quantity.trim());
    if (!quantity.trim() || Number.isNaN(parsedQty) || parsedQty <= 0) {
      errors.quantity = t('quote.errQuantity');
    }
    if (!availableUnits.includes(quantityUnit)) {
      errors.quantityUnit = t('quote.errUnit');
    }
    if (deliveryLocation.trim().length < 2) {
      errors.deliveryLocation = t('quote.errLocation');
    }
    if (!privacyConsent) {
      errors.privacyConsent = t('quote.errConsent');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validationErrors = validateFields();
    setFieldErrors(validationErrors);

    const errorValues = Object.values(validationErrors);
    if (errorValues.length > 0) {
      setErrorMsg(errorValues[0] || t('quote.errorHeading'));
      return;
    }

    if (!selectedProduct) {
      setErrorMsg(t('quote.errProduct'));
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/quotes/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          companyName,
          phone,
          email,
          productSlug: selectedProduct.slug,
          productName: selectedProduct.name,
          quantity,
          quantityUnit,
          deliveryLocation,
          message,
          privacyConsent,
          honeypot
        })
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Could not validate quotation request.');
      }

      const { docId, quoteReference, sanitizedPayload } = data;

      try {
        await setDoc(doc(db, 'quote_requests', docId), {
          ...sanitizedPayload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.CREATE, `quote_requests/${docId}`);
        } catch {
          throw new Error(
            'Unable to save your quotation request right now. Please try again or contact us directly by phone or email.'
          );
        }
      }

      setSubmittedQuote({
        quoteReference,
        customerName: sanitizedPayload.customerName || customerName.trim(),
        companyName: sanitizedPayload.companyName || companyName.trim(),
        phone: sanitizedPayload.phone || phone.trim(),
        email: sanitizedPayload.email || email.trim(),
        productName: selectedProduct.name,
        productSlug: selectedProduct.slug,
        quantity: String(sanitizedPayload.quantity ?? quantity.trim()),
        quantityUnit: sanitizedPayload.quantityUnit || quantityUnit,
        deliveryLocation: sanitizedPayload.deliveryLocation || deliveryLocation.trim(),
        message: sanitizedPayload.message || message.trim()
      });

      setFieldErrors({});
      setCustomerName('');
      setCompanyName('');
      setPhone('');
      setEmail('');
      setQuantity('');
      setDeliveryLocation('');
      setMessage('');
      setPrivacyConsent(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SEOHead
        title={`Request a Quote | ${settings.companyName}`}
        description="Submit a product quotation request to Naveen Minerals."
      />

      {/* Page Header */}
      <section className="bg-[#FFF7ED]/90 border-b border-[#F3F4F6] py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold text-[#D97706] mb-2">
              {t('quote.badge')}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0F172A] mb-4">
              {t('quote.title')}
            </h1>
            <p className="text-base text-[#1F2937] leading-relaxed">
              {t('quote.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Main Quote Form & Sidebar */}
      <section className="py-12 lg:py-16 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <div className="lg:col-span-8">
              {submittedQuote ? (
                <div
                  role="status"
                  className="bg-[#FFFFFF] border border-[#D97706]/40 rounded-2xl p-6 sm:p-10 shadow-xs space-y-6"
                >
                  <div className="flex items-start gap-4 pb-5 border-b border-[#F3F4F6]">
                    <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] border border-[#D97706]/40 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-7 h-7 text-[#D97706]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#D97706] mb-1">
                        {t('quote.successBadge')}
                      </p>
                      <h2 className="font-display text-2xl font-bold text-[#0F172A]">
                        {t('quote.successTitle')}
                      </h2>
                      <p className="text-sm text-[#1F2937] mt-1">
                        {t('quote.successThanks').replace('{name}', submittedQuote.customerName)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#FFF7ED] border border-[#D97706]/30 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-[#1F2937] mb-1">
                        {t('quote.uniqueReference')}
                      </p>
                      <p className="font-mono-tabular text-xl sm:text-2xl font-bold text-[#0F172A]">
                        {submittedQuote.quoteReference}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-[#0F172A] text-[#FFFFFF] self-start sm:self-center">
                      {t('quote.initialStatus')}
                    </span>
                  </div>

                  <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-xl overflow-hidden">
                    <div className="bg-[#0F172A] px-5 py-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#FFFFFF]">
                        {t('quote.summaryTitle')}
                      </h3>
                    </div>
                    <dl className="divide-y divide-[#F3F4F6] text-xs sm:text-sm">
                      <div className="px-5 py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-1">
                        <dt className="font-semibold text-[#0F172A]">{t('quote.summaryProduct')}</dt>
                        <dd className="sm:col-span-2 text-[#1F2937] font-medium">
                          {submittedQuote.productName}
                        </dd>
                      </div>
                      <div className="px-5 py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-1">
                        <dt className="font-semibold text-[#0F172A]">{t('quote.summaryQuantity')}</dt>
                        <dd className="sm:col-span-2 font-mono-tabular font-semibold text-[#0F172A]">
                          {submittedQuote.quantity} {submittedQuote.quantityUnit}
                        </dd>
                      </div>
                      <div className="px-5 py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-1">
                        <dt className="font-semibold text-[#0F172A]">{t('quote.summaryLocation')}</dt>
                        <dd className="sm:col-span-2 text-[#1F2937]">
                          {submittedQuote.deliveryLocation}
                        </dd>
                      </div>
                      <div className="px-5 py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-1">
                        <dt className="font-semibold text-[#0F172A]">{t('quote.summaryContact')}</dt>
                        <dd className="sm:col-span-2 text-[#1F2937]">
                          {submittedQuote.customerName}
                          {submittedQuote.companyName ? ` (${submittedQuote.companyName})` : ''} ·{' '}
                          <span className="font-mono-tabular">{submittedQuote.phone}</span> ·{' '}
                          {submittedQuote.email}
                        </dd>
                      </div>
                      {submittedQuote.message && (
                        <div className="px-5 py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-1">
                          <dt className="font-semibold text-[#0F172A]">{t('quote.summaryAdditional')}</dt>
                          <dd className="sm:col-span-2 text-[#1F2937]">
                            {submittedQuote.message}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <p className="text-sm text-[#1F2937] leading-relaxed">
                    {t('quote.successFooterText').replace('{companyName}', settings.companyName)}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setSubmittedQuote(null)}
                      className="px-6 py-3 text-xs sm:text-sm font-semibold text-[#FFFFFF] bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg transition-colors cursor-pointer"
                    >
                      {t('quote.submitAnother')}
                    </button>
                    <Link
                      to={`/products/${submittedQuote.productSlug}`}
                      className="px-5 py-3 text-xs sm:text-sm font-semibold text-[#0F172A] bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-lg transition-colors"
                    >
                      {t('quote.viewDetailsName').replace('{name}', submittedQuote.productName)}
                    </Link>
                    <Link
                      to="/products"
                      className="px-5 py-3 text-xs sm:text-sm font-semibold text-[#0F172A] hover:text-[#DC2626] transition-colors"
                    >
                      {t('quote.browseAll')}
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="quote-hp">{t('quote.faxNumber')}</label>
                    <input
                      id="quote-hp"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  {/* Step Indicator Header */}
                  <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl p-5 sm:p-6 shadow-2xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-[#0F172A] text-[#FFFFFF] font-mono-tabular font-bold flex items-center justify-center shrink-0">
                          01
                        </span>
                        <div>
                          <p className="font-bold text-[#0F172A]">{t('quote.step1')}</p>
                          <p className="text-[#1F2937]/75">{t('quote.step1Desc')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-[#0F172A] text-[#FFFFFF] font-mono-tabular font-bold flex items-center justify-center shrink-0">
                          02
                        </span>
                        <div>
                          <p className="font-bold text-[#0F172A]">{t('quote.step2')}</p>
                          <p className="text-[#1F2937]/75">{t('quote.step2Desc')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-[#0F172A] text-[#FFFFFF] font-mono-tabular font-bold flex items-center justify-center shrink-0">
                          03
                        </span>
                        <div>
                          <p className="font-bold text-[#0F172A]">{t('quote.step3')}</p>
                          <p className="text-[#1F2937]/75">{t('quote.step3Desc')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {errorMsg && (
                    <div
                      role="alert"
                      className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-sm text-red-900"
                    >
                      <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-950">{t('quote.errorHeading')}</p>
                        <p className="mt-0.5">{errorMsg}</p>
                      </div>
                    </div>
                  )}

                  {/* SECTION 1 */}
                  <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex items-start gap-3.5 pb-4 border-b border-[#F3F4F6]">
                      <div className="w-9 h-9 rounded-lg bg-[#FFF7ED] border border-[#D97706]/30 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-5 h-5 text-[#D97706]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#D97706]">{t('quote.section01')}</p>
                        <h2 className="font-display text-xl font-bold text-[#0F172A]">
                          {t('quote.section1Title')}
                        </h2>
                        <p className="text-xs text-[#1F2937]/80 mt-0.5">
                          {t('quote.section1Desc')}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          htmlFor="quote-customerName"
                          className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                        >
                          {t('quote.customerName')}
                        </label>
                        <input
                          id="quote-customerName"
                          type="text"
                          required
                          maxLength={100}
                          value={customerName}
                          onChange={(e) => {
                            setCustomerName(e.target.value);
                            clearFieldError('customerName');
                          }}
                          placeholder={t('quote.customerNamePlaceholder')}
                          aria-invalid={Boolean(fieldErrors.customerName)}
                          className={`w-full px-3.5 py-2.5 text-sm text-[#1F2937] bg-[#FFFFFF] border rounded-lg focus:outline-none focus:ring-1 ${
                            fieldErrors.customerName
                              ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]'
                              : 'border-slate-300 focus:border-[#0F172A] focus:ring-[#0F172A]'
                          }`}
                        />
                        {fieldErrors.customerName && (
                          <p className="mt-1.5 text-xs font-medium text-[#DC2626]">
                            {fieldErrors.customerName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="quote-companyName"
                          className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                        >
                          {t('quote.companyName')}{' '}
                          <span className="font-normal text-[#1F2937]/70">
                            {t('quote.companyOptional')}
                          </span>
                        </label>
                        <input
                          id="quote-companyName"
                          type="text"
                          maxLength={120}
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder={t('quote.companyPlaceholder')}
                          className="w-full px-3.5 py-2.5 text-sm text-[#1F2937] bg-[#FFFFFF] border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          htmlFor="quote-phone"
                          className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                        >
                          {t('quote.phone')}
                        </label>
                        <input
                          id="quote-phone"
                          type="tel"
                          required
                          maxLength={25}
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            clearFieldError('phone');
                          }}
                          placeholder={t('quote.phonePlaceholder')}
                          aria-invalid={Boolean(fieldErrors.phone)}
                          className={`w-full px-3.5 py-2.5 text-sm font-mono-tabular text-[#1F2937] bg-[#FFFFFF] border rounded-lg focus:outline-none focus:ring-1 ${
                            fieldErrors.phone
                              ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]'
                              : 'border-slate-300 focus:border-[#0F172A] focus:ring-[#0F172A]'
                          }`}
                        />
                        {fieldErrors.phone && (
                          <p className="mt-1.5 text-xs font-medium text-[#DC2626]">
                            {fieldErrors.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="quote-email"
                          className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                        >
                          {t('quote.email')}
                        </label>
                        <input
                          id="quote-email"
                          type="email"
                          required
                          maxLength={120}
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            clearFieldError('email');
                          }}
                          placeholder={t('quote.emailPlaceholder')}
                          aria-invalid={Boolean(fieldErrors.email)}
                          className={`w-full px-3.5 py-2.5 text-sm text-[#1F2937] bg-[#FFFFFF] border rounded-lg focus:outline-none focus:ring-1 ${
                            fieldErrors.email
                              ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]'
                              : 'border-slate-300 focus:border-[#0F172A] focus:ring-[#0F172A]'
                          }`}
                        />
                        {fieldErrors.email && (
                          <p className="mt-1.5 text-xs font-medium text-[#DC2626]">
                            {fieldErrors.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2 */}
                  <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex items-start gap-3.5 pb-4 border-b border-[#F3F4F6]">
                      <div className="w-9 h-9 rounded-lg bg-[#FFF7ED] border border-[#D97706]/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Package className="w-5 h-5 text-[#D97706]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#D97706]">{t('quote.section02')}</p>
                        <h2 className="font-display text-xl font-bold text-[#0F172A]">
                          {t('quote.section2Title')}
                        </h2>
                        <p className="text-xs text-[#1F2937]/80 mt-0.5">
                          {t('quote.section2Desc')}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="quote-product"
                        className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                      >
                        {t('quote.selectProductLabel')}
                      </label>
                      <select
                        id="quote-product"
                        value={productSlug}
                        onChange={(e) => {
                          setProductSlug(e.target.value);
                          clearFieldError('productSlug');
                        }}
                        className="w-full px-3.5 py-2.5 text-sm font-medium text-[#0F172A] bg-[#FFFFFF] border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                      >
                        {products.map((prod) => {
                          const translatedName = t(`prod.${prod.slug}.name`) !== `prod.${prod.slug}.name` ? t(`prod.${prod.slug}.name`) : prod.name;
                          const translatedCat = t(`prod.${prod.slug}.cat`) !== `prod.${prod.slug}.cat` ? t(`prod.${prod.slug}.cat`) : prod.category;
                          return (
                            <option key={prod.id} value={prod.slug}>
                              {translatedName} ({translatedCat})
                            </option>
                          );
                        })}
                      </select>
                      {fieldErrors.productSlug && (
                        <p className="mt-1.5 text-xs font-medium text-[#DC2626]">
                          {fieldErrors.productSlug}
                        </p>
                      )}
                    </div>

                    {selectedProduct && (
                      <div className="bg-[#FFF7ED]/80 border border-[#F3F4F6] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-28 sm:w-32 shrink-0 rounded-lg overflow-hidden border border-[#F3F4F6] bg-[#FFFFFF]">
                          <MineralImage
                            src={selectedProduct.mainImage}
                            alt={t(`prod.${selectedProduct.slug}.name`, selectedProduct.name)}
                            aspectClassName="aspect-[4/3]"
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#D97706]">
                            <span>{t(`prod.${selectedProduct.slug}.cat`) !== `prod.${selectedProduct.slug}.cat` ? t(`prod.${selectedProduct.slug}.cat`) : selectedProduct.category}</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#0F172A]">
                              {t('quote.supportedUnits')} {availableUnits.join(', ')}
                            </span>
                          </div>
                          <h3 className="font-display text-base font-bold text-[#0F172A]">
                            {t(`prod.${selectedProduct.slug}.name`) !== `prod.${selectedProduct.slug}.name` ? t(`prod.${selectedProduct.slug}.name`) : selectedProduct.name}
                          </h3>
                          <p className="text-xs text-[#1F2937] leading-relaxed line-clamp-2">
                            {t(`prod.${selectedProduct.slug}.shortDesc`) !== `prod.${selectedProduct.slug}.shortDesc` ? t(`prod.${selectedProduct.slug}.shortDesc`) : selectedProduct.shortDescription}
                          </p>
                          <div className="pt-1">
                            <Link
                              to={`/products/${selectedProduct.slug}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F172A] hover:text-[#DC2626] transition-colors"
                            >
                              <span>{t('quote.viewProductDetails')}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
                      <div className="sm:col-span-6">
                        <label
                          htmlFor="quote-quantity"
                          className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                        >
                          {t('quote.requiredQuantity')}
                        </label>
                        <input
                          id="quote-quantity"
                          type="number"
                          min="1"
                          step="any"
                          required
                          value={quantity}
                          onChange={(e) => {
                            setQuantity(e.target.value);
                            clearFieldError('quantity');
                          }}
                          placeholder={t('quote.quantityPlaceholder').replace('{unit}', quantityUnit)}
                          aria-invalid={Boolean(fieldErrors.quantity)}
                          className={`w-full px-3.5 py-2.5 text-sm font-mono-tabular text-[#1F2937] bg-[#FFFFFF] border rounded-lg focus:outline-none focus:ring-1 ${
                            fieldErrors.quantity
                              ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]'
                              : 'border-slate-300 focus:border-[#0F172A] focus:ring-[#0F172A]'
                          }`}
                        />
                        {fieldErrors.quantity && (
                          <p className="mt-1.5 text-xs font-medium text-[#DC2626]">
                            {fieldErrors.quantity}
                          </p>
                        )}
                      </div>

                      <div className="sm:col-span-6">
                        <label
                          htmlFor="quote-unit"
                          className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                        >
                          {t('quote.quantityUnitLabel')}
                        </label>
                        <select
                          id="quote-unit"
                          value={quantityUnit}
                          onChange={(e) => {
                            setQuantityUnit(e.target.value);
                            clearFieldError('quantityUnit');
                          }}
                          className="w-full px-3.5 py-2.5 text-sm text-[#1F2937] bg-[#FFFFFF] border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                        >
                          {availableUnits.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] text-[#1F2937]/75">
                            {t('quote.availableUnits')}
                          </span>
                          {availableUnits.map((u) => (
                            <button
                              key={u}
                              type="button"
                              onClick={() => {
                                setQuantityUnit(u);
                                clearFieldError('quantityUnit');
                              }}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                                quantityUnit === u
                                  ? 'bg-[#0F172A] text-[#FFFFFF] border-[#0F172A]'
                                  : 'bg-[#F3F4F6] text-[#1F2937] border-transparent hover:bg-[#E5E7EB]'
                              }`}
                            >
                              {u}
                            </button>
                          ))}
                        </div>
                        {fieldErrors.quantityUnit && (
                          <p className="mt-1.5 text-xs font-medium text-[#DC2626]">
                            {fieldErrors.quantityUnit}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3 */}
                  <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex items-start gap-3.5 pb-4 border-b border-[#F3F4F6]">
                      <div className="w-9 h-9 rounded-lg bg-[#FFF7ED] border border-[#D97706]/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Truck className="w-5 h-5 text-[#D97706]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#D97706]">{t('quote.section03')}</p>
                        <h2 className="font-display text-xl font-bold text-[#0F172A]">
                          {t('quote.section3Title')}
                        </h2>
                        <p className="text-xs text-[#1F2937]/80 mt-0.5">
                          {t('quote.section3Desc')}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="quote-location"
                        className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                      >
                        {t('quote.deliveryLocationLabel')}
                      </label>
                      <input
                        id="quote-location"
                        type="text"
                        required
                        maxLength={200}
                        value={deliveryLocation}
                        onChange={(e) => {
                          setDeliveryLocation(e.target.value);
                          clearFieldError('deliveryLocation');
                        }}
                        placeholder={t('quote.deliveryPlaceholder')}
                        aria-invalid={Boolean(fieldErrors.deliveryLocation)}
                        className={`w-full px-3.5 py-2.5 text-sm text-[#1F2937] bg-[#FFFFFF] border rounded-lg focus:outline-none focus:ring-1 ${
                          fieldErrors.deliveryLocation
                            ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]'
                            : 'border-slate-300 focus:border-[#0F172A] focus:ring-[#0F172A]'
                        }`}
                      />
                      {fieldErrors.deliveryLocation && (
                        <p className="mt-1.5 text-xs font-medium text-[#DC2626]">
                          {fieldErrors.deliveryLocation}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="quote-message"
                        className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                      >
                        {t('quote.additionalRequirements')}{' '}
                        <span className="font-normal text-[#1F2937]/70">
                          {t('quote.companyOptional')}
                        </span>
                      </label>
                      <textarea
                        id="quote-message"
                        rows={4}
                        maxLength={1500}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t('quote.additionalPlaceholder')}
                        className="w-full px-3.5 py-2.5 text-sm text-[#1F2937] bg-[#FFFFFF] border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                      />
                    </div>

                    <div className="bg-[#FFF7ED]/70 border border-[#F3F4F6] rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <input
                          id="quote-consent"
                          type="checkbox"
                          checked={privacyConsent}
                          onChange={(e) => {
                            setPrivacyConsent(e.target.checked);
                            clearFieldError('privacyConsent');
                          }}
                          aria-invalid={Boolean(fieldErrors.privacyConsent)}
                          className="mt-1 w-4 h-4 rounded border-slate-300 text-[#0F172A] focus:ring-[#0F172A]"
                        />
                        <label
                          htmlFor="quote-consent"
                          className="text-xs text-[#1F2937] leading-relaxed"
                        >
                          {t('quote.consentText').replace('{companyName}', settings.companyName)}
                        </label>
                      </div>
                      {fieldErrors.privacyConsent && (
                        <p className="mt-2 text-xs font-medium text-[#DC2626]">
                          {fieldErrors.privacyConsent}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center justify-center px-8 py-4 text-sm font-semibold text-[#FFFFFF] bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        {submitting ? t('quote.submittingBtn') : t('quote.submitBtn')}
                      </button>
                      <p className="text-xs text-[#1F2937]/75">
                        {t('quote.requiredFieldsNote')}
                      </p>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
              <div className="bg-[#FFF7ED] border border-[#F3F4F6] rounded-2xl p-6 space-y-5">
                <div>
                  <p className="text-xs font-semibold text-[#D97706] mb-1">
                    {t('quote.sideTitle')}
                  </p>
                  <h3 className="font-display text-lg font-bold text-[#0F172A]">
                    {t('quote.sideHeading')}
                  </h3>
                </div>
                <p className="text-xs text-[#1F2937] leading-relaxed">
                  {t('quote.sideDesc').replace('{companyName}', settings.companyName)}
                </p>

                <div className="space-y-4 text-sm text-[#1F2937]">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#D97706] shrink-0 mt-1" />
                    <span>{settings.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#D97706] shrink-0" />
                    <a
                      href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                      className="font-mono-tabular font-semibold text-[#0F172A] hover:text-[#DC2626]"
                    >
                      {settings.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#D97706] shrink-0" />
                    <a
                      href={`mailto:${settings.email}`}
                      className="font-semibold text-[#0F172A] hover:text-[#DC2626] break-all"
                    >
                      {settings.email}
                    </a>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#0F172A]/10 space-y-2 text-xs text-[#1F2937]">
                  <p className="font-semibold text-[#0F172A]">{t('quote.howWorks')}</p>
                  <ul className="space-y-1.5 text-[#1F2937]/90">
                    <li>{t('quote.how1')}</li>
                    <li>{t('quote.how2')}</li>
                    <li>{t('quote.how3')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
