export type StudentStatus = 'active' | 'inactive' | 'pending' | 'overdue';

export type ProfilePlan = {
  name: string;
  status: StudentStatus;
  startDate: string;
  renewalDate: string;
  mesocycle: string;
  nextCheckIn: string;
  objective: string;
};

export type ProfileCoach = {
  name: string;
  role: string;
  responseTime: string;
  assignedSince: string;
};

export type ProfileMetrics = {
  workoutsDone: number;
  validSets: number;
  totalVolume: string;
  progressions: number;
  questionnaires: number;
  adherence: number;
};

export type BodySnapshot = {
  age: number;
  weightKg: number;
  heightCm: number;
  bodyFatPercent: number;
  updatedAt: string;
};

export type ProfileDocument = {
  id: string;
  title: string;
  category: 'contract' | 'plan' | 'exam' | 'terms';
  status: 'available' | 'reviewed' | 'signed' | 'pending';
  date: string;
  description: string;
};

export type ProfilePreferences = {
  workoutReminders: boolean;
  mealReminders: boolean;
  assessmentAlerts: boolean;
  privateProgress: boolean;
  communicationChannel: 'whatsapp' | 'email' | 'app';
};

export type StudentProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  avatarVariant: number;
  plan: ProfilePlan;
  coach: ProfileCoach;
  metrics: ProfileMetrics;
  body: BodySnapshot;
  observations: string;
  restrictions: string[];
  currentWorkout: string;
  currentDiet: string;
  documents: ProfileDocument[];
  preferences: ProfilePreferences;
};
