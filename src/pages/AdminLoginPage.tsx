import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, AlertCircle, LogOut, ArrowRight } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useLanguage } from '../context/LanguageContext';
import { SEOHead } from '../components/SEOHead';

export const AdminLoginPage: React.FC = () => {
  const { user, authReady, isAdmin, signInAdminWithGoogle, signOutAdmin, settings } = useAppData();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (authReady && user && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [authReady, user, isAdmin, navigate]);

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSigningIn(true);
    try {
      await signInAdminWithGoogle();
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Google Sign-In failed or popup was closed.'
      );
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="bg-[#FFFFFF] min-h-[80vh] flex items-center justify-center px-4 py-16">
      <SEOHead
        title={`${t('admin.pageTitle')} | ${settings.companyName}`}
        description={t('admin.pageDesc')}
      />

      <div className="max-w-md w-full bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/USN_NAVEN_Minerals_Winged_Emblem_f8e368b9.png"
            alt={`${settings.companyName} Logo`}
            className="h-11 w-auto object-contain shrink-0"
          />
          <div>
            <h1 className="font-display text-xl font-bold text-[#0F172A]">
              {t('admin.portalHeaderTitle')}
            </h1>
            <p className="text-xs text-[#1F2937]">
              {t('admin.portalHeaderSubtitle').replace('{companyName}', settings.companyName)}
            </p>
          </div>
        </div>

        <div className="bg-[#FFF7ED] border border-[#F3F4F6] rounded-xl p-4 text-xs text-[#1F2937] leading-relaxed">
          <div className="flex items-center gap-2 font-semibold text-[#0F172A] mb-1">
            <ShieldCheck className="w-4 h-4 text-[#D97706]" />
            <span>{t('admin.firebaseBadge')}</span>
          </div>
          <p>
            {t('admin.accessRestricted').replace('{companyName}', settings.companyName)}
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2.5 text-xs text-red-900"
          >
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {authReady && user && !isAdmin ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3 text-xs text-amber-950">
            <p className="font-bold text-sm text-[#0F172A]">
              {t('admin.notAuthorizedTitle')}
            </p>
            <p>
              {t('admin.notAuthorizedDesc').replace('{email}', user.email || '')}
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => signOutAdmin()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#FFFFFF] bg-[#0F172A] hover:bg-[#1E293B] rounded-lg cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('admin.signOutSwitch')}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              disabled={!authReady || signingIn}
              onClick={handleGoogleSignIn}
              className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3 text-sm font-semibold text-[#FFFFFF] bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
              <span>{signingIn ? t('admin.verifying') : t('admin.signInGoogle')}</span>
            </button>
          </div>
        )}

        <div className="pt-4 border-t border-[#F3F4F6] flex items-center justify-between text-xs text-[#1F2937]">
          <Link to="/" className="hover:text-[#0F172A] font-medium">
            {t('admin.returnPublic')}
          </Link>
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-1 font-semibold text-[#DC2626]"
            >
              <span>{t('admin.openDashboard')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
