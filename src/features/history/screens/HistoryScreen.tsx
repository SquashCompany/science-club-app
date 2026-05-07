import { Barbell, ClockCounterClockwise, Drop, ForkKnife, Timer, TrendUp, Trophy } from 'phosphor-react-native';
import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppScreen } from '@/src/shared/components/ui/AppScreen';
import { AppText } from '@/src/shared/components/ui/AppText';
import { useDietStore } from '@/src/features/diet/services/diet.store';

import { HistoryMealDayCard } from '../components/HistoryMealDayCard';
import { HistoryMetricCard } from '../components/HistoryMetricCard';
import { HistoryWorkoutCard } from '../components/HistoryWorkoutCard';
import { workoutHistory } from '../data/workoutHistory';
import { HistoryPeriod, HistoryTab } from '../types';
import {
  formatSeconds,
  formatShortNumber,
  getMealDayAdherence,
  getMealDayMacros,
  getWorkoutVolume,
  periodMatches,
  toMealHistoryEntry,
} from '../utils';
import { cn } from '@/src/shared/utils/cn';

const periods: { label: string; value: HistoryPeriod }[] = [
  { label: '7 dias', value: '7d' },
  { label: '30 dias', value: '30d' },
  { label: 'Tudo', value: 'all' },
];

export function HistoryScreen() {
  const [activeTab, setActiveTab] = useState<HistoryTab>('workouts');
  const [period, setPeriod] = useState<HistoryPeriod>('30d');
  const plan = useDietStore((state) => state.plan);
  const dayLogs = useDietStore((state) => state.dayLogs);

  const workouts = useMemo(
    () => workoutHistory.filter((entry) => periodMatches(entry.date, period)).sort((a, b) => b.date.localeCompare(a.date)),
    [period],
  );
  const mealDays = useMemo(
    () =>
      Object.values(dayLogs)
        .filter((dayLog) => periodMatches(dayLog.date, period))
        .map((dayLog) => ({
          dayLog,
          entry: toMealHistoryEntry(plan, dayLog),
          adherence: getMealDayAdherence(plan, dayLog),
        }))
        .sort((a, b) => b.entry.date.localeCompare(a.entry.date)),
    [dayLogs, period, plan],
  );

  const workoutVolume = workouts.reduce((total, entry) => total + getWorkoutVolume(entry), 0);
  const workoutDuration = workouts.reduce((total, entry) => total + entry.durationSeconds, 0);
  const bestProgression = workouts.reduce((best, entry) => Math.max(best, entry.progressions), 0);
  const mealMacroTotals = mealDays.map((item) => getMealDayMacros(item.entry));
  const avgCalories = mealMacroTotals.length
    ? mealMacroTotals.reduce((total, macros) => total + macros.calories, 0) / mealMacroTotals.length
    : 0;
  const avgProtein = mealMacroTotals.length
    ? mealMacroTotals.reduce((total, macros) => total + macros.protein, 0) / mealMacroTotals.length
    : 0;
  const avgAdherence = mealDays.length
    ? mealDays.reduce((total, item) => total + item.adherence, 0) / mealDays.length
    : 0;
  const daysOnTarget = mealDays.filter((item) => {
    const calories = getMealDayMacros(item.entry).calories;
    return calories >= plan.targets.calories * 0.9 && calories <= plan.targets.calories * 1.08;
  }).length;

  return (
    <AppScreen contentClassName="px-5 pb-36 pt-10">
      <Animated.View entering={FadeInDown.duration(420)}>
        <View className="mb-8 flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <AppText className="text-sm text-text-muted">Science Club</AppText>
            <AppText className="mt-2 text-5xl font-semibold leading-tight text-text-main">Histórico</AppText>
          </View>
          <View className="rounded-2xl border border-border-subtle bg-bg-surface px-4 py-3">
            <ClockCounterClockwise color="#A78BFA" size={23} weight="duotone" />
          </View>
        </View>

        <View className="mb-5 rounded-[28px] border border-border-subtle bg-bg-surface p-2">
          <View className="flex-row gap-2">
            {[
              { label: 'Treinos', value: 'workouts' as const, icon: Barbell },
              { label: 'Refeições', value: 'meals' as const, icon: ForkKnife },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.value;

              return (
                <Pressable
                  key={item.value}
                  accessibilityRole="button"
                  className={cn('min-h-[48px] flex-1 flex-row items-center justify-center gap-2 rounded-[20px]', active ? 'bg-brand-primary' : 'bg-transparent')}
                  onPress={() => setActiveTab(item.value)}
                >
                  <Icon color={active ? '#FFFFFF' : '#A1A1AA'} size={19} weight={active ? 'fill' : 'duotone'} />
                  <AppText className={cn('text-sm font-semibold', active ? 'text-white' : 'text-text-muted')}>{item.label}</AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mb-7 flex-row gap-2">
          {periods.map((item) => (
            <Pressable
              key={item.value}
              accessibilityRole="button"
              className={cn(
                'min-h-[42px] flex-1 items-center justify-center rounded-2xl border',
                period === item.value ? 'border-brand-primary bg-brand-primary/15' : 'border-border-subtle bg-bg-surface',
              )}
              onPress={() => setPeriod(item.value)}
            >
              <AppText className={cn('text-sm font-semibold', period === item.value ? 'text-brand-secondary' : 'text-text-muted')}>
                {item.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      {activeTab === 'workouts' ? (
        <Animated.View entering={FadeInDown.delay(80).duration(420)}>
          <View className="mb-6 flex-row gap-3">
            <HistoryMetricCard icon={Barbell} label="treinos" value={String(workouts.length)} caption="no periodo" />
            <HistoryMetricCard icon={TrendUp} label="volume" value={`${formatShortNumber(workoutVolume)}kg`} caption="carga total" tone="success" />
          </View>
          <View className="mb-8 flex-row gap-3">
            <HistoryMetricCard icon={Timer} label="tempo" value={formatSeconds(workoutDuration)} caption="somado" tone="neutral" />
            <HistoryMetricCard icon={Trophy} label="melhor dia" value={String(bestProgression)} caption="progressoes" tone="warning" />
          </View>

          <View className="mb-4 flex-row items-center justify-between">
            <AppText className="text-2xl font-semibold text-text-main">Treinos registrados</AppText>
            <AppText className="text-sm text-text-muted">{workouts.length} itens</AppText>
          </View>
          <View className="gap-4">
            {workouts.map((entry) => (
              <HistoryWorkoutCard
                key={entry.id}
                entry={entry}
                onPress={() => router.push(`/(app)/history/workouts/${entry.id}` as Href)}
              />
            ))}
          </View>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.delay(80).duration(420)}>
          <View className="mb-6 flex-row gap-3">
            <HistoryMetricCard icon={ForkKnife} label="kcal média" value={String(Math.round(avgCalories))} caption="por dia" />
            <HistoryMetricCard icon={TrendUp} label="aderência" value={`${Math.round(avgAdherence)}%`} caption="média" tone="success" />
          </View>
          <View className="mb-8 flex-row gap-3">
            <HistoryMetricCard icon={Drop} label="proteína" value={`${Math.round(avgProtein)}g`} caption="média/dia" tone="neutral" />
            <HistoryMetricCard icon={Trophy} label="na meta" value={String(daysOnTarget)} caption="dias" tone="warning" />
          </View>

          <View className="mb-4 flex-row items-center justify-between">
            <AppText className="text-2xl font-semibold text-text-main">Refeições por dia</AppText>
            <AppText className="text-sm text-text-muted">{mealDays.length} dias</AppText>
          </View>
          <View className="gap-4">
            {mealDays.map(({ entry, adherence }) => (
              <HistoryMealDayCard
                key={entry.date}
                adherence={adherence}
                entry={entry}
                onPress={() => router.push(`/(app)/history/meals/${entry.date}` as Href)}
              />
            ))}
          </View>
        </Animated.View>
      )}
    </AppScreen>
  );
}
