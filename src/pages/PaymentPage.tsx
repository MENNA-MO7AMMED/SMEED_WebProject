import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  MapPin,
  ArrowLeft,
  Shield,
  CheckCircle
} from 'lucide-react';
import Card from '../components/ui/Card';
import StyledInput from '../components/ui/StyledInput';
import styles from './PaymentPage.module.css';
import buttonStyles from '../styles/CustomButtons.module.css';
import masterCardLogo from '../assets/mastercard-logo.png';
import paypalLogo from '../assets/—Pngtree—paypal logo icon_3593258.png';

interface PaymentFormData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  country: string;
  zip: string;
}

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedPlan] = useState(location.state?.plan || 'free');
  const [paymentMethod, setPaymentMethod] = useState<'credit-card' | 'paypal'>('credit-card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    country: 'United States',
    zip: ''
  });

  const getPlanDetails = () => {
    switch (selectedPlan) {
      case 'pro':
        return {
          name: 'Pro Student',
          price: '$9.90',
          addons: [
            { name: 'Access to Premium Arena', price: 'FREE' },
            { name: '30 Gem Coins', price: 'FREE' },
            { name: 'Premium Badge', price: 'FREE' }
          ]
        };
      case 'enterprise':
        return {
          name: 'University',
          price: '$49.90',
          addons: [
            { name: 'Access to Premium Arena', price: 'FREE' },
            { name: '100 Gem Coins', price: 'FREE' },
            { name: 'Premium Badge', price: 'FREE' }
          ]
        };
      default:
        return {
          name: 'Free Forever',
          price: '$0',
          addons: []
        };
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      alert('Please agree to the terms of service');
      return;
    }
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSuccess(true);

    // Redirect to dashboard after success
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  const planDetails = getPlanDetails();

  return (
    <div className={styles.paymentPage}>
      <div className="max-w-6xl mx-auto">
        <div className={buttonStyles.headerContainer}>
          <button
            className={buttonStyles.backButton}
            onClick={() => navigate('/plans')}
          >
            <div className={buttonStyles.backButtonSlider}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" height="20px" width="20px">
                <path d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z" fill="#000000" />
                <path d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z" fill="#000000" />
              </svg>
            </div>
            <p className={buttonStyles.backButtonText}>Back</p>
          </button>
          <h1 className="text-2xl font-bold text-white">
            PAYMENT METHOD
          </h1>
        </div>

        <div className={buttonStyles.pageContent}>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Payment Details Form */}
            <div>
              <Card withHover>
                <form onSubmit={handleSubmit} className="p-6">
                  <h2 className="text-xl font-semibold mb-6 text-white">Payment Details</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <StyledInput
                      name="firstName"
                      label="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                    <StyledInput
                      name="lastName"
                      label="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <StyledInput
                    name="address"
                    label="Address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <StyledInput
                      name="city"
                      label="City"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                    <StyledInput
                      name="zip"
                      label="ZIP"
                      value={formData.zip}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-6 mt-8">
                    <label className="block text-sm font-medium mb-2 text-white">
                      Country
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full bg-transparent border-b-2 border-white text-white py-2 focus:border-blue-500 outline-none transition-colors"
                      required
                    >
                      <option value="Egypt">Egypt</option>
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="Poland">Poland</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4 text-white">Available Payment Methods</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('credit-card')}
                        className={`p-4 border-2 rounded-lg flex items-center justify-center transition-colors ${
                          paymentMethod === 'credit-card'
                            ? 'border-blue-500 bg-blue-500/10 text-white'
                            : 'border-white/30 text-white/70 hover:border-white/50'
                        }`}
                      >
                        <img src={masterCardLogo} alt="Mastercard" className="h-8 mr-2" />
                        Credit Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('paypal')}
                        className={`p-4 border-2 rounded-lg flex items-center justify-center transition-colors ${
                          paymentMethod === 'paypal'
                            ? 'border-blue-500 bg-blue-500/10 text-white'
                            : 'border-white/30 text-white/70 hover:border-white/50'
                        }`}
                      >
                        <img src={paypalLogo} alt="PayPal" className="h-8" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="flex items-center text-white">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">
                        I Agree to{' '}
                        <a href="/terms" className="text-blue-500 hover:text-blue-400">
                          Terms of service
                        </a>
                      </span>
                    </label>
                  </div>
                </form>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card withHover>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-6 text-white">Your Order:</h2>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2 text-white">
                      <span>Country</span>
                      <span className="font-medium">{formData.country}</span>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-white">{planDetails.name}</h3>
                        <p className="text-sm text-gray-400">3 Month Premium Account</p>
                      </div>
                      <span className="font-bold text-white">{planDetails.price}</span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium mb-2 text-white">Add-on services</h4>
                      {planDetails.addons.map((addon, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-300">{addon.name}</span>
                          <span className="text-blue-400">{addon.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 mb-6">
                    <div className="flex justify-between items-center text-lg font-bold text-white">
                      <span>Total:</span>
                      <span>{planDetails.price}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={buttonStyles.payButton}
                    disabled={isProcessing || !agreedToTerms}
                    onClick={handleSubmit}
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center">
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        <span className="ml-2">Processing...</span>
                      </span>
                    ) : (
                      <>
                        <span className={buttonStyles.buttonText}>Place Your Order</span>
                        <div className={buttonStyles.iconContainer}>
                          <svg viewBox="0 0 24 24" className={`${buttonStyles.icon} ${buttonStyles.cardIcon}`}>
                            <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18C2,19.11 2.89,20 4,20H20C21.11,20 22,19.11 22,18V6C22,4.89 21.11,4 20,4Z" fill="currentColor" />
                          </svg>
                          <svg viewBox="0 0 24 24" className={`${buttonStyles.icon} ${buttonStyles.paymentIcon}`}>
                            <path d="M2,17H22V21H2V17M6.25,7H9V6H6V3H18V6H15V7H17.75L19,17H5L6.25,7M9,10H15V8H9V10M9,13H15V11H9V13Z" fill="currentColor" />
                          </svg>
                          <svg viewBox="0 0 24 24" className={`${buttonStyles.icon} ${buttonStyles.dollarIcon}`}>
                            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="currentColor" />
                          </svg>
                          <svg viewBox="0 0 24 24" className={`${buttonStyles.icon} ${buttonStyles.defaultIcon}`}>
                            <path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18M12,16H22V8H12M16,13.5A1.5,1.5 0 0,1 14.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,12A1.5,1.5 0 0,1 16,13.5Z" fill="currentColor" />
                          </svg>
                          <svg viewBox="0 0 24 24" className={`${buttonStyles.icon} ${buttonStyles.checkIcon}`}>
                            <path d="M9,16.17L4.83,12L3.41,13.41L9,19L21,7L19.59,5.59L9,16.17Z" fill="currentColor" />
                          </svg>
                        </div>
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-400 mt-4">
                    By clicking "Place Your Order" you agree to the terms and conditions. Your order will be processed immediately.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-lg p-8 max-w-md w-full mx-4"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2 text-white">Payment Successful!</h2>
                <p className="text-gray-400 mb-4">
                  Thank you for your purchase. You will be redirected to your dashboard shortly.
                </p>
                <motion.div
                  className="w-full h-2 bg-gray-800 rounded-full overflow-hidden"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 3, ease: 'linear' }}
                >
                  <div className="h-full bg-green-500 rounded-full" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentPage; 