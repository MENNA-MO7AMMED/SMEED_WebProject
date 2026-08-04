import React, { useState, useEffect } from 'react';
import { Heart, Mail, Github, Linkedin, Twitter, GraduationCap } from 'lucide-react';
import MayerImage from '../../assets/Mayer.jpg';
import MennaImage from '../../assets/Menna.jpg';
import MostafaImage from '../../assets/Mostafa.jpg';
import GalalImage from '../../assets/Galal.jpg';
import BasmalaImage from '../../assets/Basmala.jpg';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [selectedFounder, setSelectedFounder] = useState<string | null>(null);

  // Reset selected founder after 3 seconds
  useEffect(() => {
    if (selectedFounder) {
      const timer = setTimeout(() => {
        setSelectedFounder(null);
      }, 3000); // 3 seconds

      return () => clearTimeout(timer);
    }
  }, [selectedFounder]);

  const founders = [
    { name: 'Basmala Aboelhamed', image: BasmalaImage },
    { name: 'Mostafa Ayman', image: MostafaImage },
    { name: 'Mayer Romany', image: MayerImage },
    { name: 'Mahmoud Galal', image: GalalImage },
    { name: 'Menna Mohamed', image: MennaImage },
  ];

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <style>
        {`
          @keyframes vibrate {
            0% { transform: translate(0) scale(1.5); }
            25% { transform: translate(-2px, 2px) scale(1.5); }
            50% { transform: translate(2px, -2px) scale(1.5); }
            75% { transform: translate(-2px, -2px) scale(1.5); }
            100% { transform: translate(2px, 2px) scale(1.5); }
          }
          .founder-photo.selected {
            animation: vibrate 0.3s ease-in-out infinite;
            z-index: 50;
          }
          .founder-photo {
            transition: all 0.3s ease-in-out;
          }
        `}
      </style>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                SMEED
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              The ultimate student management platform with everything you need to excel in your academic journey & in your Life.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Platform
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 text-sm transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 text-sm transition-colors">
                  Academic Planner
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 text-sm transition-colors">
                  Health Tracker
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 text-sm transition-colors">
                  Finance Manager
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 text-sm transition-colors">
                  Appointments
                </a>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 text-sm transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 text-sm transition-colors">
                  Tutorials
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 text-sm transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 text-sm transition-colors">
                  API
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 text-sm transition-colors">
                  Community
                </a>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Founders
            </h3>
            <ul className="space-y-2">
              {founders.map((founder) => (
                <li key={founder.name}>
                  <button
                    onClick={() => setSelectedFounder(selectedFounder === founder.name ? null : founder.name)}
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 text-sm transition-colors focus:outline-none"
                  >
                    {founder.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © {currentYear} SMEED. All rights reserved.
          </p>
          
          {/* Team Photos */}
          <div className="flex -space-x-2 my-6 md:my-0 mx-8">
            {founders.map((founder) => (
              <div
                key={founder.name}
                className={`w-20 h-20 rounded-full border-3 border-white dark:border-gray-800 overflow-hidden relative bg-gradient-to-br from-blue-500 to-purple-600 hover:scale-125 transition-all duration-300 hover:z-10 shadow-lg ml-4 first:ml-0 founder-photo ${
                  selectedFounder === founder.name ? 'selected' : ''
                }`}
              >
                <img 
                  src={founder.image}
                  alt={founder.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 md:mt-0 flex items-center">
            Made with <Heart size={14} className="text-red-500 mx-1" /> for students worldwide
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;