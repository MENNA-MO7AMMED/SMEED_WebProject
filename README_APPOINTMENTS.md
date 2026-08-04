# Appointments & Task Management System

## Overview

The Appointments & Task Management System is a comprehensive solution for students to manage their schedules, track tasks, and stay organized. Built with React, TypeScript, and Tailwind CSS, it provides multiple views and powerful features for effective task management.

## ✨ New Features

### 📅 **Integrated Calendar View**
- **Interactive Monthly Calendar**: Full calendar view with appointment visualization
- **Visual Indicators**: Color-coded dots showing scheduled, completed, and overdue tasks
- **Click-to-Add**: Click any date to quickly schedule new appointments
- **Selected Date Panel**: Detailed view of appointments for any selected date
- **Monthly Summary**: Statistics for the currently viewed month
- **Today Navigation**: Quick jump to current date
- **Responsive Design**: Optimized for both desktop and mobile

### 📄 **Professional PDF Export**
- **Corporate Styling**: Professional layout with OpticOdds branding
- **Comprehensive Reports**: Multi-page PDFs with complete task analysis
- **Visual Statistics**: Charts, progress bars, and infographics
- **Task Details Table**: Formatted table with all appointment information
- **Productivity Insights**: AI-generated recommendations and tips
- **Filtering Support**: Export filtered results (by type, date range)
- **Auto-naming**: Timestamped filenames for easy organization

## Features

### 🗂️ Task Management
- **Create Tasks**: Add tasks with title, description, type, date, location, and reminders
- **Task Types**: Categorize tasks as Study, Gym, Meeting, Game, or Vibe with Friends
- **Edit & Delete**: Full CRUD operations for all tasks
- **Mark Complete**: Toggle task completion with visual feedback
- **Smart Status**: Automatic status assignment based on dates and completion

### 📊 Multiple Views
1. **Kanban Board**: Visual task management with To Do, In Progress, and Completed columns
2. **Calendar View**: Interactive monthly calendar with appointment indicators
3. **List View**: Traditional list format with all task details
4. **Statistics View**: Comprehensive analytics and insights

### 📈 Analytics & Insights
- **Completion Rate**: Overall progress tracking with visual progress bars
- **Task Statistics**: Total, completed, pending, and overdue task counts
- **Type Analysis**: Performance breakdown by task type
- **Recent Activity**: Track recently completed tasks
- **Productivity Tips**: Smart suggestions based on your task patterns
- **Monthly Summaries**: Calendar-based monthly performance tracking

### 🔍 Advanced Features
- **Search**: Find tasks by title or description
- **Filter**: Filter tasks by type (Study, Gym, Meeting, etc.)
- **Professional PDF Export**: Download comprehensive task reports
- **Overdue Detection**: Automatic identification of overdue tasks
- **Smart Categorization**: Intelligent task status assignment
- **Dark Mode**: Full dark mode support
- **Responsive Design**: Optimized for all screen sizes

## Database Schema

The system is based on two main tables:

### Students Table
```sql
CREATE TABLE Students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(50) UNIQUE NOT NULL,
    national_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(255) UNIQUE NOT NULL,
    birthdate DATE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    encryption_key VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active TINYINT(1) DEFAULT 1,
    is_verified TINYINT(1) DEFAULT 0,
    email_verified_at DATETIME,
    password_reset_token VARCHAR(255),
    password_reset_expires DATETIME,
    login_attempts INT DEFAULT 0,
    account_locked_until DATETIME
) ENGINE=InnoDB;
```

### Appointments Table
```sql
CREATE TABLE Appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    appointment_date DATETIME NOT NULL,
    location VARCHAR(255),
    reminder_enabled TINYINT(1) DEFAULT 1,
    FOREIGN KEY (student_id) REFERENCES Students(student_id)
) ENGINE=InnoDB;
```

## Usage

### Accessing the Appointments Page
1. Navigate to the home page
2. Click on the "Appointments & Tasks" card
3. You'll be redirected to `/appointments`

### Creating a New Task
1. Click the "Add Task" button (or click a date in calendar view)
2. Fill in the required information:
   - **Title**: Task name (required)
   - **Description**: Optional details
   - **Date & Time**: When the task is scheduled
   - **Location**: Where the task takes place (optional)
   - **Type**: Select from Study, Gym, Meeting, Game, or Vibe with Friends
   - **Reminders**: Enable/disable notifications
3. Click "Create Task"

### Using the Calendar View
1. Click the "Calendar" tab in the view toggle
2. **Navigate**: Use arrow buttons or click "Today" to navigate months
3. **View Appointments**: Click any date to see appointments for that day
4. **Add Appointment**: Click "Add" button in the selected date panel
5. **Edit Appointment**: Click on any appointment in the selected date panel
6. **Visual Indicators**: 
   - 🔵 Blue dots = Scheduled appointments
   - 🟢 Green dots = Completed appointments
   - 🔴 Red dots = Overdue appointments

### Managing Tasks
- **Complete Task**: Click the checkmark icon
- **Edit Task**: Click the edit icon to modify details
- **Delete Task**: Click the trash icon to remove the task
- **Search**: Use the search bar to find specific tasks
- **Filter**: Select a specific task type to filter results

