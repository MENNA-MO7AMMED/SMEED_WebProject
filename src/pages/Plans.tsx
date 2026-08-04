import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  X,
  Sparkles,
  Rocket,
  Crown,
  Star,
  ChevronRight,
  Shield,
  Clock,
  Users,
  Cloud,
  Zap,
  BookOpen,
  Calendar,
  Heart,
  Activity,
  Settings,
  MessageCircle,
  HelpCircle,
  Database,
  Lock
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { initParticleEffect } from '../utils/animations';

interface PricingFeature {
  name: string;
  free: boolean;
  pro: boolean;
  enterprise: boolean;
  icon: React.ReactNode;
}

const Plans: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'enterprise'>('free');
  const [isHovered, setIsHovered] = useState<string | null>(null);

  // Add particle effect for background
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

  const features: PricingFeature[] = [
    { name: 'Basic Health Tracking & BMI Calculator', free: true, pro: true, enterprise: true, icon: <Heart size={18} /> },
    { name: 'Prayer Times & Religious Toolkit', free: true, pro: true, enterprise: true, icon: <BookOpen size={18} /> },
    { name: 'Basic Calendar Management', free: true, pro: true, enterprise: true, icon: <Calendar size={18} /> },
    { name: 'Basic Financial Planning', free: true, pro: true, enterprise: true, icon: <Activity size={18} /> },
    { name: 'Cloud Storage (5GB)', free: true, pro: true, enterprise: true, icon: <Cloud size={18} /> },
    { name: 'Email Support', free: true, pro: true, enterprise: true, icon: <MessageCircle size={18} /> },
    { name: 'Advanced Health Analytics', free: false, pro: true, enterprise: true, icon: <Activity size={18} /> },
    { name: 'Custom Prayer Reminders', free: false, pro: true, enterprise: true, icon: <Settings size={18} /> },
    { name: 'Team Collaboration', free: false, pro: false, enterprise: true, icon: <Users size={18} /> },
    { name: 'Priority Support 24/7', free: false, pro: false, enterprise: true, icon: <HelpCircle size={18} /> },
    { name: 'Custom Integrations', free: false, pro: false, enterprise: true, icon: <Database size={18} /> },
    { name: 'Advanced Security Features', free: false, pro: false, enterprise: true, icon: <Lock size={18} /> },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.5
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  const featureRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const floatingAnimation = {
    y: [-10, 10],
    transition: {
      y: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };

  const glowAnimation = {
    boxShadow: [
      "0 0 20px rgba(59, 130, 246, 0.5)",
      "0 0 40px rgba(59, 130, 246, 0.3)",
      "0 0 20px rgba(59, 130, 246, 0.5)"
    ],
    transition: {
      boxShadow: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  const renderPlanIcon = (plan: string) => {
    switch (plan) {
      case 'free':
        return <Star className="h-8 w-8 text-blue-500" />;
      case 'pro':
        return <Rocket className="h-8 w-8 text-purple-500" />;
      case 'enterprise':
        return <Crown className="h-8 w-8 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free':
        return 'blue';
      case 'pro':
        return 'purple';
      case 'enterprise':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Header />
      
      <motion.section 
        className="relative pt-32 pb-20 md:pt-40 md:pb-24"
        variants={containerVariants}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            variants={cardVariants}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Choose Your Perfect{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                Plan
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Select the plan that best fits your needs. All plans include our core features to help you succeed.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <motion.div
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              className="relative"
            >
              <Card 
                withHover 
                withGlow={selectedPlan === 'free'}
                className={`h-full ${selectedPlan === 'free' ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="p-6">
                  <motion.div 
                    className="flex items-center justify-center mb-4"
                    animate={floatingAnimation}
                  >
                    {renderPlanIcon('free')}
                  </motion.div>
                  <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                    Free Forever
                  </h3>
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">$0</span>
                    <span className="text-gray-600 dark:text-gray-400">/forever</span>
                  </div>
                  <motion.button
                    className="shine-button w-full mb-6"
                    onClick={() => {
                      localStorage.setItem('selectedPlan', 'free');
                      navigate('/register');
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Started
                  </motion.button>
                  <ul className="space-y-3">
                    {features.map((feature, index) => (
                      <motion.li
                        key={index}
                        variants={featureRowVariants}
                        className={`flex items-center space-x-2 ${
                          feature.free ? 'text-gray-900 dark:text-white' : 'text-gray-400 line-through'
                        }`}
                      >
                        {feature.free ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                        <span className="flex items-center space-x-2">
                          {feature.icon}
                          <span>{feature.name}</span>
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </Card>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              className="relative"
            >
              <motion.div
                className="absolute -top-4 left-0 right-0 flex justify-center"
                animate={floatingAnimation}
              >
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </motion.div>
              <Card 
                withHover 
                withGlow={selectedPlan === 'pro'}
                className={`h-full transform translate-y-0 hover:-translate-y-1 transition-transform duration-300 ${
                  selectedPlan === 'pro' ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                <motion.div 
                  className="absolute inset-0 rounded-lg"
                  animate={glowAnimation}
                ></motion.div>
                <div className="p-6 relative z-10">
                  <motion.div 
                    className="flex items-center justify-center mb-4"
                    animate={floatingAnimation}
                  >
                    {renderPlanIcon('pro')}
                  </motion.div>
                  <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                    Pro Student
                  </h3>
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">$9</span>
                    <span className="text-gray-600 dark:text-gray-400">/month</span>
                  </div>
                  <motion.button
                    className="shine-button w-full mb-6"
                    onClick={() => {
                      navigate('/payment', { state: { plan: 'pro' } });
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Started
                  </motion.button>
                  <ul className="space-y-3">
                    {features.map((feature, index) => (
                      <motion.li
                        key={index}
                        variants={featureRowVariants}
                        className={`flex items-center space-x-2 ${
                          feature.pro ? 'text-gray-900 dark:text-white' : 'text-gray-400 line-through'
                        }`}
                      >
                        {feature.pro ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                        <span className="flex items-center space-x-2">
                          {feature.icon}
                          <span>{feature.name}</span>
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </Card>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              className="relative"
            >
              <Card 
                withHover 
                withGlow={selectedPlan === 'enterprise'}
                className={`h-full ${selectedPlan === 'enterprise' ? 'ring-2 ring-yellow-500' : ''}`}
              >
                <div className="p-6">
                  <motion.div 
                    className="flex items-center justify-center mb-4"
                    animate={floatingAnimation}
                  >
                    {renderPlanIcon('enterprise')}
                  </motion.div>
                  <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                    University
                  </h3>
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">$49</span>
                    <span className="text-gray-600 dark:text-gray-400">/month</span>
                  </div>
                  <motion.button
                    className="shine-button w-full mb-6"
                    onClick={() => {
                      navigate('/payment', { state: { plan: 'enterprise' } });
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Contact Sales
                  </motion.button>
                  <ul className="space-y-3">
                    {features.map((feature, index) => (
                      <motion.li
                        key={index}
                        variants={featureRowVariants}
                        className={`flex items-center space-x-2 ${
                          feature.enterprise ? 'text-gray-900 dark:text-white' : 'text-gray-400 line-through'
                        }`}
                      >
                        {feature.enterprise ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                        <span className="flex items-center space-x-2">
                          {feature.icon}
                          <span>{feature.name}</span>
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Features Comparison */}
          <motion.div 
            className="mt-20"
            variants={containerVariants}
          >
            <Card withHover>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                  Compare Plan Features
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left py-4 px-6">Feature</th>
                        <th className="text-center py-4 px-6">Free</th>
                        <th className="text-center py-4 px-6">Pro</th>
                        <th className="text-center py-4 px-6">Enterprise</th>
                      </tr>
                    </thead>
                    <tbody>
                      {features.map((feature, index) => (
                        <motion.tr
                          key={index}
                          variants={featureRowVariants}
                          className="border-t border-gray-200 dark:border-gray-700"
                          whileHover={{
                            backgroundColor: "rgba(59, 130, 246, 0.1)",
                            transition: { duration: 0.2 }
                          }}
                        >
                          <td className="py-4 px-6 flex items-center space-x-2">
                            {feature.icon}
                            <span>{feature.name}</span>
                          </td>
                          <td className="text-center py-4 px-6">
                            {feature.free ? (
                              <Check className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-red-500 mx-auto" />
                            )}
                          </td>
                          <td className="text-center py-4 px-6">
                            {feature.pro ? (
                              <Check className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-red-500 mx-auto" />
                            )}
                          </td>
                          <td className="text-center py-4 px-6">
                            {feature.enterprise ? (
                              <Check className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-red-500 mx-auto" />
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* FAQ Section */}
          <motion.div 
            className="mt-20"
            variants={containerVariants}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Have questions? We're here to help.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  q: "Can I switch plans later?",
                  a: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans."
                },
                {
                  q: "Is there a long-term contract?",
                  a: "No, all our plans are month-to-month with no long-term commitment required."
                },
                {
                  q: "Do you offer student discounts?",
                  a: "Yes! Students can get 20% off any paid plan with a valid student email address."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card withHover>
                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {faq.q}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {faq.a}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div 
            className="mt-20 text-center"
            variants={containerVariants}
          >
            <Card withHover withGlow>
              <div className="p-12">
                <motion.h2 
                  className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Ready to Get Started?
                </motion.h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                  Join thousands of students who are already using SMEED to manage their academic life.
                </p>
                <motion.button
                  className="shine-button mx-auto"
                  onClick={() => navigate('/register')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Your Journey Now
                </motion.button>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.section>
      
      <Footer />
    </motion.div>
  );
};

export default Plans; 