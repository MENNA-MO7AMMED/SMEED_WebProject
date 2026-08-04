import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/animations.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { useLanguage } from './contexts/LanguageContext';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Verify from './pages/auth/Verify';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyOTP from './pages/auth/VerifyOTP';
import ResetPassword from './pages/auth/ResetPassword';
import Worship from './pages/Worship';
import Dashboard from './pages/Dashboard';
import Health from './pages/Health';
import Appointments from './pages/Appointments';
import Financial from './pages/Financial';
import SavingsGoals from './pages/SavingsGoals';
import Plans from './pages/Plans';
import PaymentPage from './pages/PaymentPage';

const AppContent = () => {
  const { isLanguageLoading } = useLanguage();

  return (
    <>
      {isLanguageLoading && (
        <div className="fixed inset-0 bg-white/50 dark:bg-black/50 z-50 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-xl flex items-center space-x-3">
            <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Changing language...</span>
          </div>
        </div>
      )}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/health" element={<Health />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/" element={<Home />} />
        <Route path="/worship" element={<Worship />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/finance" element={<Financial />} />
        <Route path="/savings-goals" element={<SavingsGoals />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/payment" element={<PaymentPage />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;