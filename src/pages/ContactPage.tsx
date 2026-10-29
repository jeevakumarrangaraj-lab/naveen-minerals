import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAppData } from '../context/AppDataContext';
import { useLanguage } from '../context/LanguageContext';
import { SEOHead } from '../components/SEOHead';

export const ContactPage: React.FC = () => {
  const { settings } = useAppData();
  const { t } = useLanguage();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Product Enquiry');
  const [message, setMessage] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (fullName.trim().length < 2) {
      setErrorMsg(t('contact.errFullName', 'Please enter your full name.'));
      return;
    }
    if (!/^[0-9+\-\s()]{8,25}$/.test(phone.trim())) {
      setErrorMsg(t('contact.errPhone', 'Please enter a valid contact phone number.'));
      return;
    }
    if (email.trim().length > 0 && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setErrorMsg(t('contact.errEmail', 'Please enter a valid email address or leave the email field blank.'));
      return;
    }
    if (message.trim().length < 5) {
      setErrorMsg(t('contact.errMessage', 'Please enter your message (at least 5 characters).'));
      return;
    }
    if (!privacyConsent) {
      setErrorMsg(t('contact.errConsent', 'Please confirm the privacy consent checkbox to submit your enquiry.'));
      return;
    }

    setSubmitting(true);
    try {
      // 1. Validate & rate-limit through trusted backend endpoint
      const response = await fetch('/api/contact/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          email,
          subject,
          message,
          privacyConsent,
          honeypot
        })
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Could not validate your enquiry. Please check your inputs.');
      }

      const { docId, sanitizedPayload } = data;

      // 2. Store securely in Firestore /contact_messages
      try {
        await setDoc(doc(db, 'contact_messages', docId), {
          ...sanitizedPayload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `contact_messages/${docId}`);
      }

      setSubmittedSuccess(true);
      setFullName('');
      setPhone('');
      setEmail('');
      setSubject('Product Enquiry');
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
        title={`Contact Us | ${settings.companyName}`}
        description={`Contact ${settings.companyName} in Namakkal, Tamil Nadu at ${settings.phone} or ${settings.email} for mineral product enquiries and quotations.`}
      />

      {/* Header Section — Soft Cream #FFF7ED */}
      <section className="relative overflow-hidden bg-[#FFF7ED]/85 border-b border-[#F3F4F6] py-12 lg:py-16">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold text-[#D97706] mb-2">
              {t('contact.badge', 'Direct Communication')}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0F172A] mb-4">
              {t('contact.title', 'Contact')} {settings.companyName}
            </h1>
            <p className="text-base text-[#1F2937] leading-relaxed">
              {t('contact.subtitle', 'Get in touch with our team in Namakkal for product information, material grade discussions, or general enquiries. For specific product quantities, you can also use our dedicated quotation form.')}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Split — Pure White #FFFFFF */}
      <section className="py-14 lg:py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Business Details (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#FFF7ED] border border-[#F3F4F6] rounded-2xl p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-[#0F172A]">
                    {settings.companyName}
                  </h2>
                  <p className="text-xs font-semibold text-[#D97706] mt-0.5">
                    {settings.tagline}
                  </p>
                </div>

                <div className="space-y-5 text-sm text-[#1F2937]">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-[#FFFFFF] border border-[#F3F4F6] flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-[#0F172A]" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-[#0F172A]">
                        {t('contact.businessAddress', 'Business Address')}
                      </p>
                      <p className="mt-1 leading-relaxed">
                        {settings.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-[#FFFFFF] border border-[#F3F4F6] flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-[#0F172A]" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-[#0F172A]">
                        {t('contact.phoneLabel', 'Phone')}
                      </p>
                      <a
                        href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                        className="inline-block mt-1 font-mono-tabular font-semibold text-[#0F172A] hover:text-[#DC2626] underline decoration-[#0F172A]/30 transition-colors"
                      >
                        {settings.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-[#FFFFFF] border border-[#F3F4F6] flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-[#0F172A]" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-[#0F172A]">
                        {t('contact.emailLabel', 'Email')}
                      </p>
                      <a
                        href={`mailto:${settings.email}`}
                        className="inline-block mt-1 font-semibold text-[#0F172A] hover:text-[#DC2626] underline decoration-[#0F172A]/30 transition-colors break-all"
                      >
                        {settings.email}
                      </a>
                    </div>
                  </div>
                </div>

                {settings.showGstinPublicly && settings.gstinVerified && settings.gstin && (
                  <div className="pt-4 border-t border-[#0F172A]/10 text-xs text-[#1F2937]">
                    <span className="font-semibold text-[#0F172A]">GSTIN: </span>
                    <span className="font-mono-tabular">{settings.gstin}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-[#0F172A]/10">
                  <p className="text-xs text-[#1F2937] mb-3">
                    {t('contact.quotePrompt', 'Looking for a formal quotation for a specific mineral product and quantity?')}
                  </p>
                  <Link
                    to="/request-quote"
                    className="inline-flex items-center justify-center w-full px-4 py-2.5 text-xs font-semibold text-[#FFFFFF] bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg transition-colors"
                  >
                    {t('contact.quoteBtn', 'Go to Request a Quote Form')}
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Enquiry Form (7 cols) — Pure White #FFFFFF */}
            <div className="lg:col-span-7">
              <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl p-6 sm:p-10 shadow-xs">
                <h2 className="font-display text-2xl font-bold text-[#0F172A] mb-2">
                  {t('contact.formTitle', 'Send Us an Enquiry')}
                </h2>
                <p className="text-sm text-[#1F2937] mb-6">
                  {t('contact.formSubtitle', 'Complete the form below and our team will get back to you. Fields marked with * are required.')}
                </p>

                {submittedSuccess && (
                  <div
                    role="status"
                    className="mb-6 bg-[#FFF7ED] border border-[#D97706]/40 rounded-xl p-5 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                    <div className="text-sm text-[#0F172A]">
                      <p className="font-bold">{t('contact.formThanks', 'Thank you — your enquiry has been recorded.')}</p>
                      <p className="text-[#1F2937] mt-1">
                        {t('contact.formReview', 'Our team at {companyName} will review your message and contact you via phone or email.').replace('{companyName}', settings.companyName)}
                      </p>
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div
                    role="alert"
                    className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-sm text-red-900"
                  >
                    <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* Hidden spam honeypot field */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="contact-website-hp">{t('contact.companyWebsite', 'Company Website')}</label>
                    <input
                      id="contact-website-hp"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="contact-fullName"
                        className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                      >
                        {t('contact.fullName', 'Full Name *')}
                      </label>
                      <input
                        id="contact-fullName"
                        type="text"
                        required
                        maxLength={100}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t('contact.namePlaceholder', 'Your full name')}
                        className="w-full px-3.5 py-2.5 text-sm text-[#1F2937] bg-[#FFFFFF] border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-phone"
                        className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                      >
                        {t('contact.phoneNumber', 'Phone Number *')}
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        required
                        maxLength={25}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t('contact.phonePlaceholder', 'e.g. 9876543210')}
                        className="w-full px-3.5 py-2.5 text-sm text-[#1F2937] bg-[#FFFFFF] border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                      >
                        {t('contact.emailOptional', 'Email Address (Optional)')}
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        maxLength={120}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('contact.emailPlaceholder', 'you@example.com')}
                        className="w-full px-3.5 py-2.5 text-sm text-[#1F2937] bg-[#FFFFFF] border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-subject"
                        className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                      >
                        {t('contact.subjectLabel', 'Subject or Enquiry Type *')}
                      </label>
                      <select
                        id="contact-subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm text-[#1F2937] bg-[#FFFFFF] border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                      >
                        <option value="Product Enquiry">{t('contact.optProduct', 'Product Enquiry')}</option>
                        <option value="Material Grade Discussion">{t('contact.optGrade', 'Material Grade Discussion')}</option>
                        <option value="Bulk Supply Discussion">{t('contact.optBulk', 'Bulk Supply Discussion')}</option>
                        <option value="Kolam Powder Enquiry">{t('contact.optKolam', 'Kolam Powder Enquiry')}</option>
                        <option value="General Business Enquiry">{t('contact.optGeneral', 'General Business Enquiry')}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                    >
                      {t('contact.messageLabel', 'Message *')}
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      maxLength={1500}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t('contact.messagePlaceholder', 'Please describe your requirement or question...')}
                      className="w-full px-3.5 py-2.5 text-sm text-[#1F2937] bg-[#FFFFFF] border border-slate-300 rounded-lg focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                    />
                  </div>

                  <div className="flex items-start gap-2.5">
                    <input
                      id="contact-consent"
                      type="checkbox"
                      checked={privacyConsent}
                      onChange={(e) => setPrivacyConsent(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-[#0F172A] focus:ring-[#0F172A]"
                    />
                    <label htmlFor="contact-consent" className="text-xs text-[#1F2937] leading-relaxed">
                      {t('contact.consentLabel', 'I consent to {companyName} storing my contact details and message to respond to this enquiry. *').replace('{companyName}', settings.companyName)}
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-[#FFFFFF] bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                  >
                    {submitting ? t('contact.submitting', 'Submitting Enquiry...') : t('contact.submitBtn', 'Submit Enquiry')}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
