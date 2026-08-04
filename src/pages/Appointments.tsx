import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Plus, 
  Filter, 
  Download, 
  CheckCircle, 
  Clock, 
  MapPin, 
  List,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Search,
  AlertCircle,
  TrendingUp,
  Target,
  Archive
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import AppointmentStatsComponent from '../components/appointments/AppointmentStats';
import AppointmentCalendar from '../components/appointments/AppointmentCalendar';
import { Appointment, AppointmentType, AppointmentStatus, AppointmentFormData, AppointmentStats } from '../types';
import { 
  isOverdue, 
  isToday, 
  formatDate, 
  getRelativeTime, 
  generateAppointmentsPDF,
  getTaskPriority,
  sortAppointmentsByPriority,
  getAppointmentTypeEmoji
} from '../utils/appointments';
import { generateProfessionalPDF } from '../utils/pdfGenerator';
import { useAuth } from '../contexts/AuthContext';
import { initParticleEffect } from '../utils/animations';

const Appointments: React.FC = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeView, setActiveView] = useState<'calendar' | 'kanban' | 'list' | 'stats'>('kanban');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterType, setFilterType] = useState<AppointmentType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<AppointmentFormData>({
    title: '',
    description: '',
    appointment_date: new Date(),
    location: '',
    type: 'study',
    reminder_enabled: true
  });

  // Simple animation variants
  const pageTransition = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  };

  const cardAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  };

  const modalAnimation = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { type: "spring", duration: 0.3 }
  };

  // Add particle effect for unauthorized access
  useEffect(() => {
    if (!currentUser) {
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
    }
  }, [currentUser]);

  // Check authentication and load data
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    // Load appointments data for authenticated user
    loadUserAppointments();
  }, [currentUser]);

  const loadUserAppointments = () => {
    setLoading(true);
    try {
      // In production, this would fetch from your API using currentUser.id
      // For now, we'll load from localStorage if available, or use mock data
      const savedAppointments = localStorage.getItem(`appointments_${currentUser?.id}`);
      
      if (savedAppointments) {
        const parsedAppointments = JSON.parse(savedAppointments).map((app: any) => ({
          ...app,
          appointment_date: new Date(app.appointment_date),
          created_at: new Date(app.created_at),
          updated_at: new Date(app.updated_at)
        }));
        setAppointments(parsedAppointments);
      } else {
        // Mock data for demonstration - in production, this would come from your database
        const mockAppointments: Appointment[] = [
          {
            appointment_id: 1,
            student_id: parseInt(currentUser?.id || '1'),
            title: 'Math Study Session',
            description: 'Prepare for calculus exam',
            appointment_date: new Date('2024-01-15T10:00:00'),
            location: 'Library',
            type: 'study',
            status: 'todo',
            reminder_enabled: true,
            completed: false,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            appointment_id: 2,
            student_id: parseInt(currentUser?.id || '1'),
            title: 'Gym Workout',
            description: 'Leg day training',
            appointment_date: new Date('2024-01-14T18:00:00'),
            location: 'Campus Gym',
            type: 'gym',
            status: 'done',
            reminder_enabled: true,
            completed: true,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            appointment_id: 3,
            student_id: parseInt(currentUser?.id || '1'),
            title: 'Project Meeting',
            description: 'Discuss final project requirements',
            appointment_date: new Date('2024-01-16T14:00:00'),
            location: 'Room 302',
            type: 'meeting',
            status: 'doing',
            reminder_enabled: true,
            completed: false,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            appointment_id: 4,
            student_id: parseInt(currentUser?.id || '1'),
            title: 'Gaming Session',
            description: 'Play FIFA with friends',
            appointment_date: new Date('2024-01-17T20:00:00'),
            location: 'Student Lounge',
            type: 'game',
            status: 'todo',
            reminder_enabled: true,
            completed: false,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            appointment_id: 5,
            student_id: parseInt(currentUser?.id || '1'),
            title: 'Coffee Hangout',
            description: 'Catch up with college friends',
            appointment_date: new Date('2024-01-18T16:00:00'),
            location: 'Campus Cafe',
            type: 'vibe with friends',
            status: 'todo',
            reminder_enabled: true,
            completed: false,
            created_at: new Date(),
            updated_at: new Date()
          }
        ];
        setAppointments(mockAppointments);
        // Save mock data to localStorage for persistence
        localStorage.setItem(`appointments_${currentUser?.id}`, JSON.stringify(mockAppointments));
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save appointments to localStorage whenever they change
  useEffect(() => {
    if (currentUser && appointments.length > 0) {
      localStorage.setItem(`appointments_${currentUser.id}`, JSON.stringify(appointments));
    }
  }, [appointments, currentUser]);

  // Calculate statistics
  const stats: AppointmentStats = useMemo(() => {
    const now = new Date();
    const total = appointments.length;
    const completed = appointments.filter(app => app.completed).length;
    const pending = appointments.filter(app => !app.completed).length;
    const overdue = appointments.filter(app => 
      new Date(app.appointment_date) < now && !app.completed
    ).length;

    const byType = appointments.reduce((acc, app) => {
      acc[app.type] = (acc[app.type] || 0) + 1;
      return acc;
    }, {} as Record<AppointmentType, number>);

    const byStatus = appointments.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<AppointmentStatus, number>);

    return { total, completed, pending, overdue, byType, byStatus };
  }, [appointments]);

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(app => {
      const matchesType = filterType === 'all' || app.type === filterType;
      const matchesSearch = app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [appointments, filterType, searchTerm]);

  // Group appointments by status for Kanban
  const kanbanColumns = useMemo(() => {
    const grouped = filteredAppointments.reduce((acc, app) => {
      const status = app.completed ? 'done' : 
                    new Date(app.appointment_date) < new Date() ? 'doing' : 'todo';
      acc[status] = acc[status] || [];
      acc[status].push(app);
      return acc;
    }, {} as Record<AppointmentStatus, Appointment[]>);

    return {
      todo: grouped.todo || [],
      doing: grouped.doing || [],
      done: grouped.done || []
    };
  }, [filteredAppointments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAppointment: Appointment = {
      appointment_id: Date.now(),
      student_id: parseInt(currentUser?.id || '1'),
      ...formData,
      status: new Date(formData.appointment_date) < new Date() ? 'doing' : 'todo',
      completed: false,
      created_at: new Date(),
      updated_at: new Date()
    };

    if (editingAppointment) {
      setAppointments(prev => prev.map(app => 
        app.appointment_id === editingAppointment.appointment_id 
          ? { ...newAppointment, appointment_id: editingAppointment.appointment_id }
          : app
      ));
      setEditingAppointment(null);
    } else {
      setAppointments(prev => [...prev, newAppointment]);
    }

    setFormData({
      title: '',
      description: '',
      appointment_date: new Date(),
      location: '',
      type: 'study',
      reminder_enabled: true
    });
    setShowAddForm(false);
  };

  const toggleComplete = (appointmentId: number) => {
    setAppointments(prev => prev.map(app =>
      app.appointment_id === appointmentId
        ? { ...app, completed: !app.completed, status: !app.completed ? 'done' : 'todo', updated_at: new Date() }
        : app
    ));
  };

  const deleteAppointment = (appointmentId: number) => {
    setAppointments(prev => prev.filter(app => app.appointment_id !== appointmentId));
  };

  const handleProfessionalPDFExport = async () => {
    setIsGeneratingPDF(true);
    try {
      await generateProfessionalPDF(filteredAppointments, stats, {
        title: `Appointments & Tasks Report${filterType !== 'all' ? ` - ${filterType}` : ''}`,
        subtitle: `Generated on ${new Date().toLocaleDateString()} | Total: ${filteredAppointments.length} tasks | Student: ${currentUser?.firstName} ${currentUser?.lastName}`,
        includeCharts: true,
        includeDetails: true,
        filterType: filterType !== 'all' ? filterType : undefined
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      // You could show an error message to the user here
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const exportToPDF = () => {
    handleProfessionalPDFExport();
  };

  const getTypeIcon = (type: AppointmentType) => {
    return getAppointmentTypeEmoji(type);
  };

  const getTypeColor = (type: AppointmentType) => {
    const colors = {
      gym: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      game: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      study: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      meeting: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'vibe with friends': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    };
    return colors[type];
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddAppointmentFromCalendar = (date: Date) => {
    setFormData(prev => ({
      ...prev,
      appointment_date: date
    }));
    setShowAddForm(true);
  };

  const handleEditAppointmentFromCalendar = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      title: appointment.title,
      description: appointment.description || '',
      appointment_date: new Date(appointment.appointment_date),
      location: appointment.location || '',
      type: appointment.type,
      reminder_enabled: appointment.reminder_enabled
    });
    setShowAddForm(true);
  };

  // Loading state with animation
  if (loading) {
    return (
      <motion.div 
        className="min-h-screen flex flex-col"
        {...pageTransition}
      >
        <Header />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="rainbow-loading-ring"></div>
        </div>
        <Footer />
      </motion.div>
    );
  }

  // Authentication check - redirect to login if not authenticated
  if (!currentUser) {
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
        <div className="relative flex-1 flex items-center justify-center pt-32 pb-20 overflow-hidden">
          {renderFloatingShapes()}
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to Your
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600"> Appointments Hub</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Stay organized, track your tasks, and manage your time effectively. 
                Login to access your personalized appointment dashboard.
              </p>
            </div>
            <Card className="max-w-md mx-auto relative z-10">
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Please Login
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You need to be logged in to access your appointments and tasks. 
                  Your data will be personalized and securely stored.
                </p>
                <div className="space-y-3">
                  <Button 
                    variant="rainbow" 
                    onClick={() => window.location.href = '/login'}
                    className="w-full"
                  >
                    Go to Login
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => window.location.href = '/register'}
                    className="w-full"
                  >
                    Create Account
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                  🔒 Your appointments are private and secure
                </p>
              </div>
            </Card>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 relative z-10">
              <Card withHover withGlow className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Smart Calendar</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Organize your schedule with our intuitive calendar interface
                </p>
              </Card>

              <Card withHover withGlow className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <List className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Task Management</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Track your tasks and appointments with our Kanban board system
                </p>
              </Card>

              <Card withHover withGlow className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Analytics</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Get insights into your productivity with detailed statistics
                </p>
              </Card>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const renderAppointmentCard = (appointment: Appointment, showActions = true) => (
    <motion.div
      initial={cardAnimation.initial}
      animate={cardAnimation.animate}
      transition={cardAnimation.transition}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card key={appointment.appointment_id} withHover className="appointment-card mb-4">
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{getTypeIcon(appointment.type)}</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {appointment.title}
                </h3>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(appointment.type)}`}>
                  {appointment.type}
                </span>
              </div>
            </div>
            {showActions && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleComplete(appointment.appointment_id)}
                  className={`p-1 rounded-full transition-colors ${
                    appointment.completed
                      ? 'text-green-600 bg-green-100 dark:bg-green-900'
                      : 'text-gray-400 hover:text-green-600'
                  }`}
                >
                  <CheckCircle size={18} />
                </button>
                <button
                  onClick={() => {
                    setEditingAppointment(appointment);
                    setFormData({
                      title: appointment.title,
                      description: appointment.description || '',
                      appointment_date: new Date(appointment.appointment_date),
                      location: appointment.location || '',
                      type: appointment.type,
                      reminder_enabled: appointment.reminder_enabled
                    });
                    setShowAddForm(true);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => deleteAppointment(appointment.appointment_id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
          
          {appointment.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {appointment.description}
            </p>
          )}
          
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Clock size={12} />
              <span>{getRelativeTime(new Date(appointment.appointment_date))}</span>
            </div>
            {appointment.location && (
              <div className="flex items-center space-x-1">
                <MapPin size={12} />
                <span>{appointment.location}</span>
              </div>
            )}
          </div>
          
          {isOverdue(new Date(appointment.appointment_date)) && !appointment.completed && (
            <div className="mt-2 flex items-center space-x-1 text-xs text-red-600 dark:text-red-400">
              <AlertCircle size={12} />
              <span>Overdue ({getRelativeTime(new Date(appointment.appointment_date))})</span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );

  const renderKanbanView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Object.entries(kanbanColumns).map(([status, statusAppointments]) => (
        <div key={status} className="kanban-column">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${
                status === 'todo' ? 'bg-blue-500' :
                status === 'doing' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></span>
              <span>{status === 'todo' ? 'To Do' : status === 'doing' ? 'In Progress' : 'Completed'}</span>
              <span className="text-sm text-gray-500">({statusAppointments.length})</span>
            </h3>
          </div>
          <div className="space-y-3">
            {statusAppointments.map(appointment => renderAppointmentCard(appointment))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderCalendarView = () => (
    <AppointmentCalendar
      appointments={appointments}
      onDateSelect={handleDateSelect}
      onAddAppointment={handleAddAppointmentFromCalendar}
      onEditAppointment={handleEditAppointmentFromCalendar}
    />
  );

  const renderStatsView = () => (
    <AppointmentStatsComponent appointments={appointments} stats={stats} />
  );

  return (
    <motion.div 
      className="min-h-screen flex flex-col"
      {...pageTransition}
    >
      <Header />
      
      <main className="flex-1 pt-20 pb-10">
        <div className="container mx-auto px-4">
          {/* Header with animation */}
          <motion.div 
            className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Appointments & Tasks
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your schedule, track progress, and stay organized
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => setShowAddForm(true)}
                  icon={<Plus size={18} />}
                  variant="rainbow"
                >
                  Add Task
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={exportToPDF}
                  icon={isGeneratingPDF ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Download size={18} />}
                  variant="secondary"
                  disabled={isGeneratingPDF}
                >
                  {isGeneratingPDF ? 'Generating...' : 'Export PDF'}
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* View Toggle with animation */}
          <motion.div 
            className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {[
              { key: 'kanban', icon: List, label: 'Kanban' },
              { key: 'calendar', icon: Calendar, label: 'Calendar' },
              { key: 'list', icon: Archive, label: 'List' },
              { key: 'stats', icon: BarChart3, label: 'Stats' }
            ].map(({ key, icon: Icon, label }) => (
              <motion.button
                key={key}
                onClick={() => setActiveView(key as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  activeView === key
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={16} />
                <span className="hidden sm:block">{label}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Main Content with view transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {activeView === 'kanban' && renderKanbanView()}
              {activeView === 'calendar' && renderCalendarView()}
              {activeView === 'stats' && renderStatsView()}
              {activeView === 'list' && (
                <div className="space-y-4">
                  {filteredAppointments.map(appointment => renderAppointmentCard(appointment))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modal with animation */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 appointment-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
              {...modalAnimation}
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {editingAppointment ? 'Edit Task' : 'Add New Task'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Task title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
                
                <textarea
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  rows={3}
                />
                
                <Input
                  type="datetime-local"
                  value={formData.appointment_date.toISOString().slice(0, 16)}
                  onChange={(e) => setFormData(prev => ({ ...prev, appointment_date: new Date(e.target.value) }))}
                  required
                />
                
                <Input
                  type="text"
                  placeholder="Location (optional)"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
                
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as AppointmentType }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                >
                  <option value="study">📚 Study</option>
                  <option value="gym">💪 Gym</option>
                  <option value="meeting">👥 Meeting</option>
                  <option value="game">🎮 Game</option>
                  <option value="vibe with friends">🎉 Vibe with Friends</option>
                </select>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.reminder_enabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, reminder_enabled: e.target.checked }))}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Enable reminders</span>
                </label>
                
                <div className="flex space-x-4 pt-4">
                  <Button type="submit" variant="rainbow" className="flex-1">
                    {editingAppointment ? 'Update' : 'Create'} Task
                  </Button>
                  <Button 
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingAppointment(null);
                      setFormData({
                        title: '',
                        description: '',
                        appointment_date: new Date(),
                        location: '',
                        type: 'study',
                        reminder_enabled: true
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </motion.div>
  );
};

export default Appointments; 