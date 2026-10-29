import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { useLanguage } from '../context/LanguageContext';
import { SEOHead } from '../components/SEOHead';
import { ProductCard } from '../components/ProductCard';

export const ProductsPage: React.FC = () => {
  const { products, settings, loadingCatalogue } = useAppData();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: t('cat.all', 'All Products') },
    { id: 'Mineral Powders', label: t('cat.powders', 'Mineral Powders') },
    { id: 'Crushed Stone & Chips', label: t('cat.granules', 'Stone Grit & Quartz Chips') },
    { id: 'Decorative Powder', label: t('cat.decorative', 'Decorative Kolam Powder') },
  ];

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen">
      <SEOHead
        title={`Our Products | ${settings.companyName}`}
        description="Explore Naveen Minerals' seven-product catalogue: Limestone Powder, Calcite Powder, Dolomite Powder, Feldspar Powder, Stone Grit, Quartz Chips, and Kolam Powder."
      />

      {/* Page Header — Soft Cream #FFF7ED with Midnight Navy Headings */}
      <section className="bg-[#FFF7ED]/85 border-b border-[#F3F4F6] py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold text-[#D97706] mb-2">
              {settings.companyName} {t('products.catalogue', 'Catalogue')}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0F172A] mb-4">
              {t('products.title', 'Our Mineral Products Catalogue')}
            </h1>
            <p className="text-base text-[#1F2937] leading-relaxed">
              {t('products.desc', 'We supply processed mineral powders, stone granules, quartz chips, and traditional decorative kolam powder. Select any product below to review its common applications or request a quotation tailored to your required quantity and delivery location.')}
            </p>
          </div>

          {/* Interactive Category Filter Controls (functional buttons per Frontend Design Skill) */}
          <div className="mt-8 inline-flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F3F4F6] rounded-xl">
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#0F172A] text-[#FFFFFF] shadow-xs'
                      : 'text-[#1F2937] hover:text-[#0F172A] hover:bg-white/60'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Grid — Pure White Theme with Subtle Page Watermark */}
      <section className="relative overflow-hidden py-14 lg:py-20 bg-transparent">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loadingCatalogue ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-96 rounded-xl bg-[#F3F4F6] animate-pulse border border-[#F3F4F6]"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-[#FFF7ED] rounded-xl border border-[#F3F4F6] p-8">
              <h2 className="font-display text-xl font-bold text-[#0F172A] mb-2">
                {t('products.noProducts', 'No products found in this category')}
              </h2>
              <p className="text-sm text-[#1F2937] mb-6">
                {t('products.resetFilter', 'Reset the category filter to view all mineral products in our catalogue.')}
              </p>
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="px-4 py-2 text-xs font-semibold text-[#FFFFFF] bg-[#0F172A] rounded-lg"
              >
                {t('products.showAll', 'Show All Products')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
