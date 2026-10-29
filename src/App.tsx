/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppDataProvider } from './context/AppDataContext';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Logo3DWatermark } from './components/Logo3DWatermark';
import SplashScreen from './components/SplashScreen';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { RequestQuotePage } from './pages/RequestQuotePage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CustomerLoginPage } from './pages/CustomerLoginPage';
import { CustomerSignupPage } from './pages/CustomerSignupPage';
import { CustomerForgotPasswordPage } from './pages/CustomerForgotPasswordPage';
import { CustomerEnquiryPage } from './pages/CustomerEnquiryPage';
import { CustomerMyEnquiriesPage } from './pages/CustomerMyEnquiriesPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { CustomCursor } from './components/CustomCursor';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    <AppDataProvider>
      <LanguageProvider>
        <BrowserRouter>
          <ScrollToTop />
          <CustomCursor />
          <div className="relative min-h-screen flex flex-col bg-[#FFFFFF] text-[#1F2937]">
            <SplashScreen />
            {/* Single Full-Page 3D Eagle Logo Watermark centred across the entire page */}
            <Logo3DWatermark />
            <Header />
            <main className="relative z-10 flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:slug" element={<ProductDetailPage />} />
                <Route path="/applications" element={<ApplicationsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/request-quote" element={<RequestQuotePage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<AdminDashboardPage />} />
                <Route path="/customer/login" element={<CustomerLoginPage />} />
                <Route path="/customer/signup" element={<CustomerSignupPage />} />
                <Route path="/customer/forgot-password" element={<CustomerForgotPasswordPage />} />
                <Route path="/customer/enquire/:slug" element={<CustomerEnquiryPage />} />
                <Route path="/customer/my-enquiries" element={<CustomerMyEnquiriesPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <div className="relative z-10">
              <Footer />
            </div>
            <FloatingWhatsApp />
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </AppDataProvider>
  );
}
