export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalId: string;
  birthDate: Date;
  verifiedEmail: boolean;
  loginAttempts: number;
  lockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  birthDate: Date;
  password: string;
  confirmPassword: string;
}



export type ThemeMode = 'dark' | 'light';
export type Language = 'en' | 'ar';



// Health-related types
export interface HealthProfile {
  health_id?: number;
  student_id: number;
  height: number; // in cm
  weight: number; // in kg
  gender: 'male' | 'female' | 'other';
  blood_type: string;
  chronic_diseases: string;
  allergies: string;
  fitness_goal: 'weight_loss' | 'muscle_gain' | 'general_health' | 'custom';
  target_weight: number;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  dietary_preferences: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface HealthData {
  record_id?: number;
  health_id: number;
  record_date: Date;
  steps: number;
  calories_burned: number;
  sleep_hours: number;
  water_intake: number; // in liters
  heart_rate: number;
  mood: 'excellent' | 'good' | 'average' | 'poor';
  created_at?: Date;
}

export interface HealthProgram {
  program_id?: number;
  health_id: number;
  program_type: 'weight_loss' | 'muscle_gain' | 'daily_health' | 'custom';
  start_date: Date;
  end_date?: Date;
  workout_plan: string;
  nutrition_plan: string;
  status: 'active' | 'completed' | 'paused';
  created_at?: Date;
  updated_at?: Date;
}

export interface HealthFormData {
  height: string;
  weight: string;
  gender: 'male' | 'female' | 'other';
  blood_type: string;
  chronic_diseases: string;
  allergies: string;
  fitness_goal: 'weight_loss' | 'muscle_gain' | 'general_health' | 'custom';
  target_weight: string;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  dietary_preferences: string;
}

export interface BMIResult {
  bmi: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  description: string;
}

export interface WaterIntakeRecommendation {
  daily_liters: number;
  glasses: number;
  factors: string[];
}

export interface ExerciseRecommendation {
  weekly_hours: number;
  daily_minutes: number;
  activity_suggestions: string[];
  intensity: string;
}

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

export interface AppointmentFormData {
  title: string;
  description: string;
  appointment_date: Date;
  location: string;
  type: AppointmentType;
  reminder_enabled: boolean;
}

export interface AppointmentStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  byType: Record<AppointmentType, number>;
  byStatus: Record<AppointmentStatus, number>;
}