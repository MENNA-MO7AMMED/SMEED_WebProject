import React, { useEffect } from 'react';
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
import { ArrowRight, BookOpen, DollarSign, Heart, Calendar, PieChart, User, Shield, BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { initParticleEffect } from '../utils/animations';
import HeroVideo from '../assets/hero-video.mp4';
import YaserImage from '../assets/yaser-image.jpg';
import RemonImage from '../assets/remon-image.jpg';
import MinaImage from '../assets/mina-image.jpg';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const controls = useAnimation();

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

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const textRevealVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 20
      }
    }
  };

  const floatingShapeVariants = {
    animate: {
      y: [0, -20, 0],
      rotate: [0, 10, -10, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const cardHoverVariants = {
    hover: {
      scale: 1.05,
      y: -10,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    document.body.appendChild(canvas);
    
    initParticleEffect('particles-canvas');
    
    controls.start("visible");

    return () => {
      const canvasElement = document.getElementById('particles-canvas');
      if (canvasElement) {
        canvasElement.remove();
      }
    };
  }, [controls]);
  
  const renderFloatingShapes = () => {
    return (
      <>
        {[
          { top: "20", left: "10%", color: "blue", size: "20" },
          { top: "40", right: "15%", color: "purple", size: "16" },
          { bottom: "60", left: "20%", color: "green", size: "24" },
          { bottom: "40", right: "10%", color: "yellow", size: "32" },
          { top: "30%", left: "30%", color: "red", size: "12" }
        ].map((shape, index) => (
          <motion.div
            key={index}
            className={`absolute w-${shape.size} h-${shape.size} bg-${shape.color}-500/10 dark:bg-${shape.color}-500/20 rounded-full`}
            style={{
              top: shape.top,
              left: shape.left,
              right: shape.right,
              bottom: shape.bottom
            }}
            variants={floatingShapeVariants}
            animate="animate"
            initial="hidden"
            custom={index}
          />
        ))}
      </>
    );
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
        className="relative pt-32 pb-20 md:pt-40 md:pb-24 overflow-hidden"
        variants={containerVariants}
      >
        {renderFloatingShapes()}
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            <motion.div 
              className="lg:w-1/2 lg:pr-12 mb-12 lg:mb-0"
              variants={textRevealVariants}
            >
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-gray-900 dark:text-white mb-6"
                variants={textRevealVariants}
              >
                Your Ultimate Student
                <motion.span 
                  className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 font-black"
                  animate={{ 
                    backgroundPosition: ["0%", "100%"],
                    transition: { duration: 5, repeat: Infinity, repeatType: "reverse" }
                  }}
                >
                  {" Management Platform"}
                </motion.span>
              </motion.h1>
              <motion.p 
                className="text-lg text-gray-600 dark:text-gray-300 mb-8"
                variants={textRevealVariants}
              >
                <motion.span 
                  className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 font-black"
                  whileHover={{ scale: 1.1 }}
                >
                  SMEED
                </motion.span>
                {" brings together all the tools you need as a student: academics, health, finance, calendar, and more - all in one beautiful platform designed just for you."}
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
                variants={itemVariants}
              >
                <motion.button
                  type="button"
                  onClick={() => navigate('/plans')}
                  className="flex justify-center gap-2 items-center shadow-xl text-lg bg-gray-50 dark:bg-gray-800 backdrop-blur-md lg:font-semibold isolation-auto border-gray-50 dark:border-gray-700 before:absolute before:w-full before:transition-all before:duration-700 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-emerald-500 hover:text-gray-50 before:-z-10 before:aspect-square before:hover:scale-150 before:hover:duration-700 relative z-10 px-6 py-3 overflow-hidden border-2 rounded-full group"
                >
                  Explore
                  <svg
                    className="w-8 h-8 justify-end group-hover:rotate-90 group-hover:bg-gray-50 text-gray-50 ease-linear duration-300 rounded-full border border-gray-700 group-hover:border-none p-2 rotate-45"
                    viewBox="0 0 16 19"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z"
                      className="fill-gray-800 dark:fill-gray-200 group-hover:fill-gray-800"
                    />
                  </svg>
                </motion.button>
              </motion.div>
            </motion.div>
            <motion.div 
              className="lg:w-1/2 relative"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-20 blur-2xl rounded-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              <video autoPlay muted loop playsInline className="relative rounded-3xl shadow-xl w-full h-auto">
                <source src={HeroVideo} type="video/mp4" />
                <source src="hero-video.webm" type="video/webm" />
                Your browser does not support the video tag.
              </video>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <motion.section 
        className="py-20 bg-gray-50 dark:bg-gray-900"
        variants={containerVariants}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            variants={textRevealVariants}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need, All in One Place
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              <motion.span 
                className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 font-black"
                whileHover={{ scale: 1.1 }}
              >
                SMEED
              </motion.span>
              {" combines essential tools for student success into a single, powerful platform with a beautiful interface."}
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
          >
            {[
              {
                icon: <BookOpen className="h-8 w-8" />,
                title: "Academic Planner",
                description: "Track courses, assignments, and exams with smart reminders and GPA calculator.",
                color: "blue"
              },
              {
                icon: <Heart className="h-8 w-8" />,
                title: "Health Tracker",
                description: "Monitor physical wellbeing with BMI calculator, activity logs, and health goals.",
                color: "green"
              },
              {
                icon: <DollarSign className="h-8 w-8" />,
                title: "Finance Manager",
                description: "Handle expenses, set budgets, and track savings goals with multi-currency support.",
                color: "purple"
              },
              {
                icon: <Calendar className="h-8 w-8" />,
                title: "Unified Calendar",
                description: "Sync all your events in one place with location-aware reminders and sharing.",
                color: "amber"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={cardHoverVariants}
                whileHover="hover"
                custom={index}
              >
                <Card withHover withGlow>
                  <div className="flex flex-col items-center text-center">
                    <motion.div 
                      className={`w-16 h-16 rounded-full bg-${feature.color}-100 dark:bg-${feature.color}-900 flex items-center justify-center mb-4`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Similar animation patterns for other sections */}
          {/* ... Rest of the sections with similar animation patterns ... */}
        </div>
      </motion.section>

      <motion.section 
        className="py-20"
        variants={containerVariants}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            variants={textRevealVariants}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Users Are Saying?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Join thousands of students who have transformed their academic journey with{" "}
              <motion.span 
                className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 font-black"
                whileHover={{ scale: 1.1 }}
              >
                SMEED
              </motion.span>
              .
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
          >
            {[
              {
                image: YaserImage,
                name: "Dr. Yaser Dahb",
                role: "Vice President of AAST South Valley Branch",
                quote: "SMEED completely changed how I manage my Lectures with students..."
              },
              {
                image: RemonImage,
                name: "Remon Ayman",
                role: "Computer Science Student",
                quote: "The health tracker and unified calendar have been game-changers for me..."
              },
              {
                image: MinaImage,
                name: "Mina Samy",
                role: "Engineering Student",
                quote: "As a Engineering student with a busy schedule, the religious toolkit..."
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                variants={cardHoverVariants}
                whileHover="hover"
                custom={index}
              >
                <Card withHover>
                  <div className="flex flex-col h-full">
                    <motion.div 
                      className="flex items-center mb-4"
                      whileHover={{ x: 10 }}
                    >
                      <motion.div 
                        className="w-12 h-12 rounded-full overflow-hidden mr-4"
                        whileHover={{ scale: 1.1 }}
                      >
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name} 
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {testimonial.role}
                        </p>
                      </div>
                    </motion.div>
                    <p className="text-gray-600 dark:text-gray-400 flex-grow">
                      "{testimonial.quote}"
                    </p>
                    <motion.div 
                      className="flex mt-4"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                          </svg>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section 
        className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white"
        variants={containerVariants}
      >
        <motion.div 
          className="container mx-auto px-4 text-center"
          variants={textRevealVariants}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Student Life?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already experiencing the benefits of the ultimate 
            student management platform.
          </p>
          <motion.button
            onClick={() => navigate('/plans')}
            className="shine-button mx-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Get Started
          </motion.button>
          <motion.p 
            className="text-sm mt-4 opacity-80"
            animate={{ 
              opacity: [0.8, 1, 0.8],
              y: [0, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            No credit card required. Free plan available forever.
          </motion.p>
        </motion.div>
      </motion.section>
      <Footer />
    </motion.div>
  );
};

export default Home;