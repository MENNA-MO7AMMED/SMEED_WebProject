import React, { useState, useEffect } from 'react';
import { User, Phone, Cake, Mail, KeyRound, AlertCircle } from 'lucide-react';
import { FaIdCard } from 'react-icons/fa';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import EgyptianFlagImage from '../../assets/egyptian-flag.png';
import { initParticleEffect } from '../../utils/animations';

const Register: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFlag, setShowFlag] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('free');
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    document.body.appendChild(canvas);
    
    initParticleEffect('particles-canvas');

    // Load selected plan from localStorage
    const plan = localStorage.getItem('selectedPlan');
    if (plan) {
      setSelectedPlan(plan);
      localStorage.removeItem('selectedPlan'); // Clear it after reading
    }

    const pendingUser = JSON.parse(localStorage.getItem('pendingUser') || '{}');
    if (pendingUser.user_name) {
      setUserName(pendingUser.user_name);
      setNationalId(pendingUser.national_id);
      setEmail(pendingUser.email);
      setPhoneNumber(pendingUser.phone_number);
      setBirthdate(pendingUser.birthdate);
      setPassword(pendingUser.password);
      setConfirmPassword(pendingUser.password);
    }

    return () => {
      const canvasElement = document.getElementById('particles-canvas');
      if (canvasElement) {
        canvasElement.remove();
      }
    };
  }, []);

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const validateNationalId = (nationalId: string): boolean => {
    const nationalIdRegex = /^[2-3]\d{13}$/;
    return nationalIdRegex.test(nationalId);
  };

  const validatePhoneNumber = (phoneNumber: string): boolean => {
    const phoneRegex = /^(010|011|012|015)\d{8}$/;
    return phoneRegex.test(phoneNumber);
  };

  const validateUserName = (userName: string): boolean => {
    const userNameRegex = /^[a-zA-Z0-9]{3,}$/;
    return userNameRegex.test(userName);
  };

  const validateBirthdate = (birthdate: string): boolean => {
    const birthDate = new Date(birthdate);
    const today = new Date();
    const ageDiffMs = today.getTime() - birthDate.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return birthDate < today && age >= 16;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    if (/^(010|011|012|015)/.test(value)) {
      setShowFlag(true);
    } else {
      setShowFlag(false);
    }
  };

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName || !nationalId || !email || !phoneNumber || !birthdate || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateUserName(userName)) {
      setError('User name must be at least 3 characters long and contain only letters and numbers');
      return;
    }

    if (!validateNationalId(nationalId)) {
      setError('National ID must be exactly 14 digits and start with 2 or 3');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Phone number must start with 010, 011, 012, or 015 and be exactly 11 digits');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validateBirthdate(birthdate)) {
      setError('Birthdate must be in the past and you must be at least 16 years old');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }

    try {
      setError('');
      setIsLoading(true);

      const checkResponse = await axios.post('http://localhost:3000/check-user', {
        user_name: userName,
        national_id: nationalId,
        email,
        phone_number: phoneNumber,
      });

      if (checkResponse.data.exists) {
        setError(checkResponse.data.message || 'User already exists with this email, national ID, or phone number.');
        return;
      }

      const verificationCode = generateVerificationCode();
      const codeExpiry = Date.now() + 60 * 1000;

      await axios.post('http://localhost:3000/send-verification-email', {
        email,
        verificationCode,
      });

      localStorage.setItem('pendingUser', JSON.stringify({
        user_name: userName,
        national_id: nationalId,
        email,
        phone_number: phoneNumber,
        birthdate,
        password,
        verificationCode,
        codeExpiry,
        selectedPlan,
      }));

      navigate('/verify');
    } catch (err: any) {
      console.error('Error:', err.response?.data || err.message);
      if (err.response) {
        setError(err.response.data?.error || 'An error occurred while checking the data. Please try again.');
      } else if (err.request) {
        setError('Unable to connect to the server. Please check your network and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getBorderColor = (value: string, validator: (val: string) => boolean, field: string): string => {
    if (!value) return 'border-blue-500 dark:border-blue-400';
    if (error) {
      if (error.includes('Username already exists') && field === 'userName') return 'border-red-500 dark:border-red-400';
      if (error.includes('National ID already exists') && field === 'nationalId') return 'border-red-500 dark:border-red-400';
      if (error.includes('Phone number already exists') && field === 'phoneNumber') return 'border-red-500 dark:border-red-400';
      if (error.includes('Email already exists') && field === 'email') return 'border-red-500 dark:border-red-400';
      if (error.includes('User already exists') && (field === 'userName' || field === 'nationalId' || field === 'email' || field === 'phoneNumber')) {
        return 'border-red-500 dark:border-red-400';
      }
    }
    return validator(value) ? 'border-green-500 dark:border-green-400' : 'border-red-500 dark:border-red-400';
  };

  const getConfirmPasswordBorderColor = () => {
    if (!confirmPassword) return 'border-blue-500 dark:border-blue-400';
    return password === confirmPassword ? 'border-green-500 dark:border-green-400' : 'border-red-500 dark:border-red-400';
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
                Create Account on
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600"> SMEED</span>
              </h1>
              
              {selectedPlan !== 'free' && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    You selected the <span className="font-semibold">{selectedPlan === 'pro' ? 'Pro Student' : 'University'}</span> plan. 
                    You can change your plan anytime after registration.
                  </p>
                </div>
              )}

              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
                Join SMEED and Start your fully student life with all the tools you need in one place.
              </p>

              <Card className="w-full animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                {error && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center text-red-700 dark:text-red-400 animate-slide-in-up">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="User Name"
                    type="text"
                    id="userName"
                    icon={<User className="h-5 w-5" />}
                    iconPosition="right"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="mero22"
                    required
                    helperText="At least 3 characters, letters and numbers only"
                    borderColor={getBorderColor(userName, validateUserName, 'userName')}
                  />

                  <Input
                    label="National ID"
                    type="text"
                    id="nationalId"
                    icon={<FaIdCard className="h-5 w-5" />}
                    iconPosition="right"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="212345678901234"
                    required
                    helperText="Exactly 14 digits, starting with 2 or 3"
                    borderColor={getBorderColor(nationalId, validateNationalId, 'nationalId')}
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    id="email"
                    icon={<Mail className="h-5 w-5" />}
                    iconPosition="right"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    autoComplete="email"
                    borderColor={getBorderColor(email, validateEmail, 'email')}
                  />

                  <Input
                    label="Phone Number"
                    type="tel"
                    id="phoneNumber"
                    leftIcon={showFlag ? <img src={EgyptianFlagImage} alt="Egyptian Flag" className="h-5 w-5" /> : null}
                    icon={<Phone className="h-5 w-5" />}
                    iconPosition="right"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="01282807407"
                    required
                    helperText="Must start with 010, 011, 012, or 015 and be 11 digits"
                    borderColor={getBorderColor(phoneNumber, validatePhoneNumber, 'phoneNumber')}
                  />

                  <Input
                    label="Birthdate"
                    type="date"
                    id="birthdate"
                    icon={<Cake className="h-5 w-5" />}
                    iconPosition="right"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    borderColor={getBorderColor(birthdate, validateBirthdate, 'birthdate')}
                  />

                  <Input
                    label="Password"
                    type="password"
                    id="password"
                    icon={<KeyRound className="h-5 w-5" />}
                    iconPosition="right"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    helperText="At least 8 characters with uppercase, lowercase, and number"
                    borderColor={getBorderColor(password, validatePassword, 'password')}
                  />

                  <Input
                    label="Confirm Password"
                    type="password"
                    id="confirmPassword"
                    icon={<KeyRound className="h-5 w-5" />}
                    iconPosition="right"
                    hideEye={true}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    borderColor={getConfirmPasswordBorderColor()}
                  />

                  <div className="flex items-center">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      required
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      I agree to the{' '}
                      <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                        Privacy Policy
                      </a>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    variant="rainbow"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full shadow-xl"
                    withShimmer
                  >
                    Create Account
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Log in
                    </Link>
                  </p>
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

export default Register;