import { ArrowLeft, CalendarBlank, ChartLineUp, ForkKnife, TrendUp } from 'phosphor-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppScreen } from '@/src/shared/components/ui/AppScreen';
import { AppText } from '@/src/shared/components/ui/AppText';
import { cn } from '@/src/shared/utils/cn';

import { MacroProgress } from '../components/MacroProgress';
import { useDietStore } from '../services/diet.store';
import {
  formatShortDate,
  getAdherence,
  getConsumedMacros,
  getMealLog,
  getMealStatus,
  getStatusLabel,
  getProgressPercent,
} from '../utils';

export function DietHistoryScreen() {
  const plan = useDietStore((state) => state.plan);
  const activeDate = useDietStore((state) => state.selectedDate);
  const dayLogs = useDietStore((state) => state.dayLogs);
  const availableDates = Object.keys(dayLogs).sort();
  const [selectedDate, setSelectedDate] = useState(activeDate);
  const selectedLog = dayLogs[selectedDate] ?? dayLogs[availableDates[availableDates.length - 1]];
  const consumed = getConsumedMacros(selectedLog);
  const adherence = getAdherence(plan, selectedLog);
  const progressions = selectedLog?.mealLogs.filter((mealLog) =>
    mealLog.foodLogs.some((foodLog) => foodLog.actualGrams > foodLog.plannedGrams || foodLog.replacedBy),
  ).length ?? 0;

  return (
    <AppScreen contentClassName="px-5 pb-32 pt-8">
      <View className="mb-8 flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          className="h-14 w-14 items-center justify-center rounded-full border border-border-subtle bg-bg-surface"
          onPress={() => router.back()}
        >
          <ArrowLeft color="#FFFFFF" size={26} weight="bold" />
        </Pressable>
        <View className="flex-1 px-4">
          <AppText className="text-center text-base font-semibold text-text-main">Historico alimentar</AppText>
          <AppText className="mt-1 text-center text-xs text-text-muted">calorias, macros e aderencia</AppText>
        </View>
        <View className="h-14 w-14 items-center justify-center rounded-full border border-border-subtle bg-bg-surface">
          <CalendarBlank color="#A78BFA" size={22} weight="duotone" />
        </View>
      </View>

      <Animated.View entering={FadeInDown.duration(420)} className="mb-6">
        <View className="flex-row gap-2">
          {availableDates.map((date) => (
            <Pressable
              key={date}
              accessibilityRole="button"
              className={cn(
                'flex-1 rounded-2xl border px-3 py-3',
                date === selectedDate ? 'border-brand-primary bg-brand-primary' : 'border-border-subtle bg-bg-surface',
              )}
              onPress={() => setSelectedDate(date)}
            >
              <AppText className={cn('text-center text-sm font-semibold', date === selectedDate ? 'text-white' : 'text-text-main')}>
                {formatShortDate(date)}
              </AppText>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(420)}>
        <View className="mb-6 rounded-[32px] border border-border-subtle bg-bg-surface px-5 py-5">
          <View className="mb-6 flex-row items-center justify-between">
            <View>
              <AppText className="text-sm text-text-muted">Resumo do dia</AppText>
              <AppText className="mt-2 text-4xl font-semibold text-text-main">{Math.round(consumed.calories)} kcal</AppText>
            </View>
            <View className="rounded-2xl bg-brand-primary/12 px-4 py-3">
              <AppText className="text-sm font-semibold text-brand-secondary">{adherence}%</AppText>
              <AppText className="mt-1 text-xs text-text-muted">aderencia</AppText>
            </View>
          </View>

          <View className="gap-4">
            <MacroProgress label="Calorias" value={consumed.calories} target={plan.targets.calories} unit=" kcal" tone="calories" />
            <MacroProgress label="Proteina" value={consumed.protein} target={plan.targets.protein} tone="protein" />
            <MacroProgress label="Carboidratos" value={consumed.carbs} target={plan.targets.carbs} tone="carbs" />
            <MacroProgress label="Gorduras" value={consumed.fat} target={plan.targets.fat} tone="fat" />
          </View>

          <View className="mt-6 flex-row gap-3">
            <View className="flex-1 rounded-2xl bg-bg-base px-4 py-4">
              <ForkKnife color="#A78BFA" size={21} weight="duotone" />
              <AppText className="mt-3 text-2xl font-semibold text-text-main">{selectedLog?.mealLogs.length ?? 0}</AppText>
              <AppText className="mt-1 text-xs text-text-muted">refeicoes registradas</AppText>
            </View>
            <View className="flex-1 rounded-2xl bg-bg-base px-4 py-4">
              <TrendUp color="#67E8F9" size={21} weight="duotone" />
              <AppText className="mt-3 text-2xl font-semibold text-text-main">{progressions}</AppText>
              <AppText className="mt-1 text-xs text-text-muted">ajustes e trocas</AppText>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(420)}>
        <View className="mb-4 flex-row items-center justify-between">
          <AppText className="text-2xl font-semibold text-text-main">Refeicoes do dia</AppText>
          <ChartLineUp color="#71717A" size={21} weight="duotone" />
        </View>

        <View className="gap-3">
          {plan.meals.map((meal) => {
            const mealLog = getMealLog(selectedLog, meal.id);
            const status = getMealStatus(meal, mealLog);
            const calories = getConsumedMacros({ date: selectedLog?.date ?? selectedDate, waterMl: 0, mealLogs: mealLog ? [mealLog] : [] }).calories;
            const percent = getProgressPercent(calories, meal.foods.reduce((acc, food) => acc + food.nutrition.calories, 0));

            return (
              <View key={meal.id} className="rounded-[24px] border border-border-subtle bg-bg-surface px-4 py-4">
                <View className="flex-row items-center justify-between">
                  <View>
                    <AppText className="text-lg font-semibold text-text-main">{meal.name}</AppText>
                    <AppText className="mt-1 text-sm text-text-muted">{meal.time} - {getStatusLabel(status)}</AppText>
                  </View>
                  <AppText className="text-base font-semibold text-text-main">{Math.round(calories)} kcal</AppText>
                </View>
                <View className="mt-4 h-2 overflow-hidden rounded-full bg-bg-base">
                  <View className="h-full rounded-full bg-brand-primary" style={{ width: `${percent}%` }} />
                </View>
              </View>
            );
          })}
        </View>
      </Animated.View>
    </AppScreen>
  );
}
