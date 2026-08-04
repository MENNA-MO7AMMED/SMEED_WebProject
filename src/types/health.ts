export interface HealthProfile {
  health_id?: number;
  student_id: number;
  height: number;
  weight: number;
  gender: string;
  blood_type: string;
  chronic_diseases: string;
  allergies: string;
  fitness_goal: string;
  custom_fitness_goal?: string;
  target_weight: number;
  activity_level: string;
  dietary_preferences: string;
  created_at?: Date;
  updated_at: Date;
}

export interface HealthFormData {
  height: string;
  weight: string;
  gender: string;
  blood_type: string;
  chronic_diseases: string;
  allergies: string;
  fitness_goal: string;
  target_weight: string;
  activity_level: string;
  dietary_preferences: string;
}

export interface BMIResult {
  bmi: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  description: string;
}

export interface TimeSlot {
  glass: number;
  time: string;
}

export interface WaterIntakeRecommendation {
  daily_liters: number;
  glasses: number;
  factors: string[];
  schedule: TimeSlot[];
}

export interface ExerciseRecommendation {
  weekly_hours: number;
  daily_minutes: number;
  activity_suggestions: string[];
  intensity: string;
}

export interface HealthData {
  health_id: number;
  record_date: Date;
  steps: number;
  calories_burned: number;
  sleep_hours: number;
  water_intake: number;
  heart_rate: number;
  mood: string;
} 