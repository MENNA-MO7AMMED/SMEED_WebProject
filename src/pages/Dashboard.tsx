import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, UserCircle, Camera, Trash2, School, Heart, DollarSign, Clock, PieChart, TrendingUp, Calendar, Activity, Target, CheckCircle, AlertCircle, BookOpen, Dumbbell, Wallet, Users, MapPin } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { initParticleEffect } from '../utils/animations';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Appointment, HealthProfile } from '../types';
import { categorizeAppointments, getAppointmentTypeEmoji } from '../utils/appointments';

interface UserData {
  user_name: string;
  national_id: string;
  email: string;
  phone_number: string;
  birthdate: string;
  profile_photo?: string;
  religion?: string;
  nationality?: string;
}

interface DashboardStats {
  appointments: {
    total: number;
    completed: number;
    overdue: number;
    today: number;
    upcoming: number;
  };
  health: {
    hasProfile: boolean;
    bmi?: number;
    bmiCategory?: string;
    activePlans: number;
    lastUpdate?: string;
  };
  worship: {
    hasPreferences: boolean;
    religion?: string;
    todayPrayers?: number;
    completedPrayers?: number;
    completionRate?: number;
  };
  academic: {
    totalCourses: number;
    completedAssignments: number;
    upcomingExams: number;
    gpa?: number;
  };
  finance: {
    totalBalance: number;
    monthlyExpenses: number;
    pendingPayments: number;
    budgetStatus: 'good' | 'warning' | 'critical';
  };
}

