import React, { useState, useEffect } from 'react';
import { KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { initParticleEffect } from '../../utils/animations';
import axios from 'axios';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    document.body.appendChild(canvas);
    initParticleEffect('particles-canvas');

    const resetToken = localStorage.getItem('resetToken');
    const resetEmail = localStorage.getItem('resetEmail');
    if (!resetToken || !resetEmail) {
      navigate('/forgot-password');
      return;
    }

    return () => {
      const canvasElement = document.getElementById('particles-canvas');
      if (canvasElement) {
        canvasElement.remove();
      }
    };
  }, [navigate]);

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const resetToken = localStorage.getItem('resetToken');
    const resetEmail = localStorage.getItem('resetEmail');
    const otp = localStorage.getItem('mockOTP');
    
    if (!resetToken || !resetEmail || !otp) {
      const missingFields = [];
      if (!resetToken) missingFields.push('reset token');
      if (!resetEmail) missingFields.push('email');
      if (!otp) missingFields.push('OTP');
      
      const errorMsg = `Missing required information: ${missingFields.join(', ')}. Please restart the password reset process.`;
      setError(errorMsg);
      navigate('/forgot-password');
      return;
    }

    try {
      setIsLoading(true);
      
      // First verify the OTP
      const verifyResponse = await axios.post('http://localhost:3000/verify-code', {
        email: resetEmail,
        code: otp
      });

      if (verifyResponse.data.message === 'Verification code is valid') {
        try {
          // Update password in the database
          const response = await axios.post('http://localhost:3000/update-password', {
            email: resetEmail,
            newPassword: password,
            verificationCode: otp
          });

          if (response.data.success) {
            // Clear all reset-related data from localStorage
            localStorage.removeItem('resetToken');
            localStorage.removeItem('resetEmail');
            localStorage.removeItem('mockOTP');
            
            // Show success message
            alert('Password has been successfully updated! Please login with your new password.');
            navigate('/login');
          } else {
            setError(response.data.error || 'Failed to update password. Please try again.');
          }
        } catch (updateErr: any) {
          console.error('Error updating password:', updateErr);
          setError(updateErr.response?.data?.error || 'Failed to update password. Please try the process again.');
        }
      } else {
        setError('OTP is invalid or expired. Please restart the password reset process.');
        navigate('/forgot-password');
      }
    } catch (err: any) {
      console.error('Error during password reset:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(`Error: ${err.message}`);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
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
                Reset Password
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
                Enter your new password below to secure your account.
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
                    <Input
                      label="New Password"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      icon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      }
                      iconPosition="right"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      helperText="At least 8 characters with uppercase, lowercase, and number"
                      borderColor={password ? (validatePassword(password) ? 'border-green-500' : 'border-red-500') : 'border-gray-300'}
                    />

                    <Input
                      label="Confirm New Password"
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      borderColor={confirmPassword ? (confirmPassword === password ? 'border-green-500' : 'border-red-500') : 'border-gray-300'}
                    />

                    <Button
                      type="submit"
                      variant="rainbow"
                      size="lg"
                      isLoading={isLoading}
                      className="w-full shadow-xl"
                      withShimmer
                      disabled={!password || !confirmPassword || password !== confirmPassword || isLoading}
                    >
                      {isLoading ? 'Processing...' : 'Reset Password'}
                    </Button>

                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="w-full text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors text-center mt-4"
                    >
                      Back to Login
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

export default ResetPassword; 