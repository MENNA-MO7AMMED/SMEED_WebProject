import { Appointment, AppointmentType, AppointmentStatus } from '../types';

export const isOverdue = (date: Date): boolean => {
  return new Date(date) < new Date() && !isToday(date);
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  return checkDate.toDateString() === today.toDateString();
};

export const isUpcoming = (date: Date): boolean => {
  return new Date(date) > new Date();
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = new Date(date).getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 1) return `In ${days} days`;
  if (days < -1) return `${Math.abs(days)} days ago`;
  return formatDate(date);
};

export const categorizeAppointments = (appointments: Appointment[]) => {
  const now = new Date();
  
  return appointments.reduce((acc, appointment) => {
    const appointmentDate = new Date(appointment.appointment_date);
    
    if (appointment.completed) {
      acc.completed.push(appointment);
    } else if (appointmentDate < now) {
      acc.overdue.push(appointment);
    } else if (isToday(appointmentDate)) {
      acc.today.push(appointment);
    } else {
      acc.upcoming.push(appointment);
    }
    
    return acc;
  }, {
    completed: [] as Appointment[],
    overdue: [] as Appointment[],
    today: [] as Appointment[],
    upcoming: [] as Appointment[]
  });
};

export const generateAppointmentsPDF = (appointments: Appointment[], filterType?: AppointmentType) => {
  // This is a simplified version - in a real app, you'd use jsPDF or similar
  const filteredAppointments = filterType 
    ? appointments.filter(app => app.type === filterType)
    : appointments;

  const reportData = {
    generatedAt: new Date().toISOString(),
    filter: filterType || 'all',
    totalAppointments: filteredAppointments.length,
    completedTasks: filteredAppointments.filter(app => app.completed).length,
    overdueTasks: filteredAppointments.filter(app => isOverdue(new Date(app.appointment_date)) && !app.completed).length,
    appointments: filteredAppointments.map(app => ({
      title: app.title,
      description: app.description,
      type: app.type,
      date: formatDate(new Date(app.appointment_date)),
      location: app.location,
      status: app.completed ? 'Completed' : isOverdue(new Date(app.appointment_date)) ? 'Overdue' : 'Pending',
      completed: app.completed
    }))
  };

  // Convert to JSON for now - in production, use jsPDF
  const dataStr = JSON.stringify(reportData, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  const exportFileDefaultName = `appointments_report_${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const getTaskPriority = (appointment: Appointment): 'high' | 'medium' | 'low' => {
  const appointmentDate = new Date(appointment.appointment_date);
  const now = new Date();
  const diffHours = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (appointment.completed) return 'low';
  if (diffHours < 0) return 'high'; // Overdue
  if (diffHours < 24) return 'high'; // Due within 24 hours
  if (diffHours < 72) return 'medium'; // Due within 3 days
  return 'low';
};

export const sortAppointmentsByPriority = (appointments: Appointment[]): Appointment[] => {
  return [...appointments].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = getTaskPriority(a);
    const bPriority = getTaskPriority(b);
    
    if (priorityOrder[aPriority] !== priorityOrder[bPriority]) {
      return priorityOrder[bPriority] - priorityOrder[aPriority];
    }
    
    // If same priority, sort by date
    return new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime();
  });
};

export const getAppointmentTypeEmoji = (type: AppointmentType): string => {
  const emojiMap: Record<AppointmentType, string> = {
    gym: '💪',
    game: '🎮',
    study: '📚',
    meeting: '👥',
    'vibe with friends': '🎉'
  };
  return emojiMap[type];
};

export const getStatusColor = (status: AppointmentStatus): string => {
  const colorMap: Record<AppointmentStatus, string> = {
    todo: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    doing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    done: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  };
  return colorMap[status];
}; 