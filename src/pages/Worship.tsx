import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Download, Settings, CheckCircle, Circle, Calendar, Sun, Moon, Star } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { initParticleEffect } from '../utils/animations';
import { useAuth } from '../contexts/AuthContext';

interface PrayerTime {
  name: string;
  time: string;
  completed: boolean;
  icon: React.ReactNode;
}

interface ReligiousPreferences {
  religion: 'islam' | 'christianity' | 'other';
  sect?: string;
  calculationMethod?: string;
  location?: {
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
}

interface ChristianPrayerSchedule {
  baker: string;
  elthaletha: string;
  elsadesa: string;
  eltas3a: string;
  el3rob: string;
  elnom: string;
  midnight: string;
}

interface LocationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation?: {
    city: string;
  };
  onSave: (location: { city: string }) => void;
}

const UnauthorizedAccess = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <section className="relative flex-1 pt-32 pb-20 overflow-hidden">
        {/* Background shapes for visual interest */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="islamic-pattern absolute inset-0 opacity-5"></div>
          <div className="floating-shape top-20 left-[10%] w-20 h-20 bg-blue-500/10 dark:bg-blue-500/20 rounded-full"></div>
          <div className="floating-shape top-40 right-[15%] w-16 h-16 bg-purple-500/10 dark:bg-purple-500/20 rounded-full" style={{ animationDelay: '1s' }}></div>
          <div className="floating-shape bottom-60 left-[20%] w-24 h-24 bg-green-500/10 dark:bg-green-500/20 rounded-full" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8 animate-fade-in">
              <div className="inline-block p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                <span className="text-4xl">🕌</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to Worship Tracker
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                Track your daily prayers, set reminders, and stay connected with your spiritual journey
              </p>
            </div>

            <Card withHover withGlow className="mb-8 animate-fade-in">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Please Sign In
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  To access the Worship Tracker and start monitoring your prayers, please sign in to your account.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    variant="primary"
                    size="lg"
                    onClick={() => window.location.href = '/login'}
                    className="flex-1 sm:flex-initial gradient-flow text-white hover:scale-105 transform transition-all duration-300"
                    style={{ 
                      background: 'linear-gradient(45deg, #7c3aed, #2563eb, #7c3aed)',
                      backgroundSize: '200% 200%',
                      animation: 'gradientFlow 5s linear infinite'
                    }}
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="primary"
                    size="lg"
                    onClick={() => window.location.href = '/register'}
                    className="flex-1 sm:flex-initial gradient-flow text-white hover:scale-105 transform transition-all duration-300"
                    style={{ 
                      background: 'linear-gradient(45deg, #2563eb, #7c3aed, #2563eb)',
                      backgroundSize: '200% 200%',
                      animation: 'gradientFlow 5s linear infinite'
                    }}
                  >
                    Create Account
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card 
                withHover 
                className="text-center p-6 transform transition-all duration-500 hover:scale-105 hover:rotate-1 animate-fade-in relative group"
                style={{ animationDelay: '0.2s' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 dark:group-hover:opacity-30 rounded-lg transition-opacity duration-300"></div>
                <div className="absolute inset-0 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative overflow-hidden rounded-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 transform -skew-y-6"></div>
                  <div className="relative z-10 p-6">
                    <div className="text-3xl mb-4">📅</div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Prayer Tracking</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Track your daily prayers and maintain consistency</p>
                  </div>
                </div>
              </Card>
              <Card 
                withHover 
                className="text-center p-6 transform transition-all duration-500 hover:scale-105 hover:rotate-1 animate-fade-in relative group"
                style={{ animationDelay: '0.4s' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 opacity-0 group-hover:opacity-20 dark:group-hover:opacity-30 rounded-lg transition-opacity duration-300"></div>
                <div className="absolute inset-0 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.5)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative overflow-hidden rounded-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 dark:from-green-500/20 dark:to-blue-500/20 transform -skew-y-6"></div>
                  <div className="relative z-10 p-6">
                    <div className="text-3xl mb-4">📊</div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Progress Reports</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monitor your spiritual journey with detailed insights</p>
                  </div>
                </div>
              </Card>
              <Card 
                withHover 
                className="text-center p-6 transform transition-all duration-500 hover:scale-105 hover:rotate-1 animate-fade-in relative group"
                style={{ animationDelay: '0.6s' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 dark:group-hover:opacity-30 rounded-lg transition-opacity duration-300"></div>
                <div className="absolute inset-0 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.5)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative overflow-hidden rounded-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 transform -skew-y-6"></div>
                  <div className="relative z-10 p-6">
                    <div className="text-3xl mb-4">⏰</div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Prayers Timees</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get accurate prayer times based on your location</p>
                  </div>
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

const LocationSettingsModal: React.FC<LocationSettingsModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSave,
}) => {
  const [city, setCity] = useState(currentLocation?.city || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ city });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-md overflow-hidden">
        {/* Background shapes for visual interest */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="islamic-pattern absolute inset-0 opacity-5"></div>
          <div className="floating-shape top-20 left-[10%] w-16 h-16 bg-blue-500/10 dark:bg-blue-500/20 rounded-full"></div>
          <div className="floating-shape bottom-20 right-[10%] w-20 h-20 bg-purple-500/10 dark:bg-purple-500/20 rounded-full" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Content */}
        <div className="relative p-6 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="inline-block p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
              <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Update Location
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your city to get accurate prayer times
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card withHover withGlow className="relative overflow-hidden">
              <div className="relative z-10">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City Name
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your city"
                  required
                />
              </div>
            </Card>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={onClose}
                className="flex-1 sm:flex-initial hover:scale-105 transform transition-all duration-300 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                className="flex-1 sm:flex-initial gradient-flow text-white hover:scale-105 transform transition-all duration-300"
                style={{ 
                  background: 'linear-gradient(45deg, #7c3aed, #2563eb, #7c3aed)',
                  backgroundSize: '200% 200%',
                  animation: 'gradientFlow 5s linear infinite'
                }}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Worship: React.FC = () => {
  const { currentUser } = useAuth();
  const [hasPreferences, setHasPreferences] = useState(false);
  const [preferences, setPreferences] = useState<ReligiousPreferences | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [customChristianTimes, setCustomChristianTimes] = useState<ChristianPrayerSchedule>({
    baker: '06:00',
    elthaletha: '09:00',
    elsadesa: '12:00',
    eltas3a: '15:00',
    el3rob: '17:00',
    elnom: '19:00',
    midnight: '00:30'
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    // Initialize particle effect
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
    checkUserPreferences();
  }, [currentUser]);

  useEffect(() => {
    if (hasPreferences && preferences) {
      loadPrayerTimes();
    }
  }, [hasPreferences, preferences, selectedDate]);

  // Add real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const checkUserPreferences = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      // Check if user has religious preferences in localStorage for demo
      const storedPrefs = localStorage.getItem(`worship_prefs_${currentUser.id}`);
      if (storedPrefs) {
        const prefs = JSON.parse(storedPrefs);
        setPreferences(prefs);
        setHasPreferences(true);
      }
    } catch (error) {
      console.error('Error checking preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveReligiousPreferences = async (prefs: ReligiousPreferences) => {
    try {
      // Save to localStorage for demo (in production, this would go to your database)
      localStorage.setItem(`worship_prefs_${currentUser?.id}`, JSON.stringify(prefs));
      setPreferences(prefs);
      setHasPreferences(true);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const loadPrayerTimes = async () => {
    if (!preferences) return;

    setLoading(true);
    try {
      if (preferences.religion === 'islam') {
        await loadIslamicPrayerTimes();
      } else if (preferences.religion === 'christianity') {
        loadChristianPrayerTimes();
      } else if (preferences.religion === 'other') {
        // Set empty prayer times for "other" religion
        setPrayerTimes([]);
      }
    } catch (error) {
      console.error('Error loading prayer times:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadIslamicPrayerTimes = async () => {
    try {
      const date = selectedDate.toISOString().split('T')[0];
      const location = preferences?.location;
      
      // Use Aladhan API for Islamic prayer times
      const url = location 
        ? `http://api.aladhan.com/v1/timings/${date}?latitude=${location.lat}&longitude=${location.lng}&method=2`
        : `http://api.aladhan.com/v1/timingsByCity/${date}?city=Cairo&country=Egypt&method=2`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === 200) {
        const timings = data.data.timings;
        const islamicPrayers: PrayerTime[] = [
          { name: 'Fajr', time: timings.Fajr, completed: false, icon: <Moon className="h-5 w-5" /> },
          { name: 'Dhuhr', time: timings.Dhuhr, completed: false, icon: <Sun className="h-5 w-5" /> },
          { name: 'Asr', time: timings.Asr, completed: false, icon: <Sun className="h-5 w-5" /> },
          { name: 'Maghrib', time: timings.Maghrib, completed: false, icon: <Moon className="h-5 w-5" /> },
          { name: 'Isha', time: timings.Isha, completed: false, icon: <Star className="h-5 w-5" /> }
        ];
        
        // Load completion status from localStorage
        const completedPrayers = JSON.parse(localStorage.getItem(`prayers_${currentUser?.id}_${date}`) || '{}');
        islamicPrayers.forEach(prayer => {
          prayer.completed = completedPrayers[prayer.name] || false;
        });
        
        setPrayerTimes(islamicPrayers);
      }
    } catch (error) {
      console.error('Error fetching Islamic prayer times:', error);
      // Fallback to default times
      setPrayerTimes([
        { name: 'Fajr', time: '05:30', completed: false, icon: <Moon className="h-5 w-5" /> },
        { name: 'Dhuhr', time: '12:00', completed: false, icon: <Sun className="h-5 w-5" /> },
        { name: 'Asr', time: '15:30', completed: false, icon: <Sun className="h-5 w-5" /> },
        { name: 'Maghrib', time: '18:00', completed: false, icon: <Moon className="h-5 w-5" /> },
        { name: 'Isha', time: '19:30', completed: false, icon: <Star className="h-5 w-5" /> }
      ]);
    }
  };

  const loadChristianPrayerTimes = () => {
    const date = selectedDate.toISOString().split('T')[0];
    const dayOfWeek = selectedDate.getDay(); // 0 is Sunday, 5 is Friday
    
    const christianPrayers: PrayerTime[] = [
      { name: 'Baker Prayer', time: customChristianTimes.baker, completed: false, icon: <Sun className="h-5 w-5" /> },
      { name: 'Elthaletha Prayer', time: customChristianTimes.elthaletha, completed: false, icon: <Sun className="h-5 w-5" /> },
      { name: 'Elsadesa Prayer', time: customChristianTimes.elsadesa, completed: false, icon: <Sun className="h-5 w-5" /> },
      { name: 'Eltas3a Prayer', time: customChristianTimes.eltas3a, completed: false, icon: <Sun className="h-5 w-5" /> },
      { name: 'El3rob Prayer', time: customChristianTimes.el3rob, completed: false, icon: <Moon className="h-5 w-5" /> },
      { name: 'Elnom Prayer', time: customChristianTimes.elnom, completed: false, icon: <Moon className="h-5 w-5" /> },
      { name: 'Midnight Prayer', time: customChristianTimes.midnight, completed: false, icon: <Star className="h-5 w-5" /> }
    ];
    
    // Add Holy Liturgy prayer on Fridays (5) and Sundays (0)
    if (dayOfWeek === 0 || dayOfWeek === 5) {
      christianPrayers.unshift({
        name: 'Holy Liturgy',
        time: '05:30',
        completed: false,
        icon: <Sun className="h-5 w-5" />
      });
    }
    
    // Load completion status from localStorage
    const completedPrayers = JSON.parse(localStorage.getItem(`prayers_${currentUser?.id}_${date}`) || '{}');
    christianPrayers.forEach(prayer => {
      prayer.completed = completedPrayers[prayer.name] || false;
    });
    
    setPrayerTimes(christianPrayers);
  };

  const togglePrayerCompletion = (prayerName: string) => {
    const date = selectedDate.toISOString().split('T')[0];
    const updatedPrayers = prayerTimes.map(prayer => 
      prayer.name === prayerName ? { ...prayer, completed: !prayer.completed } : prayer
    );
    
    setPrayerTimes(updatedPrayers);
    
    // Save to localStorage
    const completedPrayers = JSON.parse(localStorage.getItem(`prayers_${currentUser?.id}_${date}`) || '{}');
    completedPrayers[prayerName] = !completedPrayers[prayerName];
    localStorage.setItem(`prayers_${currentUser?.id}_${date}`, JSON.stringify(completedPrayers));
  };

  const generatePrayerReport = (reportType: 'daily' | 'weekly' | 'monthly' | 'yearly', format: 'pdf' | 'excel') => {
    const currentDate = new Date();
    const startDate = new Date();
    const endDate = new Date();

    // Calculate date ranges based on report type
    switch (reportType) {
      case 'daily':
        // Keep current date
        break;
      case 'weekly':
        startDate.setDate(currentDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(currentDate.getMonth() - 1);
        break;
      case 'yearly':
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
    }

    // Get all prayer records within the date range
    const prayerRecords: { [date: string]: { completed: number; total: number } } = {};
    let totalCompleted = 0;
    let totalPrayers = 0;

    // Generate dates array between start and end date
    const dates: Date[] = [];
    let currentDateIter = new Date(startDate);
    while (currentDateIter <= endDate) {
      dates.push(new Date(currentDateIter));
      currentDateIter.setDate(currentDateIter.getDate() + 1);
    }

    // Collect prayer data for each date
    dates.forEach(date => {
      const dateStr = date.toISOString().split('T')[0];
      const storedData = JSON.parse(localStorage.getItem(`prayers_${currentUser?.id}_${dateStr}`) || '{}');
      const completedCount = Object.values(storedData).filter(val => val === true).length;
      const totalCount = prayerTimes.length;

      prayerRecords[dateStr] = {
        completed: completedCount,
        total: totalCount
      };

      totalCompleted += completedCount;
      totalPrayers += totalCount;
    });

    const completionRate = totalPrayers > 0 ? ((totalCompleted / totalPrayers) * 100).toFixed(1) : '0';

    if (format === 'excel') {
      // Generate Excel file
      generateExcelReport(reportType, {
        startDate,
        endDate,
        prayerRecords,
        totalCompleted,
        totalPrayers,
        completionRate
      });
      return;
    }

    // Create a new window with the report content for PDF generation
    const reportWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!reportWindow) {
      alert('Please allow pop-ups to generate the PDF report');
      return;
    }

    // Format date range for display
    const formatDateRange = () => {
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      
      if (reportType === 'daily') {
        return currentDate.toLocaleDateString('en-US', options);
      }
      
      return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
    };

    // Create comprehensive HTML report optimized for PDF
    const reportHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Prayer Report</title>
    <style>
        @page {
            size: A4;
            margin: 20mm;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            font-size: 12pt;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            border-bottom: 3px solid #2563eb;
        }
        
        .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 28pt;
            margin-bottom: 10px;
        }
        
        .header .date {
            color: #6b7280;
            font-size: 14pt;
            margin-bottom: 10px;
        }
        
        .religion-badge {
            background: #2563eb;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 11pt;
            display: inline-block;
        }
        
        .location {
            margin-top: 10px;
            color: #6b7280;
            font-size: 11pt;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin: 30px 0;
        }
        
        .stat-card {
            text-align: center;
            padding: 20px;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            background: #f9fafb;
        }
        
        .stat-number {
            font-size: 24pt;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
        }
        
        .stat-label {
            color: #6b7280;
            font-size: 10pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .section {
            margin: 30px 0;
            page-break-inside: avoid;
        }
        
        .section-title {
            color: #1f2937;
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }
        
        .completion-bar-container {
            margin: 20px 0;
        }
        
        .completion-bar {
            width: 100%;
            height: 15px;
            background: #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
            position: relative;
        }
        
        .completion-fill {
            height: 100%;
            background: linear-gradient(90deg, #22c55e, #16a34a);
            width: ${completionRate}%;
            position: relative;
        }
        
        .completion-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #333;
            font-weight: bold;
            font-size: 10pt;
        }
        
        .prayer-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 8px;
            border-left: 4px solid transparent;
            page-break-inside: avoid;
        }
        
        .prayer-item.completed {
            background: #f0fdf4;
            border-left-color: #22c55e;
        }
        
        .prayer-item.missed {
            background: #fef2f2;
            border-left-color: #ef4444;
        }
        
        .prayer-details {
            flex-grow: 1;
        }
        
        .prayer-name {
            font-weight: bold;
            font-size: 13pt;
            margin-bottom: 3px;
        }
        
        .prayer-time {
            color: #6b7280;
            font-size: 11pt;
        }
        
        .prayer-status {
            font-weight: bold;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 10pt;
            white-space: nowrap;
        }
        
        .status-completed {
            background: #22c55e;
            color: white;
        }
        
        .status-missed {
            background: #ef4444;
            color: white;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            border-top: 2px solid #e5e7eb;
            color: #6b7280;
            font-size: 10pt;
        }
        
        .footer .generated-time {
            margin-bottom: 10px;
            font-style: italic;
        }
        
        .footer .blessing {
            font-size: 12pt;
            color: #2563eb;
            margin: 15px 0;
        }
        
        .footer .app-name {
            font-weight: bold;
            color: #1f2937;
        }
        
        @media print {
            body { 
                print-color-adjust: exact; 
                -webkit-print-color-adjust: exact;
            }
            .no-print { 
                display: none !important; 
            }
        }
        
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2563eb;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12pt;
            font-weight: bold;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
        }
        
        .print-button:hover {
            background: #1d4ed8;
        }
        
        .timeline {
            margin: 30px 0;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
        }
        
        .timeline-item {
            display: flex;
            justify-content: space-between;
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .timeline-date {
            font-weight: bold;
            color: #2563eb;
        }
        
        .timeline-stats {
            display: flex;
            gap: 20px;
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onClick="window.print()">📄 Save as PDF</button>
    
    <div class="header">
        <h1>🕌 ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Prayer Report</h1>
        <div class="date">${formatDateRange()}</div>
        <div class="religion-badge">${preferences?.religion ? preferences.religion.charAt(0).toUpperCase() + preferences.religion.slice(1) : 'Unknown'}</div>
        ${preferences?.location ? `<div class="location">📍 ${preferences.location.city}, ${preferences.location.country}</div>` : ''}
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-number">${totalCompleted}</div>
            <div class="stat-label">Total Prayers Completed</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${totalPrayers - totalCompleted}</div>
            <div class="stat-label">Total Prayers Missed</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${totalPrayers}</div>
            <div class="stat-label">Total Required Prayers</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${completionRate}%</div>
            <div class="stat-label">Overall Completion Rate</div>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">📋 Prayer Completion Overview</h2>
        <div class="completion-bar-container">
            <div class="completion-bar">
                <div class="completion-fill" style="width: ${completionRate}%"></div>
                <div class="completion-text">${completionRate}% Complete</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">📅 Detailed Timeline</h2>
        <div class="timeline">
            ${Object.entries(prayerRecords).map(([date, stats]) => `
                <div class="timeline-item">
                    <div class="timeline-date">${new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</div>
                    <div class="timeline-stats">
                        <span>Completed: ${stats.completed}/${stats.total}</span>
                        <span>Rate: ${stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0}%</span>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">📈 Summary</h2>
        <div style="padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #2563eb;">
            <p style="margin-bottom: 10px;"><strong>Overall Performance:</strong> You completed ${totalCompleted} out of ${totalPrayers} prayers (${completionRate}%)</p>
            ${totalCompleted === totalPrayers ? 
                '<p style="color: #22c55e; font-weight: bold;">🎉 Excellent! You completed all your prayers during this period.</p>' : 
                totalCompleted >= totalPrayers * 0.8 ? 
                '<p style="color: #f59e0b; font-weight: bold;">👍 Good effort! Keep striving for consistency.</p>' :
                '<p style="color: #ef4444; font-weight: bold;">💪 There\'s room for improvement. Every prayer counts!</p>'
            }
            <p style="margin-top: 10px; font-style: italic; color: #6b7280;">Remember: Consistency in prayer brings peace and spiritual growth.</p>
        </div>
    </div>

    <div class="footer">
        <div class="generated-time">Generated on ${new Date().toLocaleString()}</div>
        <div class="blessing">🌙 May your prayers bring you peace, guidance, and spiritual fulfillment 🌙</div>
        <div class="app-name">SMEED - Student Management Everything Easily Digitally</div>
        <div style="margin-top: 10px; font-size: 9pt; color: #9ca3af;">
            This report was automatically generated by your Worship Tracker
        </div>
    </div>
    
    <script>
        // Auto-print dialog for PDF generation
        window.onload = function() {
            // Small delay to ensure content is fully loaded
            setTimeout(() => {
                document.querySelector('.print-button').style.display = 'block';
            }, 500);
        };
        
        // Handle print completion
        window.onafterprint = function() {
            setTimeout(() => {
                window.close();
            }, 1000);
        };
    </script>
</body>
</html>`;

    // Write the content to the new window
    reportWindow.document.write(reportHTML);
    reportWindow.document.close();

    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in-down';
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <span>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report window opened! Click "Save as PDF" to download.</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  };

  const generateExcelReport = (
    reportType: string,
    data: {
      startDate: Date;
      endDate: Date;
      prayerRecords: { [date: string]: { completed: number; total: number } };
      totalCompleted: number;
      totalPrayers: number;
      completionRate: string;
    }
  ) => {
    // Create workbook data
    const workbookData = [
      // Header row
      ['Date', 'Completed Prayers', 'Total Prayers', 'Completion Rate'],
      // Data rows
      ...Object.entries(data.prayerRecords).map(([date, stats]) => [
        new Date(date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        stats.completed,
        stats.total,
        `${((stats.completed / stats.total) * 100).toFixed(1)}%`
      ]),
      // Empty row
      [],
      // Summary rows
      ['Summary'],
      ['Total Completed Prayers', data.totalCompleted],
      ['Total Required Prayers', data.totalPrayers],
      ['Overall Completion Rate', `${data.completionRate}%`]
    ];

    // Convert to CSV
    const csvContent = workbookData
      .map(row => row.join(','))
      .join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `prayer_report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in-down';
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <span>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report downloaded as Excel!</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  };

  const renderFloatingShapes = () => {
    return (
      <>
        <div className="floating-shape top-20 left-[10%] w-20 h-20 bg-purple-500/10 dark:bg-purple-500/20 rounded-full"></div>
        <div className="floating-shape top-40 right-[15%] w-16 h-16 bg-blue-500/10 dark:bg-blue-500/20 rounded-full" style={{ animationDelay: '1s' }}></div>
        <div className="floating-shape bottom-60 left-[20%] w-24 h-24 bg-green-500/10 dark:bg-green-500/20 rounded-full" style={{ animationDelay: '2s' }}></div>
      </>
    );
  };

  const handleResetPreferences = () => {
    // Clear preferences from localStorage
    if (currentUser?.id) {
      localStorage.removeItem(`worship_prefs_${currentUser.id}`);
    }
    // Reset states
    setPreferences(null);
    setHasPreferences(false);
    setPrayerTimes([]);
  };

  const handleLocationUpdate = async (newLocation: { city: string }) => {
    try {
      // In a real app, you would use a geocoding service to get coordinates
      // For demo purposes, using default coordinates
      const updatedPreferences: ReligiousPreferences = {
        ...preferences!,
        location: {
          city: newLocation.city,
          country: 'Default', // Using a default country
          lat: 30.0444,
          lng: 31.2357,
        },
      };

      // Save to localStorage
      localStorage.setItem(`worship_prefs_${currentUser?.id}`, JSON.stringify(updatedPreferences));
      setPreferences(updatedPreferences);

      // Reload prayer times with new location
      await loadPrayerTimes();
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  if (!currentUser) {
    return <UnauthorizedAccess />;
  }

  if (!hasPreferences) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <section className="relative pt-32 pb-20 overflow-hidden flex-1">
          {renderFloatingShapes()}
          
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card withHover className="animate-fade-in">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Welcome to Your Worship Tracker
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Let's set up your religious preferences to provide you with personalized prayer times and tracking.
                  </p>
                </div>

                <ReligiousPreferenceSetup onSave={saveReligiousPreferences} />
              </Card>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <section className="relative pt-32 pb-20 overflow-hidden flex-1">
        {renderFloatingShapes()}
        
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12 animate-slide-in-up">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Worship Tracker
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Stay connected with your spiritual journey
              </p>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card withHover className="animate-fade-in">
                <div className="flex flex-col p-4 h-full">
                  <div className="flex items-center space-x-3 mb-4">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Select Date
                      </label>
                      <input
                        type="date"
                        value={selectedDate.toISOString().split('T')[0]}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Current Time:</span>
                      <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {currentTime.toLocaleTimeString([], { 
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true 
                      })}
                    </div>
                    <div className="mt-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Next Prayer:</div>
                      <div className="text-md font-medium text-blue-600 dark:text-blue-400">
                        {prayerTimes.find(p => !p.completed)?.name || 'All prayers completed'}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card withHover className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="flex flex-col p-4 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Location</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {preferences?.location?.city || 'Not Set'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setIsLocationModalOpen(true)}
                      className="hover:scale-105 transform transition-all duration-300 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                    >
                      <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </Button>
                  </div>
                  <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Prayer Direction:</div>
                        <div className="flex items-center space-x-2">
                          <Sun className="h-4 w-4 text-yellow-500" />
                          <span className="text-md font-medium text-gray-900 dark:text-white">
                            {preferences?.religion === 'christianity' 
                              ? '→ East (Facing Jerusalem)'
                              : preferences?.religion === 'islam'
                                ? `Qibla ${preferences?.location ? '↑ North' : 'Direction not available'}`
                                : 'Direction not applicable'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Local Time Zone:</div>
                        <div className="text-md font-medium text-gray-900 dark:text-white">
                          {Intl.DateTimeFormat().resolvedOptions().timeZone}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Prayer Method:</div>
                        <div className="text-md font-medium text-gray-900 dark:text-white">
                          {preferences?.calculationMethod === '2' ? 'Egyptian General Authority' : 'Standard Method'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card withHover className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Download className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Report</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Download activity log
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {/* Daily Reports */}
                    <div className="flex flex-col space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Report</h4>
                      <div className="flex space-x-2">
                        <Button 
                          variant="rainbow" 
                          size="sm" 
                          onClick={() => generatePrayerReport('daily', 'pdf')}
                          className="flex-1 gradient-flow text-white hover:scale-105 transform transition-all duration-300"
                          style={{ 
                            background: 'linear-gradient(45deg, #7c3aed, #2563eb, #7c3aed)',
                            backgroundSize: '200% 200%',
                            animation: 'gradientFlow 5s linear infinite'
                          }}
                        >
                          PDF
                        </Button>
                        <Button 
                          variant="rainbow" 
                          size="sm" 
                          onClick={() => generatePrayerReport('daily', 'excel')}
                          className="flex-1 gradient-flow text-white hover:scale-105 transform transition-all duration-300"
                          style={{ 
                            background: 'linear-gradient(45deg, #059669, #10b981, #059669)',
                            backgroundSize: '200% 200%',
                            animation: 'gradientFlow 5s linear infinite'
                          }}
                        >
                          Excel
                        </Button>
                      </div>
                    </div>

                    {/* Weekly Reports */}
                    <div className="flex flex-col space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Weekly Report</h4>
                      <div className="flex space-x-2">
                        <Button 
                          variant="rainbow" 
                          size="sm" 
                          onClick={() => generatePrayerReport('weekly', 'pdf')}
                          className="flex-1 gradient-flow text-white hover:scale-105 transform transition-all duration-300"
                          style={{ 
                            background: 'linear-gradient(45deg, #7c3aed, #2563eb, #7c3aed)',
                            backgroundSize: '200% 200%',
                            animation: 'gradientFlow 5s linear infinite'
                          }}
                        >
                          PDF
                        </Button>
                        <Button 
                          variant="rainbow" 
                          size="sm" 
                          onClick={() => generatePrayerReport('weekly', 'excel')}
                          className="flex-1 gradient-flow text-white hover:scale-105 transform transition-all duration-300"
                          style={{ 
                            background: 'linear-gradient(45deg, #059669, #10b981, #059669)',
                            backgroundSize: '200% 200%',
                            animation: 'gradientFlow 5s linear infinite'
                          }}
                        >
                          Excel
                        </Button>
                      </div>
                    </div>

                    {/* Monthly Reports */}
                    <div className="flex flex-col space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Report</h4>
                      <div className="flex space-x-2">
                        <Button 
                          variant="rainbow" 
                          size="sm" 
                          onClick={() => generatePrayerReport('monthly', 'pdf')}
                          className="flex-1 gradient-flow text-white hover:scale-105 transform transition-all duration-300"
                          style={{ 
                            background: 'linear-gradient(45deg, #7c3aed, #2563eb, #7c3aed)',
                            backgroundSize: '200% 200%',
                            animation: 'gradientFlow 5s linear infinite'
                          }}
                        >
                          PDF
                        </Button>
                        <Button 
                          variant="rainbow" 
                          size="sm" 
                          onClick={() => generatePrayerReport('monthly', 'excel')}
                          className="flex-1 gradient-flow text-white hover:scale-105 transform transition-all duration-300"
                          style={{ 
                            background: 'linear-gradient(45deg, #059669, #10b981, #059669)',
                            backgroundSize: '200% 200%',
                            animation: 'gradientFlow 5s linear infinite'
                          }}
                        >
                          Excel
                        </Button>
                      </div>
                    </div>

                    {/* Yearly Reports */}
                    <div className="flex flex-col space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Yearly Report</h4>
                      <div className="flex space-x-2">
                        <Button 
                          variant="rainbow" 
                          size="sm" 
                          onClick={() => generatePrayerReport('yearly', 'pdf')}
                          className="flex-1 gradient-flow text-white hover:scale-105 transform transition-all duration-300"
                          style={{ 
                            background: 'linear-gradient(45deg, #7c3aed, #2563eb, #7c3aed)',
                            backgroundSize: '200% 200%',
                            animation: 'gradientFlow 5s linear infinite'
                          }}
                        >
                          PDF
                        </Button>
                        <Button 
                          variant="rainbow" 
                          size="sm" 
                          onClick={() => generatePrayerReport('yearly', 'excel')}
                          className="flex-1 gradient-flow text-white hover:scale-105 transform transition-all duration-300"
                          style={{ 
                            background: 'linear-gradient(45deg, #059669, #10b981, #059669)',
                            backgroundSize: '200% 200%',
                            animation: 'gradientFlow 5s linear infinite'
                          }}
                        >
                          Excel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Prayer Times or Message */}
            {preferences?.religion === 'other' ? (
              <Card withHover className="text-center p-12 mb-8 animate-fade-in">
                <div className="max-w-2xl mx-auto">
                  <div className="text-6xl mb-6">🤍</div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    No Specific Prayer Times
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    You don't have any prayers related to godless. Feel free to use this space for your personal spiritual practices and reflections.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={handleResetPreferences}
                    className="inline-flex items-center space-x-2 hover:scale-105 transform transition-all duration-300 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Update Preferences</span>
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {prayerTimes.map((prayer, index) => (
                  <Card 
                    key={prayer.name}
                    withHover 
                    withGlow
                    className={`animate-fade-in cursor-pointer ${prayer.completed ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => togglePrayerCompletion(prayer.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          prayer.completed 
                            ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>
                          {prayer.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {prayer.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {prayer.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {prayer.completed ? (
                          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <Circle className="h-6 w-6 text-gray-400 dark:text-gray-600" />
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Statistics */}
            <Card withHover className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {prayerTimes.filter(p => p.completed).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Completed Today</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                    {prayerTimes.length - prayerTimes.filter(p => p.completed).length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {prayerTimes.length > 0 ? Math.round((prayerTimes.filter(p => p.completed).length / prayerTimes.length) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {prayerTimes.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Daily Prayers</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
      
      <Footer />

      <LocationSettingsModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={preferences?.location}
        onSave={handleLocationUpdate}
      />
    </div>
  );
};

// Religious Preference Setup Component
const ReligiousPreferenceSetup: React.FC<{ onSave: (prefs: ReligiousPreferences) => void }> = ({ onSave }) => {
  const [religion, setReligion] = useState<'islam' | 'christianity' | 'other'>('islam');
  const [sect, setSect] = useState('');
  const [calculationMethod, setCalculationMethod] = useState('2'); // Egyptian General Authority of Survey
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const preferences: ReligiousPreferences = {
        religion,
        sect: sect || undefined,
        calculationMethod: calculationMethod || undefined,
      };

      if (city) {
        // In a real app, you'd geocode the city
        preferences.location = {
          city,
          country: 'Egypt',
          lat: 30.0444,
          lng: 31.2357
        };
      }

      onSave(preferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Select Your Religion
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              religion === 'islam'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            onClick={() => setReligion('islam')}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">☪</div>
              <div className="font-medium text-gray-900 dark:text-white">Islam</div>
            </div>
          </div>
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              religion === 'christianity'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            onClick={() => setReligion('christianity')}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">✝</div>
              <div className="font-medium text-gray-900 dark:text-white">Christianity</div>
            </div>
          </div>
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              religion === 'other'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            onClick={() => setReligion('other')}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🕊</div>
              <div className="font-medium text-gray-900 dark:text-white">Other</div>
            </div>
          </div>
        </div>
      </div>

      {religion === 'islam' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sect (Optional)
            </label>
            <input
              type="text"
              value={sect}
              onChange={(e) => setSect(e.target.value)}
              placeholder="e.g., Sunni, Shia"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Calculation Method
            </label>
            <select
              value={calculationMethod}
              onChange={(e) => setCalculationMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="2">Egyptian General Authority of Survey</option>
              <option value="1">University of Islamic Sciences, Karachi</option>
              <option value="3">University of Islamic Sciences, Karachi (Hanafi)</option>
              <option value="4">Umm Al-Qura University, Makkah</option>
              <option value="5">Islamic Society of North America</option>
            </select>
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          City (Optional)
        </label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter your city for accurate prayer times"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <Button
        type="submit"
        variant="rainbow"
        size="lg"
        className="w-full gradient-flow text-white hover:scale-105 transform transition-all duration-300"
        isLoading={loading}
        withShimmer
        style={{ 
          background: 'linear-gradient(45deg, #7c3aed, #2563eb, #7c3aed)',
          backgroundSize: '200% 200%',
          animation: 'gradientFlow 5s linear infinite'
        }}
      >
        Save Preferences
      </Button>
    </form>
  );
};

export default Worship;