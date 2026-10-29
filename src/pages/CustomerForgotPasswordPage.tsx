import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { SEOHead } from '../components/SEOHead';
import { useLanguage } from '../context/LanguageContext';

export const CustomerForgotPasswordPage: React.FC = () => {
  const { customerResetPassword } = useAppData();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError(t('auth.errEnterEmail', 'Please enter your email address.'));
      return;
    }

    setLoading(true);
    try {
      await customerResetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#FFF7ED]/50">
      <SEOHead
        title="Reset Password | Naveen Minerals"
        description="Reset your Naveen Minerals customer account password."
      />

      <div className="max-w-md w-full bg-[#FFFFFF] border border-[#F3F4F6] rounded-2xl shadow-md p-8 sm:p-10">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-[#0F172A]">
            {t('auth.resetPasswordTitle', 'Reset Password')}
          </h1>
          <p className="text-xs text-[#1F2937]/75 mt-1">
            {t('auth.resetPasswordSubtitle', 'Enter your account email and we will send you a secure password reset link.')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-800 text-left">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{t('auth.passResetSent', 'Password reset email sent to')} <strong>{email}</strong>. {t('auth.checkInbox', 'Please check your inbox.')}</span>
            </div>
            <Link
              to="/customer/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#0F172A] hover:bg-[#1E293B] text-[#FFFFFF] font-semibold rounded-xl text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('auth.returnSignIn', 'Return to Sign In')}</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#DC2626] hover:bg-[#B91C1C] text-[#FFFFFF] font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? t('auth.sendingResetLink', 'Sending Reset Link...') : t('auth.sendResetLink', 'Send Password Reset Link')}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/customer/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('auth.backSignIn', 'Back to Sign In')}</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
