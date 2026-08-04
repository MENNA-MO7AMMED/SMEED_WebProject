import React, { useState, useEffect } from 'react';
import { Mail, AlertCircle } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { initParticleEffect } from '../../utils/animations';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    document.body.appendChild(canvas);
    
    initParticleEffect('particles-canvas');
    
    return () => {
      const canvasElement = document.getElementById('particles-canvas');
      if (canvasElement) {
        canvasElement.remove();
      }
    };
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError(t('auth.enterEmailAddress'));
      return;
    }

    if (!validateEmail(email)) {
      setError(t('auth.enterValidEmail'));
      return;
    }

    try {
      setIsLoading(true);
      
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Send verification email with OTP
      const response = await axios.post('http://localhost:3000/send-verification-email', {
        email,
        verificationCode: otp
      });

      if (response.data.message === 'Verification code sent successfully') {
        setSuccess(true);
        localStorage.setItem('resetEmail', email);
        localStorage.setItem('mockOTP', otp); // Store for verification
        setTimeout(() => {
          navigate('/verify-otp');
        }, 2000); // Give user time to see success message
      } else {
        setError(t('auth.failedToSendOTP'));
      }
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      setError(err.response?.data?.message || t('auth.failedToSendOTP'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="relative pt-32 pb-20 md:pt-40 md:pb-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 dark:text-white mb-6 animate-slide-in-up">
                {t('auth.forgotPasswordTitle')}
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
                {t('auth.forgotPasswordDescription')}
              </p>

              <Card className="w-full animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="p-6">
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center text-red-700 dark:text-red-400">
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center text-green-700 dark:text-green-400">
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <p className="text-sm">{t('auth.otpSentSuccess')}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                      label={t('common.email')}
                      type="email"
                      id="email"
                      icon={<Mail className="h-5 w-5" />}
                      iconPosition="right"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      autoComplete="email"
                      borderColor={email ? (validateEmail(email) ? 'border-green-500' : 'border-red-500') : 'border-gray-300'}
                    />

                    <Button
                      type="submit"
                      variant="rainbow"
                      size="lg"
                      isLoading={isLoading}
                      className="w-full shadow-xl"
                      withShimmer
                      disabled={isLoading}
                    >
                      {isLoading ? t('auth.sendingOTP') : t('auth.sendOTP')}
                    </Button>

                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="w-full text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors text-center mt-4"
                    >
                      {t('auth.backToLogin')}
                    </button>
                  </form>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ForgotPassword; 