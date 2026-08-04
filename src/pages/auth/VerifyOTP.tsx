import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { initParticleEffect } from '../../utils/animations';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const VerifyOTP: React.FC = () => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isVerifyLocked, setIsVerifyLocked] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<number>();
  const navigate = useNavigate();

  const startTimer = useCallback(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Set initial state
    setTimeLeft(120);
    setIsVerifyLocked(false);

    // Start new timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          setIsVerifyLocked(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    document.body.appendChild(canvas);
    initParticleEffect('particles-canvas');

    const resetEmail = localStorage.getItem('resetEmail');
    if (!resetEmail) {
      navigate('/forgot-password');
      return;
    }

    // Start initial timer
    startTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      const canvasElement = document.getElementById('particles-canvas');
      if (canvasElement) {
        canvasElement.remove();
      }
    };
  }, [navigate, startTimer]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, 6).split('');
    const newOtp = [...otp];
    digits.forEach((digit, index) => {
      if (index < 6) newOtp[index] = digit;
    });
    setOtp(newOtp);
  };

  const handleResendOTP = async () => {
    const email = localStorage.getItem('resetEmail');
    if (!email) {
      navigate('/forgot-password');
      return;
    }

    try {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate new OTP generation
      localStorage.setItem('mockOTP', '123456');
      setTimeLeft(120); // Reset to 2 minutes
      setIsVerifyLocked(false);
      setError('');
      setOtp(['', '', '', '', '', '']);
      
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.failedToResendOTP'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = localStorage.getItem('resetEmail');
    if (!email) {
      navigate('/forgot-password');
      return;
    }

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError(t('auth.enterAllDigits'));
      return;
    }

    try {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockOTP = localStorage.getItem('mockOTP');
      
      if (otpValue === mockOTP) {
        // Generate a mock reset token
        const mockResetToken = 'mock-reset-token-' + Date.now();
        localStorage.setItem('resetToken', mockResetToken);
        navigate('/reset-password');
      } else {
        setError(t('auth.invalidOTP'));
        setOtp(['', '', '', '', '', '']);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.failedToVerify'));
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
                {t('auth.verifyOTP')}
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
                {t('auth.enterOTPCode')}
              </p>

              <Card className="w-full animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="p-6">
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center text-red-700 dark:text-red-400">
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center space-x-4">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (inputRefs.current[index] = el)}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleInputChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={handlePaste}
                          className="w-12 h-12 text-center text-2xl font-bold 
                            bg-white dark:bg-gray-800
                            border border-gray-200 dark:border-gray-700 
                            rounded-lg 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                            dark:text-white
                            transition-all duration-200
                            hover:border-blue-400 dark:hover:border-blue-400"
                        />
                      ))}
                    </div>

                    <div className="text-center space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('auth.timeRemaining')}: <span className="font-medium text-blue-600 dark:text-blue-400">{formatTime(timeLeft)}</span>
                      </p>
                      
                      {timeLeft === 0 && (
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={isLoading}
                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        >
                          {t('auth.resendOTP')}
                        </button>
                      )}

                      <Button
                        type="submit"
                        variant="rainbow"
                        size="lg"
                        isLoading={isLoading}
                        className="w-full shadow-xl"
                        withShimmer
                        disabled={isLoading || !otp || otp.length !== 6 || isVerifyLocked}
                      >
                        {isLoading ? t('auth.verifying') : isVerifyLocked ? t('auth.timeExpired') : t('auth.verify')}
                      </Button>

                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                      >
                        {t('auth.backToLogin')}
                      </button>
                    </div>
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

export default VerifyOTP; 