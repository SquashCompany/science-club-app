import { DietDayLog, DietPlan } from '@/src/features/diet/types';
import { getAdherence, getConsumedMacros, getMealLog, getMealStatus, sumMacros } from '@/src/features/diet/utils';

import {
  HistoryMealDayEntry,
  HistoryMealEntry,
  HistoryMealFood,
  HistoryPeriod,
  HistoryWorkoutEntry,
  HistoryWorkoutExercise,
} from './types';

export function formatDateLabel(date: string) {
  const [, month, day] = date.split('-');
  return `${day}/${month}`;
}

export function formatSeconds(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatShortNumber(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  }

  return String(Math.round(value));
}

export function getSetVolume(set: { actualReps: number; weightKg?: number; completed: boolean }) {
  if (!set.completed || !set.weightKg) return 0;
  return set.weightKg * set.actualReps;
}

export function getExerciseVolume(exercise: HistoryWorkoutExercise) {
  return exercise.sets.reduce((total, set) => total + getSetVolume(set), 0);
}

export function getWorkoutVolume(entry: HistoryWorkoutEntry) {
  return entry.exercises.reduce((total, exercise) => total + getExerciseVolume(exercise), 0);
}

export function getBestProgression(entry: HistoryWorkoutEntry) {
  return entry.exercises
    .flatMap((exercise) =>
      exercise.sets.map((set) => ({
        exercise: exercise.name,
        delta: set.weightKg && set.previousWeightKg ? set.weightKg - set.previousWeightKg : 0,
      })),
    )
    .sort((a, b) => b.delta - a.delta)[0];
}

export function getWorkoutCompletion(entry: HistoryWorkoutEntry) {
  if (entry.totalSets <= 0) return 0;
  return Math.round((entry.completedSets / entry.totalSets) * 100);
}

export function periodMatches(date: string, period: HistoryPeriod) {
  if (period === 'all') return true;

  const days = period === '7d' ? 7 : 30;
  const target = new Date(`${date}T00:00:00`);
  const today = new Date('2026-05-05T00:00:00');
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);
  return diffDays >= 0 && diffDays <= days;
}

export function toMealHistoryEntry(plan: DietPlan, dayLog: DietDayLog): HistoryMealDayEntry {
  const meals: HistoryMealEntry[] = plan.meals.map((meal) => {
    const mealLog = getMealLog(dayLog, meal.id);
    const foods: HistoryMealFood[] = meal.foods.map((food) => {
      const foodLog = mealLog?.foodLogs.find((log) => log.foodId === food.id);

      return {
        id: food.id,
        name: foodLog?.selectedFoodName ?? food.name,
        plannedGrams: foodLog?.plannedGrams ?? food.plannedGrams,
        actualGrams: foodLog?.actualGrams ?? 0,
        nutrition: foodLog?.nutrition ?? { calories: 0, protein: 0, carbs: 0, fat: 0 },
        replacedBy: foodLog?.replacedBy,
      };
    });

    return {
      id: meal.id,
      name: meal.name,
      time: meal.time,
      status: getMealStatus(meal, mealLog),
      foods,
    };
  });

  return {
    date: dayLog.date,
    waterMl: dayLog.waterMl,
    meals,
    targets: plan.targets,
  };
}

export function getMealDayMacros(entry: HistoryMealDayEntry) {
  return sumMacros(entry.meals.flatMap((meal) => meal.foods.map((food) => food.nutrition)));
}

export function getMealDayAdherence(plan: DietPlan, dayLog: DietDayLog) {
  return getAdherence(plan, dayLog);
}

export function getMealDayStatus(entry: HistoryMealDayEntry) {
  const macros = getMealDayMacros(entry);
  const ratio = entry.targets.calories > 0 ? macros.calories / entry.targets.calories : 0;
  const doneMeals = entry.meals.filter((meal) => meal.status === 'done').length;
  const partialMeals = entry.meals.filter((meal) => meal.status === 'partial').length;

  if (doneMeals + partialMeals === 0) return 'Sem registros';
  if (ratio >= 0.9 && ratio <= 1.08) return 'Dentro da meta';
  if (ratio > 1.08) return 'Acima da meta';
  return 'Consumo baixo';
}

export function getDietConsumedMacros(dayLog: DietDayLog) {
  return getConsumedMacros(dayLog);
}
