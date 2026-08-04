import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, KeyRound } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { initParticleEffect } from '../../utils/animations';

const Verify: React.FC = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isExpired, setIsExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    document.body.appendChild(canvas);
    initParticleEffect('particles-canvas');

    const pendingUser = JSON.parse(localStorage.getItem('pendingUser') || '{}');
    if (!pendingUser?.email) {
      navigate('/register');
      return;
    }

    const now = Date.now();
    const expiry = pendingUser.codeExpiry || now;
    const initialRemaining = Math.max(0, Math.floor((expiry - now) / 1000));
    setTimeLeft(initialRemaining);
    setIsExpired(initialRemaining === 0);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          setIsExpired(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      const canvasElement = document.getElementById('particles-canvas');
      if (canvasElement) {
        canvasElement.remove();
      }
    };
  }, [navigate]);

  const handleResendCode = async () => {
    if (!isExpired) return;

    const pendingUser = JSON.parse(localStorage.getItem('pendingUser') || '{}');
    if (!pendingUser?.email) {
      setError('No user data found. Please try signing up again.');
      navigate('/register');
      return;
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpiry = Date.now() + 60 * 1000;

    try {
      await axios.post('http://localhost:3000/send-verification-email', {
        email: pendingUser.email,
        verificationCode: newCode,
      });

      localStorage.setItem('pendingUser', JSON.stringify({
        ...pendingUser,
        verificationCode: newCode,
        codeExpiry: newExpiry,
      }));

      setTimeLeft(60);
      setIsExpired(false);
      setError(null);
      setCode(['', '', '', '', '', '']);

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            setIsExpired(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Error resending code:', err.response?.data || err.message);
      setError('Failed to resend verification code. Please try again.');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const pendingUser = JSON.parse(localStorage.getItem('pendingUser') || '{}');
    if (!pendingUser?.email) {
      setError('No user data found. Please try signing up again.');
      setIsLoading(false);
      navigate('/register');
      return;
    }

    const enteredCode = code.join('');
    if (!enteredCode || enteredCode.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Verifying code:', enteredCode, 'for email:', pendingUser.email);
      const verifyResponse = await axios.post('http://localhost:3000/verify-code', {
        email: pendingUser.email,
        code: enteredCode,
      });

      console.log('Verify response:', verifyResponse.data);

      if (verifyResponse.data.message === 'Verification code is valid') {
        console.log('Code verified, proceeding to signup...');
        const signupResponse = await axios.post('http://localhost:3000/signup', {
          user_name: pendingUser.user_name,
          national_id: pendingUser.national_id,
          email: pendingUser.email,
          phone_number: pendingUser.phone_number,
          birthdate: pendingUser.birthdate,
          password: pendingUser.password,
        });

        console.log('Signup response:', signupResponse.data);

        if (signupResponse.status === 201) {
          localStorage.removeItem('pendingUser');
          navigate('/login');
        } else {
          setError('Signup failed unexpectedly.');
        }
      } else {
        setError('Verification failed unexpectedly.');
      }
    } catch (err: any) {
      console.error('Error during verification:', err.response?.data || err.message);
      if (err.response) {
        setError(err.response.data?.error || 'An error occurred while verifying the code or creating the account.');
      } else if (err.request) {
        setError('Unable to connect to the server. Please check your network and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignUp = () => {
    navigate('/register');
  };

  const validateCode = (value: string[]): boolean => {
    const fullCode = value.join('');
    return fullCode.length === 6 && /^\d+$/.test(fullCode);
  };

  const getBorderColor = (value: string[]): string => {
    const fullCode = value.join('');
    if (!fullCode) return 'border-blue-500 dark:border-blue-400';
    if (error && (error.includes('Invalid verification code') || error.includes('Please enter a valid 6-digit code'))) {
      return 'border-red-500 dark:border-red-400';
    }
    return validateCode(value) ? 'border-green-500 dark:border-green-400' : 'border-red-500 dark:border-red-400';
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(0, 1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const renderFloatingShapes = () => {
    return (
      <>
        <div className="floating-shape top-20 left-[10%] w-20 h-20 bg-blue-500/10 dark:bg-blue-500/20 rounded-full"></div>
        <div className="floating-shape top-40 right-[15%] w-16 h-16 bg-purple-500/10 dark:bg-purple-500/20 rounded-full" style={{ animationDelay: '1s' }}></div>
        <div className="floating-shape bottom-60 left-[20%] w-24 h-24 bg-green-500/10 dark:bg-green-500/20 rounded-full" style={{ animationDelay: '2s' }}></div>
        <div className="floating-shape bottom-40 right-[10%] w-32 h-32 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-full" style={{ animationDelay: '1.5s' }}></div>
        <div className="floating-shape top-[30%] left-[30%] w-12 h-12 bg-red-500/10 dark:bg-red-500/20 rounded-full" style={{ animationDelay: '0.5s' }}></div>
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="relative pt-32 pb-20 md:pt-40 md:pb-24 overflow-hidden">
        {renderFloatingShapes()}

        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 dark:text-white mb-6 animate-slide-in-up">
                Verify Your Email on
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600"> SMEED</span>
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
                Enter the 6-digit code sent to your email. Time left: {timeLeft} seconds.
              </p>

              <Card className="w-full animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                {error && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center text-red-700 dark:text-red-400 animate-slide-in-up">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleVerify} className="space-y-6">
                  <div className="flex justify-between gap-2">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        ref={(el) => (inputRefs.current[index] = el)}
                        maxLength={1}
                        disabled={isLoading}
                        required
                        className={`w-12 h-12 text-center text-lg font-medium rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300 ${
                          getBorderColor(code)
                        } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                        placeholder="0"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Must be exactly 6 digits</p>

                  <Button
                    type="submit"
                    variant="rainbow"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full shadow-xl"
                    withShimmer
                    disabled={isLoading || !validateCode(code) || isExpired}
                  >
                    {isLoading ? 'Verifying...' : isExpired ? 'Time Expired - Resend Code' : 'Verify'}
                  </Button>
                </form>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={handleResendCode}
                    className={`font-medium ${isExpired ? 'text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300' : 'text-gray-400 cursor-not-allowed'}`}
                    disabled={!isExpired}
                  >
                    Resend Code
                  </button>
                  <button
                    onClick={handleBackToSignUp}
                    className="font-medium text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    Back to Sign Up
                  </button>
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

export default Verify;