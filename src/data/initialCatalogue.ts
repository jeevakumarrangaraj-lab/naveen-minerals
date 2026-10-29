import { BusinessSettings, ProductRecord, ApplicationCategoryItem } from '../types';

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  companyName: 'Naveen Minerals',
  tagline: 'Quality Materials. Reliable Supply.',
  address: '4/47, Kadakalpudar, Veeasanam, Namakkal, Tamil Nadu – 637405, India',
  email: 'usnnaveen@gmail.com',
  phone: '8884855288',
  introText:
    'Explore our range of mineral powders, stone grit and quartz products. Contact our team for product information and quotations.',
  aboutText:
    'Naveen Minerals is a mineral products business based in Namakkal, Tamil Nadu. Our catalogue brings together mineral powders, stone materials and quartz products for customers seeking product information and quotations. Contact us to discuss your requirements and obtain a quotation.',
  gstin: '',
  gstinVerified: false,
  showGstinPublicly: false
};

export const INITIAL_PRODUCTS: ProductRecord[] = [
  {
    id: 'limestone-powder',
    name: 'Limestone Powder',
    slug: 'limestone-powder',
    category: 'Mineral Powders',
    shortDescription:
      'Processed limestone powder used as a raw material in construction-material manufacturing and selected industrial applications.',
    fullDescription:
      'Processed limestone powder used as a raw material in construction-material manufacturing and selected industrial applications. Supplied for industrial buyers seeking consistent mineral filler and raw material inputs. Suitability for specific formulations depends on the customer’s required grade and process requirements.',
    commonApplications: [
      'Cement and construction-material manufacturing',
      'Industrial filler applications',
      'Putty and selected building materials',
      'Other suitable industrial processes'
    ],
    mainImage: '/assets/aistudio/limestone-powder_0e00f61c.png',
    additionalImages: [],
    allowedUnits: ['Tonnes', 'Bags', 'kg'],
    published: true,
    displayOrder: 1
  },
  {
    id: 'calcite-powder',
    name: 'Calcite Powder',
    slug: 'calcite-powder',
    category: 'Mineral Powders',
    shortDescription:
      'Processed calcite powder used in industrial manufacturing and suitable filler applications.',
    fullDescription:
      'Processed calcite powder used in industrial manufacturing and suitable filler applications. Commonly used as a mineral extender and filler across coatings, polymer compounds, rubber processing, and building material formulations.',
    commonApplications: [
      'Paint and coatings',
      'Plastics and polymers',
      'Rubber products',
      'Putty and selected construction materials'
    ],
    mainImage: '/assets/aistudio/calcite-powder_31a66b0b.png',
    additionalImages: [],
    allowedUnits: ['Tonnes', 'Bags', 'kg'],
    published: true,
    displayOrder: 2
  },
  {
    id: 'dolomite-powder',
    name: 'Dolomite Powder',
    slug: 'dolomite-powder',
    category: 'Mineral Powders',
    shortDescription:
      'Processed dolomite mineral powder used in selected industrial, manufacturing and construction-material applications.',
    fullDescription:
      'Processed dolomite mineral powder used in selected industrial, manufacturing and construction-material applications. Suitable for customers looking for carbonate mineral powders across construction compounds, selected ceramic/glass batches, and industrial fillers.',
    commonApplications: [
      'Construction-material manufacturing',
      'Selected ceramic and glass applications',
      'Paint and filler applications',
      'Other suitable industrial processes'
    ],
    mainImage: '/assets/aistudio/dolomite-powder_c221f136.png',
    additionalImages: [],
    published: true,
    allowedUnits: ['Tonnes', 'Bags', 'kg'],
    displayOrder: 3
  },
  {
    id: 'feldspar-powder',
    name: 'Feldspar Powder',
    slug: 'feldspar-powder',
    category: 'Mineral Powders',
    shortDescription:
      'Processed feldspar mineral powder used as a raw material in ceramic, glass and other suitable manufacturing applications.',
    fullDescription:
      'Processed feldspar mineral powder used as a raw material in ceramic, glass and other suitable manufacturing applications. Used as a fluxing mineral component in tile bodies, sanitaryware, tableware glazes, and glass batch formulations.',
    commonApplications: [
      'Ceramic tile manufacturing',
      'Sanitaryware manufacturing',
      'Glass manufacturing',
      'Ceramic glaze production'
    ],
    mainImage: '/assets/aistudio/feldspar-powder_ba2e11f3.png',
    additionalImages: [],
    allowedUnits: ['Tonnes', 'Bags', 'kg'],
    published: true,
    displayOrder: 4
  },
  {
    id: 'stone-grit',
    name: 'Stone Grit',
    slug: 'stone-grit',
    category: 'Crushed Stone & Chips',
    shortDescription:
      'Graded stone granules for suitable construction, industrial and decorative applications. The actual composition depends on the material supplied.',
    fullDescription:
      'Graded stone granules for suitable construction, industrial and decorative applications. The actual composition depends on the material supplied. Contact our team with your required granule size and intended application to confirm suitable supply.',
    commonApplications: [
      'Construction-material production',
      'Selected flooring applications',
      'Decorative applications',
      'Other suitable uses depending on the stone type and size'
    ],
    mainImage: '/assets/aistudio/stone-grit_6e5e324b.png',
    additionalImages: [],
    allowedUnits: ['Tonnes', 'Bags', 'kg'],
    published: true,
    displayOrder: 5
  },
  {
    id: 'quartz-chips',
    name: 'Quartz Chips',
    slug: 'quartz-chips',
    category: 'Crushed Stone & Chips',
    shortDescription:
      'Processed quartz pieces used as a mineral raw material in suitable industrial and manufacturing applications.',
    fullDescription:
      'Processed quartz pieces used as a mineral raw material in suitable industrial and manufacturing applications. Supplied as crushed angular quartz pieces for glass, ceramic, engineered-stone, and selected decorative uses depending on required grade.',
    commonApplications: [
      'Glass manufacturing where purity is suitable',
      'Ceramic manufacturing',
      'Engineered-stone applications',
      'Decorative applications'
    ],
    mainImage: '/assets/aistudio/quartz-chips_26c3984d.png',
    additionalImages: [],
    allowedUnits: ['Tonnes', 'Bags', 'kg'],
    published: true,
    displayOrder: 6
  },
  {
    id: 'kolam-powder',
    name: 'Kolam Powder (Rangoli Powder)',
    slug: 'kolam-powder',
    category: 'Decorative Powder',
    shortDescription:
      'Fine powder used for drawing traditional kolam and rangoli designs at the entrances of homes and other spaces.',
    fullDescription:
      'Fine powder used for drawing traditional kolam and rangoli designs at the entrances of homes and other spaces. Supplied specifically for traditional decorative floor patterns, daily household kolam drawings, and festive cultural decorations.',
    commonApplications: [
      'Traditional kolam designs',
      'Rangoli decorations',
      'Festival and cultural decorations',
      'Decorative floor patterns'
    ],
    mainImage: '/assets/aistudio/kolam-powder_45805643.png',
    additionalImages: [],
    allowedUnits: ['kg', 'Bags', 'Packets'],
    published: true,
    displayOrder: 7
  }
];

