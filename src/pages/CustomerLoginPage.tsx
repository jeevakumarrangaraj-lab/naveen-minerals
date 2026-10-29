import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { SEOHead } from '../components/SEOHead';
import { useLanguage } from '../context/LanguageContext';

export const CustomerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || searchParams.get('product') ? `/customer/enquire/${searchParams.get('product')}` : null;
  const pendingProductSlug = localStorage.getItem('pending_enquiry_product');

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePostAuthSuccess = () => {
    localStorage.removeItem('pending_enquiry_product');
    if (pendingProductSlug) {
      navigate(`/customer/enquire/${pendingProductSlug}`);
    } else if (redirectPath) {
      navigate(redirectPath);
    } else {
      navigate('/customer/my-enquiries');
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError(t('auth.errEmailPass', 'Please enter both email and password.'));
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccessMessage('Successfully signed in!');
      setTimeout(handlePostAuthSuccess, 800);
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setSuccessMessage('Successfully signed in with Google!');
      setTimeout(handlePostAuthSuccess, 800);
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        setError(t('auth.errPopupClosed', 'Sign-in popup was closed before completion.'));
      } else {
        setError(err?.message || 'Failed to sign in with Google.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-16 bg-[#FFF7ED]/50">
      <SEOHead
        title="Customer Sign In | Naveen Minerals"
        description="Sign in to your Naveen Minerals customer account using Google or Email."
      />

      <div className="max-w-md w-full bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl shadow-lg p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#0F172A] text-[#F59E0B] flex items-center justify-center mx-auto mb-4 font-display font-bold text-xl shadow-sm">
            NM
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A]">
            {t('auth.portalTitle', 'Customer Portal')}
          </h1>
          <p className="text-xs text-[#1F2937]/75 mt-1">
            {t('auth.portalSubtitle', 'Sign in to manage quotation enquiries and track orders.')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. Continue with Google Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-[#0F172A] font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-3 text-sm"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{loading ? t('auth.connectingGoogle', 'Connecting to Google...') : t('auth.googleLogin', 'Continue with Google')}</span>
          </button>
        </div>

        {/* 2. Divider: OR CONTINUE WITH EMAIL */}
        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-xs text-slate-400 font-medium uppercase tracking-wider">{t('auth.emailLogin', 'Or continue with email')}</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* 3. Email Sign In Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              {t('auth.emailLabel', 'Email Address')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[#1F2937]/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@company.com"
                className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#0F172A]">
                {t('auth.passwordLabel', 'Password')}
              </label>
              <Link
                to="/customer/forgot-password"
                className="text-xs text-[#D97706] hover:underline"
              >
                {t('auth.forgotPassword', 'Forgot password?')}
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[#1F2937]/40" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#DC2626] hover:bg-[#B91C1C] text-[#FFFFFF] font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>{t('auth.signingIn', 'Signing In...')}</span>
            ) : (
              <>
                <span>{t('auth.signInEmail', 'Sign In with Email')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#F3F4F6] text-center text-xs text-[#1F2937]">
          {t('auth.noAccountPrompt', "Don't have a customer account?")}{' '}
          <Link to="/customer/signup" className="font-semibold text-[#0F172A] hover:underline">
            {t('auth.createAccountLink', 'Create an Account')}
          </Link>
        </div>
      </div>
    </div>
  );
};

