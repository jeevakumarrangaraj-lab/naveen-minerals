import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SEOHead } from '../components/SEOHead';

export const NotFoundPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-[#FFFFFF] min-h-[70vh] flex items-center justify-center px-4 py-16">
      <SEOHead
        title={t('notfound.title', '404 – Page Not Found | Naveen Minerals')}
        description={t('notfound.desc', 'The page you requested could not be found on the Naveen Minerals website.')}
      />
      <div className="max-w-lg w-full bg-[#FFF7ED] border border-[#F3F4F6] rounded-2xl p-8 sm:p-10 text-center space-y-5">
        <p className="font-mono-tabular text-xs font-bold text-[#D97706]">
          {t('notfound.errCode', 'ERROR 404')}
        </p>
        <h1 className="font-display text-3xl font-bold text-[#0F172A]">
          {t('notfound.title', 'Page Not Found')}
        </h1>
        <p className="text-sm text-[#1F2937] leading-relaxed">
          {t('notfound.desc', 'The page you are looking for may have been moved or does not exist. Use the links below to explore our mineral product catalogue or request a quotation.')}
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] bg-[#0F172A] hover:bg-[#1E293B] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('notfound.homeBtn', 'Back to Home')}</span>
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold text-[#0F172A] bg-[#FFFFFF] border border-[#0F172A]/15 hover:bg-[#F3F4F6] rounded-lg transition-colors"
          >
            {t('notfound.viewProducts', 'View Products')}
          </Link>
          <Link
            to="/request-quote"
            className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg transition-colors"
          >
            {t('nav.requestQuote', 'Request a Quote')}
          </Link>
        </div>
      </div>
    </div>
  );
};
