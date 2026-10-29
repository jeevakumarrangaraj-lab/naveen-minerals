import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Clock, CheckCircle2, AlertCircle, LogOut, ChevronRight, FileText, ArrowRight } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useLanguage } from '../context/LanguageContext';
import { SEOHead } from '../components/SEOHead';
import { CustomerEnquiryRecord } from '../types';

export const CustomerMyEnquiriesPage: React.FC = () => {
  const { user, customerSignOut, fetchMyCustomerEnquiries } = useAppData();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [enquiries, setEnquiries] = useState<CustomerEnquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<CustomerEnquiryRecord | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/customer/login');
      return;
    }
    loadEnquiries();
  }, [user]);

  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const data = await fetchMyCustomerEnquiries();
      setEnquiries(data);
    } catch (err) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await customerSignOut();
    navigate('/customer/login');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">{t('myEnquiries.statusNew', 'New Enquiry')}</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">{t('myEnquiries.statusUnderReview', 'Under Review')}</span>;
      case 'QUOTATION_SENT':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">{t('myEnquiries.statusQuotationSent', 'Quotation Sent')}</span>;
      case 'ACCEPTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">{t('myEnquiries.statusAccepted', 'Accepted')}</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{t('myEnquiries.statusClosed', 'Closed')}</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen py-10 bg-[#FFF7ED]/40">
      <SEOHead
        title="My Enquiries | Naveen Minerals Customer Portal"
        description="View and track your submitted product quotation enquiries and quotations."
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D97706] mb-1">
              <span>{t('myEnquiries.portal', 'Customer Portal')}</span>
              <span>·</span>
              <span className="font-mono">{user?.email}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0F172A]">
              {t('myEnquiries.title', 'My Quotation Enquiries')}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/products"
              className="px-4 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-[#FFFFFF] text-xs font-semibold rounded-xl transition-colors"
            >
              {t('myEnquiries.browseBtn', 'Browse Products & Enquire')}
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('myEnquiries.signOut', 'Sign Out')}</span>
            </button>
          </div>
        </div>

        {/* Enquiries List */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">{t('myEnquiries.loading', 'Loading your enquiries...')}</div>
        ) : enquiries.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl p-12 text-center shadow-xs">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold text-[#0F172A] mb-2">{t('myEnquiries.emptyTitle', 'No Enquiries Yet')}</h2>
            <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
              {t('myEnquiries.emptyDesc', 'You haven\'t submitted any quotation enquiries yet. Explore our mineral catalogue and click "Enquire About Pricing" on any product.')}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#DC2626] text-[#FFFFFF] font-semibold rounded-xl text-sm hover:bg-[#B91C1C] transition-colors"
            >
              <span>{t('myEnquiries.exploreBtn', 'Explore Mineral Catalogue')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {enquiries.map((enq) => (
              <div
                key={enq.id}
                className="bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl p-6 shadow-2xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono font-bold text-sm text-[#0F172A] bg-[#FFF7ED] px-3 py-1 rounded-lg border border-[#D97706]/30">
                      {enq.enquiryReference}
                    </span>
                    {getStatusBadge(enq.status)}
                  </div>

                  <div>
                    <h3 className="font-display text-lg font-bold text-[#0F172A]">
                      {enq.productName}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {t('myEnquiries.quantity', 'Quantity:')} <strong className="text-[#0F172A]">{enq.quantity} {enq.quantityUnit}</strong> · {t('myEnquiries.delivery', 'Delivery:')} <strong className="text-[#0F172A]">{enq.deliveryLocation}</strong>
                    </p>
                  </div>

                  {enq.adminResponse && (
                    <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 mt-2">
                      <p className="font-semibold mb-0.5">{t('myEnquiries.adminResponse', 'Admin Response:')}</p>
                      <p>{enq.adminResponse}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col items-end justify-between md:justify-center gap-3 shrink-0">
                  {enq.quotationAmount > 0 ? (
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400">{t('myEnquiries.quoteAmount', 'Quotation Amount')}</p>
                      <p className="font-display text-xl font-bold text-emerald-700">
                        {enq.currency || 'INR'} {enq.quotationAmount.toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <div className="text-right text-xs text-slate-500 italic">
                      {t('myEnquiries.underReview', 'Quotation under review')}
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedEnquiry(enq)}
                    className="px-4 py-2 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#0F172A] font-semibold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>{t('myEnquiries.viewDetails', 'View Details')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedEnquiry && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="font-mono text-xs text-[#D97706] font-bold">
                    {selectedEnquiry.enquiryReference}
                  </span>
                  <h2 className="font-display text-xl font-bold text-[#0F172A]">
                    {selectedEnquiry.productName}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-slate-500">{t('myEnquiries.status', 'Status')}</p>
                  <p className="font-semibold text-slate-900 mt-1">{selectedEnquiry.status}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-slate-500">{t('myEnquiries.reqQuantity', 'Requested Quantity')}</p>
                  <p className="font-semibold text-slate-900 mt-1">{selectedEnquiry.quantity} {selectedEnquiry.quantityUnit}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-slate-500">{t('myEnquiries.deliveryLoc', 'Delivery Location')}</p>
                  <p className="font-semibold text-slate-900 mt-1">{selectedEnquiry.deliveryLocation}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-slate-500">{t('myEnquiries.quoteAmount', 'Quotation Amount')}</p>
                  <p className="font-semibold text-emerald-700 mt-1">
                    {selectedEnquiry.quotationAmount > 0 ? `${selectedEnquiry.currency || 'INR'} ${selectedEnquiry.quotationAmount.toLocaleString()}` : 'Pending'}
                  </p>
                </div>
              </div>

              {selectedEnquiry.message && (
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1">{t('myEnquiries.yourMessage', 'Your Requirements / Message:')}</p>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">{selectedEnquiry.message}</p>
                </div>
              )}

              {selectedEnquiry.adminResponse && (
                <div>
                  <p className="text-xs font-semibold text-blue-900 mb-1">{t('myEnquiries.adminResponseDetails', 'Admin Response / Quotation Details:')}</p>
                  <p className="text-xs text-blue-900 bg-blue-50 p-3 rounded-xl border border-blue-200">{selectedEnquiry.adminResponse}</p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 text-right">
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="px-5 py-2.5 bg-[#0F172A] text-[#FFFFFF] text-xs font-semibold rounded-xl"
                >
                  {t('myEnquiries.close', 'Close')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
