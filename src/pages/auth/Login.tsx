import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, KeyRound, AlertCircle } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import axios from 'axios';
import { z } from 'zod';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { initParticleEffect } from '../../utils/animations';
import { useTranslation } from 'react-i18next';

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8)
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const initialFailedAttempts = parseInt(localStorage.getItem('failedAttempts') || '0');
  const initialLockoutStartTime = parseInt(localStorage.getItem('lockoutStartTime') || '0');
  const initialIsLocked = initialLockoutStartTime > 0 && Date.now() - initialLockoutStartTime < 300000;

  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [attemptMessage, setAttemptMessage] = useState('');
  const [unlockMessage, setUnlockMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState<number>(initialFailedAttempts);
  const [isLocked, setIsLocked] = useState<boolean>(initialIsLocked);
  const [lockoutStartTime, setLockoutStartTime] = useState<number>(initialLockoutStartTime);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  // إضافة الـ Particle Effect
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

  const calculateRemainingTime = () => {
    if (!isLocked) return 0;
    const elapsedTime = Date.now() - lockoutStartTime;
    const remaining = 300000 - elapsedTime;
    return remaining > 0 ? remaining : 0;
  };

  const calculateProgressPercentage = () => {
    const totalLockoutTime = 300000;
    const remaining = calculateRemainingTime();
    return (remaining / totalLockoutTime) * 100;
  };

  useEffect(() => {
    if (isLocked) {
      const timer = setInterval(() => {
        const remaining = calculateRemainingTime();
        setRemainingTime(remaining);

        if (remaining <= 0) {
          setIsLocked(false);
          setFailedAttempts(0);
          setLockoutStartTime(0);
          setAttemptMessage('');
          setUnlockMessage('Account unlocked. You have 5 attempts remaining.');
          localStorage.removeItem('failedAttempts');
          localStorage.removeItem('lockoutStartTime');
          clearInterval(timer);

          setTimeout(() => {
            setUnlockMessage('');
          }, 3000);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutStartTime]);

  const formatRemainingTime = () => {
    const minutes = Math.floor(remainingTime / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError('');
      setAttemptMessage('');
      const validatedData = loginSchema.parse(formData);
      setIsLoading(true);

      const response = await axios.post('http://localhost:3000/login', validatedData);
      
      if (response.data.message === 'Login successful') {
        const user = response.data.user;
        console.log('Login response user:', user); // Debug log

        // Store the user data with the correct format including student_id
        const formattedUser = {
          id: user.id.toString(),
          student_id: user.student_id.toString(), // Make sure to include student_id
          username: user.username,
          email: user.email,
          firstName: user.username.split(' ')[0],
          lastName: user.username.split(' ')[1] || '',
          phoneNumber: user.phone_number || '',
          nationalId: user.national_id || '',
          birthDate: new Date(user.birthdate || Date.now()),
          verifiedEmail: true,
          loginAttempts: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        console.log('Storing user data:', formattedUser); // Debug log
        localStorage.setItem('user', JSON.stringify(formattedUser));
        
        setFailedAttempts(0);
        setAttemptMessage('');
        localStorage.removeItem('failedAttempts');
        localStorage.removeItem('lockoutStartTime');
        navigate('/dashboard');
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0]?.message || 'Invalid input. Please check your username and password.');
      } else {
        const backendError = err.response?.data?.error || 'Login failed. Please try again.';
        setError(backendError);

        if (backendError === 'Invalid username or password') {
          const newFailedAttempts = failedAttempts + 1;
          setFailedAttempts(newFailedAttempts);
          localStorage.setItem('failedAttempts', newFailedAttempts.toString());

          const remaining = 5 - newFailedAttempts;
          if (remaining > 0) {
            setAttemptMessage(`You have ${remaining} attempts left.`);
          }

          if (newFailedAttempts >= 5) {
            setIsLocked(true);
            const lockTime = Date.now();
            setLockoutStartTime(lockTime);
            localStorage.setItem('lockoutStartTime', lockTime.toString());
            setRemainingTime(300000);
            setAttemptMessage('');
            setError('Account is locked!');
          }
        }
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const remainingAttempts = 5 - failedAttempts;

  // دالة لعرض الـ Floating Shapes
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
                {t('auth.loginTo')}{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                  {t('common.appName')}
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
                {t('auth.loginDescription')}
              </p>

              <Card className="w-full animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                {error && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center text-red-700 dark:text-red-400 animate-slide-in-up">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {unlockMessage && (
                  <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center text-green-700 dark:text-green-400">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p className="text-sm">{t('auth.unlocked')}</p>
                  </div>
                )}

                {isLocked && (
                  <div className="mb-4 flex flex-col items-center">
                    <div className="w-24 h-24 mb-2">
                      <CircularProgressbar
                        value={calculateProgressPercentage()}
                        text={formatRemainingTime()}
                        styles={buildStyles({
                          pathColor: '#f4b400',
                          textColor: '#f4b400',
                          trailColor: '#d6d6d6',
                          textSize: '20px',
                        })}
                      />
                    </div>
                    <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                      {t('auth.accountLocked', { time: formatRemainingTime() })}
                    </p>
                  </div>
                )}

                {!isLocked && remainingAttempts < 5 && attemptMessage && (
                  <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-700 dark:text-yellow-400">
                    {t('auth.remainingAttempts', { count: remainingAttempts })}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label={t('common.username')}
                    type="text"
                    name="username"
                    icon={<User className="h-5 w-5 text-gray-400" />}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder={t('auth.enterUsername')}
                    required
                    disabled={isLocked || isLoading}
                  />

                  <Input
                    label={t('common.password')}
                    type="password"
                    name="password"
                    icon={<KeyRound className="h-5 w-5 text-gray-400" />}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={t('auth.enterPassword')}
                    required
                    disabled={isLocked || isLoading}
                  />

                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        {t('common.rememberMe')}
                      </span>
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {t('common.forgotPassword')}
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    variant="rainbow"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full shadow-xl"
                    withShimmer
                    disabled={isLocked || isLoading}
                  >
                    {isLoading ? t('auth.loggingIn') : t('common.login')}
                  </Button>

                  <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    {t('auth.noAccount')}{' '}
                    <Link
                      to="/register"
                      className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {t('common.register')}
                    </Link>
                  </p>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Login;