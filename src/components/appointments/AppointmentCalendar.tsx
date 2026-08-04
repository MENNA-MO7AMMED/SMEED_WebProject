import React, { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Appointment, AppointmentType } from '../../types';
import { getAppointmentTypeEmoji, isOverdue, getRelativeTime } from '../../utils/appointments';
import 'react-calendar/dist/Calendar.css';
import { motion, AnimatePresence } from 'framer-motion';

type Value = Date | null | [Date | null, Date | null];

interface CalendarTileProperties {
  date: Date;
  view: string;
}

interface ActiveStartDateChangeProperties {
  activeStartDate: Date | null;
  value: Value;
  view: string;
  action: string;
}

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onDateSelect?: (date: Date) => void;
  onAddAppointment?: (date: Date) => void;
  onEditAppointment?: (appointment: Appointment) => void;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  onDateSelect,
  onAddAppointment,
  onEditAppointment
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewDate, setViewDate] = useState<Date>(new Date());

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointment_date);
      return appointmentDate.toDateString() === date.toDateString();
    });
  };

  // Get appointments for selected date
  const selectedDateAppointments = useMemo(() => {
    return getAppointmentsForDate(selectedDate);
  }, [selectedDate, appointments]);

  // Mark dates that have appointments
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayAppointments = getAppointmentsForDate(date);
      if (dayAppointments.length > 0) {
        const completedCount = dayAppointments.filter(app => app.completed).length;
        const overdueCount = dayAppointments.filter(app => 
          !app.completed && isOverdue(new Date(app.appointment_date))
        ).length;
        
        return (
          <div className="calendar-day-indicators">
            <div className="flex justify-center space-x-1 mt-1">
              {dayAppointments.slice(0, 3).map((appointment, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full ${
                    appointment.completed
                      ? 'bg-green-500'
                      : isOverdue(new Date(appointment.appointment_date))
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                  }`}
                />
              ))}
              {dayAppointments.length > 3 && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  +{dayAppointments.length - 3}
                </div>
              )}
            </div>
          </div>
        );
      }
    }
    return null;
  };

  // Custom tile class names
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayAppointments = getAppointmentsForDate(date);
      const hasOverdue = dayAppointments.some(app => 
        !app.completed && isOverdue(new Date(app.appointment_date))
      );
      const hasCompleted = dayAppointments.some(app => app.completed);
      const hasAppointments = dayAppointments.length > 0;

      let classes = [];
      if (hasAppointments) classes.push('has-appointments');
      if (hasOverdue) classes.push('has-overdue');
      if (hasCompleted && dayAppointments.every(app => app.completed)) {
        classes.push('all-completed');
      }
      
      return classes.join(' ');
    }
    return '';
  };

  const handleDateChange = (value: Value) => {
    if (value) {
      const selectedDate = Array.isArray(value) ? value[0] : value;
      if (selectedDate) {
        setSelectedDate(selectedDate);
        onDateSelect?.(selectedDate);
      }
    }
  };

  const getTypeColor = (type: AppointmentType) => {
    const colors = {
      gym: 'border-l-red-500 bg-red-50 dark:bg-red-900/20',
      game: 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/20',
      study: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20',
      meeting: 'border-l-green-500 bg-green-50 dark:bg-green-900/20',
      'vibe with friends': 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
    };
    return colors[type];
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  const calendarVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  // Add custom CSS for calendar animations
  const calendarStyles = `
    .appointment-calendar {
      --calendar-bg: var(--background, #ffffff);
      --calendar-border: var(--border, #e5e7eb);
      --calendar-text: var(--text, #1f2937);
      --calendar-selected-bg: var(--primary, #3b82f6);
      --calendar-selected-text: #ffffff;
      --calendar-hover-bg: var(--hover, #f3f4f6);
    }

    .react-calendar {
      width: 100%;
      background: var(--calendar-bg);
      border: 1px solid var(--calendar-border);
      border-radius: 0.75rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .react-calendar:hover {
      box-shadow: 0 8px 12px -2px rgba(0, 0, 0, 0.12);
    }

    .react-calendar__tile {
      padding: 1rem;
      position: relative;
      transition: all 0.2s ease;
    }

    .react-calendar__tile:enabled:hover {
      background: var(--calendar-hover-bg);
      transform: scale(1.05);
    }

    .react-calendar__tile--active {
      background: var(--calendar-selected-bg) !important;
      color: var(--calendar-selected-text) !important;
      transform: scale(1.1);
    }

    .calendar-day-indicators {
      position: absolute;
      bottom: 4px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      gap: 2px;
    }

    .calendar-day-indicators > div {
      transition: transform 0.2s ease;
    }

    .calendar-day-indicators:hover > div {
      transform: scale(1.2);
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    .has-appointments {
      animation: pulse 2s infinite;
    }

    .has-overdue {
      position: relative;
    }

    .has-overdue::after {
      content: '';
      position: absolute;
      top: 4px;
      right: 4px;
      width: 6px;
      height: 6px;
      background: #ef4444;
      border-radius: 50%;
      animation: blink 1s infinite;
    }

    @keyframes blink {
      0% { opacity: 0; }
      50% { opacity: 1; }
      100% { opacity: 0; }
    }

    .all-completed {
      background: rgba(34, 197, 94, 0.1);
    }

    .dark .react-calendar {
      --calendar-bg: #1f2937;
      --calendar-border: #374151;
      --calendar-text: #f3f4f6;
      --calendar-hover-bg: #374151;
    }
  `;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <style>{calendarStyles}</style>
      
      {/* Calendar */}
      <motion.div 
        className="lg:col-span-2"
        variants={itemVariants}
      >
        <Card>
          <div className="p-6">
            <motion.div 
              className="flex items-center justify-between mb-6"
              variants={itemVariants}
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Calendar View
              </h3>
              <motion.div 
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setViewDate(new Date())}
                >
                  Today
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="appointment-calendar"
              variants={calendarVariants}
            >
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                activeStartDate={viewDate}
                onActiveStartDateChange={({ activeStartDate }: ActiveStartDateChangeProperties) => 
                  activeStartDate && setViewDate(activeStartDate)
                }
                tileContent={tileContent}
                tileClassName={tileClassName}
                locale="en-US"
                showNavigation={true}
                navigationLabel={({ date }: CalendarTileProperties) => (
                  <span className="text-lg font-semibold">
                    {date.toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                )}
                prevLabel={<ChevronLeft size={20} />}
                nextLabel={<ChevronRight size={20} />}
                prev2Label={null}
                next2Label={null}
              />
            </motion.div>

            {/* Calendar Legend */}
            <motion.div 
              className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              variants={itemVariants}
            >
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Legend
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <motion.div 
                  className="flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Scheduled</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Completed</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Overdue</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Selected Date Details */}
      <motion.div 
        className="space-y-6"
        variants={itemVariants}
      >
        <Card>
          <div className="p-6">
            <motion.div 
              className="flex items-center justify-between mb-4"
              variants={itemVariants}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h3>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Plus size={16} />}
                  onClick={() => onAddAppointment?.(selectedDate)}
                >
                  Add
                </Button>
              </motion.div>
            </motion.div>

            <AnimatePresence mode="wait">
              {selectedDateAppointments.length === 0 ? (
                <motion.div 
                  className="text-center py-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <CalendarIcon size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No appointments scheduled for this date
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-3"
                    onClick={() => onAddAppointment?.(selectedDate)}
                  >
                    Schedule something
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  className="space-y-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {selectedDateAppointments
                    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
                    .map((appointment, index) => (
                      <motion.div
                        key={appointment.appointment_id}
                        className={`p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow ${getTypeColor(appointment.type)} ${
                          appointment.completed ? 'opacity-75' : ''
                        }`}
                        onClick={() => onEditAppointment?.(appointment)}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, x: 5 }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2">
                            <span className="text-lg">
                              {getAppointmentTypeEmoji(appointment.type)}
                            </span>
                            <div className="flex-1">
                              <h4 className={`font-medium ${
                                appointment.completed 
                                  ? 'line-through text-gray-500 dark:text-gray-400' 
                                  : 'text-gray-900 dark:text-white'
                              }`}>
                                {appointment.title}
                              </h4>
                              {appointment.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {appointment.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <div className="flex items-center space-x-1">
                                  <Clock size={12} />
                                  <span>
                                    {new Date(appointment.appointment_date).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                {appointment.location && (
                                  <div className="flex items-center space-x-1">
                                    <MapPin size={12} />
                                    <span>{appointment.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div>
                            {appointment.completed && (
                              <div className="text-green-600 dark:text-green-400 text-xs font-medium">
                                ✓ Completed
                              </div>
                            )}
                            {!appointment.completed && isOverdue(new Date(appointment.appointment_date)) && (
                              <div className="text-red-600 dark:text-red-400 text-xs font-medium">
                                ⚠ Overdue
                              </div>
                            )}
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              appointment.type === 'study' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              appointment.type === 'gym' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              appointment.type === 'meeting' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              appointment.type === 'game' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {appointment.type}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>

        {/* Monthly Summary */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Monthly Summary
            </h3>
            {(() => {
              const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
              const monthEnd = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
              const monthAppointments = appointments.filter(app => {
                const appDate = new Date(app.appointment_date);
                return appDate >= monthStart && appDate <= monthEnd;
              });
              
              const stats = {
                total: monthAppointments.length,
                completed: monthAppointments.filter(app => app.completed).length,
                overdue: monthAppointments.filter(app => 
                  !app.completed && isOverdue(new Date(app.appointment_date))
                ).length
              };

              return (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                    <span className="font-medium">{stats.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {stats.completed}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Overdue</span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      {stats.overdue}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Completion Rate
                      </span>
                      <span className="font-semibold">
                        {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AppointmentCalendar; 