export const APPLICATION_CATEGORIES: ApplicationCategoryItem[] = [
  {
    id: 'cement-construction',
    title: '01. Cement and Construction Materials',
    summary:
      'Mineral powders and graded stone granules used as raw materials and fillers in building products, wall putties, and construction compounds.',
    details:
      'Manufacturers of construction materials, wall putty, mortar mixes, and flooring compounds utilize processed mineral powders and stone granules depending on the required formulation and material grade.',
    relatedProductSlugs: ['limestone-powder', 'dolomite-powder', 'calcite-powder', 'stone-grit'],
    featuredImage: '/assets/minerals/limestone-powder.jpg'
  },
  {
    id: 'paint-coatings',
    title: '02. Paint and Coatings',
    summary:
      'Fine white and off-white mineral extenders used in architectural coatings, primers, and industrial surface finishes.',
    details:
      'Calcite and dolomite powders serve as functional mineral fillers in paint, primer, and coating formulations where brightness and particle distribution are selected according to the coating type.',
    relatedProductSlugs: ['calcite-powder', 'dolomite-powder', 'limestone-powder'],
    featuredImage: '/assets/minerals/calcite-powder.jpg'
  },
  {
    id: 'plastics-rubber',
    title: '03. Plastics and Rubber',
    summary:
      'Processed mineral fillers used in polymer compounding, PVC profiles, and moulded rubber products.',
    details:
      'Processed calcite and limestone powders are incorporated as filler materials in suitable plastic compounds and rubber manufacturing processes.',
    relatedProductSlugs: ['calcite-powder', 'limestone-powder'],
    featuredImage: '/assets/minerals/calcite-powder.jpg'
  },
  {
    id: 'ceramics-tiles',
    title: '04. Ceramics and Tiles',
    summary:
      'Mineral raw materials for ceramic tile bodies, sanitaryware production, and glaze formulations.',
    details:
      'Feldspar powder, quartz chips, and dolomite powder are supplied as raw materials for ceramic body preparation, vitrified tiles, sanitaryware, and glaze production.',
    relatedProductSlugs: ['feldspar-powder', 'quartz-chips', 'dolomite-powder'],
    featuredImage: '/assets/minerals/feldspar-powder.jpg'
  },
  {
    id: 'glass-manufacturing',
    title: '05. Glass Manufacturing',
    summary:
      'Selected feldspar, dolomite, and quartz raw materials for suitable glass batch processes.',
    details:
      'Glass manufacturers source feldspar powder, dolomite powder, and suitable grades of quartz chips as batch raw materials depending on purity and furnace requirements.',
    relatedProductSlugs: ['feldspar-powder', 'quartz-chips', 'dolomite-powder'],
    featuredImage: '/assets/minerals/quartz-chips.jpg'
  },
  {
    id: 'decorative-stone',
    title: '06. Selected Decorative & Engineered Stone Applications',
    summary:
      'Graded stone granules and crushed quartz chips for landscaping, terrazzo flooring, and engineered stone surfaces.',
    details:
      'Stone grit and quartz chips are used in selected architectural flooring, decorative aggregate finishes, and engineered-stone manufacturing depending on stone type and granule sizing.',
    relatedProductSlugs: ['stone-grit', 'quartz-chips'],
    featuredImage: '/assets/minerals/stone-grit.jpg'
  },
  {
    id: 'traditional-kolam',
    title: '07. Traditional Kolam and Rangoli Decoration',
    summary:
      'Dedicated decorative white powder for drawing traditional kolam and rangoli floor patterns at homes, temples, and cultural events.',
    details:
      'Kept distinct from industrial mineral applications, our Kolam Powder (Rangoli Powder) is a fine decorative powder used for everyday and festive South Indian floor designs.',
    isDecorativeOnly: true,
    relatedProductSlugs: ['kolam-powder'],
    featuredImage: '/assets/minerals/kolam-powder.jpg'
  }
];