const Dashboard: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    appointments: { total: 0, completed: 0, overdue: 0, today: 0, upcoming: 0 },
    health: { hasProfile: false, activePlans: 0 },
    worship: { hasPreferences: false },
    academic: { totalCourses: 0, completedAssignments: 0, upcomingExams: 0 },
    finance: { totalBalance: 0, monthlyExpenses: 0, pendingPayments: 0, budgetStatus: 'good' }
  });

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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (currentUser) {
          const storedUser = localStorage.getItem('user');
          const storedUserData = storedUser ? JSON.parse(storedUser) : null;

          const userData: UserData = {
            user_name: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'N/A',
            national_id: currentUser.nationalId || 'Unknown',
            email: currentUser.email,
            phone_number: currentUser.phoneNumber || 'Unknown',
            birthdate: currentUser.birthDate ? new Date(currentUser.birthDate).toISOString().split('T')[0] : 'Unknown',
            profile_photo: storedUserData?.profile_photo,
            religion: "Unknown",
            nationality: "Unknown"
          };
          setUserData(userData);

          // Load dashboard statistics
          await loadDashboardStats();
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const loadDashboardStats = async () => {
    if (!currentUser?.id) return;

    const userId = currentUser.id;
    const stats: DashboardStats = {
      appointments: { total: 0, completed: 0, overdue: 0, today: 0, upcoming: 0 },
      health: { hasProfile: false, activePlans: 0 },
      worship: { hasPreferences: false },
      academic: { totalCourses: 0, completedAssignments: 0, upcomingExams: 0 },
      finance: { totalBalance: 0, monthlyExpenses: 0, pendingPayments: 0, budgetStatus: 'good' }
    };

    try {
      // Load Appointments Data
      const appointmentsData = localStorage.getItem(`appointments_${userId}`);
      if (appointmentsData) {
        const appointments: Appointment[] = JSON.parse(appointmentsData).map((app: any) => ({
          ...app,
          appointment_date: new Date(app.appointment_date)
        }));
        
        const categorized = categorizeAppointments(appointments);
        stats.appointments = {
          total: appointments.length,
          completed: categorized.completed.length,
          overdue: categorized.overdue.length,
          today: categorized.today.length,
          upcoming: categorized.upcoming.length
        };
      }

      // Load Health Data
      const healthProfileData = localStorage.getItem(`health_profile_${userId}`);
      if (healthProfileData) {
        const healthProfile: HealthProfile = JSON.parse(healthProfileData);
        const bmi = healthProfile.height && healthProfile.weight ? 
          parseFloat((healthProfile.weight / Math.pow(healthProfile.height / 100, 2)).toFixed(1)) : undefined;
        
        let bmiCategory = 'Unknown';
        if (bmi) {
          if (bmi < 18.5) bmiCategory = 'Underweight';
          else if (bmi < 25) bmiCategory = 'Normal';
          else if (bmi < 30) bmiCategory = 'Overweight';
          else bmiCategory = 'Obese';
        }

        const planProgressData = localStorage.getItem(`plan_progress_${userId}`);
        const activePlans = planProgressData ? Object.keys(JSON.parse(planProgressData)).length : 0;

        stats.health = {
          hasProfile: true,
          bmi,
          bmiCategory,
          activePlans,
          lastUpdate: healthProfile.updated_at ? new Date(healthProfile.updated_at).toLocaleDateString() : undefined
        };
      }

      // Load Worship Data
      const worshipPrefsData = localStorage.getItem(`worship_prefs_${userId}`);
      if (worshipPrefsData) {
        const worshipPrefs = JSON.parse(worshipPrefsData);
        
        // Get today's prayer data
        const today = new Date().toISOString().split('T')[0];
        const todayPrayersData = localStorage.getItem(`prayers_${userId}_${today}`);
        
        let todayPrayers = 0;
        let completedPrayers = 0;
        
        if (todayPrayersData) {
          const prayersStatus = JSON.parse(todayPrayersData);
          todayPrayers = Object.keys(prayersStatus).length;
          completedPrayers = Object.values(prayersStatus).filter(status => status === true).length;
        }

        stats.worship = {
          hasPreferences: true,
          religion: worshipPrefs.religion,
          todayPrayers,
          completedPrayers,
          completionRate: todayPrayers > 0 ? Math.round((completedPrayers / todayPrayers) * 100) : 0
        };
      }

      // Load Academic Data
      const academicData = localStorage.getItem(`academic_${userId}`);
      if (academicData) {
        const academic = JSON.parse(academicData);
        stats.academic = academic;
      }

      // Load Finance Data
      const financeData = localStorage.getItem(`finance_${userId}`);
      if (financeData) {
        try {
          const storedFinance = JSON.parse(financeData);
          // Validate and assign, otherwise stats.finance retains its initial default values
          if (storedFinance && typeof storedFinance === 'object') {
            stats.finance = {
              totalBalance: typeof storedFinance.totalBalance === 'number' ? storedFinance.totalBalance : stats.finance.totalBalance,
              monthlyExpenses: typeof storedFinance.monthlyExpenses === 'number' ? storedFinance.monthlyExpenses : stats.finance.monthlyExpenses,
              pendingPayments: typeof storedFinance.pendingPayments === 'number' ? storedFinance.pendingPayments : stats.finance.pendingPayments,
              budgetStatus: ['good', 'warning', 'critical'].includes(storedFinance.budgetStatus) ? storedFinance.budgetStatus : stats.finance.budgetStatus,
            };
          }
        } catch (e) {
          console.error('Error parsing finance data from localStorage:', e);
          // If parsing fails, stats.finance will retain its initial default values
          // as set during the 'stats' object initialization.
        }
      }
      // If financeData is null, stats.finance also retains its initial default values.

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }

    setDashboardStats(stats);
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUserData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            profile_photo: base64String
          };
        });

        // Save to localStorage to persist the photo
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          user.profile_photo = base64String;
          localStorage.setItem('user', JSON.stringify(user));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePhoto = () => {
    setUserData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        profile_photo: undefined
      };
    });

    // Remove photo from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      delete user.profile_photo;
      localStorage.setItem('user', JSON.stringify(user));
    }
  };

  const renderQuickStats = (title: string, icon: React.ReactNode, stats: React.ReactNode, actionButton?: React.ReactNode) => (
    <Card withHover withGlow className="fade-in">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
              {icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          </div>
          {actionButton}
        </div>
        {stats}
      </div>
    </Card>
  );

  const renderSection = (title: string, icon: React.ReactNode, content: React.ReactNode) => (
    <Card withHover withGlow className="fade-in mb-6">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
            {icon}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
        </div>
        {content}
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <section className="relative pt-32 pb-20 overflow-hidden flex-1">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              {t('nav.dashboard')}
            </h1>

            {/* Personal Information */}
            {renderSection(
              t('dashboard.personalInfo'),
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      {userData?.profile_photo ? (
                        <img 
                          src={userData.profile_photo} 
                          alt={t('dashboard.profilePhoto')} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircle className="w-20 h-20 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 flex space-x-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                        />
                        <Camera className="h-8 w-8 p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors" />
                      </label>
                      {userData?.profile_photo && (
                        <button
                          onClick={handleDeletePhoto}
                          className="h-8 w-8 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          aria-label={t('dashboard.deletePhoto')}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('common.username')}</label>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{userData?.user_name}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('common.nationalId')}</label>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{userData?.national_id}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('common.email')}</label>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{userData?.email}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('common.phoneNumber')}</label>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{userData?.phone_number}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('common.birthDate')}</label>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{userData?.birthdate}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Dashboard Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Appointments Quick Stats */}
              {renderQuickStats(
                "Appointments",
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</span>
                    <span className="font-semibold">{dashboardStats.appointments.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                    <span className="font-semibold text-green-600">{dashboardStats.appointments.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Today</span>
                    <span className="font-semibold text-blue-600">{dashboardStats.appointments.today}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Overdue</span>
                    <span className="font-semibold text-red-600">{dashboardStats.appointments.overdue}</span>
                  </div>
                </div>,
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => navigate('/appointments')}
                  className="text-xs"
                >
                  View All
                </Button>
              )}

              {/* Health Quick Stats */}
              {renderQuickStats(
                "Health",
                <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />,
                dashboardStats.health.hasProfile ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">BMI</span>
                      <span className="font-semibold">{dashboardStats.health.bmi || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Category</span>
                      <span className="font-semibold">{dashboardStats.health.bmiCategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Active Plans</span>
                      <span className="font-semibold text-blue-600">{dashboardStats.health.activePlans}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Last Update</span>
                      <span className="font-semibold text-xs">{dashboardStats.health.lastUpdate}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-600 dark:text-gray-400">
                    <p className="text-sm">No health profile found</p>
                    <p className="text-xs mt-1">Create your profile to track health data</p>
                  </div>
                ),
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => navigate('/health')}
                  className="text-xs"
                >
                  {dashboardStats.health.hasProfile ? 'View Details' : 'Create Profile'}
                </Button>
              )}

              {/* Worship Quick Stats */}
              {renderQuickStats(
                "Worship",
                <PieChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
                dashboardStats.worship.hasPreferences ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Religion</span>
                      <span className="font-semibold capitalize">{dashboardStats.worship.religion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Today's Prayers</span>
                      <span className="font-semibold">{dashboardStats.worship.completedPrayers}/{dashboardStats.worship.todayPrayers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
                      <span className="font-semibold text-green-600">{dashboardStats.worship.completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${dashboardStats.worship.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-600 dark:text-gray-400">
                    <p className="text-sm">No worship preferences set</p>
                    <p className="text-xs mt-1">Set your preferences to track prayers</p>
                  </div>
                ),
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => navigate('/worship')}
                  className="text-xs"
                >
                  {dashboardStats.worship.hasPreferences ? 'View Prayers' : 'Set Preferences'}
                </Button>
              )}
            </div>

            {/* Academic Information */}
            {renderSection(
              t('nav.academic'),
              <School className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Courses</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{dashboardStats.academic.totalCourses}</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Assignments</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{dashboardStats.academic.completedAssignments}</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming Exams</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">{dashboardStats.academic.upcomingExams}</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Current GPA</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{dashboardStats.academic.gpa}</div>
                </div>
              </div>
            )}

            {/* Health Information */}
            {renderSection(
              t('nav.health'),
              <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />,
              dashboardStats.health.hasProfile ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Activity className="h-5 w-5 text-red-600 mr-2" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">BMI Status</span>
                    </div>
                    <div className="text-xl font-bold text-red-600">{dashboardStats.health.bmi}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{dashboardStats.health.bmiCategory}</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Dumbbell className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Plans</span>
                    </div>
                    <div className="text-xl font-bold text-blue-600">{dashboardStats.health.activePlans}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Health Programs</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Target className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</span>
                    </div>
                    <div className="text-sm font-bold text-green-600">{dashboardStats.health.lastUpdate || 'Never'}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Profile Update</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-600 dark:text-gray-400 py-8">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg mb-2">No Health Profile Found</p>
                  <p className="text-sm mb-4">Create your health profile to track your wellness journey</p>
                  <Button onClick={() => navigate('/health')}>Create Health Profile</Button>
                </div>
              )
            )}

            {/* Finance Information */}
            {renderSection(
              t('nav.finance'),
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />,
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Wallet className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Balance</span>
                  </div>
                  <div className="text-xl font-bold text-green-600">${dashboardStats.finance.totalBalance}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Available Funds</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Expenses</span>
                  </div>
                  <div className="text-xl font-bold text-blue-600">${dashboardStats.finance.monthlyExpenses}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">This Month</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Payments</span>
                  </div>
                  <div className="text-xl font-bold text-yellow-600">{dashboardStats.finance.pendingPayments}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                      dashboardStats.finance.budgetStatus === 'good' ? 'bg-green-500' :
                      dashboardStats.finance.budgetStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></span>
                    Budget {dashboardStats.finance.budgetStatus}
                  </div>
                </div>
              </div>
            )}

            {/* Appointments Information */}
            {renderSection(
              "Appointments & Tasks",
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{dashboardStats.appointments.total}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{dashboardStats.appointments.completed}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{dashboardStats.appointments.today}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Today</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{dashboardStats.appointments.overdue}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Overdue</div>
                  </div>
                </div>
                {dashboardStats.appointments.total > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>Completion Progress</span>
                      <span>{Math.round((dashboardStats.appointments.completed / dashboardStats.appointments.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(dashboardStats.appointments.completed / dashboardStats.appointments.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Worship Information */}
            {renderSection(
              "Worship Information",
              <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
              dashboardStats.worship.hasPreferences ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Religion</label>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                      {dashboardStats.worship.religion}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Prayer Progress</label>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {dashboardStats.worship.completedPrayers}/{dashboardStats.worship.todayPrayers} ({dashboardStats.worship.completionRate}%)
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${dashboardStats.worship.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-600 dark:text-gray-400 py-8">
                  <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg mb-2">No Worship Preferences Set</p>
                  <p className="text-sm mb-4">Set your religious preferences to track your spiritual journey</p>
                  <Button onClick={() => navigate('/worship')}>Set Worship Preferences</Button>
                </div>
              )
            )}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Dashboard;