### Viewing Statistics
1. Click the "Stats" tab in the view toggle
2. View comprehensive analytics including:
   - Overall completion rate
   - Task breakdown by type
   - Recent activity
   - Productivity insights and tips

### Exporting Professional PDFs
1. Click the "Export PDF" button
2. The system will generate a professional report containing:
   - **Header Section**: OpticOdds branding and generation info
   - **Overview Statistics**: Visual cards showing totals, completion rates
   - **Progress Charts**: Task breakdown by type with visual bars
   - **Task Details Table**: Comprehensive table of all appointments
   - **Productivity Insights**: Personalized recommendations and tips
   - **Multi-page Support**: Automatic pagination for large datasets
3. PDF will be automatically downloaded with timestamp in filename

## Technical Implementation

### Dependencies
```json
{
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1",
  "react-calendar": "^4.6.1",
  "date-fns": "^2.30.0"
}
```

### Type Definitions
```typescript
export type AppointmentType = 'gym' | 'game' | 'study' | 'meeting' | 'vibe with friends';
export type AppointmentStatus = 'todo' | 'doing' | 'done';

export interface Appointment {
  appointment_id: number;
  student_id: number;
  title: string;
  description?: string;
  appointment_date: Date;
  location?: string;
  type: AppointmentType;
  status: AppointmentStatus;
  reminder_enabled: boolean;
  completed: boolean;
  created_at: Date;
  updated_at: Date;
}
```

### Key Components
1. **Appointments.tsx**: Main page component with all views
2. **AppointmentCalendar.tsx**: Interactive calendar component
3. **AppointmentStats.tsx**: Dedicated statistics component
4. **pdfGenerator.ts**: Professional PDF generation system
5. **appointments.ts**: Utility functions for date handling and task management

### Utility Functions
- `isOverdue()`: Check if a task is overdue
- `getRelativeTime()`: Get human-readable time differences
- `categorizeAppointments()`: Smart task categorization
- `generateProfessionalPDF()`: Create comprehensive PDF reports
- `getTaskPriority()`: Determine task urgency

## Styling

The system uses a comprehensive CSS system with:
- **Calendar Styling**: Custom styles for react-calendar integration
- **Responsive Design**: Mobile-first approach with breakpoints
- **Dark Mode**: Full dark theme support for all new components
- **Animations**: Smooth transitions and hover effects
- **Custom Classes**: Specialized styles for calendar and PDF components

### Key CSS Classes
- `.appointment-calendar`: Styled calendar container
- `.appointment-card`: Enhanced task cards with animations
- `.kanban-column`: Improved Kanban board columns
- `.calendar-day-indicators`: Visual appointment indicators
- `.stats-card`: Professional statistics display cards

## Future Enhancements

### Planned Features
1. **Drag & Drop**: Reschedule appointments by dragging in calendar view
2. **Recurring Tasks**: Support for repeating appointments
3. **Real-time Sync**: Live updates across multiple devices
4. **Advanced PDF Customization**: Custom themes and layouts
5. **Calendar Integration**: Sync with Google Calendar, Outlook
6. **Notification System**: Real-time reminders and alerts
7. **Collaboration**: Share calendars and collaborate with other students
8. **Time Tracking**: Track time spent on different task types
9. **Goal Setting**: Set and track productivity goals
10. **Mobile App**: Native mobile application

### Performance Optimizations
- **Virtual Calendar**: Efficient rendering for large date ranges
- **PDF Streaming**: Generate large PDFs without memory issues
- **Lazy Loading**: Load calendar data on-demand
- **Caching**: Client-side caching for frequently accessed data
- **Offline Support**: PWA capabilities for offline usage

## Installation & Setup

1. **Prerequisites**: Node.js, npm/yarn
2. **Install Dependencies**: 
   ```bash
   npm install jspdf html2canvas react-calendar date-fns
   ```
3. **Start Development Server**: `npm start`
4. **Access**: Navigate to `http://localhost:3000/appointments`

## API Integration

For production use, integrate with your backend API:

```typescript
// Example API integration
const appointmentAPI = {
  getAppointments: () => fetch('/api/appointments'),
  createAppointment: (data) => fetch('/api/appointments', { method: 'POST', body: JSON.stringify(data) }),
  updateAppointment: (id, data) => fetch(`/api/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAppointment: (id) => fetch(`/api/appointments/${id}`, { method: 'DELETE' })
};
```

## Contributing

When contributing to the appointments system:
1. Follow TypeScript best practices
2. Maintain consistent styling with Tailwind CSS
3. Add proper error handling for PDF generation
4. Include unit tests for new functionality
5. Update documentation for new features
6. Test calendar interactions thoroughly
7. Verify PDF output quality

## Support

For issues or questions regarding the appointment system:
1. Check the existing documentation
2. Review the code comments
3. Test in both light and dark modes
4. Verify responsive behavior on different screen sizes
5. Test PDF generation with various data sets
6. Ensure calendar works across different browsers

---

*This appointment system is part of the OpticOdds student management platform, designed to help students stay organized and productive throughout their academic journey with professional-grade calendar and reporting capabilities.* 