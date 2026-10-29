import React from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const FloatingWhatsApp: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();

  // Do not render on admin dashboard or admin login
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const phoneNumber = '918884852288';
  const defaultMessage = 'Hello Naveen Minerals, I would like to enquire about your mineral products and pricing.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      {/* Tooltip on hover for desktop */}
      <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0F172A] text-white text-xs font-semibold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden sm:block">
        {t('whatsapp.chat', 'Chat on WhatsApp')}
      </div>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('whatsapp.aria', 'Chat with Naveen Minerals on WhatsApp')}
        className="flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
      >
        <svg
          viewBox="0 0 32 32"
          className="w-8 h-8 fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.825.827 5.46 2.257 7.685L2.05 29.95l6.517-1.708A13.924 13.924 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.45c-2.312 0-4.502-.622-6.38-1.704l-.458-.27-4.743 1.243 1.267-4.625-.298-.475A11.458 11.458 0 1 1 16 27.45zm6.54-8.583c-.358-.179-2.115-1.044-2.443-1.163-.328-.119-.567-.179-.806.179-.239.358-.925 1.163-1.134 1.402-.209.239-.418.268-.776.089-.358-.179-1.511-.557-2.879-1.777-1.063-.948-1.781-2.119-1.99-2.477-.209-.358-.022-.552.157-.731.161-.161.358-.418.537-.627.179-.209.239-.358.358-.597.12-.239.06-.448-.03-.627-.089-.179-.806-1.942-1.104-2.66-.291-.702-.587-.607-.806-.618l-.687-.012c-.239 0-.627.089-.955.448s-1.254 1.223-1.254 2.984c0 1.761 1.284 3.461 1.463 3.7.179.239 2.525 3.852 6.12 5.399.855.369 1.522.59 2.041.755.859.273 1.641.234 2.257.142.69-.103 2.115-.865 2.414-1.701.299-.836.299-1.551.21-1.701-.09-.15-.328-.239-.686-.418z" />
        </svg>
      </a>
    </div>
  );
};
