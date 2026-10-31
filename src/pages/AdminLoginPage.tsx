
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  AlertCircle,
  LogOut,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useLanguage } from '../context/LanguageContext';
import { SEOHead } from '../components/SEOHead';

export const AdminLoginPage: React.FC = () => {
  const {
    user,
    authReady,
    isAdmin,
    signInAdminWithGoogle,
    signInAdminWithEmail,
    resetAdminPassword,
    signOutAdmin,
    settings
  } = useAppData();

  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (authReady && user && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [authReady, user, isAdmin, navigate]);

  const friendlyError = (err: unknown) => {
    const code = (err as { code?: string })?.code;

    if (
      code === 'auth/invalid-credential' ||
      code === 'auth/wrong-password' ||
      code === 'auth/user-not-found'
    ) {
      return 'Incorrect email or password. Please try again.';
    }

    if (code === 'auth/too-many-requests') {
      return 'Too many attempts. Please wait and try again later.';
    }

    if (code === 'auth/invalid-email') {
      return 'Please enter a valid email address.';
    }

    if (code === 'auth/user-disabled') {
      return 'This account has been disabled. Contact the administrator.';
    }

    if (code === 'auth/popup-closed-by-user') {
      return 'Google sign-in was cancelled.';
    }

    return err instanceof Error
      ? err.message
      : 'Authentication failed. Please try again.';
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMsg(null);
    setSuccessMsg(null);
    setSigningIn(true);

    try {
      await signInAdminWithEmail(email.trim(), password);
    } catch (err) {
      setErrorMsg(friendlyError(err));
    } finally {
      setSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSigningIn(true);

    try {
      await signInAdminWithGoogle();
    } catch (err) {
      setErrorMsg(friendlyError(err));
    } finally {
      setSigningIn(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setErrorMsg('Enter your administrator email address first.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setResetting(true);

    try {
      await resetAdminPassword(email.trim());
      setSuccessMsg(
        'Password reset email sent. Check your inbox and spam folder.'
      );
    } catch (err) {
      setErrorMsg(friendlyError(err));
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="bg-[#FFFFFF] min-h-[80vh] flex items-center justify-center px-4 py-16">
      <SEOHead
        title={`${t('admin.pageTitle')} | ${settings.companyName}`}
        description={t('admin.pageDesc')}
      />

      <div className="max-w-md w-full bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl p-8 shadow-sm space-y-6">

        {/* Logo and heading */}
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
              {t('admin.portalHeaderSubtitle').replace(
                '{companyName}',
                settings.companyName
              )}
            </p>
          </div>
        </div>

        {/* Security notice */}
        <div className="bg-[#FFF7ED] border border-[#F3F4F6] rounded-xl p-4 text-xs text-[#1F2937] leading-relaxed">
          <div className="flex items-center gap-2 font-semibold text-[#0F172A] mb-1">
            <ShieldCheck className="w-4 h-4 text-[#D97706]" />
            <span>{t('admin.firebaseBadge')}</span>
          </div>

          <p>
            {t('admin.accessRestricted').replace(
              '{companyName}',
              settings.companyName
            )}
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2.5 text-xs text-red-900"
          >
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div
            role="status"
            className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-800"
          >
            {successMsg}
          </div>
        )}

        {/* Unauthorized user */}
        {authReady && user && !isAdmin ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3 text-xs text-amber-950">
            <p className="font-bold text-sm text-[#0F172A]">
              {t('admin.notAuthorizedTitle')}
            </p>

            <p>
              {t('admin.notAuthorizedDesc').replace(
                '{email}',
                user.email || ''
              )}
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

            {/* Email and password login */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">

              {/* Email */}
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-semibold text-[#0F172A] mb-1.5"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full pl-10 pr-3 py-3 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0F172A]/15 focus:border-[#0F172A]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-semibold text-[#0F172A]"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={resetting}
                    className="text-xs font-medium text-[#D97706] hover:underline disabled:opacity-60"
                  >
                    {resetting ? 'Sending...' : 'Forgot password?'}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-3 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0F172A]/15 focus:border-[#0F172A]"
                  />

                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Email login button */}
              <button
                type="submit"
                disabled={!authReady || signingIn}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 rounded-lg transition-colors"
              >
                <KeyRound className="w-4 h-4" />
                {signingIn ? 'Signing in...' : 'Sign In with Email'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              <span>OR</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Google login */}
            <button
              type="button"
              disabled={!authReady || signingIn}
              onClick={handleGoogleSignIn}
              className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3 text-sm font-semibold text-[#FFFFFF] bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
              <span>
                {signingIn ? t('admin.verifying') : t('admin.signInGoogle')}
              </span>
            </button>
          </div>
        )}

        {/* Footer navigation */}
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
