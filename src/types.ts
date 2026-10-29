export type ProductCategory = 'Mineral Powders' | 'Crushed Stone & Chips' | 'Decorative Powder';

export interface ProductRecord {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  shortDescription: string;
  fullDescription: string;
  commonApplications: string[];
  mainImage: string;
  additionalImages: string[];
  allowedUnits: string[];
  published: boolean;
  displayOrder: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface BusinessSettings {
  companyName: string;
  tagline: string;
  address: string;
  email: string;
  phone: string;
  introText: string;
  aboutText: string;
  gstin: string;
  gstinVerified: boolean;
  showGstinPublicly: boolean;
  updatedAt?: unknown;
  updatedBy?: string;
}

export type QuoteStatus = 'New' | 'Under Review' | 'Contacted' | 'Quotation Prepared' | 'Closed';

export interface QuoteRequestRecord {
  id: string;
  quoteReference: string;
  customerName: string;
  companyName: string;
  phone: string;
  email: string;
  productSlug: string;
  productName: string;
  quantity: string;
  quantityUnit: string;
  deliveryLocation: string;
  message: string;
  privacyConsent: boolean;
  status: QuoteStatus;
  internalNotes: string;
  createdAt?: { seconds?: number; toDate?: () => Date } | string;
  updatedAt?: { seconds?: number; toDate?: () => Date } | string;
}

export type ContactStatus = 'New' | 'Reviewed' | 'Responded' | 'Archived';

export interface ContactMessageRecord {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  privacyConsent: boolean;
  status: ContactStatus;
  internalNotes: string;
  createdAt?: { seconds?: number; toDate?: () => Date } | string;
  updatedAt?: { seconds?: number; toDate?: () => Date } | string;
}

export interface ActivityLogRecord {
  id: string;
  adminUid: string;
  adminEmail: string;
  action: string;
  targetId: string;
  summary: string;
  createdAt?: { seconds?: number; toDate?: () => Date } | string;
}

export interface ApplicationCategoryItem {
  id: string;
  title: string;
  summary: string;
  details: string;
  isDecorativeOnly?: boolean;
  relatedProductSlugs: string[];
  featuredImage: string;
}

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'SUB_ADMIN';
export type AdminStatus = 'Active' | 'Invited' | 'Revoked';

export interface AdminPermissions {
  products: boolean;
  quotes: boolean;
  contacts: boolean;
  settings: boolean;
  users: boolean;
  auditLogs: boolean;
}

export interface AdminUserRecord {
  id: string;
  uid: string;
  email: string;
  name?: string;
  role: AdminRole;
  status: AdminStatus;
  permissions: AdminPermissions;
  createdAt?: unknown;
  lastSignIn?: unknown;
  invitedBy?: string;
}

export type CustomerEnquiryStatus = 'NEW' | 'UNDER_REVIEW' | 'QUOTATION_SENT' | 'ACCEPTED' | 'CLOSED';

export interface CustomerEnquiryRecord {
  id: string;
  enquiryReference: string;
  customerUid: string;
  customerEmail: string;
  customerName: string;
  companyName: string;
  phone: string;
  productSlug: string;
  productName: string;
  quantity: string;
  quantityUnit: string;
  deliveryLocation: string;
  message: string;
  privacyConsent: boolean;
  status: CustomerEnquiryStatus;
  quotationAmount: number;
  currency: string;
  adminResponse: string;
  adminNotes: string;
  createdAt?: { seconds?: number; toDate?: () => Date } | string;
  updatedAt?: { seconds?: number; toDate?: () => Date } | string;
}


