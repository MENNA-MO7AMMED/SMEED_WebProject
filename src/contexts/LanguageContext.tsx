import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n from '../i18n';

interface LanguageContextType {
  language: string;
  toggleLanguage: () => void;
  isLanguageLoading: boolean;
  direction: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps): JSX.Element => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [isLanguageLoading, setIsLanguageLoading] = useState(false);
  const [direction, setDirection] = useState<'ltr' | 'rtl'>(language === 'ar' ? 'rtl' : 'ltr');

  // Handle initial language setup
  useEffect(() => {
    const setupInitialLanguage = async () => {
      const savedLanguage = localStorage.getItem('language') || 'en';
      const dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
      
      document.dir = dir;
      document.documentElement.lang = savedLanguage;
      await i18n.changeLanguage(savedLanguage);
    };

    setupInitialLanguage();
  }, []);

  // Handle language changes
  useEffect(() => {
    const applyLanguage = async () => {
      setIsLanguageLoading(true);
      
      // Update direction based on language
      const newDirection = language === 'ar' ? 'rtl' : 'ltr';
      setDirection(newDirection);
      
      // Add transition class before changes
      document.documentElement.classList.add('lang-transition');
      
      // Update document direction and language
      document.dir = newDirection;
      document.documentElement.lang = language;
      
      // Update language in i18n and localStorage
      await i18n.changeLanguage(language);
      localStorage.setItem('language', language);
      
      // Remove transition class and loading state after a short delay
      setTimeout(() => {
        document.documentElement.classList.remove('lang-transition');
        setIsLanguageLoading(false);
      }, 300);
    };

    applyLanguage();
  }, [language]);

  const toggleLanguage = () => {
    if (!isLanguageLoading) {
      const newLanguage = language === 'en' ? 'ar' : 'en';
      setLanguage(newLanguage);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, isLanguageLoading, direction }}>
      {children}
    </LanguageContext.Provider>
  );
}; 