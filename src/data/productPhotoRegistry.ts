export interface ProductPhotoMapping {
  slug: string;
  productName: string;
  category: string;
  targetAssetPath: string;
  /**
   * Set to true once the owner's real photograph has been supplied and placed
   * at `targetAssetPath` (or mapped to an uploaded asset path).
   */
  photoSupplied: boolean;
}

/**
 * Canonical mapping of the 7 Naveen Minerals products to their real photograph paths.
 * Do not substitute generated images or unrelated stock photos when `photoSupplied` is false.
 */
export const PRODUCT_PHOTO_REGISTRY: Record<string, ProductPhotoMapping> = {
  'limestone-powder': {
    slug: 'limestone-powder',
    productName: 'Limestone Powder',
    category: 'Mineral Powders',
    targetAssetPath: '/assets/aistudio/limestone-powder_0e00f61c.png',
    photoSupplied: true,
  },
  'calcite-powder': {
    slug: 'calcite-powder',
    productName: 'Calcite Powder',
    category: 'Mineral Powders',
    targetAssetPath: '/assets/aistudio/calcite-powder_31a66b0b.png',
    photoSupplied: true,
  },
  'dolomite-powder': {
    slug: 'dolomite-powder',
    productName: 'Dolomite Powder',
    category: 'Mineral Powders',
    targetAssetPath: '/assets/aistudio/dolomite-powder_c221f136.png',
    photoSupplied: true,
  },
  'feldspar-powder': {
    slug: 'feldspar-powder',
    productName: 'Feldspar Powder',
    category: 'Mineral Powders',
    targetAssetPath: '/assets/aistudio/feldspar-powder_ba2e11f3.png',
    photoSupplied: true,
  },
  'stone-grit': {
    slug: 'stone-grit',
    productName: 'Stone Grit',
    category: 'Crushed Stone & Chips',
    targetAssetPath: '/assets/aistudio/stone-grit_6e5e324b.png',
    photoSupplied: true,
  },
  'quartz-chips': {
    slug: 'quartz-chips',
    productName: 'Quartz Chips',
    category: 'Crushed Stone & Chips',
    targetAssetPath: '/assets/aistudio/quartz-chips_26c3984d.png',
    photoSupplied: true,
  },
  'kolam-powder': {
    slug: 'kolam-powder',
    productName: 'Kolam Powder (Rangoli Powder)',
    category: 'Decorative Powder',
    targetAssetPath: '/assets/aistudio/kolam-powder_45805643.png',
    photoSupplied: true,
  },
};

/**
 * Resolves a product slug or image path to its canonical ProductPhotoMapping entry if it matches one of the 7 products.
 */
export function getProductPhotoMapping(slugOrSrc?: string, titleOrAlt?: string): ProductPhotoMapping | null {
  if (slugOrSrc) {
    const clean = slugOrSrc.split('?')[0].trim().toLowerCase();
    if (PRODUCT_PHOTO_REGISTRY[clean]) {
      return PRODUCT_PHOTO_REGISTRY[clean];
    }
    for (const entry of Object.values(PRODUCT_PHOTO_REGISTRY)) {
      if (
        clean.endsWith(`/${entry.slug}.jpg`) ||
        clean.endsWith(`/${entry.slug}.png`) ||
        clean.endsWith(`/${entry.slug}.webp`) ||
        clean.endsWith(`/${entry.slug}.svg`)
      ) {
        return entry;
      }
    }
  }

  if (titleOrAlt) {
    const lowerTitle = titleOrAlt.toLowerCase();
    for (const entry of Object.values(PRODUCT_PHOTO_REGISTRY)) {
      if (
        lowerTitle.includes(entry.productName.toLowerCase()) ||
        lowerTitle.includes(entry.slug.replace('-', ' '))
      ) {
        return entry;
      }
    }
  }

  return null;
}
