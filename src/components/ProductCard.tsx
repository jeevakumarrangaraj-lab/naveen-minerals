import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductRecord } from '../types';
import { MineralImage } from './MineralImage';
import { useLanguage } from '../context/LanguageContext';

interface ProductCardProps {
  product: ProductRecord;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { t } = useLanguage();
  const translatedName = t(`prod.${product.slug}.name`, product.name);
  const translatedCategory = t(`prod.${product.slug}.cat`, product.category);
  const translatedShortDesc = t(`prod.${product.slug}.shortDesc`, product.shortDescription);
  const translatedApps = product.commonApplications.map((app, idx) => t(`prod.${product.slug}.app${idx+1}`, app));

  return (
    <article className="group bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-150 flex flex-col h-full">
      <Link
        to={`/products/${product.slug}`}
        className="block overflow-hidden bg-[#111318] rounded-t-xl focus-visible:outline-2 focus-visible:outline-[#0F172A]"
      >
        <MineralImage
          src={product.mainImage}
          productSlug={product.slug}
          alt={`${translatedName} – Naveen Minerals`}
          title={translatedName}
          aspectClassName="aspect-[4/3]"
          className="group-hover:scale-[1.02] transition-transform duration-200"
        />
      </Link>

      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          {/* Clean unboxed metadata kicker per Zero-Pill rule */}
          <div className="text-xs font-semibold text-[#D97706] mb-1.5">
            <span>{translatedCategory}</span>
            <span aria-hidden="true" className="mx-1.5 text-[#1F2937]/40">·</span>
            <span className="text-[#1F2937]/70">{t('productCard.enquiryCatalogue', 'Enquiry Catalogue')}</span>
          </div>

          <h3 className="font-display text-xl font-bold text-[#0F172A] mb-2">
            <Link
              to={`/products/${product.slug}`}
              className="hover:text-[#DC2626] transition-colors"
            >
              {translatedName}
            </Link>
          </h3>

          <p className="text-sm text-[#1F2937] leading-relaxed mb-4">
            {translatedShortDesc}
          </p>

          <div className="border-t border-[#F3F4F6] pt-3.5 mb-5">
            <p className="text-xs font-semibold text-[#0F172A] mb-2">
              {t('productCard.commonApps', 'Common Applications')}:
            </p>
            <ul className="space-y-1 text-xs text-[#1F2937]">
              {translatedApps.slice(0, 4).map((app, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span aria-hidden="true" className="text-[#D97706] font-bold">·</span>
                  <span>{app}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Aligned Action Buttons */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          <Link
            to={`/products/${product.slug}`}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-[#0F172A] bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#0F172A]"
          >
            <span>{t('productCard.viewDetails', 'View Details')}</span>
          </Link>
          <Link
            to={`/customer/enquire/${product.slug}`}
            className="inline-flex items-center justify-center px-3.5 py-2.5 text-xs font-semibold text-[#FFFFFF] bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#0F172A]"
          >
            {t('productCard.enquire', 'Enquire Pricing')}
          </Link>
        </div>
      </div>
    </article>
  );
};
