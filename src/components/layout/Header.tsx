import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Moon, Sun, Menu, X, User, LogOut, Home, Settings, BookOpen, Calendar, Heart, DollarSign, GraduationCap, Globe } from 'lucide-react';
import Button from '../ui/Button';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, isLanguageLoading } = useLanguage();
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    if (!isMenuOpen) {
      setIsProfileOpen(false);
    }
  };
  
  const toggleProfile = () => {
    setIsProfileOpen((prev) => !prev);
    if (!isProfileOpen) {
      setIsMenuOpen(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };
  
  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled 
          ? 'bg-white dark:bg-gray-900 shadow-md py-2' 
          : 'bg-transparent py-4'}
      `}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white animate-pulse" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              SMEED
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="nav-link">{t('nav.home')}</Link>
            <Link to="/dashboard" className="nav-link">{t('nav.dashboard')}</Link>
            <Link to="/academic" className="nav-link">{t('nav.academic')}</Link>
            <Link to="/health" className="nav-link">{t('nav.health')}</Link>
            <Link to="/finance" className="nav-link">{t('nav.finance')}</Link>
            <Link to="/worship" className="nav-link">{t('nav.worship')}</Link>
            <Link to="/appointments" className="nav-link">{t('nav.appointments')}</Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              disabled={isLanguageLoading}
              className={`p-2 rounded-full transition-colors relative ${
                isLanguageLoading 
                  ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-800'
              }`}
              aria-label={language === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
            >
              <Globe className={`h-5 w-5 text-gray-700 dark:text-gray-300 ${
                isLanguageLoading ? 'opacity-50' : ''
              }`} />
              {isLanguageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <span className="sr-only">{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </button>
            
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleProfile}
                  className="flex items-center space-x-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full p-1 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden">
                    <User className="h-5 w-5 text-white" />
                  </div>
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden animate-slide-in-up z-20">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{currentUser?.firstName} {currentUser?.lastName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link to="/dashboard" className="profile-dropdown-link">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                      <Link to="/settings" className="profile-dropdown-link">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="profile-dropdown-link text-red-500 dark:text-red-400 w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Button 
                  variant="Button_2" // استخدام الـ variant الجديد
                  size="sm"
                  onClick={handleLogin}
                >
                  Login
                </Button>
                <Button 
                  variant="Button_2" // استخدام الـ variant الجديد
                  size="sm"
                  onClick={handleRegister}
                >
                  Register
                </Button>
              </div>
            )}
            
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg rounded-b-lg mt-2 animate-slide-in-down">
          <nav className="flex flex-col py-4 px-4">
            <Link to="/" className="mobile-nav-link">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link to="/academic" className="mobile-nav-link">
              <BookOpen className="h-5 w-5" />
              <span>Academic</span>
            </Link>
            <Link to="/health" className="mobile-nav-link">
              <Heart className="h-5 w-5" />
              <span>Health</span>
            </Link>
            <Link to="/finance" className="mobile-nav-link">
              <DollarSign className="h-5 w-5" />
              <span>Finance</span>
            </Link>
            <Link to="/calendar" className="mobile-nav-link">
              <Calendar className="h-5 w-5" />
              <span>Calendar</span>
            </Link>
            
            {!isAuthenticated && (
              <div className="flex flex-col space-y-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button 
                  variant="Button_2" // استخدام الـ variant الجديد
                  className="w-full"
                  onClick={handleLogin}
                  withShimmer={true}
                >
                  Login
                </Button>
                <Button 
                  variant="Button_2" // استخدام الـ variant الجديد
                  className="w-full"
                  onClick={handleRegister}
                  withShimmer={true}
                >
                  Register
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;