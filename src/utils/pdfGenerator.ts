import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Appointment, AppointmentType, AppointmentStats } from '../types';
import { getAppointmentTypeEmoji, isOverdue, formatDate } from './appointments';

interface PDFOptions {
  title?: string;
  subtitle?: string;
  includeCharts?: boolean;
  includeDetails?: boolean;
  filterType?: AppointmentType;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

type RGBColor = [number, number, number];

export class ProfessionalPDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private currentY: number = 20;
  private lineHeight: number = 6;
  
  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  private addHeader(title: string, subtitle?: string) {
    // Add logo/company header
    this.doc.setFillColor(59, 130, 246); // Blue color
    this.doc.rect(0, 0, this.pageWidth, 25, 'F');
    
    // Title
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('OpticOdds', this.margin, 15);
    
    // Student Management Platform
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Student Management Platform', this.margin, 20);
    
    // Date
    this.doc.text(`Generated: ${new Date().toLocaleDateString()}`, this.pageWidth - 60, 15);
    
    this.currentY = 40;
    
    // Report title
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 10;
    
    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(subtitle, this.margin, this.currentY);
      this.currentY += 8;
    }
    
    // Separator line
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 15;
  }

  private addFooter() {
    const footerY = this.pageHeight - 15;
    this.doc.setFontSize(8);
    this.doc.setTextColor(150, 150, 150);
    this.doc.setFont('helvetica', 'normal');
    
    // Page number
    const pageNum = this.doc.getCurrentPageInfo().pageNumber;
    this.doc.text(`Page ${pageNum}`, this.pageWidth - 30, footerY);
    
    // Company info
    this.doc.text('OpticOdds - Appointments & Task Management Report', this.margin, footerY);
  }

  private addStatsSection(stats: AppointmentStats) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Overview Statistics', this.margin, this.currentY);
    this.currentY += 10;

    // Stats cards
    const cardWidth = (this.pageWidth - 2 * this.margin - 30) / 4;
    const cardHeight = 25;
    const startX = this.margin;

    const statsData: { label: string; value: string; color: RGBColor }[] = [
      { label: 'Total Tasks', value: stats.total.toString(), color: [59, 130, 246] },
      { label: 'Completed', value: stats.completed.toString(), color: [34, 197, 94] },
      { label: 'Pending', value: stats.pending.toString(), color: [251, 191, 36] },
      { label: 'Overdue', value: stats.overdue.toString(), color: [239, 68, 68] }
    ];

    statsData.forEach((stat, index) => {
      const x = startX + index * (cardWidth + 10);
      
      // Card background
      this.doc.setFillColor(248, 250, 252);
      this.doc.rect(x, this.currentY, cardWidth, cardHeight, 'F');
      
      // Card border
      const [r, g, b] = stat.color;
      this.doc.setDrawColor(r, g, b);
      this.doc.setLineWidth(0.5);
      this.doc.rect(x, this.currentY, cardWidth, cardHeight);
      
      // Value
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(r, g, b);
      this.doc.text(stat.value, x + cardWidth/2, this.currentY + 12, { align: 'center' });
      
      // Label
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(stat.label, x + cardWidth/2, this.currentY + 18, { align: 'center' });
    });

    this.currentY += cardHeight + 20;

    // Completion rate
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Completion Rate', this.margin, this.currentY);
    this.currentY += 8;

    const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
    const progressBarWidth = this.pageWidth - 2 * this.margin - 60;
    const progressBarHeight = 8;

    // Progress bar background
    this.doc.setFillColor(229, 231, 235);
    this.doc.rect(this.margin, this.currentY, progressBarWidth, progressBarHeight, 'F');

    // Progress bar fill
    this.doc.setFillColor(34, 197, 94);
    this.doc.rect(this.margin, this.currentY, (progressBarWidth * completionRate) / 100, progressBarHeight, 'F');

    // Percentage text
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(`${Math.round(completionRate)}%`, this.pageWidth - this.margin - 30, this.currentY + 6);

    this.currentY += 25;
  }

  private addTasksByTypeChart(stats: AppointmentStats) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Tasks by Type', this.margin, this.currentY);
    this.currentY += 15;

    const typeColors: Record<string, RGBColor> = {
      study: [59, 130, 246],
      gym: [239, 68, 68],
      meeting: [34, 197, 94],
      game: [168, 85, 247],
      'vibe with friends': [251, 191, 36]
    };

    Object.entries(stats.byType).forEach(([type, count], index) => {
      const emoji = getAppointmentTypeEmoji(type as AppointmentType);
      const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
      const barWidth = (this.pageWidth - 2 * this.margin - 80) * (percentage / 100);
      const barHeight = 12;
      const y = this.currentY + index * 20;

      // Type name and emoji
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(`${emoji} ${type}`, this.margin, y + 8);

      // Bar background
      this.doc.setFillColor(243, 244, 246);
      this.doc.rect(this.margin + 60, y, this.pageWidth - 2 * this.margin - 140, barHeight, 'F');

      // Bar fill
      const color = typeColors[type] || [156, 163, 175];
      const [r, g, b] = color;
      this.doc.setFillColor(r, g, b);
      this.doc.rect(this.margin + 60, y, barWidth, barHeight, 'F');

      // Count and percentage
      this.doc.setFontSize(9);
      this.doc.text(`${count} (${Math.round(percentage)}%)`, this.pageWidth - this.margin - 70, y + 8);
    });

    this.currentY += Object.keys(stats.byType).length * 20 + 15;
  }

  private addTasksTable(appointments: Appointment[]) {
    this.checkPageBreak(40);
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Task Details', this.margin, this.currentY);
    this.currentY += 15;

    // Table headers
    const headers = ['Task', 'Type', 'Date', 'Status', 'Location'];
    const columnWidths = [60, 25, 35, 20, 40];
    const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0);
    const startX = this.margin;

    // Header background
    this.doc.setFillColor(59, 130, 246);
    this.doc.rect(startX, this.currentY, tableWidth, 8, 'F');

    // Header text
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    
    let x = startX + 2;
    headers.forEach((header, index) => {
      this.doc.text(header, x, this.currentY + 6);
      x += columnWidths[index];
    });

    this.currentY += 8;

    // Table rows
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);

    appointments.slice(0, 20).forEach((appointment, index) => {
      const isEven = index % 2 === 0;
      const rowHeight = 6;

      // Row background
      if (isEven) {
        this.doc.setFillColor(248, 250, 252);
        this.doc.rect(startX, this.currentY, tableWidth, rowHeight, 'F');
      }

      // Check if we need a new page
      this.checkPageBreak(rowHeight + 5);

      let x = startX + 2;
      const rowY = this.currentY + 4;

      // Task title (truncated if too long)
      const title = appointment.title.length > 30 
        ? appointment.title.substring(0, 27) + '...' 
        : appointment.title;
      this.doc.text(title, x, rowY);
      x += columnWidths[0];

      // Type
      this.doc.text(appointment.type, x, rowY);
      x += columnWidths[1];

      // Date
      const date = new Date(appointment.appointment_date).toLocaleDateString();
      this.doc.text(date, x, rowY);
      x += columnWidths[2];

      // Status
      const status = appointment.completed ? 'Completed' : 
                    isOverdue(new Date(appointment.appointment_date)) ? 'Overdue' : 'Pending';
      const statusColor: RGBColor = appointment.completed ? [34, 197, 94] : 
                         isOverdue(new Date(appointment.appointment_date)) ? [239, 68, 68] : [251, 191, 36];
      const [r, g, b] = statusColor;
      this.doc.setTextColor(r, g, b);
      this.doc.text(status, x, rowY);
      this.doc.setTextColor(0, 0, 0);
      x += columnWidths[3];

      // Location
      const location = appointment.location || 'N/A';
      this.doc.text(location.length > 20 ? location.substring(0, 17) + '...' : location, x, rowY);

      this.currentY += rowHeight;
    });

    if (appointments.length > 20) {
      this.currentY += 5;
      this.doc.setFontSize(9);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(`Showing first 20 of ${appointments.length} tasks`, this.margin, this.currentY);
    }

    this.currentY += 15;
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.currentY + requiredSpace > this.pageHeight - 30) {
      this.doc.addPage();
      this.currentY = 30;
      this.addFooter();
    }
  }

  private addRecommendations(stats: AppointmentStats) {
    this.checkPageBreak(50);
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Productivity Insights & Recommendations', this.margin, this.currentY);
    this.currentY += 15;

    const recommendations = [];
    const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

    if (completionRate >= 80) {
      recommendations.push({
        icon: '🎉',
        title: 'Excellent Performance!',
        text: 'You\'re maintaining an outstanding completion rate. Keep up the great work!'
      });
    } else if (completionRate >= 60) {
      recommendations.push({
        icon: '👍',
        title: 'Good Progress',
        text: 'You\'re doing well! Consider setting aside specific times for task completion.'
      });
    } else {
      recommendations.push({
        icon: '💪',
        title: 'Room for Improvement',
        text: 'Try breaking larger tasks into smaller, manageable chunks and set daily goals.'
      });
    }

    if (stats.overdue > 0) {
      recommendations.push({
        icon: '⚠️',
        title: 'Address Overdue Tasks',
        text: `You have ${stats.overdue} overdue task${stats.overdue > 1 ? 's' : ''}. Consider rescheduling or completing them soon.`
      });
    }

    if (stats.pending > 10) {
      recommendations.push({
        icon: '📋',
        title: 'Task Organization',
        text: 'With many pending tasks, consider using the Kanban view to prioritize effectively.'
      });
    }

    recommendations.forEach((rec) => {
      this.checkPageBreak(15);
      
      // Icon and title
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(59, 130, 246);
      this.doc.text(`${rec.icon} ${rec.title}`, this.margin, this.currentY);
      this.currentY += 8;

      // Text
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(0, 0, 0);
      const lines = this.doc.splitTextToSize(rec.text, this.pageWidth - 2 * this.margin - 20);
      this.doc.text(lines, this.margin + 10, this.currentY);
      this.currentY += lines.length * 4 + 8;
    });
  }

  public async generateAppointmentsPDF(
    appointments: Appointment[], 
    stats: AppointmentStats, 
    options: PDFOptions = {}
  ): Promise<void> {
    const {
      title = 'Appointments & Tasks Report',
      subtitle = `Generated on ${new Date().toLocaleDateString()}`,
      includeCharts = true,
      includeDetails = true,
      filterType,
      dateRange
    } = options;

    // Filter appointments if needed
    let filteredAppointments = appointments;
    if (filterType) {
      filteredAppointments = appointments.filter(app => app.type === filterType);
    }
    if (dateRange) {
      filteredAppointments = filteredAppointments.filter(app => {
        const appDate = new Date(app.appointment_date);
        return appDate >= dateRange.start && appDate <= dateRange.end;
      });
    }

    // Add header
    this.addHeader(title, subtitle);

    // Add statistics
    this.addStatsSection(stats);

    // Add charts if requested
    if (includeCharts) {
      this.addTasksByTypeChart(stats);
    }

    // Add task details if requested
    if (includeDetails) {
      this.addTasksTable(filteredAppointments);
    }

    // Add recommendations
    this.addRecommendations(stats);

    // Add footer to all pages
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.addFooter();
    }

    // Save the PDF
    const filename = `OpticOdds_Appointments_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    this.doc.save(filename);
  }
}

export const generateProfessionalPDF = async (
  appointments: Appointment[], 
  stats: AppointmentStats, 
  options: PDFOptions = {}
): Promise<void> => {
  const generator = new ProfessionalPDFGenerator();
  await generator.generateAppointmentsPDF(appointments, stats, options);
}; 