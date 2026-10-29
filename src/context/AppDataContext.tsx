import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';
import {
  db,
  auth,
  googleProvider,
  handleFirestoreError,
  OperationType
} from '../firebase';
import {
  BusinessSettings,
  ProductRecord,
  CustomerEnquiryRecord,
  CustomerEnquiryStatus
} from '../types';
import {
  DEFAULT_BUSINESS_SETTINGS,
  INITIAL_PRODUCTS
} from '../data/initialCatalogue';

const BOOTSTRAPPED_ADMIN_EMAILS = new Set([
  'jeevakumarrangarajk@gmail.com',
  'usnnaveen@gmail.com'
]);

interface AppDataContextType {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  settings: BusinessSettings;
  products: ProductRecord[];
  allProductsAdmin: ProductRecord[];
  loadingCatalogue: boolean;
  signInAdminWithGoogle: () => Promise<void>;
  signOutAdmin: () => Promise<void>;
  customerSignIn: (email: string, pass: string) => Promise<void>;
  customerSignUp: (email: string, pass: string, name: string) => Promise<void>;
  customerSignOut: () => Promise<void>;
  customerResetPassword: (email: string) => Promise<void>;
  submitCustomerEnquiry: (data: {
    productSlug: string;
    productName: string;
    customerName: string;
    companyName: string;
    phone: string;
    quantity: string;
    quantityUnit: string;
    deliveryLocation: string;
    message: string;
    privacyConsent: boolean;
  }) => Promise<string>;
  fetchMyCustomerEnquiries: () => Promise<CustomerEnquiryRecord[]>;
  fetchAllCustomerEnquiriesAdmin: () => Promise<CustomerEnquiryRecord[]>;
  updateCustomerEnquiryAdmin: (
    enquiryId: string,
    updates: {
      status?: CustomerEnquiryStatus;
      quotationAmount?: number;
      currency?: string;
      adminResponse?: string;
      adminNotes?: string;
    }
  ) => Promise<void>;
  refreshPublicData: () => Promise<void>;
  refreshAdminCatalogue: () => Promise<void>;
  seedInitialCatalogueAndSettings: () => Promise<void>;
  saveBusinessSettings: (updated: Omit<BusinessSettings, 'updatedAt' | 'updatedBy'>) => Promise<void>;
  saveProduct: (product: ProductRecord, isNew: boolean) => Promise<void>;
  removeProduct: (productId: string, productName: string) => Promise<void>;
  logAdminActivity: (action: string, targetId: string, summary: string) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_BUSINESS_SETTINGS);
  const [products, setProducts] = useState<ProductRecord[]>(INITIAL_PRODUCTS);
  const [allProductsAdmin, setAllProductsAdmin] = useState<ProductRecord[]>(INITIAL_PRODUCTS);
  const [loadingCatalogue, setLoadingCatalogue] = useState<boolean>(true);

  // Verify whether user is authorized administrator
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setIsAdmin(false);
        setAuthReady(true);
        return;
      }

      const emailLower = (currentUser.email || '').toLowerCase();
      if (BOOTSTRAPPED_ADMIN_EMAILS.has(emailLower)) {
        setIsAdmin(true);
        setAuthReady(true);
        // Automatically ensure their admin_users document exists in Firestore for security rules compliance
        try {
          const adminRef = doc(db, 'admin_users', currentUser.uid);
          const adminSnap = await getDoc(adminRef);
          if (!adminSnap.exists()) {
            await setDoc(adminRef, {
              uid: currentUser.uid,
              email: currentUser.email || emailLower,
              role: 'admin',
              createdAt: serverTimestamp()
            });
          }
        } catch (err) {
          console.error('Failed to initialize admin_users document:', err);
        }
        return;
      }

      if (!currentUser.emailVerified) {
        setIsAdmin(false);
        setAuthReady(true);
        return;
      }

      try {
        const adminDoc = await getDoc(doc(db, 'admin_users', currentUser.uid));
        setIsAdmin(adminDoc.exists() && adminDoc.data()?.role === 'admin');
      } catch {
        setIsAdmin(false);
      } finally {
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const normalizeProductImages = (p: ProductRecord): ProductRecord => {
    const fixPath = (path: string) =>
      path && path.startsWith('/assets/minerals/') && path.endsWith('.svg')
        ? path.replace(/\.svg$/, '.jpg')
        : path;
    return {
      ...p,
      mainImage: fixPath(p.mainImage),
      additionalImages: (p.additionalImages || [])
        .map(fixPath)
        .filter((img) => !img.includes('hero-mineral-stockpile'))
    };
  };

  const refreshPublicData = async () => {
    setLoadingCatalogue(true);
    try {
      // Load public business settings
      try {
        const settingsSnap = await getDoc(doc(db, 'business_settings', 'main'));
        if (settingsSnap.exists()) {
          const data = settingsSnap.data() as BusinessSettings;
          setSettings({
            ...DEFAULT_BUSINESS_SETTINGS,
            ...data
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'business_settings/main');
      }

      // Load published products only (compliant with allow list rule)
      try {
        const q = query(collection(db, 'products'), where('published', '==', true));
        const prodSnap = await getDocs(q);
        if (!prodSnap.empty) {
          const loaded: ProductRecord[] = [];
          prodSnap.forEach((docSnap) => {
            loaded.push(normalizeProductImages(docSnap.data() as ProductRecord));
          });
          loaded.sort((a, b) => a.displayOrder - b.displayOrder);
          setProducts(loaded);
        } else {
          setProducts(INITIAL_PRODUCTS.filter((p) => p.published));
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'products');
      }
    } catch {
      // Fallback to initial catalogue if offline or unseeded
      setProducts(INITIAL_PRODUCTS.filter((p) => p.published));
    } finally {
      setLoadingCatalogue(false);
    }
  };

  const refreshAdminCatalogue = async () => {
    if (!isAdmin) return;
    try {
      const snap = await getDocs(collection(db, 'products'));
      if (!snap.empty) {
        const records: ProductRecord[] = [];
        snap.forEach((d) => records.push(normalizeProductImages(d.data() as ProductRecord)));
        records.sort((a, b) => a.displayOrder - b.displayOrder);
        setAllProductsAdmin(records);
        setProducts(records.filter((r) => r.published));
      } else {
        setAllProductsAdmin(INITIAL_PRODUCTS);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'products');
    }
  };

  useEffect(() => {
    refreshPublicData();
  }, []);

  useEffect(() => {
    if (authReady && isAdmin) {
      refreshAdminCatalogue();
    }
  }, [authReady, isAdmin]);

  const logAdminActivity = async (action: string, targetId: string, summary: string) => {
    if (!auth.currentUser || !isAdmin) return;
    const logId = `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const path = `activity_logs/${logId}`;
    try {
      await setDoc(doc(db, 'activity_logs', logId), {
        adminUid: auth.currentUser.uid,
        adminEmail: (auth.currentUser.email || 'admin@naveenminerals.in').slice(0, 120),
        action: action.slice(0, 80),
        targetId: targetId.slice(0, 128),
        summary: summary.slice(0, 300),
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const seedInitialCatalogueAndSettings = async () => {
    if (!auth.currentUser || !isAdmin) return;

    // Seed business_settings/main if missing
    const settingsRef = doc(db, 'business_settings', 'main');
    const settingsSnap = await getDoc(settingsRef);
    if (!settingsSnap.exists()) {
      try {
        await setDoc(settingsRef, {
          companyName: DEFAULT_BUSINESS_SETTINGS.companyName,
          tagline: DEFAULT_BUSINESS_SETTINGS.tagline,
          address: DEFAULT_BUSINESS_SETTINGS.address,
          email: DEFAULT_BUSINESS_SETTINGS.email,
          phone: DEFAULT_BUSINESS_SETTINGS.phone,
          introText: DEFAULT_BUSINESS_SETTINGS.introText,
          aboutText: DEFAULT_BUSINESS_SETTINGS.aboutText,
          gstin: '',
          gstinVerified: false,
          showGstinPublicly: false,
          updatedAt: serverTimestamp(),
          updatedBy: auth.currentUser.uid
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'business_settings/main');
      }
    }

    // Seed initial 7 products if missing, or upgrade any legacy .svg paths to .jpg
    for (const prod of INITIAL_PRODUCTS) {
      const prodRef = doc(db, 'products', prod.id);
      const prodSnap = await getDoc(prodRef);
      if (!prodSnap.exists()) {
        try {
          await setDoc(prodRef, {
            id: prod.id,
            name: prod.name,
            slug: prod.slug,
            category: prod.category,
            shortDescription: prod.shortDescription,
            fullDescription: prod.fullDescription,
            commonApplications: prod.commonApplications.slice(0, 10),
            mainImage: prod.mainImage,
            additionalImages: prod.additionalImages.slice(0, 6),
            allowedUnits: prod.allowedUnits.slice(0, 6),
            published: prod.published,
            displayOrder: prod.displayOrder,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `products/${prod.id}`);
        }
      } else {
        const existingData = prodSnap.data() as ProductRecord;
        const hasLegacySvg = existingData.mainImage?.endsWith('.svg');
        const hasStockpileThumb = (existingData.additionalImages || []).some((img) =>
          img.includes('hero-mineral-stockpile')
        );
        if (hasLegacySvg || hasStockpileThumb) {
          try {
            await updateDoc(prodRef, {
              name: prod.name,
              slug: prod.slug,
              category: prod.category,
              shortDescription: existingData.shortDescription || prod.shortDescription,
              fullDescription: existingData.fullDescription || prod.fullDescription,
              commonApplications: (existingData.commonApplications || prod.commonApplications).slice(0, 10),
              mainImage: prod.mainImage,
              additionalImages: prod.additionalImages.slice(0, 6),
              allowedUnits: (existingData.allowedUnits || prod.allowedUnits).slice(0, 6),
              published: Boolean(existingData.published),
              displayOrder: Number(existingData.displayOrder) || prod.displayOrder,
              updatedAt: serverTimestamp()
            });
          } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `products/${prod.id}`);
          }
        }
      }
    }

    await logAdminActivity(
      'SEED_CATALOGUE',
      'initial_7_products',
      'Synchronized default business settings and 7 initial mineral products in Firestore.'
    );
    await refreshPublicData();
    await refreshAdminCatalogue();
  };

  const saveBusinessSettings = async (
    updated: Omit<BusinessSettings, 'updatedAt' | 'updatedBy'>
  ) => {
    if (!auth.currentUser || !isAdmin) {
      throw new Error('Unauthorized administrator action.');
    }
    const settingsRef = doc(db, 'business_settings', 'main');
    const existingSnap = await getDoc(settingsRef);

    // Ensure GSTIN is never publicly shown unless verified and >= 15 chars
    const safeShowGstin =
      Boolean(updated.showGstinPublicly) &&
      Boolean(updated.gstinVerified) &&
      updated.gstin.trim().length >= 15;

    const payload = {
      companyName: updated.companyName.trim().slice(0, 100),
      tagline: updated.tagline.trim().slice(0, 160),
      address: updated.address.trim().slice(0, 300),
      email: updated.email.trim().slice(0, 120),
      phone: updated.phone.trim().slice(0, 25),
      introText: updated.introText.trim().slice(0, 600),
      aboutText: updated.aboutText.trim().slice(0, 1200),
      gstin: updated.gstin.trim().slice(0, 20),
      gstinVerified: Boolean(updated.gstinVerified),
      showGstinPublicly: safeShowGstin,
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser.uid
    };

    try {
      if (existingSnap.exists()) {
        await updateDoc(settingsRef, payload);
      } else {
        await setDoc(settingsRef, payload);
      }
    } catch (error) {
      handleFirestoreError(
        error,
        existingSnap.exists() ? OperationType.UPDATE : OperationType.CREATE,
        'business_settings/main'
      );
    }

    await logAdminActivity(
      'UPDATE_BUSINESS_SETTINGS',
      'main',
      `Updated business contact and website settings for ${payload.companyName}.`
    );
    await refreshPublicData();
  };

  const saveProduct = async (product: ProductRecord, isNew: boolean) => {
    if (!auth.currentUser || !isAdmin) {
      throw new Error('Unauthorized administrator action.');
    }
    const cleanId = product.id.trim().replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, 80);
    const cleanSlug = product.slug.trim().toLowerCase().replace(/[^a-z0-9\-]/g, '-').slice(0, 80);
    const prodRef = doc(db, 'products', cleanId);

    const commonApps = product.commonApplications
      .map((a) => a.trim().slice(0, 160))
      .filter(Boolean)
      .slice(0, 10);

    const allowedUnits = product.allowedUnits
      .map((u) => u.trim().slice(0, 30))
      .filter(Boolean)
      .slice(0, 6);

    const additionalImgs = (product.additionalImages || [])
      .map((i) => i.trim().slice(0, 500))
      .filter(Boolean)
      .slice(0, 6);

    try {
      const existingSnap = await getDoc(prodRef);
      if (isNew || !existingSnap.exists()) {
        await setDoc(prodRef, {
          id: cleanId,
          name: product.name.trim().slice(0, 100),
          slug: cleanSlug,
          category: product.category,
          shortDescription: product.shortDescription.trim().slice(0, 350),
          fullDescription: product.fullDescription.trim().slice(0, 2000),
          commonApplications: commonApps.length > 0 ? commonApps : ['Suitable industrial application'],
          mainImage: product.mainImage.trim().slice(0, 500),
          additionalImages: additionalImgs,
          allowedUnits: allowedUnits.length > 0 ? allowedUnits : ['kg', 'Bags'],
          published: Boolean(product.published),
          displayOrder: Number(product.displayOrder) || 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        await updateDoc(prodRef, {
          name: product.name.trim().slice(0, 100),
          slug: cleanSlug,
          category: product.category,
          shortDescription: product.shortDescription.trim().slice(0, 350),
          fullDescription: product.fullDescription.trim().slice(0, 2000),
          commonApplications: commonApps.length > 0 ? commonApps : ['Suitable industrial application'],
          mainImage: product.mainImage.trim().slice(0, 500),
          additionalImages: additionalImgs,
          allowedUnits: allowedUnits.length > 0 ? allowedUnits : ['kg', 'Bags'],
          published: Boolean(product.published),
          displayOrder: Number(product.displayOrder) || 1,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(
        error,
        isNew ? OperationType.CREATE : OperationType.UPDATE,
        `products/${cleanId}`
      );
    }

    await logAdminActivity(
      isNew ? 'CREATE_PRODUCT' : 'UPDATE_PRODUCT',
      cleanId,
      `${isNew ? 'Created' : 'Updated'} product "${product.name}" (published: ${product.published}).`
    );
    await refreshPublicData();
    await refreshAdminCatalogue();
  };

  const removeProduct = async (productId: string, productName: string) => {
    if (!auth.currentUser || !isAdmin) {
      throw new Error('Unauthorized administrator action.');
    }
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
    }
    await logAdminActivity(
      'DELETE_PRODUCT',
      productId,
      `Removed product "${productName}" from catalogue (historical quotations preserved).`
    );
    await refreshPublicData();
    await refreshAdminCatalogue();
  };

  const signInAdminWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signOutAdmin = async () => {
    await signOut(auth);
  };

  const customerSignIn = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const customerSignUp = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }
      await sendEmailVerification(cred.user);
    }
  };

  const customerSignOut = async () => {
    await signOut(auth);
  };

  const customerResetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const submitCustomerEnquiry = async (data: {
    productSlug: string;
    productName: string;
    customerName: string;
    companyName: string;
    phone: string;
    quantity: string;
    quantityUnit: string;
    deliveryLocation: string;
    message: string;
    privacyConsent: boolean;
  }) => {
    if (!auth.currentUser) throw new Error('You must be signed in to submit an enquiry.');
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const enquiryReference = `NM-CE-${dateStr}-${randStr}`;
    const enquiryId = `ceq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const payload = {
      enquiryReference,
      customerUid: auth.currentUser.uid,
      customerEmail: auth.currentUser.email || data.customerName,
      customerName: data.customerName.trim().slice(0, 100),
      companyName: (data.companyName || '').trim().slice(0, 120),
      phone: data.phone.trim().slice(0, 25),
      productSlug: data.productSlug.trim().slice(0, 80),
      productName: data.productName.trim().slice(0, 100),
      quantity: data.quantity.trim().slice(0, 40),
      quantityUnit: data.quantityUnit.trim().slice(0, 30),
      deliveryLocation: data.deliveryLocation.trim().slice(0, 200),
      message: (data.message || '').trim().slice(0, 1500),
      privacyConsent: Boolean(data.privacyConsent),
      status: 'NEW' as CustomerEnquiryStatus,
      quotationAmount: 0,
      currency: 'INR',
      adminResponse: '',
      adminNotes: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    try {
      await setDoc(doc(db, 'customer_enquiries', enquiryId), payload);
      return enquiryReference;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `customer_enquiries/${enquiryId}`);
    }
  };

  const fetchMyCustomerEnquiries = async (): Promise<CustomerEnquiryRecord[]> => {
    if (!auth.currentUser) return [];
    try {
      const q = query(collection(db, 'customer_enquiries'), where('customerUid', '==', auth.currentUser.uid));
      const snap = await getDocs(q);
      const results: CustomerEnquiryRecord[] = [];
      snap.forEach((d) => results.push({ id: d.id, ...d.data() } as CustomerEnquiryRecord));
      return results;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'customer_enquiries');
      return [];
    }
  };

  const fetchAllCustomerEnquiriesAdmin = async (): Promise<CustomerEnquiryRecord[]> => {
    if (!auth.currentUser || !isAdmin) return [];
    try {
      const snap = await getDocs(collection(db, 'customer_enquiries'));
      const results: CustomerEnquiryRecord[] = [];
      snap.forEach((d) => results.push({ id: d.id, ...d.data() } as CustomerEnquiryRecord));
      return results;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'customer_enquiries');
      return [];
    }
  };

  const updateCustomerEnquiryAdmin = async (
    enquiryId: string,
    updates: {
      status?: CustomerEnquiryStatus;
      quotationAmount?: number;
      currency?: string;
      adminResponse?: string;
      adminNotes?: string;
    }
  ) => {
    if (!auth.currentUser || !isAdmin) throw new Error('Unauthorized');
    try {
      const ref = doc(db, 'customer_enquiries', enquiryId);
      const updateData: any = {
        updatedAt: serverTimestamp()
      };
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.quotationAmount !== undefined) updateData.quotationAmount = Number(updates.quotationAmount) || 0;
      if (updates.currency !== undefined) updateData.currency = updates.currency;
      if (updates.adminResponse !== undefined) updateData.adminResponse = updates.adminResponse;
      if (updates.adminNotes !== undefined) updateData.adminNotes = updates.adminNotes;
      await updateDoc(ref, updateData);
      await logAdminActivity('UPDATE_CUSTOMER_ENQUIRY', enquiryId, `Updated customer enquiry ${enquiryId}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `customer_enquiries/${enquiryId}`);
    }
  };

  return (
    <AppDataContext.Provider
      value={{
        user,
        authReady,
        isAdmin,
        settings,
        products,
        allProductsAdmin,
        loadingCatalogue,
        signInAdminWithGoogle,
        signOutAdmin,
        customerSignIn,
        customerSignUp,
        customerSignOut,
        customerResetPassword,
        submitCustomerEnquiry,
        fetchMyCustomerEnquiries,
        fetchAllCustomerEnquiriesAdmin,
        updateCustomerEnquiryAdmin,
        refreshPublicData,
        refreshAdminCatalogue,
        seedInitialCatalogueAndSettings,
        saveBusinessSettings,
        saveProduct,
        removeProduct,
        logAdminActivity
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export function useAppData(): AppDataContextType {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error('useAppData must be used inside AppDataProvider');
  }
  return ctx;
}
