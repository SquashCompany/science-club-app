import { MacroValues, MealStatus } from '@/src/features/diet/types';

export type HistoryPeriod = '7d' | '30d' | 'all';

export type HistoryTab = 'workouts' | 'meals';

export type HistoryWorkoutSet = {
  id: string;
  targetReps: number;
  actualReps: number;
  previousWeightKg?: number;
  weightKg?: number;
  durationSeconds?: number;
  completed: boolean;
};

export type HistoryWorkoutExercise = {
  id: string;
  name: string;
  muscle: string;
  sets: HistoryWorkoutSet[];
};

export type HistoryWorkoutEntry = {
  id: string;
  date: string;
  title: string;
  sheetTitle: string;
  durationSeconds: number;
  completedSets: number;
  totalSets: number;
  progressions: number;
  comment?: string;
  photoUri?: string;
  exercises: HistoryWorkoutExercise[];
};

export type HistoryMealFood = {
  id: string;
  name: string;
  plannedGrams: number;
  actualGrams: number;
  nutrition: MacroValues;
  replacedBy?: string;
};

export type HistoryMealEntry = {
  id: string;
  name: string;
  time: string;
  status: MealStatus;
  foods: HistoryMealFood[];
};

export type HistoryMealDayEntry = {
  date: string;
  waterMl: number;
  meals: HistoryMealEntry[];
  targets: MacroValues & {
    waterMl: number;
  };
};

export type HistoryMetricSummary = {
  label: string;
  value: string;
  caption: string;
};
