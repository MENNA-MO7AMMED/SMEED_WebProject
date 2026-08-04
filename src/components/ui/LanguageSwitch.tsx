import React, { useState } from 'react';
import { Globe } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface LanguageSwitchProps {
  languages: Language[];
  currentLanguage: string;
  onLanguageChange: (languageCode: string) => void;
  className?: string;
}

const LanguageSwitch: React.FC<LanguageSwitchProps> = ({
  languages,
  currentLanguage,
  onLanguageChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getCurrentLanguage = () => {
    return languages.find((lang) => lang.code === currentLanguage) || languages[0];
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLanguageSelect = (languageCode: string) => {
    onLanguageChange(languageCode);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        className="flex items-center space-x-1 py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        onClick={toggleDropdown}
      >
        <Globe size={18} className="text-gray-600 dark:text-gray-300" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{getCurrentLanguage().flag}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10 animate-fade-in">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {languages.map((language) => (
              <button
                key={language.code}
                className={`
                  w-full text-left px-4 py-2 text-sm flex items-center space-x-2
                  ${currentLanguage === language.code 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                  transition-colors duration-200
                `}
                role="menuitem"
                onClick={() => handleLanguageSelect(language.code)}
              >
                <span>{language.flag}</span>
                <span>{language.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitch;