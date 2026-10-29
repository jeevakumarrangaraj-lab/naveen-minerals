import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { getProductPhotoMapping } from '../data/productPhotoRegistry';

interface MineralImageProps {
  src: string;
  alt: string;
  title?: string;
  productSlug?: string;
  className?: string;
  aspectClassName?: string;
  priority?: boolean;
  fit?: 'contain' | 'cover';
}

export const MineralImage: React.FC<MineralImageProps> = ({
  src,
  alt,
  title,
  productSlug,
  className = '',
  aspectClassName = 'aspect-[4/3]',
  priority = false,
  fit,
}) => {
  const [loadFailed, setLoadFailed] = useState(false);

  const normalizedSrc = src;

  const mapping = getProductPhotoMapping(productSlug || normalizedSrc, title || alt);

  // Check if a custom uploaded URL (e.g., data:, https:, or /assets/aistudio/) was provided
  const isCustomUploadedPhoto =
    Boolean(normalizedSrc) &&
    !normalizedSrc.startsWith('/assets/minerals/') &&
    (normalizedSrc.startsWith('/assets/aistudio/') ||
      normalizedSrc.startsWith('http://') ||
      normalizedSrc.startsWith('https://') ||
      normalizedSrc.startsWith('data:image/'));

  // Determine whether a real photograph is available to render
  const hasRealPhotograph = isCustomUploadedPhoto
    ? !loadFailed
    : mapping
    ? mapping.photoSupplied && !loadFailed
    : Boolean(normalizedSrc) && !loadFailed;

  const resolvedSrc = isCustomUploadedPhoto
    ? normalizedSrc
    : mapping
    ? mapping.targetAssetPath
    : normalizedSrc;

  useEffect(() => {
    setLoadFailed(false);
  }, [src, productSlug]);

  // Default to object-contain for product photographs on #111318 so real mounds are never reshaped or cropped,
  // and object-cover for editorial banners such as the hero stockpile photograph.
  const objectFitClass =
    fit === 'contain'
      ? 'object-contain'
      : fit === 'cover'
      ? 'object-cover'
      : mapping
      ? 'object-contain p-2 sm:p-3'
      : 'object-cover';

  return (
    <div
      className={`relative overflow-hidden bg-[#111318] select-none ${aspectClassName} ${className}`}
      title={title || alt}
    >
      {hasRealPhotograph ? (
        <img
          src={resolvedSrc}
          alt={alt}
          referrerPolicy="no-referrer"
          loading={priority ? 'eager' : 'lazy'}
          onError={() => {
            if (!loadFailed) setLoadFailed(true);
          }}
          className={`w-full h-full object-center transition-transform duration-200 ${objectFitClass}`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-5 text-center bg-[#111318]">
          <div className="w-11 h-11 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mb-3">
            <Camera className="w-5 h-5 text-[#D4A72C]" />
          </div>
          <p className="font-display text-sm sm:text-base font-bold text-[#FFFFFF] tracking-tight">
            {mapping ? mapping.productName : title || alt}
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#F59E0B] mt-1">
            Real Product Photograph Pending Upload
          </p>
          <p className="text-[11px] text-slate-400 mt-1.5 max-w-[240px] leading-snug">
            Prepared for authentic owner photograph ({mapping ? mapping.slug : 'mineral-photo'})
          </p>
        </div>
      )}
    </div>
  );
};
