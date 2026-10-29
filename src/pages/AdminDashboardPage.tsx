import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  LogOut,
  Plus,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  Upload,
  Users,
  Shield,
  UserPlus,
  Key,
  Lock,
  Check,
  X
} from 'lucide-react';
import {
  db,
  storage,
  handleFirestoreError,
  OperationType
} from '../firebase';
import { useAppData } from '../context/AppDataContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ProductRecord,
  ProductCategory,
  QuoteRequestRecord,
  QuoteStatus,
  ContactMessageRecord,
  ContactStatus,
  AdminUserRecord,
  AdminRole,
  AdminStatus,
  AdminPermissions,
  CustomerEnquiryRecord,
  CustomerEnquiryStatus
} from '../types';
import { SEOHead } from '../components/SEOHead';
import { MineralImage } from '../components/MineralImage';

type AdminTab = 'overview' | 'products' | 'quotes' | 'contacts' | 'settings' | 'users' | 'customer_enquiries';

export const AdminDashboardPage: React.FC = () => {
  const {
    user,
    authReady,
    isAdmin,
    settings,
    allProductsAdmin,
    signOutAdmin,
    seedInitialCatalogueAndSettings,
    saveBusinessSettings,
    saveProduct,
    removeProduct,
    logAdminActivity,
    updateCustomerEnquiryAdmin
  } = useAppData();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [quotes, setQuotes] = useState<QuoteRequestRecord[]>([]);
  const [contacts, setContacts] = useState<ContactMessageRecord[]>([]);
  const [customerEnquiries, setCustomerEnquiries] = useState<CustomerEnquiryRecord[]>([]);
  const [selectedCustEnquiry, setSelectedCustEnquiry] = useState<CustomerEnquiryRecord | null>(null);
  const [custEnqStatusDraft, setCustEnqStatusDraft] = useState<CustomerEnquiryStatus>('NEW');
  const [custEnqAmountDraft, setCustEnqAmountDraft] = useState<number | string>(0);
  const [custEnqCurrencyDraft, setCustEnqCurrencyDraft] = useState<string>('INR');
  const [custEnqResponseDraft, setCustEnqResponseDraft] = useState<string>('');
  const [custEnqNotesDraft, setCustEnqNotesDraft] = useState<string>('');
  const [custEnqSearch, setCustEnqSearch] = useState('');
  const [custEnqStatusFilter, setCustEnqStatusFilter] = useState('ALL');

  const [adminUsers, setAdminUsers] = useState<AdminUserRecord[]>([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminRoleFilter, setAdminRoleFilter] = useState<string>('ALL');
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>('ALL');

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<AdminRole>('ADMIN');
  const [invitePermissions, setInvitePermissions] = useState<AdminPermissions>({
    products: true,
    quotes: true,
    contacts: true,
    settings: false,
    users: false,
    auditLogs: false
  });

  const [editingAdminUser, setEditingAdminUser] = useState<AdminUserRecord | null>(null);
  const [editRole, setEditRole] = useState<AdminRole>('ADMIN');
  const [editStatus, setEditStatus] = useState<AdminStatus>('Active');
  const [editPermissions, setEditPermissions] = useState<AdminPermissions>({
    products: true,
    quotes: true,
    contacts: true,
    settings: false,
    users: false,
    auditLogs: false
  });
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [notificationConfig, setNotificationConfig] = useState<{
    loaded: boolean;
    configured: boolean;
    statusMessage: string;
  }>({
    loaded: false,
    configured: false,
    statusMessage: 'All quote requests and contact enquiries are saved directly to Firestore.'
  });

  // Quote filters & selection
  const [quoteSearch, setQuoteSearch] = useState('');
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<string>('ALL');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequestRecord | null>(null);
  const [quoteNoteDraft, setQuoteNoteDraft] = useState('');
  const [quoteStatusDraft, setQuoteStatusDraft] = useState<QuoteStatus>('New');

  // Contact message search, filter & selection
  const [contactSearch, setContactSearch] = useState('');
  const [contactStatusFilter, setContactStatusFilter] = useState<string>('ALL');
  const [selectedContact, setSelectedContact] = useState<ContactMessageRecord | null>(null);
  const [contactNoteDraft, setContactNoteDraft] = useState('');
  const [contactStatusDraft, setContactStatusDraft] = useState<ContactStatus>('New');

  // Product Editor & Preview Modal state
  const [editingProduct, setEditingProduct] = useState<ProductRecord | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<ProductRecord | null>(null);
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState<ProductRecord | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Business Settings Form state
  const [settingsForm, setSettingsForm] = useState({
    companyName: settings.companyName,
    tagline: settings.tagline,
    address: settings.address,
    email: settings.email,
    phone: settings.phone,
    introText: settings.introText,
    aboutText: settings.aboutText,
    gstin: settings.gstin || '',
    gstinVerified: Boolean(settings.gstinVerified),
    showGstinPublicly: Boolean(settings.showGstinPublicly)
  });

  useEffect(() => {
    setSettingsForm({
      companyName: settings.companyName,
      tagline: settings.tagline,
      address: settings.address,
      email: settings.email,
      phone: settings.phone,
      introText: settings.introText,
      aboutText: settings.aboutText,
      gstin: settings.gstin || '',
      gstinVerified: Boolean(settings.gstinVerified),
      showGstinPublicly: Boolean(settings.showGstinPublicly)
    });
  }, [settings]);

  // Redirect unauthenticated or unauthorized users
  useEffect(() => {
    if (authReady && (!user || !isAdmin)) {
      navigate('/admin/login', { replace: true });
    }
  }, [authReady, user, isAdmin, navigate]);

  // Sync tab with pathname /admin/users
  useEffect(() => {
    if (window.location.pathname === '/admin/users') {
      setActiveTab('users');
    }
  }, []);

  const formatUserRole = (role: AdminRole | string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return t('admin.users.roleSuperAdmin', 'Super Admin');
      case 'ADMIN':
        return t('admin.users.roleAdmin', 'Admin');
      case 'SUB_ADMIN':
        return t('admin.users.roleSubAdmin', 'Sub-Admin');
      default:
        return role;
    }
  };

  const formatUserStatus = (status: AdminStatus | string) => {
    switch (status) {
      case 'Active':
        return t('admin.users.statusActive', 'Active');
      case 'Invited':
        return t('admin.users.statusInvited', 'Invited');
      case 'Revoked':
        return t('admin.users.statusRevoked', 'Revoked');
      default:
        return status;
    }
  };

  const formatPermissionKey = (permKey: string) => {
    switch (permKey) {
      case 'products':
        return t('admin.users.permProducts', 'Products');
      case 'quotes':
        return t('admin.users.permQuotes', 'Quotes');
      case 'contacts':
        return t('admin.users.permContacts', 'Contacts');
      case 'settings':
        return t('admin.users.permSettings', 'Settings');
      case 'users':
        return t('admin.users.permUsers', 'Users');
      case 'auditLogs':
        return t('admin.users.permAuditLogs', 'Audit Logs');
      default:
        return permKey;
    }
  };

  const handleInviteAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setStatusBanner(null);

    const emailTrim = inviteEmail.trim().toLowerCase();
    const adminId = `admin_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    try {
      await setDoc(doc(db, 'admin_users', adminId), {
        uid: adminId,
        email: emailTrim,
        name: inviteName.trim().slice(0, 100),
        role: inviteRole,
        status: 'Invited',
        permissions: invitePermissions,
        createdAt: serverTimestamp(),
        invitedBy: user?.email || 'Super Admin'
      });

      await logAdminActivity(
        'INVITE_ADMIN',
        adminId,
        `Invited administrator ${emailTrim} with role ${inviteRole}.`
      );

      setStatusBanner({
        type: 'success',
        text: t('admin.users.inviteSuccess', 'Successfully invited administrator {email}.').replace('{email}', emailTrim)
      });

      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteName('');
      setInviteRole('ADMIN');
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : t('admin.users.inviteError', 'Could not invite administrator.')
      });
    }
  };

  const formatCustomerEnquiryStatus = (status: CustomerEnquiryStatus | string) => {
    switch (status) {
      case 'NEW':
        return t('admin.customerEnquiries.statusNew', 'New Enquiry');
      case 'UNDER_REVIEW':
        return t('admin.customerEnquiries.statusUnderReview', 'Under Review');
      case 'QUOTATION_SENT':
        return t('admin.customerEnquiries.statusQuotationSent', 'Quotation Sent');
      case 'ACCEPTED':
        return t('admin.customerEnquiries.statusAccepted', 'Accepted');
      case 'CLOSED':
        return t('admin.customerEnquiries.statusClosed', 'Closed');
      default:
        return status;
    }
  };

  const handleUpdateCustomerEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustEnquiry) return;
    setStatusBanner(null);
    try {
      await updateCustomerEnquiryAdmin(selectedCustEnquiry.id, {
        status: custEnqStatusDraft,
        quotationAmount: Number(custEnqAmountDraft) || 0,
        currency: custEnqCurrencyDraft,
        adminResponse: custEnqResponseDraft,
        adminNotes: custEnqNotesDraft
      });
      setStatusBanner({
        type: 'success',
        text: t('admin.customerEnquiries.updateSuccess', 'Updated customer enquiry {ref}.')
          .replace('{ref}', selectedCustEnquiry.enquiryReference)
      });
      setSelectedCustEnquiry(null);
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : t('admin.customerEnquiries.updateError', 'Could not update customer enquiry.')
      });
    }
  };

  const handleUpdateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdminUser) return;
    setStatusBanner(null);

    const isSuperAdminBootstrap =
      editingAdminUser.email.toLowerCase() === 'jeevakumarrangarajk@gmail.com' ||
      editingAdminUser.email.toLowerCase() === 'usnnaveen@gmail.com';

    if (isSuperAdminBootstrap && editRole !== 'SUPER_ADMIN') {
      setStatusBanner({
        type: 'error',
        text: t('admin.users.cannotDowngradeBootstrap', 'Cannot downgrade core bootstrap Super Admin account.')
      });
      return;
    }

    try {
      const adminRef = doc(db, 'admin_users', editingAdminUser.id);
      await updateDoc(adminRef, {
        role: editRole,
        status: editStatus,
        permissions: editPermissions,
        updatedAt: serverTimestamp()
      });

      await logAdminActivity(
        'UPDATE_ADMIN',
        editingAdminUser.id,
        `Updated admin ${editingAdminUser.email}: Role=${editRole}, Status=${editStatus}.`
      );

      setStatusBanner({
        type: 'success',
        text: t('admin.users.updateSuccess', 'Updated admin {email}.').replace('{email}', editingAdminUser.email)
      });

      setEditingAdminUser(null);
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : t('admin.users.updateError', 'Could not update administrator.')
      });
    }
  };

  // Attach real-time Firestore listeners ONLY when authReady && isAdmin
  useEffect(() => {
    if (!authReady || !user || !isAdmin) return;

    const unsubQuotes = onSnapshot(
      collection(db, 'quote_requests'),
      (snap) => {
        const list: QuoteRequestRecord[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<QuoteRequestRecord, 'id'>) });
        });
        list.sort((a, b) => {
          const tA = typeof a.createdAt === 'object' && a.createdAt?.seconds ? a.createdAt.seconds : 0;
          const tB = typeof b.createdAt === 'object' && b.createdAt?.seconds ? b.createdAt.seconds : 0;
          return tB - tA;
        });
        setQuotes(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'quote_requests');
      }
    );

    const unsubContacts = onSnapshot(
      collection(db, 'contact_messages'),
      (snap) => {
        const list: ContactMessageRecord[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<ContactMessageRecord, 'id'>) });
        });
        list.sort((a, b) => {
          const tA = typeof a.createdAt === 'object' && a.createdAt?.seconds ? a.createdAt.seconds : 0;
          const tB = typeof b.createdAt === 'object' && b.createdAt?.seconds ? b.createdAt.seconds : 0;
          return tB - tA;
        });
        setContacts(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'contact_messages');
      }
    );

    const unsubAdmins = onSnapshot(
      collection(db, 'admin_users'),
      (snap) => {
        const list: AdminUserRecord[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            uid: data.uid || d.id,
            email: data.email || '',
            name: data.name || '',
            role: data.role || 'ADMIN',
            status: data.status || 'Active',
            permissions: data.permissions || {
              products: true,
              quotes: true,
              contacts: true,
              settings: false,
              users: false,
              auditLogs: false
            },
            createdAt: data.createdAt,
            lastSignIn: data.lastSignIn,
            invitedBy: data.invitedBy
          });
        });
        setAdminUsers(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'admin_users');
      }
    );

    const unsubCustEnq = onSnapshot(
      collection(db, 'customer_enquiries'),
      (snap) => {
        const list: CustomerEnquiryRecord[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<CustomerEnquiryRecord, 'id'>) });
        });
        list.sort((a, b) => {
          const tA = typeof a.createdAt === 'object' && (a.createdAt as any)?.seconds ? (a.createdAt as any).seconds : 0;
          const tB = typeof b.createdAt === 'object' && (b.createdAt as any)?.seconds ? (b.createdAt as any).seconds : 0;
          return tB - tA;
        });
        setCustomerEnquiries(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'customer_enquiries');
      }
    );

    return () => {
      unsubQuotes();
      unsubContacts();
      unsubAdmins();
      unsubCustEnq();
    };
  }, [authReady, user, isAdmin]);

  // Fetch optional webhook notification status from backend
  useEffect(() => {
    if (!authReady || !user || !isAdmin) return;
    let active = true;
    fetch('/api/admin/notification-status')
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data && typeof data.configured === 'boolean') {
          setNotificationConfig({
            loaded: true,
            configured: data.configured,
            statusMessage:
              data.statusMessage ||
              (data.configured
                ? t('admin.settings.webhookEnabledMsg', 'Active webhook endpoint configured.')
                : t('admin.settings.webhookDisabledMsg', 'Webhook notifications are disabled (optional). All quote requests and contact enquiries are saved directly to Firestore.'))
          });
        }
      })
      .catch(() => {
        if (!active) return;
        setNotificationConfig({
          loaded: true,
          configured: false,
          statusMessage:
            t('admin.settings.webhookDisabledMsg', 'Webhook notifications are disabled (optional). All quote requests and contact enquiries are saved directly to Firestore.')
        });
      });
    return () => {
      active = false;
    };
  }, [authReady, user, isAdmin]);

  if (!authReady || !user || !isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FFFFFF] p-8">
        <p className="text-sm font-medium text-[#0F172A]">Verifying administrator session...</p>
      </div>
    );
  }

  const formatTimestamp = (ts?: { seconds?: number; toDate?: () => Date } | string) => {
    if (!ts) return 'Just now';
    if (typeof ts === 'string') return ts;
    if (typeof ts.toDate === 'function') {
      return ts.toDate().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    if (ts.seconds) {
      return new Date(ts.seconds * 1000).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return 'Recent';
  };

  // Operational metrics (Enquiry-management metrics only, no stock/inventory)
  const publishedProductsCount = allProductsAdmin.filter((p) => p.published).length;
  const newQuotesCount = quotes.filter((q) => q.status === 'New').length;
  const underReviewQuotesCount = quotes.filter((q) => q.status === 'Under Review').length;
  const newContactsCount = contacts.filter((c) => c.status === 'New').length;

  const filteredQuotes = quotes.filter((q) => {
    const matchesStatus = quoteStatusFilter === 'ALL' || q.status === quoteStatusFilter;
    const term = quoteSearch.trim().toLowerCase();
    const matchesSearch =
      !term ||
      q.quoteReference.toLowerCase().includes(term) ||
      q.customerName.toLowerCase().includes(term) ||
      q.productName.toLowerCase().includes(term) ||
      q.phone.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const formatQuoteStatus = (status: QuoteStatus) => {
    switch (status) {
      case 'New':
        return t('status.new', 'New');
      case 'Under Review':
        return t('status.underReview', 'Under Review');
      case 'Contacted':
        return t('status.contacted', 'Contacted');
      case 'Quotation Prepared':
        return t('status.quotationPrepared', 'Quotation Prepared');
      case 'Closed':
        return t('status.closed', 'Closed');
      default:
        return status;
    }
  };

  const formatContactStatus = (status: ContactStatus) => {
    switch (status) {
      case 'New':
        return t('admin.contacts.statusNew', 'New');
      case 'Reviewed':
        return t('admin.contacts.statusReviewed', 'Reviewed');
      case 'Responded':
        return t('admin.contacts.statusResponded', 'Responded');
      case 'Archived':
        return t('admin.contacts.statusArchived', 'Archived');
      default:
        return status;
    }
  };

  const handleSyncCatalogue = async () => {
    setStatusBanner(null);
    try {
      await seedInitialCatalogueAndSettings();
      setStatusBanner({
        type: 'success',
        text: t('admin.syncSuccess', 'Synchronized initial 7 mineral products and business settings with Firestore.')
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : t('admin.syncError', 'Failed to sync catalogue.')
      });
    }
  };

  const handleUpdateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;
    setStatusBanner(null);
    const path = `quote_requests/${selectedQuote.id}`;
    try {
      await updateDoc(doc(db, 'quote_requests', selectedQuote.id), {
        status: quoteStatusDraft,
        internalNotes: quoteNoteDraft.trim().slice(0, 2000),
        updatedAt: serverTimestamp()
      });
      await logAdminActivity(
        'UPDATE_QUOTE_STATUS',
        selectedQuote.quoteReference,
        `Updated quote ${selectedQuote.quoteReference} status to ${quoteStatusDraft}.`
      );
      setStatusBanner({
        type: 'success',
        text: t('admin.quotes.updateSuccess', 'Updated quotation {ref} to "{status}".')
          .replace('{ref}', selectedQuote.quoteReference)
          .replace('{status}', formatQuoteStatus(quoteStatusDraft))
      });
      setSelectedQuote(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact) return;
    setStatusBanner(null);
    const path = `contact_messages/${selectedContact.id}`;
    try {
      await updateDoc(doc(db, 'contact_messages', selectedContact.id), {
        status: contactStatusDraft,
        internalNotes: contactNoteDraft.trim().slice(0, 2000),
        updatedAt: serverTimestamp()
      });
      await logAdminActivity(
        'UPDATE_CONTACT_ENQUIRY',
        selectedContact.id,
        `Updated contact enquiry from ${selectedContact.fullName} to ${contactStatusDraft}.`
      );
      setStatusBanner({
        type: 'success',
        text: t('admin.contacts.updateSuccess', 'Updated contact enquiry from {name}.').replace('{name}', selectedContact.fullName)
      });
      setSelectedContact(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const formatProductCategory = (category: ProductCategory) => {
    switch (category) {
      case 'Mineral Powders':
        return t('admin.products.catMineralPowders', 'Mineral Powders');
      case 'Crushed Stone & Chips':
        return t('admin.products.catCrushedStone', 'Crushed Stone & Chips');
      case 'Decorative Powder':
        return t('admin.products.catDecorativePowder', 'Decorative Powder');
      default:
        return category;
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;
    if (file.size > 5 * 1024 * 1024) {
      setStatusBanner({ type: 'error', text: t('admin.products.imgSizeLimit', 'Image file must be under 5 MB.') });
      return;
    }
    setUploadingImage(true);
    setStatusBanner(null);
    try {
      const safeSlug = editingProduct.slug || 'mineral-product';
      const storageRef = ref(storage, `products/${safeSlug}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      setEditingProduct({
        ...editingProduct,
        mainImage: downloadUrl
      });
      setStatusBanner({
        type: 'success',
        text: t('admin.products.imgUploadSuccess', 'Uploaded product image to Firebase Storage.')
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text:
          err instanceof Error
            ? t('admin.products.imgUploadErrorWithMsg', 'Storage upload failed: {msg}. You can also enter a direct asset path.').replace('{msg}', err.message)
            : t('admin.products.imgUploadError', 'Storage upload failed.')
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setStatusBanner(null);
    try {
      await saveProduct(editingProduct, isNewProduct);
      setStatusBanner({
        type: 'success',
        text: t('admin.products.saveSuccess', 'Saved product "{name}".').replace('{name}', editingProduct.name)
      });
      setEditingProduct(null);
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : t('admin.products.saveError', 'Failed to save product.')
      });
    }
  };

  const handleConfirmDeleteProduct = async () => {
    if (!confirmDeleteProduct) return;
    setStatusBanner(null);
    try {
      await removeProduct(confirmDeleteProduct.id, confirmDeleteProduct.name);
      setStatusBanner({
        type: 'success',
        text: t('admin.products.deleteSuccess', 'Deleted product "{name}" from catalogue. Historical quotes remain intact.').replace('{name}', confirmDeleteProduct.name)
      });
      setConfirmDeleteProduct(null);
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : t('admin.products.deleteError', 'Could not delete product.')
      });
    }
  };

  const handleSaveSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusBanner(null);
    try {
      await saveBusinessSettings(settingsForm);
      setStatusBanner({
        type: 'success',
        text: t('admin.settings.updateSuccess', 'Updated public business settings and contact details.')
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : t('admin.settings.updateError', 'Could not update business settings.')
      });
    }
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen">
      <SEOHead
        title={`${t('admin.seoTitle', 'Admin Dashboard')} | ${settings.companyName}`}
        description={t('admin.seoDesc', 'Administrator portal for managing products, quotation requests, contact enquiries, and business settings.')}
      />

      {/* Top Admin Header Bar — Midnight Navy #0F172A */}
      <div className="bg-[#0F172A] text-[#FFFFFF] border-b border-[#D97706]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-[#F59E0B]">
              {t('admin.authorizedPortal')}
            </span>
            <h1 className="font-display text-2xl font-bold text-[#FFFFFF]">
              {settings.companyName} {t('admin.management')}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSyncCatalogue}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0F172A] bg-[#FFF7ED] hover:bg-[#FFFFFF] rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('admin.syncCatalogue', 'Sync Initial 7 Products to Firestore')}</span>
            </button>
            <span className="text-xs text-slate-300 font-mono-tabular">
              {user.email}
            </span>
            <button
              type="button"
              onClick={() => signOutAdmin()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#FFFFFF] bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('admin.signOut', 'Sign Out')}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto pb-3">
          {[
            { id: 'overview', label: t('admin.tabOverview') },
            { id: 'products', label: `${t('admin.tabProducts')} (${allProductsAdmin.length})` },
            { id: 'quotes', label: `${t('admin.tabQuotes')} (${quotes.length})` },
            { id: 'contacts', label: `${t('admin.tabContacts')} (${contacts.length})` },
            { id: 'customer_enquiries', label: `${t('admin.tabCustomerEnquiries')} (${customerEnquiries.length})` },
            { id: 'settings', label: t('admin.tabSettings') },
            { id: 'users', label: `${t('admin.tabUsers')} (${adminUsers.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as AdminTab);
                navigate(tab.id === 'users' ? '/admin/users' : '/admin/dashboard');
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#FFFFFF] text-[#0F172A]'
                  : 'text-slate-300 hover:text-[#FFFFFF] hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {statusBanner && (
          <div
            role="status"
            className={`rounded-xl p-4 border flex items-center justify-between gap-3 text-sm ${
              statusBanner.type === 'success'
                ? 'bg-[#FFF7ED] border-[#D97706]/40 text-[#0F172A]'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {statusBanner.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-[#D97706] shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
              )}
              <span>{statusBanner.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              className="text-xs font-semibold underline cursor-pointer"
            >
              {t('admin.dismiss', 'Dismiss')}
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-[#FFF7ED] border border-[#F3F4F6] rounded-xl p-6">
                <p className="text-xs font-semibold text-[#1F2937]">{t('admin.statPublishedProducts', 'Published Products')}</p>
                <p className="font-display font-mono-tabular text-3xl font-bold text-[#0F172A] mt-2">
                  {publishedProductsCount}
                </p>
                <p className="text-xs text-[#1F2937]/70 mt-1">
                  {t('admin.statActiveInCatalogue', 'Active in public catalogue')}
                </p>
              </div>

              <div className="bg-[#FFF7ED] border border-[#F3F4F6] rounded-xl p-6">
                <p className="text-xs font-semibold text-[#1F2937]">{t('admin.statNewQuoteRequests', 'New Quote Requests')}</p>
                <p className="font-display font-mono-tabular text-3xl font-bold text-[#DC2626] mt-2">
                  {newQuotesCount}
                </p>
                <p className="text-xs text-[#1F2937]/70 mt-1">
                  {t('admin.statAwaitingReview', 'Awaiting initial review')}
                </p>
              </div>

              <div className="bg-[#FFF7ED] border border-[#F3F4F6] rounded-xl p-6">
                <p className="text-xs font-semibold text-[#1F2937]">{t('admin.statQuotesUnderReview', 'Quotes Under Review')}</p>
                <p className="font-display font-mono-tabular text-3xl font-bold text-[#0F172A] mt-2">
                  {underReviewQuotesCount}
                </p>
                <p className="text-xs text-[#1F2937]/70 mt-1">
                  {t('admin.statInActivePrep', 'In active quotation preparation')}
                </p>
              </div>

              <div className="bg-[#FFF7ED] border border-[#F3F4F6] rounded-xl p-6">
                <p className="text-xs font-semibold text-[#1F2937]">{t('admin.statNewContactMessages', 'New Contact Messages')}</p>
                <p className="font-display font-mono-tabular text-3xl font-bold text-[#0F172A] mt-2">
                  {newContactsCount}
                </p>
                <p className="text-xs text-[#1F2937]/70 mt-1">
                  {t('admin.statGeneralEnquiries', 'General website enquiries')}
                </p>
              </div>
            </div>

            {/* Optional Webhook Notification Configuration Status Card */}
            <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display font-bold text-sm text-[#0F172A]">
                      {t('admin.storageDeliveryTitle', 'Enquiry Storage & Notification Delivery:')}
                    </span>
                    <span className="font-semibold text-[#D97706]">
                      {notificationConfig.configured
                        ? t('admin.firestoreActiveWebhookEnabled', 'Firestore Active · Webhook Enabled')
                        : t('admin.firestoreActiveWebhookDisabled', 'Firestore Active · Webhook Disabled (Optional)')}
                    </span>
                  </div>
                  <p className="text-[#1F2937] leading-relaxed">
                    {t('admin.storageDefaultStatus', notificationConfig.statusMessage)}
                  </p>
                </div>
              </div>
              <div className="text-xs font-mono-tabular text-[#0F172A] bg-[#FFF7ED] border border-[#F3F4F6] px-3 py-1.5 rounded-lg shrink-0">
                {notificationConfig.configured
                  ? t('admin.webhookBadgeEnabled', 'Webhook: Enabled')
                  : t('admin.webhookBadgeOptional', 'Webhook: Optional')}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Quote Requests */}
              <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-[#0F172A]">
                    {t('admin.recentQuoteRequests', 'Recently Received Quote Requests')}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('quotes')}
                    className="text-xs font-semibold text-[#DC2626] hover:underline cursor-pointer"
                  >
                    {t('admin.viewAllQuotes', 'View All Quotes')}
                  </button>
                </div>

                {quotes.length === 0 ? (
                  <p className="text-xs text-[#1F2937] py-6">
                    {t('admin.noQuotesYet', 'No quotation requests have been submitted yet.')}
                  </p>
                ) : (
                  <div className="divide-y divide-[#F3F4F6]">
                    {quotes.slice(0, 5).map((q) => (
                      <div key={q.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                        <div>
                          <p className="font-mono-tabular font-bold text-[#0F172A]">
                            {q.quoteReference} · {q.productName}
                          </p>
                          <p className="text-[#1F2937] mt-0.5">
                            {q.customerName} ({q.quantity} {q.quantityUnit}) · {q.deliveryLocation}
                          </p>
                        </div>
                        <span className="font-semibold text-[#D97706] shrink-0">
                          {formatQuoteStatus(q.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Contact Messages */}
              <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-[#0F172A]">
                    {t('admin.recentContactMessages', 'Recent Contact Messages')}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('contacts')}
                    className="text-xs font-semibold text-[#DC2626] hover:underline cursor-pointer"
                  >
                    {t('admin.viewAllMessages', 'View All Messages')}
                  </button>
                </div>

                {contacts.length === 0 ? (
                  <p className="text-xs text-[#1F2937] py-6">
                    {t('admin.noContactsYet', 'No contact enquiries have been submitted yet.')}
                  </p>
                ) : (
                  <div className="divide-y divide-[#F3F4F6]">
                    {contacts.slice(0, 5).map((c) => (
                      <div key={c.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                        <div>
                          <p className="font-bold text-[#0F172A]">
                            {c.fullName} · {c.subject}
                          </p>
                          <p className="text-[#1F2937] line-clamp-1 mt-0.5">
                            {c.message}
                          </p>
                        </div>
                        <span className="font-semibold text-[#0F172A] shrink-0">
                          {formatContactStatus(c.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCT MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-[#0F172A]">
                  {t('admin.products.catalogueTitle', 'Product Catalogue Management')}
                </h2>
                <p className="text-xs text-[#1F2937] mt-0.5">
                  {t('admin.products.catalogueDesc', 'Add, edit, preview, publish, or unpublish mineral products. Historical quotation requests remain untouched when products are modified.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsNewProduct(true);
                  setEditingProduct({
                    id: `product-${Date.now()}`,
                    name: '',
                    slug: '',
                    category: 'Mineral Powders',
                    shortDescription: '',
                    fullDescription: '',
                    commonApplications: [''],
                    mainImage: '/assets/minerals/limestone-powder.jpg',
                    additionalImages: [],
                    allowedUnits: ['Tonnes', 'Bags', 'kg'],
                    published: false,
                    displayOrder: allProductsAdmin.length + 1
                  });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#FFFFFF] bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('admin.products.addProduct', 'Add Product')}</span>
              </button>
            </div>

            <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FFF7ED] border-b border-[#F3F4F6] text-[#0F172A] font-display font-bold">
                    <th className="py-3.5 px-4">{t('admin.products.colOrder', 'Order')}</th>
                    <th className="py-3.5 px-4">{t('admin.products.colProduct', 'Product')}</th>
                    <th className="py-3.5 px-4">{t('admin.products.colCategory', 'Category')}</th>
                    <th className="py-3.5 px-4">{t('admin.products.colUnits', 'Units')}</th>
                    <th className="py-3.5 px-4">{t('admin.products.colStatus', 'Status')}</th>
                    <th className="py-3.5 px-4 text-right">{t('admin.products.colActions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {allProductsAdmin.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-[#1F2937]">
                        {t('admin.products.noProducts', 'No mineral products found in catalogue.')}
                      </td>
                    </tr>
                  ) : (
                    allProductsAdmin.map((prod) => (
                      <tr key={prod.id} className="hover:bg-[#FFF7ED]/50">
                        <td className="py-3.5 px-4 font-mono-tabular font-semibold text-[#0F172A]">
                          #{prod.displayOrder}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#0F172A]">{t(`prod.${prod.slug}.name`, prod.name)}</p>
                          <p className="text-[#1F2937]/70 font-mono-tabular">/products/{prod.slug}</p>
                        </td>
                        <td className="py-3.5 px-4 text-[#1F2937]">{t(`prod.${prod.slug}.cat`, formatProductCategory(prod.category))}</td>
                        <td className="py-3.5 px-4 text-[#1F2937]">
                          {prod.allowedUnits.join(', ')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-[#0F172A]">
                            {prod.published ? t('admin.products.statusPublished', 'Published (Public)') : t('admin.products.statusDraft', 'Draft (Hidden)')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setPreviewProduct(prod)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#0F172A] font-semibold cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{t('admin.products.btnPreview', 'Preview')}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsNewProduct(false);
                              setEditingProduct({ ...prod });
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#0F172A] text-[#FFFFFF] font-semibold cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{t('admin.products.btnEdit', 'Edit')}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteProduct(prod)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-red-50 hover:bg-red-100 text-[#DC2626] font-semibold cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{t('admin.products.btnDelete', 'Delete')}</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Product Edit / Create Form Modal */}
            {editingProduct && (
              <div className="fixed inset-0 z-50 bg-[#0F172A]/60 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
                    <h3 className="font-display text-lg font-bold text-[#0F172A]">
                      {isNewProduct ? t('admin.products.modalAddTitle', 'Add Mineral Product') : `${t('admin.products.modalEditTitle', 'Edit')} ${editingProduct.name}`}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="text-xs font-semibold text-[#1F2937] hover:text-[#0F172A] cursor-pointer"
                    >
                      {t('admin.products.btnClose', 'Close')}
                    </button>
                  </div>

                  <form onSubmit={handleSaveProductSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-[#0F172A] mb-1">
                          {t('admin.products.labelName', 'Product Name *')}
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={100}
                          value={editingProduct.name}
                          onChange={(e) => {
                            const name = e.target.value;
                            const autoSlug = isNewProduct
                              ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                              : editingProduct.slug;
                            setEditingProduct({
                              ...editingProduct,
                              name,
                              slug: autoSlug,
                              id: isNewProduct ? autoSlug || editingProduct.id : editingProduct.id
                            });
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-[#0F172A] mb-1">
                          {t('admin.products.labelSlug', 'URL Slug *')}
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={80}
                          value={editingProduct.slug}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              slug: e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, '-')
                            })
                          }
                          className="w-full px-3 py-2 font-mono-tabular border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-semibold text-[#0F172A] mb-1">
                          {t('admin.products.labelCategory', 'Category *')}
                        </label>
                        <select
                          value={editingProduct.category}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              category: e.target.value as ProductCategory
                            })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        >
                          <option value="Mineral Powders">{t('admin.products.catMineralPowders', 'Mineral Powders')}</option>
                          <option value="Crushed Stone & Chips">{t('admin.products.catCrushedStone', 'Crushed Stone & Chips')}</option>
                          <option value="Decorative Powder">{t('admin.products.catDecorativePowder', 'Decorative Powder')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-[#0F172A] mb-1">
                          {t('admin.products.labelDisplayOrder', 'Display Order *')}
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={editingProduct.displayOrder}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              displayOrder: Number(e.target.value) || 1
                            })
                          }
                          className="w-full px-3 py-2 font-mono-tabular border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div className="flex items-center pt-5">
                        <label className="inline-flex items-center gap-2 font-semibold text-[#0F172A] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingProduct.published}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                published: e.target.checked
                              })
                            }
                            className="w-4 h-4 rounded"
                          />
                          <span>{t('admin.products.labelPublished', 'Published in Public Catalogue')}</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">
                        {t('admin.products.labelShortDesc', 'Short Description (Card Summary) *')}
                      </label>
                      <textarea
                        rows={2}
                        required
                        maxLength={350}
                        value={editingProduct.shortDescription}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            shortDescription: e.target.value
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">
                        {t('admin.products.labelFullDesc', 'Full Description (Detail Page) *')}
                      </label>
                      <textarea
                        rows={3}
                        required
                        maxLength={2000}
                        value={editingProduct.fullDescription}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            fullDescription: e.target.value
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">
                        {t('admin.products.labelApplications', 'Common Applications (One per line, max 10) *')}
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={editingProduct.commonApplications.join('\n')}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            commonApplications: e.target.value.split('\n')
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-[#0F172A] mb-1">
                          {t('admin.products.labelMainImage', 'Main Image Path or URL *')}
                        </label>
                        <input
                          type="text"
                          required
                          value={editingProduct.mainImage}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              mainImage: e.target.value
                            })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        />
                        <div className="mt-2">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF7ED] border border-[#D97706]/30 rounded-lg font-semibold text-[#0F172A] cursor-pointer">
                            <Upload className="w-3.5 h-3.5 text-[#D97706]" />
                            <span>{uploadingImage ? t('admin.products.uploading', 'Uploading...') : t('admin.products.uploadToStorage', 'Upload Image to Firebase Storage')}</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/svg+xml"
                              onChange={handleImageFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-[#0F172A] mb-1">
                          {t('admin.products.labelAllowedUnits', 'Allowed Quantity Units (Comma-separated) *')}
                        </label>
                        <input
                          type="text"
                          required
                          value={editingProduct.allowedUnits.join(', ')}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              allowedUnits: e.target.value.split(',').map((s) => s.trim())
                            })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#F3F4F6] flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setPreviewProduct(editingProduct)}
                        className="px-4 py-2 font-semibold text-[#0F172A] bg-[#F3F4F6] rounded-lg cursor-pointer"
                      >
                        {t('admin.products.btnPreviewBeforeSave', 'Preview Before Saving')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="px-4 py-2 font-semibold text-[#1F2937] hover:text-[#0F172A] cursor-pointer"
                      >
                        {t('admin.products.btnCancel', 'Cancel')}
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 font-semibold text-[#FFFFFF] bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg cursor-pointer"
                      >
                        {t('admin.products.btnSave', 'Save Product')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Product Preview Modal */}
            {previewProduct && (
              <div className="fixed inset-0 z-50 bg-[#0F172A]/60 flex items-center justify-center p-4">
                <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl max-w-xl w-full p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
                    <h3 className="font-display text-base font-bold text-[#0F172A]">
                      {t('admin.products.previewTitle', 'Catalogue Preview:')} {previewProduct.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setPreviewProduct(null)}
                      className="text-xs font-semibold text-[#DC2626] cursor-pointer"
                    >
                      {t('admin.products.btnClosePreview', 'Close Preview')}
                    </button>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-[#F3F4F6]">
                    <MineralImage
                      src={previewProduct.mainImage}
                      alt={t(`prod.${previewProduct.slug}.name`, previewProduct.name)}
                      title={t(`prod.${previewProduct.slug}.name`, previewProduct.name)}
                      aspectClassName="aspect-[16/9]"
                    />
                  </div>
                  <p className="text-xs font-semibold text-[#D97706]">
                    {t(`prod.${previewProduct.slug}.cat`, formatProductCategory(previewProduct.category))} · {previewProduct.published ? t('admin.products.previewPublished', 'Published') : t('admin.products.previewDraft', 'Unpublished Draft')}
                  </p>
                  <p className="text-sm text-[#1F2937] leading-relaxed">
                    {t(`prod.${previewProduct.slug}.fullDesc`, previewProduct.fullDescription)}
                  </p>
                  <div className="bg-[#FFF7ED] rounded-lg p-3 text-xs">
                    <p className="font-bold text-[#0F172A] mb-1">{t('admin.products.previewApplicationsHeading', 'Common Applications:')}</p>
                    <ul className="list-disc list-inside space-y-1 text-[#1F2937]">
                      {previewProduct.commonApplications.filter(Boolean).map((a, i) => (
                        <li key={i}>{t(`prod.${previewProduct.slug}.app${i+1}`, a)}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Dialog for Destructive Product Deletion */}
            {confirmDeleteProduct && (
              <div className="fixed inset-0 z-50 bg-[#0F172A]/60 flex items-center justify-center p-4">
                <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl max-w-md w-full p-6 space-y-4">
                  <h3 className="font-display text-lg font-bold text-[#0F172A]">
                    {t('admin.products.deleteConfirmTitle', 'Confirm Product Removal')}
                  </h3>
                  <p className="text-xs text-[#1F2937] leading-relaxed">
                    {t('admin.products.deleteConfirmPrefix', 'Are you sure you want to remove')} <strong>{confirmDeleteProduct.name}</strong> {t('admin.products.deleteConfirmSuffix', 'from the catalogue? Existing customer quotation records referencing this product will be preserved.')}
                  </p>
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteProduct(null)}
                      className="px-4 py-2 text-xs font-semibold text-[#0F172A] bg-[#F3F4F6] rounded-lg cursor-pointer"
                    >
                      {t('admin.products.btnCancel', 'Cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDeleteProduct}
                      className="px-4 py-2 text-xs font-semibold text-[#FFFFFF] bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg cursor-pointer"
                    >
                      {t('admin.products.btnConfirmDelete', 'Confirm Delete')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: QUOTE MANAGEMENT */}
        {activeTab === 'quotes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-[#0F172A]">
                  {t('admin.quotes.title', 'Quotation Requests')}
                </h2>
                <p className="text-xs text-[#1F2937]">
                  {t('admin.quotes.desc', 'Search by quote reference or customer name, filter by workflow status, and record internal follow-up notes.')}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#1F2937]/60 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={quoteSearch}
                    onChange={(e) => setQuoteSearch(e.target.value)}
                    placeholder={t('admin.quotes.searchPlaceholder', 'Search reference or customer...')}
                    className="pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <select
                  value={quoteStatusFilter}
                  onChange={(e) => setQuoteStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-[#FFFFFF]"
                >
                  <option value="ALL">{t('admin.quotes.filterAllStatus', 'All Statuses')}</option>
                  <option value="New">{t('status.new', 'New')}</option>
                  <option value="Under Review">{t('status.underReview', 'Under Review')}</option>
                  <option value="Contacted">{t('status.contacted', 'Contacted')}</option>
                  <option value="Quotation Prepared">{t('status.quotationPrepared', 'Quotation Prepared')}</option>
                  <option value="Closed">{t('status.closed', 'Closed')}</option>
                </select>
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FFF7ED] border-b border-[#F3F4F6] text-[#0F172A] font-display font-bold">
                    <th className="py-3.5 px-4">{t('admin.quotes.colReference', 'Reference')}</th>
                    <th className="py-3.5 px-4">{t('admin.quotes.colCustomer', 'Customer')}</th>
                    <th className="py-3.5 px-4">{t('admin.quotes.colProductQuantity', 'Product & Quantity')}</th>
                    <th className="py-3.5 px-4">{t('admin.quotes.colDeliveryLocation', 'Delivery Location')}</th>
                    <th className="py-3.5 px-4">{t('admin.quotes.colSubmitted', 'Submitted')}</th>
                    <th className="py-3.5 px-4">{t('admin.quotes.colStatus', 'Status')}</th>
                    <th className="py-3.5 px-4 text-right">{t('admin.quotes.colManage', 'Manage')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {filteredQuotes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#1F2937]">
                        {t('admin.quotes.noQuotesFound', 'No matching quotation requests found.')}
                      </td>
                    </tr>
                  ) : (
                    filteredQuotes.map((q) => (
                      <tr key={q.id} className="hover:bg-[#FFF7ED]/50">
                        <td className="py-3.5 px-4 font-mono-tabular font-bold text-[#0F172A]">
                          {q.quoteReference}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#0F172A]">{q.customerName}</p>
                          {q.companyName && <p className="text-[#1F2937]/70">{q.companyName}</p>}
                          <p className="font-mono-tabular text-[#1F2937]">{q.phone}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-[#0F172A]">{q.productName}</p>
                          <p className="font-mono-tabular text-[#1F2937]">
                            {q.quantity} {q.quantityUnit}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-[#1F2937]">{q.deliveryLocation}</td>
                        <td className="py-3.5 px-4 font-mono-tabular text-[#1F2937]">
                          {formatTimestamp(q.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#D97706]">
                          {formatQuoteStatus(q.status)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedQuote(q);
                              setQuoteStatusDraft(q.status);
                              setQuoteNoteDraft(q.internalNotes || '');
                            }}
                            className="px-3 py-1.5 rounded bg-[#0F172A] text-[#FFFFFF] font-semibold cursor-pointer"
                          >
                            {t('admin.quotes.btnOpenRequest', 'Open Request')}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {selectedQuote && (
              <div className="fixed inset-0 z-50 bg-[#0F172A]/60 flex items-center justify-center p-4">
                <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
                    <div>
                      <span className="font-mono-tabular text-xs font-bold text-[#D97706]">
                        {selectedQuote.quoteReference}
                      </span>
                      <h3 className="font-display text-lg font-bold text-[#0F172A]">
                        {t('admin.quotes.modalTitle', 'Quotation Request —')} {selectedQuote.customerName}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedQuote(null)}
                      className="text-xs font-semibold text-[#1F2937] cursor-pointer"
                    >
                      {t('admin.quotes.btnClose', 'Close')}
                    </button>
                  </div>

                  <div className="bg-[#FFF7ED] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-[#0F172A]">{t('admin.quotes.labelCustomer', 'Customer:')} </span>
                      <span>{selectedQuote.customerName}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#0F172A]">{t('admin.quotes.labelCompany', 'Company:')} </span>
                      <span>{selectedQuote.companyName || '—'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#0F172A]">{t('admin.quotes.labelPhone', 'Phone:')} </span>
                      <a
                        href={`tel:${selectedQuote.phone}`}
                        className="font-mono-tabular underline text-[#DC2626]"
                      >
                        {selectedQuote.phone}
                      </a>
                    </div>
                    <div>
                      <span className="font-semibold text-[#0F172A]">{t('admin.quotes.labelEmail', 'Email:')} </span>
                      <a
                        href={`mailto:${selectedQuote.email}?subject=Quotation%20${selectedQuote.quoteReference}%20-%20Naveen%20Minerals`}
                        className="underline text-[#DC2626] break-all"
                      >
                        {selectedQuote.email}
                      </a>
                    </div>
                    <div>
                      <span className="font-semibold text-[#0F172A]">{t('admin.quotes.labelProduct', 'Product:')} </span>
                      <span>{selectedQuote.productName}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#0F172A]">{t('admin.quotes.labelRequiredQuantity', 'Required Quantity:')} </span>
                      <span className="font-mono-tabular">
                        {selectedQuote.quantity} {selectedQuote.quantityUnit}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-semibold text-[#0F172A]">{t('admin.quotes.labelDeliveryLoc', 'Delivery Location:')} </span>
                      <span>{selectedQuote.deliveryLocation}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-semibold text-[#0F172A]">{t('admin.quotes.labelCustomerMessage', 'Customer Message:')} </span>
                      <p className="mt-1 text-[#1F2937]">
                        {selectedQuote.message || t('admin.quotes.noSpecialReq', 'No special requirements noted.')}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateQuote} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">
                        {t('admin.quotes.labelWorkflowStatus', 'Quotation Workflow Status')}
                      </label>
                      <select
                        value={quoteStatusDraft}
                        onChange={(e) => setQuoteStatusDraft(e.target.value as QuoteStatus)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      >
                        <option value="New">{t('status.new', 'New')}</option>
                        <option value="Under Review">{t('status.underReview', 'Under Review')}</option>
                        <option value="Contacted">{t('status.contacted', 'Contacted')}</option>
                        <option value="Quotation Prepared">{t('status.quotationPrepared', 'Quotation Prepared')}</option>
                        <option value="Closed">{t('status.closed', 'Closed')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">
                        {t('admin.quotes.labelInternalNotes', 'Internal Administrator Notes')}
                      </label>
                      <textarea
                        rows={3}
                        maxLength={2000}
                        value={quoteNoteDraft}
                        onChange={(e) => setQuoteNoteDraft(e.target.value)}
                        placeholder={t('admin.quotes.notesPlaceholder', 'Record internal follow-up details, discussed grade, or dispatch notes...')}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedQuote(null)}
                        className="px-4 py-2 font-semibold text-[#1F2937] bg-[#F3F4F6] rounded-lg cursor-pointer"
                      >
                        {t('admin.quotes.btnCancel', 'Cancel')}
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 font-semibold text-[#FFFFFF] bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg cursor-pointer"
                      >
                        {t('admin.quotes.btnSaveStatusNotes', 'Save Status & Notes')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CONTACT ENQUIRY MANAGEMENT */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-[#0F172A]">
                  {t('admin.contacts.title', 'Customer Contact Enquiries')}
                </h2>
                <p className="text-xs text-[#1F2937]">
                  {t('admin.contacts.desc', 'Review messages submitted through the Contact page and track follow-up status.')}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#1F2937]/60 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    placeholder={t('admin.contacts.searchPlaceholder', 'Search sender, email, subject or message...')}
                    className="pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <select
                  value={contactStatusFilter}
                  onChange={(e) => setContactStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-[#FFFFFF]"
                >
                  <option value="ALL">{t('admin.contacts.filterAllStatus', 'All Statuses')}</option>
                  <option value="New">{t('admin.contacts.statusNew', 'New')}</option>
                  <option value="Reviewed">{t('admin.contacts.statusReviewed', 'Reviewed')}</option>
                  <option value="Responded">{t('admin.contacts.statusResponded', 'Responded')}</option>
                  <option value="Archived">{t('admin.contacts.statusArchived', 'Archived')}</option>
                </select>
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FFF7ED] border-b border-[#F3F4F6] text-[#0F172A] font-display font-bold">
                    <th className="py-3.5 px-4">{t('admin.contacts.colSender', 'Sender')}</th>
                    <th className="py-3.5 px-4">{t('admin.contacts.colSubject', 'Subject')}</th>
                    <th className="py-3.5 px-4">{t('admin.contacts.colMessage', 'Message')}</th>
                    <th className="py-3.5 px-4">{t('admin.contacts.colReceived', 'Received')}</th>
                    <th className="py-3.5 px-4">{t('admin.contacts.colStatus', 'Status')}</th>
                    <th className="py-3.5 px-4 text-right">{t('admin.contacts.colAction', 'Action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {contacts.filter((c) => {
                    const matchesSearch =
                      !contactSearch ||
                      c.fullName.toLowerCase().includes(contactSearch.toLowerCase()) ||
                      (c.email && c.email.toLowerCase().includes(contactSearch.toLowerCase())) ||
                      c.phone.toLowerCase().includes(contactSearch.toLowerCase()) ||
                      c.subject.toLowerCase().includes(contactSearch.toLowerCase()) ||
                      c.message.toLowerCase().includes(contactSearch.toLowerCase());
                    const matchesStatus = contactStatusFilter === 'ALL' || c.status === contactStatusFilter;
                    return matchesSearch && matchesStatus;
                  }).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#1F2937]">
                        {t('admin.contacts.emptyState', 'No contact messages received yet.')}
                      </td>
                    </tr>
                  ) : (
                    contacts.filter((c) => {
                      const matchesSearch =
                        !contactSearch ||
                        c.fullName.toLowerCase().includes(contactSearch.toLowerCase()) ||
                        (c.email && c.email.toLowerCase().includes(contactSearch.toLowerCase())) ||
                        c.phone.toLowerCase().includes(contactSearch.toLowerCase()) ||
                        c.subject.toLowerCase().includes(contactSearch.toLowerCase()) ||
                        c.message.toLowerCase().includes(contactSearch.toLowerCase());
                      const matchesStatus = contactStatusFilter === 'ALL' || c.status === contactStatusFilter;
                      return matchesSearch && matchesStatus;
                    }).map((c) => (
                      <tr key={c.id} className="hover:bg-[#FFF7ED]/50">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#0F172A]">{c.fullName}</p>
                          <p className="font-mono-tabular text-[#1F2937]">{c.phone}</p>
                          {c.email && <p className="text-[#1F2937]/70">{c.email}</p>}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#0F172A]">{c.subject}</td>
                        <td className="py-3.5 px-4 text-[#1F2937] max-w-xs truncate">
                          {c.message}
                        </td>
                        <td className="py-3.5 px-4 font-mono-tabular text-[#1F2937]">
                          {formatTimestamp(c.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#D97706]">{formatContactStatus(c.status)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedContact(c);
                              setContactStatusDraft(c.status);
                              setContactNoteDraft(c.internalNotes || '');
                            }}
                            className="px-3 py-1.5 rounded bg-[#0F172A] text-[#FFFFFF] font-semibold cursor-pointer"
                          >
                            {t('admin.contacts.btnReview', 'Review')}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {selectedContact && (
              <div className="fixed inset-0 z-50 bg-[#0F172A]/60 flex items-center justify-center p-4">
                <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl max-w-lg w-full p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
                    <h3 className="font-display text-lg font-bold text-[#0F172A]">
                      {t('admin.contacts.modalTitle', 'Contact Enquiry —')} {selectedContact.fullName}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSelectedContact(null)}
                      className="text-xs font-semibold text-[#1F2937] cursor-pointer"
                    >
                      {t('admin.contacts.btnClose', 'Close')}
                    </button>
                  </div>

                  <div className="bg-[#FFF7ED] rounded-xl p-4 space-y-2 text-xs">
                    <p>
                      <strong className="text-[#0F172A]">{t('admin.contacts.labelPhone', 'Phone:')} </strong>
                      <a href={`tel:${selectedContact.phone}`} className="underline text-[#DC2626] font-mono-tabular">
                        {selectedContact.phone}
                      </a>
                    </p>
                    {selectedContact.email && (
                      <p>
                        <strong className="text-[#0F172A]">{t('admin.contacts.labelEmail', 'Email:')} </strong>
                        <a href={`mailto:${selectedContact.email}`} className="underline text-[#DC2626]">
                          {selectedContact.email}
                        </a>
                      </p>
                    )}
                    <p>
                      <strong className="text-[#0F172A]">{t('admin.contacts.labelSubject', 'Subject:')} </strong>
                      {selectedContact.subject}
                    </p>
                    <p className="pt-2 border-t border-[#0F172A]/10 text-[#1F2937] leading-relaxed">
                      {selectedContact.message}
                    </p>
                  </div>

                  <form onSubmit={handleUpdateContact} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">
                        {t('admin.contacts.labelFollowUpStatus', 'Follow-up Status')}
                      </label>
                      <select
                        value={contactStatusDraft}
                        onChange={(e) => setContactStatusDraft(e.target.value as ContactStatus)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      >
                        <option value="New">{t('admin.contacts.statusNew', 'New')}</option>
                        <option value="Reviewed">{t('admin.contacts.statusReviewed', 'Reviewed')}</option>
                        <option value="Responded">{t('admin.contacts.statusResponded', 'Responded')}</option>
                        <option value="Archived">{t('admin.contacts.statusArchived', 'Archived')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">
                        {t('admin.contacts.labelInternalNotes', 'Internal Notes')}
                      </label>
                      <textarea
                        rows={3}
                        maxLength={2000}
                        value={contactNoteDraft}
                        onChange={(e) => setContactNoteDraft(e.target.value)}
                        placeholder={t('admin.contacts.notesPlaceholder', 'Record internal follow-up details or notes...')}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedContact(null)}
                        className="px-4 py-2 font-semibold bg-[#F3F4F6] rounded-lg cursor-pointer"
                      >
                        {t('admin.contacts.btnCancel', 'Cancel')}
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 font-semibold text-[#FFFFFF] bg-[#DC2626] rounded-lg cursor-pointer"
                      >
                        {t('admin.contacts.btnUpdate', 'Update Enquiry')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: BUSINESS SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-[#0F172A]">
                {t('admin.settings.title', 'Public Business Information & Settings')}
              </h2>
              <p className="text-xs text-[#1F2937] mt-1">
                {t('admin.settings.desc', 'Changes saved here update the public website header, footer, About page, and Contact page. GSTIN remains hidden from visitors unless both verified and enabled for public display.')}
              </p>
            </div>

            <form onSubmit={handleSaveSettingsSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    {t('admin.settings.labelBusinessName', 'Business Name *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.companyName}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, companyName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    {t('admin.settings.labelTagline', 'Tagline *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.tagline}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, tagline: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  {t('admin.settings.labelAddress', 'Business Address *')}
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.address}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    {t('admin.settings.labelPhone', 'Official Phone *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.phone}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 font-mono-tabular border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">
                    {t('admin.settings.labelEmail', 'Official Email *')}
                  </label>
                  <input
                    type="email"
                    required
                    value={settingsForm.email}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  {t('admin.settings.labelIntroText', 'Hero Introductory Text *')}
                </label>
                <textarea
                  rows={3}
                  required
                  value={settingsForm.introText}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, introText: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  {t('admin.settings.labelAboutText', 'About Page Copy *')}
                </label>
                <textarea
                  rows={4}
                  required
                  value={settingsForm.aboutText}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, aboutText: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              {/* GSTIN Verification Controls */}
              <div className="bg-[#FFF7ED] border border-[#F3F4F6] rounded-xl p-4 space-y-3">
                <p className="font-display font-bold text-[#0F172A]">
                  {t('admin.settings.titleGstinControl', 'GSTIN Registration Control (Hidden Until Verified)')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      {t('admin.settings.labelGstinNumber', 'GSTIN Number (Leave blank until verified)')}
                    </label>
                    <input
                      type="text"
                      maxLength={20}
                      value={settingsForm.gstin}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          gstin: e.target.value.toUpperCase()
                        })
                      }
                      placeholder={t('admin.settings.placeholderUnset', 'Unset')}
                      className="w-full px-3 py-2 font-mono-tabular border border-slate-300 rounded-lg bg-[#FFFFFF]"
                    />
                  </div>

                  <div className="space-y-2 pt-3">
                    <label className="flex items-center gap-2 font-semibold text-[#0F172A] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.gstinVerified}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            gstinVerified: e.target.checked,
                            showGstinPublicly: e.target.checked
                              ? settingsForm.showGstinPublicly
                              : false
                          })
                        }
                        className="w-4 h-4 rounded"
                      />
                      <span>{t('admin.settings.labelGstinVerified', 'GSTIN Verified by Owner')}</span>
                    </label>

                    <label className="flex items-center gap-2 font-semibold text-[#0F172A] cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!settingsForm.gstinVerified || settingsForm.gstin.trim().length < 15}
                        checked={settingsForm.showGstinPublicly}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            showGstinPublicly: e.target.checked
                          })
                        }
                        className="w-4 h-4 rounded disabled:opacity-50"
                      />
                      <span>{t('admin.settings.labelShowGstinPublicly', 'Display GSTIN on Public Website')}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 font-semibold text-[#FFFFFF] bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg transition-colors cursor-pointer"
                >
                  {t('admin.settings.btnSaveSettings', 'Save Business Settings')}
                </button>
              </div>
            </form>

            {/* Optional Notification Status Panel inside Business Settings */}
            <div className="pt-6 border-t border-[#F3F4F6] space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-base font-bold text-[#0F172A]">
                  {t('admin.settings.titleNotificationStorage', 'Enquiry Storage & Optional Webhook Delivery')}
                </h3>
                <span className="font-semibold text-[#D97706]">
                  {notificationConfig.configured
                    ? t('admin.settings.statusWebhookEnabled', 'Webhook Enabled')
                    : t('admin.settings.statusFirestoreActive', 'Firestore Active (Webhook Optional)')}
                </span>
              </div>
              <p className="text-[#1F2937] leading-relaxed">
                {notificationConfig.statusMessage}
              </p>
              <div className="bg-[#FFF7ED] border border-[#F3F4F6] rounded-xl p-4 space-y-1.5 text-[#1F2937]">
                <p>
                  • {t('admin.settings.noteFirestoreDirect', 'All customer quotation requests and contact messages are saved directly to Firestore without requiring any external webhook configuration.')}
                </p>
                <p>
                  • {t('admin.settings.noteWebhookOptional', 'If you wish to receive external webhook notifications in the future, you can optionally configure a valid')} <code className="font-mono-tabular">https://</code> {t('admin.settings.noteWebhookEndpoint', 'webhook endpoint in the server environment.')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: USER & ACCESS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFF7ED] border border-[#D97706]/30 rounded-2xl p-6">
              <div>
                <p className="text-xs font-semibold text-[#D97706]">{t('admin.users.badge', 'ACCESS CONTROL & RBAC')}</p>
                <h2 className="font-display text-xl font-bold text-[#0F172A] mt-1">
                  {t('admin.users.title', 'Administrator & User Access Management')}
                </h2>
                <p className="text-xs text-[#1F2937] mt-1 max-w-2xl">
                  {t('admin.users.desc', 'Manage authorized administrators, assign role-based permissions (Super Admin, Admin, Sub-Admin), review access history, and securely invite new team members.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-xl transition-colors shrink-0 shadow-sm cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[#F59E0B]" />
                <span>{t('admin.users.btnInvite', 'Invite New Administrator')}</span>
              </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('admin.users.searchPlaceholder', 'Search by name or email...')}
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs border border-[#F3F4F6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <select
                  value={adminRoleFilter}
                  onChange={(e) => setAdminRoleFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-[#F3F4F6] rounded-xl bg-white font-medium text-[#0F172A]"
                >
                  <option value="ALL">{t('admin.users.filterAllRoles', 'All Roles')}</option>
                  <option value="SUPER_ADMIN">{t('admin.users.roleSuperAdmin', 'Super Admin')}</option>
                  <option value="ADMIN">{t('admin.users.roleAdmin', 'Admin')}</option>
                  <option value="SUB_ADMIN">{t('admin.users.roleSubAdmin', 'Sub-Admin')}</option>
                </select>

                <select
                  value={adminStatusFilter}
                  onChange={(e) => setAdminStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-[#F3F4F6] rounded-xl bg-white font-medium text-[#0F172A]"
                >
                  <option value="ALL">{t('admin.users.filterAllStatuses', 'All Statuses')}</option>
                  <option value="Active">{t('admin.users.statusActive', 'Active')}</option>
                  <option value="Invited">{t('admin.users.statusInvited', 'Invited')}</option>
                  <option value="Revoked">{t('admin.users.statusRevoked', 'Revoked')}</option>
                </select>
              </div>
            </div>

            {/* Admin Users Table */}
            <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#F3F4F6] text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-5">{t('admin.users.colAdministrator', 'Administrator')}</th>
                      <th className="py-3.5 px-5">{t('admin.users.colRole', 'Role')}</th>
                      <th className="py-3.5 px-5">{t('admin.users.colStatus', 'Status')}</th>
                      <th className="py-3.5 px-5">{t('admin.users.colPermissions', 'Permissions')}</th>
                      <th className="py-3.5 px-5">{t('admin.users.colCreatedInvited', 'Created / Invited')}</th>
                      <th className="py-3.5 px-5 text-right">{t('admin.users.colActions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6] text-xs">
                    {adminUsers.filter((adm) => {
                      const matchSearch =
                        adm.email.toLowerCase().includes(adminSearch.toLowerCase()) ||
                        (adm.name || '').toLowerCase().includes(adminSearch.toLowerCase());
                      const matchRole = adminRoleFilter === 'ALL' || adm.role === adminRoleFilter;
                      const matchStatus = adminStatusFilter === 'ALL' || adm.status === adminStatusFilter;
                      return matchSearch && matchRole && matchStatus;
                    }).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#1F2937]">
                          {t('admin.users.emptyState', 'No administrator accounts match your criteria.')}
                        </td>
                      </tr>
                    ) : (
                      adminUsers
                        .filter((adm) => {
                          const matchSearch =
                            adm.email.toLowerCase().includes(adminSearch.toLowerCase()) ||
                            (adm.name || '').toLowerCase().includes(adminSearch.toLowerCase());
                          const matchRole = adminRoleFilter === 'ALL' || adm.role === adminRoleFilter;
                          const matchStatus = adminStatusFilter === 'ALL' || adm.status === adminStatusFilter;
                          return matchSearch && matchRole && matchStatus;
                        })
                        .map((adm) => {
                          const isBootstrap =
                            adm.email.toLowerCase() === 'jeevakumarrangarajk@gmail.com' ||
                            adm.email.toLowerCase() === 'usnnaveen@gmail.com';
                          return (
                            <tr key={adm.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-4 px-5">
                                <div className="font-semibold text-[#0F172A]">
                                  {adm.name || t('admin.users.unnamedAdmin', 'Unnamed Administrator')}
                                </div>
                                <div className="text-slate-500 font-mono-tabular text-[11px]">
                                  {adm.email}
                                </div>
                              </td>
                              <td className="py-4 px-5">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide ${
                                    adm.role === 'SUPER_ADMIN'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : adm.role === 'ADMIN'
                                      ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                      : 'bg-slate-100 text-slate-800 border border-slate-200'
                                  }`}
                                >
                                  <Shield className="w-3 h-3" />
                                  {formatUserRole(adm.role)}
                                </span>
                              </td>
                              <td className="py-4 px-5">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                                    adm.status === 'Active'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : adm.status === 'Invited'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-red-50 text-red-700 border border-red-200'
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    adm.status === 'Active' ? 'bg-emerald-500' : adm.status === 'Invited' ? 'bg-amber-500' : 'bg-red-500'
                                  }`} />
                                  {formatUserStatus(adm.status)}
                                </span>
                              </td>
                              <td className="py-4 px-5 text-[11px] text-slate-600">
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                  {Object.entries(adm.permissions || {}).map(([key, val]) =>
                                    val ? (
                                      <span key={key} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-mono text-[10px]">
                                        {formatPermissionKey(key)}
                                      </span>
                                    ) : null
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-5 text-slate-500 font-mono-tabular text-[11px]">
                                {adm.createdAt && typeof adm.createdAt === 'object' && 'seconds' in adm.createdAt
                                  ? new Date((adm.createdAt as any).seconds * 1000).toLocaleDateString()
                                  : t('admin.users.recentDate', 'Recent')}
                              </td>
                              <td className="py-4 px-5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingAdminUser(adm);
                                      setEditRole(adm.role);
                                      setEditStatus(adm.status);
                                      setEditPermissions({
                                        products: adm.permissions?.products ?? true,
                                        quotes: adm.permissions?.quotes ?? true,
                                        contacts: adm.permissions?.contacts ?? true,
                                        settings: adm.permissions?.settings ?? false,
                                        users: adm.permissions?.users ?? false,
                                        auditLogs: adm.permissions?.auditLogs ?? false
                                      });
                                    }}
                                    className="px-3 py-1.5 text-xs font-semibold text-[#0F172A] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                                  >
                                    {t('admin.users.btnEditRole', 'Edit Role')}
                                  </button>
                                  {!isBootstrap && (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (window.confirm(t('admin.users.confirmRevoke', 'Revoke access for {email}?').replace('{email}', adm.email))) {
                                          try {
                                            await updateDoc(doc(db, 'admin_users', adm.id), {
                                              status: 'Revoked',
                                              updatedAt: serverTimestamp()
                                            });
                                            await logAdminActivity(
                                              'REVOKE_ADMIN',
                                              adm.id,
                                              `Revoked access for admin ${adm.email}`
                                            );
                                            setStatusBanner({
                                              type: 'success',
                                              text: t('admin.users.revokeSuccess', 'Revoked access for {email}.').replace('{email}', adm.email)
                                            });
                                          } catch (err) {
                                            setStatusBanner({
                                              type: 'error',
                                              text: t('admin.users.revokeError', 'Failed to revoke access.')
                                            });
                                          }
                                        }
                                      }}
                                      className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                                    >
                                      {t('admin.users.btnRevoke', 'Revoke')}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* INVITE ADMIN MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="font-display text-lg font-bold text-[#0F172A]">
                  {t('admin.users.modalInviteTitle', 'Invite New Administrator')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteAdminSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  {t('admin.users.labelEmail', 'Email Address *')}
                </label>
                <input
                  type="email"
                  required
                  placeholder={t('admin.users.placeholderEmail', 'admin@example.com')}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#F3F4F6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  {t('admin.users.labelName', 'Display Name (Optional)')}
                </label>
                <input
                  type="text"
                  placeholder={t('admin.users.placeholderName', 'Full Name')}
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#F3F4F6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] mb-1">
                  {t('admin.users.labelAssignedRole', 'Assigned Role')}
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as AdminRole)}
                  className="w-full px-3.5 py-2.5 border border-[#F3F4F6] rounded-xl bg-white font-medium text-[#0F172A]"
                >
                  <option value="ADMIN">{t('admin.users.optionAdminDesc', 'ADMIN (Operational Management)')}</option>
                  <option value="SUB_ADMIN">{t('admin.users.optionSubAdminDesc', 'SUB_ADMIN (Restricted Modules)')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-[#0F172A]">
                  {t('admin.users.labelModulePermissions', 'Module Permissions')}
                </label>
                <div className="grid grid-cols-2 gap-2 bg-[#FFF7ED] p-3 rounded-xl border border-[#D97706]/20">
                  {Object.entries(invitePermissions).map(([key, val]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer capitalize">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={(e) =>
                          setInvitePermissions({
                            ...invitePermissions,
                            [key]: e.target.checked
                          })
                        }
                        className="w-4 h-4 rounded text-[#0F172A]"
                      />
                      <span>{formatPermissionKey(key)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F3F4F6]">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  {t('admin.users.btnCancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-lg cursor-pointer"
                >
                  {t('admin.users.btnSendInvitation', 'Send Invitation')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ADMIN MODAL */}
      {editingAdminUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-[#D97706]" />
                <h3 className="font-display text-lg font-bold text-[#0F172A]">
                  {t('admin.users.modalEditTitle', 'Edit Administrator & Permissions')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingAdminUser(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAdminSubmit} className="space-y-4 text-xs">
              <div>
                <p className="font-semibold text-slate-500 mb-1">{t('admin.users.labelAdminEmail', 'Administrator Email')}</p>
                <p className="font-mono-tabular text-sm font-bold text-[#0F172A]">{editingAdminUser.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">{t('admin.users.labelRole', 'Role')}</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as AdminRole)}
                    className="w-full px-3.5 py-2.5 border border-[#F3F4F6] rounded-xl bg-white font-medium text-[#0F172A]"
                  >
                    <option value="SUPER_ADMIN">{t('admin.users.roleSuperAdmin', 'Super Admin')}</option>
                    <option value="ADMIN">{t('admin.users.roleAdmin', 'Admin')}</option>
                    <option value="SUB_ADMIN">{t('admin.users.roleSubAdmin', 'Sub-Admin')}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#0F172A] mb-1">{t('admin.users.labelStatus', 'Status')}</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as AdminStatus)}
                    className="w-full px-3.5 py-2.5 border border-[#F3F4F6] rounded-xl bg-white font-medium text-[#0F172A]"
                  >
                    <option value="Active">{t('admin.users.statusActive', 'Active')}</option>
                    <option value="Invited">{t('admin.users.statusInvited', 'Invited')}</option>
                    <option value="Revoked">{t('admin.users.statusRevoked', 'Revoked')}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-[#0F172A]">
                  {t('admin.users.labelModulePermissions', 'Module Permissions')}
                </label>
                <div className="grid grid-cols-2 gap-2 bg-[#FFF7ED] p-3 rounded-xl border border-[#D97706]/20">
                  {Object.entries(editPermissions).map(([key, val]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer capitalize">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={(e) =>
                          setEditPermissions({
                            ...editPermissions,
                            [key]: e.target.checked
                          })
                        }
                        className="w-4 h-4 rounded text-[#0F172A]"
                      />
                      <span>{formatPermissionKey(key)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F3F4F6]">
                <button
                  type="button"
                  onClick={() => setEditingAdminUser(null)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  {t('admin.users.btnCancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-lg cursor-pointer"
                >
                  {t('admin.users.btnSaveChanges', 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 7: CUSTOMER ENQUIRIES */}
      {activeTab === 'customer_enquiries' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-[#0F172A]">
                {t('admin.customerEnquiries.title', 'Customer Quotation Enquiries')}
              </h2>
              <p className="text-xs text-[#1F2937]">
                {t('admin.customerEnquiries.desc', 'Manage registered customer product enquiries, set quotation amounts, status, and responses.')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#1F2937]/60 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={custEnqSearch}
                  onChange={(e) => setCustEnqSearch(e.target.value)}
                  placeholder={t('admin.customerEnquiries.searchPlaceholder', 'Search reference, email or product...')}
                  className="pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <select
                value={custEnqStatusFilter}
                onChange={(e) => setCustEnqStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-[#FFFFFF]"
              >
                <option value="ALL">{t('admin.customerEnquiries.filterAllStatus', 'All Statuses')}</option>
                <option value="NEW">{t('admin.customerEnquiries.statusNew', 'New Enquiry')}</option>
                <option value="UNDER_REVIEW">{t('admin.customerEnquiries.statusUnderReview', 'Under Review')}</option>
                <option value="QUOTATION_SENT">{t('admin.customerEnquiries.statusQuotationSent', 'Quotation Sent')}</option>
                <option value="ACCEPTED">{t('admin.customerEnquiries.statusAccepted', 'Accepted')}</option>
                <option value="CLOSED">{t('admin.customerEnquiries.statusClosed', 'Closed')}</option>
              </select>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-xl overflow-x-auto shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FFF7ED] border-b border-[#F3F4F6] text-[#0F172A] font-display font-bold">
                  <th className="py-3.5 px-4">{t('admin.customerEnquiries.colReference', 'Reference')}</th>
                  <th className="py-3.5 px-4">{t('admin.customerEnquiries.colCustomerEmail', 'Customer Email')}</th>
                  <th className="py-3.5 px-4">{t('admin.customerEnquiries.colProductQuantity', 'Product & Quantity')}</th>
                  <th className="py-3.5 px-4">{t('admin.customerEnquiries.colDelivery', 'Delivery')}</th>
                  <th className="py-3.5 px-4">{t('admin.customerEnquiries.colQuotationAmount', 'Quotation Amount')}</th>
                  <th className="py-3.5 px-4">{t('admin.customerEnquiries.colStatus', 'Status')}</th>
                  <th className="py-3.5 px-4 text-right">{t('admin.customerEnquiries.colManage', 'Manage')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {customerEnquiries.filter((enq) => {
                  const matchesSearch =
                    enq.enquiryReference.toLowerCase().includes(custEnqSearch.toLowerCase()) ||
                    enq.customerEmail.toLowerCase().includes(custEnqSearch.toLowerCase()) ||
                    enq.productName.toLowerCase().includes(custEnqSearch.toLowerCase());
                  const matchesStatus = custEnqStatusFilter === 'ALL' || enq.status === custEnqStatusFilter;
                  return matchesSearch && matchesStatus;
                }).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#1F2937]">
                      {t('admin.customerEnquiries.noEnquiriesFound', 'No customer enquiries found.')}
                    </td>
                  </tr>
                ) : (
                  customerEnquiries.filter((enq) => {
                    const matchesSearch =
                      enq.enquiryReference.toLowerCase().includes(custEnqSearch.toLowerCase()) ||
                      enq.customerEmail.toLowerCase().includes(custEnqSearch.toLowerCase()) ||
                      enq.productName.toLowerCase().includes(custEnqSearch.toLowerCase());
                    const matchesStatus = custEnqStatusFilter === 'ALL' || enq.status === custEnqStatusFilter;
                    return matchesSearch && matchesStatus;
                  }).map((enq) => (
                    <tr key={enq.id} className="hover:bg-[#FFF7ED]/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A]">
                        {enq.enquiryReference}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#0F172A]">{enq.customerName || t('admin.customerEnquiries.defaultCustomerName', 'Customer')}</p>
                        <p className="text-[#1F2937]/70 font-mono text-[11px]">{enq.customerEmail}</p>
                        <p className="font-mono-tabular text-[#1F2937]">{enq.phone}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-[#0F172A]">{enq.productName}</p>
                        <p className="font-mono-tabular text-[#1F2937]">
                          {enq.quantity} {enq.quantityUnit}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-[#1F2937]">{enq.deliveryLocation}</td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-700">
                        {enq.quotationAmount > 0 ? `${enq.currency || 'INR'} ${enq.quotationAmount.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#D97706]">
                        {formatCustomerEnquiryStatus(enq.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCustEnquiry(enq);
                            setCustEnqStatusDraft(enq.status);
                            setCustEnqAmountDraft(enq.quotationAmount || 0);
                            setCustEnqCurrencyDraft(enq.currency || 'INR');
                            setCustEnqResponseDraft(enq.adminResponse || '');
                            setCustEnqNotesDraft(enq.adminNotes || '');
                          }}
                          className="px-3 py-1.5 rounded bg-[#0F172A] text-[#FFFFFF] font-semibold cursor-pointer"
                        >
                          {t('admin.customerEnquiries.btnManageEnquiry', 'Manage Enquiry')}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {selectedCustEnquiry && (
            <div className="fixed inset-0 z-50 bg-[#0F172A]/60 flex items-center justify-center p-4">
              <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#D97706]">
                      {selectedCustEnquiry.enquiryReference}
                    </span>
                    <h3 className="font-display text-lg font-bold text-[#0F172A]">
                      {t('admin.customerEnquiries.modalTitle', 'Customer Enquiry —')} {selectedCustEnquiry.productName}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCustEnquiry(null)}
                    className="text-xs font-semibold text-[#1F2937] cursor-pointer"
                  >
                    {t('admin.customerEnquiries.btnClose', 'Close')}
                  </button>
                </div>

                <div className="bg-[#FFF7ED] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-[#0F172A]">{t('admin.customerEnquiries.labelCustomer', 'Customer:')} </span>
                    <span>{selectedCustEnquiry.customerName}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#0F172A]">{t('admin.customerEnquiries.labelEmail', 'Email:')} </span>
                    <span className="font-mono">{selectedCustEnquiry.customerEmail}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#0F172A]">{t('admin.customerEnquiries.labelPhone', 'Phone:')} </span>
                    <span className="font-mono-tabular">{selectedCustEnquiry.phone}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#0F172A]">{t('admin.customerEnquiries.labelQuantity', 'Quantity:')} </span>
                    <span className="font-mono-tabular">{selectedCustEnquiry.quantity} {selectedCustEnquiry.quantityUnit}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="font-semibold text-[#0F172A]">{t('admin.customerEnquiries.labelDeliveryLoc', 'Delivery Location:')} </span>
                    <span>{selectedCustEnquiry.deliveryLocation}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="font-semibold text-[#0F172A]">{t('admin.customerEnquiries.labelCustomerMessage', 'Customer Message:')} </span>
                    <p className="mt-1 text-[#1F2937]">{selectedCustEnquiry.message || t('admin.customerEnquiries.noMessageProvided', 'No message provided.')}</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateCustomerEnquiry} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      {t('admin.customerEnquiries.labelEnquiryStatus', 'Enquiry Status')}
                    </label>
                    <select
                      value={custEnqStatusDraft}
                      onChange={(e) => setCustEnqStatusDraft(e.target.value as CustomerEnquiryStatus)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="NEW">{t('admin.customerEnquiries.statusNew', 'New Enquiry')}</option>
                      <option value="UNDER_REVIEW">{t('admin.customerEnquiries.statusUnderReview', 'Under Review')}</option>
                      <option value="QUOTATION_SENT">{t('admin.customerEnquiries.statusQuotationSent', 'Quotation Sent')}</option>
                      <option value="ACCEPTED">{t('admin.customerEnquiries.statusAccepted', 'Accepted')}</option>
                      <option value="CLOSED">{t('admin.customerEnquiries.statusClosed', 'Closed')}</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">
                        {t('admin.customerEnquiries.labelQuotationAmount', 'Quotation Amount')}
                      </label>
                      <input
                        type="number"
                        value={custEnqAmountDraft}
                        onChange={(e) => setCustEnqAmountDraft(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        placeholder={t('admin.customerEnquiries.placeholderAmount', '0.00')}
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">
                        {t('admin.customerEnquiries.labelCurrency', 'Currency')}
                      </label>
                      <input
                        type="text"
                        value={custEnqCurrencyDraft}
                        onChange={(e) => setCustEnqCurrencyDraft(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        placeholder={t('admin.customerEnquiries.placeholderCurrency', 'INR')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      {t('admin.customerEnquiries.labelCustomerResponse', 'Customer-Facing Response & Quotation Details')}
                    </label>
                    <textarea
                      rows={3}
                      value={custEnqResponseDraft}
                      onChange={(e) => setCustEnqResponseDraft(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      placeholder={t('admin.customerEnquiries.placeholderResponse', 'Enter response visible to customer in their portal...')}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">
                      {t('admin.customerEnquiries.labelInternalNotes', 'Internal Admin Notes')} <span className="font-normal text-slate-400">{t('admin.customerEnquiries.hiddenFromCustomer', '(Hidden from customer)')}</span>
                    </label>
                    <textarea
                      rows={2}
                      value={custEnqNotesDraft}
                      onChange={(e) => setCustEnqNotesDraft(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      placeholder={t('admin.customerEnquiries.placeholderNotes', 'Internal notes...')}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedCustEnquiry(null)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg cursor-pointer"
                    >
                      {t('admin.customerEnquiries.btnCancel', 'Cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#DC2626] text-[#FFFFFF] font-semibold rounded-lg hover:bg-[#B91C1C] cursor-pointer"
                    >
                      {t('admin.customerEnquiries.btnSaveUpdate', 'Save & Update Enquiry')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
