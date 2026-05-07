import { CalendarBlank, Drop, ForkKnife, ListChecks, Notebook, Scales } from 'phosphor-react-native';
import { router, type Href } from 'expo-router';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppScreen } from '@/src/shared/components/ui/AppScreen';
import { AppText } from '@/src/shared/components/ui/AppText';

import { DietMealTimelineItem } from '../components/DietMealTimelineItem';
import { MacroProgress } from '../components/MacroProgress';
import { useDietStore, useSelectedDietDay } from '../services/diet.store';
import {
  getAdherence,
  getConsumedMacros,
  getMealLog,
  getMealStatus,
  getNextMeal,
  getProgressPercent,
} from '../utils';

export function DietDashboardScreen() {
  const plan = useDietStore((state) => state.plan);
  const addWater = useDietStore((state) => state.addWater);
  const dayLog = useSelectedDietDay();
  const consumed = getConsumedMacros(dayLog);
  const adherence = getAdherence(plan, dayLog);
  const nextMeal = getNextMeal(plan, dayLog);
  const remainingCalories = plan.targets.calories - consumed.calories;
  const caloriePercent = getProgressPercent(consumed.calories, plan.targets.calories);

  return (
    <AppScreen contentClassName="px-5 pb-36 pt-10">
      <Animated.View entering={FadeInDown.duration(420)}>
        <View className="mb-8 flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <AppText className="text-sm text-text-muted">Science Club</AppText>
            <AppText className="mt-2 text-5xl font-semibold leading-tight text-text-main">Dieta</AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            className="rounded-2xl border border-border-subtle bg-bg-surface px-4 py-3"
            onPress={() => router.push('/(app)/diet/history' as Href)}
          >
            <CalendarBlank color="#A78BFA" size={22} weight="duotone" />
          </Pressable>
        </View>

        <View className="mb-6 overflow-hidden rounded-[32px] border border-brand-primary/35 bg-bg-surface p-5">
          <View className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-brand-primary/20" />
          <View className="mb-8 flex-row items-center justify-between">
            <View className="rounded-full bg-brand-primary/15 px-3 py-1.5">
              <AppText className="text-xs font-semibold text-brand-secondary">Meta de hoje</AppText>
            </View>
            <AppText className="text-sm font-semibold text-text-muted">{adherence}% aderencia</AppText>
          </View>

          <View className="flex-row items-end justify-between gap-4">
            <View className="flex-1">
              <AppText className="text-5xl font-semibold tracking-tight text-text-main">{Math.round(consumed.calories)}</AppText>
              <AppText className="mt-2 text-base text-text-muted">de {plan.targets.calories} kcal consumidas</AppText>
            </View>
            <View className="items-end">
              <AppText className="text-sm text-text-muted">{remainingCalories >= 0 ? 'Restam' : 'Passou'}</AppText>
              <AppText className="mt-1 text-2xl font-semibold text-brand-secondary">{Math.abs(Math.round(remainingCalories))}</AppText>
            </View>
          </View>

          <View className="mt-6 h-3 overflow-hidden rounded-full bg-bg-base">
            <View className="h-full rounded-full bg-brand-primary" style={{ width: `${caloriePercent}%` }} />
          </View>

          <View className="mt-6 gap-4">
            <MacroProgress label="Proteina" value={consumed.protein} target={plan.targets.protein} tone="protein" />
            <MacroProgress label="Carboidratos" value={consumed.carbs} target={plan.targets.carbs} tone="carbs" />
            <MacroProgress label="Gorduras" value={consumed.fat} target={plan.targets.fat} tone="fat" />
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(420)} className="mb-7">
        <View className="mb-4 flex-row items-center justify-between">
          <AppText className="text-2xl font-semibold text-text-main">Proxima refeicao</AppText>
          <AppText className="text-sm text-text-muted">{nextMeal.time}</AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          className="rounded-[28px] border border-border-subtle bg-bg-surface px-5 py-5"
          onPress={() => router.push(`/(app)/diet/meals/${nextMeal.id}` as Href)}
        >
          <View className="flex-row items-start gap-4">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/12">
              <ForkKnife color="#A78BFA" size={25} weight="duotone" />
            </View>
            <View className="flex-1">
              <AppText className="text-3xl font-semibold leading-tight text-text-main">{nextMeal.name}</AppText>
              <AppText className="mt-2 text-base leading-snug text-text-muted">
                {nextMeal.foods.map((food) => food.name).slice(0, 3).join(' + ')}
              </AppText>
            </View>
          </View>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(420)} className="mb-8">
        <View className="flex-row gap-3">
          {[
            { label: 'Plano', icon: Notebook, href: '/(app)/diet/plan' },
            { label: 'Balança', icon: Scales, href: '/(app)/diet/log' },
            { label: 'Historico', icon: ListChecks, href: '/(app)/diet/history' },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Pressable
                key={item.label}
                accessibilityRole="button"
                className="flex-1 items-center rounded-[22px] border border-border-subtle bg-bg-surface px-3 py-4"
                onPress={() => router.push(item.href as Href)}
              >
                <Icon color="#A78BFA" size={23} weight="duotone" />
                <AppText className="mt-2 text-sm font-semibold text-text-main">{item.label}</AppText>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          className="mt-3 flex-row items-center rounded-[22px] border border-border-subtle bg-bg-surface px-4 py-4"
          onPress={() => addWater(500)}
        >
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/10">
            <Drop color="#67E8F9" size={22} weight="duotone" />
          </View>
          <View className="ml-4 flex-1">
            <AppText className="text-base font-semibold text-text-main">Agua do dia</AppText>
            <AppText className="mt-1 text-sm text-text-muted">
              {dayLog.waterMl}ml / {plan.targets.waterMl}ml
            </AppText>
          </View>
          <AppText className="text-sm font-semibold text-brand-secondary">+500ml</AppText>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(160).duration(420)}>
        <View className="mb-4 flex-row items-center justify-between">
          <AppText className="text-2xl font-semibold text-text-main">Refeicoes</AppText>
          <AppText className="text-sm text-text-muted">{plan.meals.length} no plano</AppText>
        </View>

        <View className="gap-3">
          {plan.meals.map((meal) => {
            const status = getMealStatus(meal, getMealLog(dayLog, meal.id));

            return (
              <DietMealTimelineItem
                key={meal.id}
                active={meal.id === nextMeal.id}
                meal={meal}
                status={status}
                onPress={() => router.push(`/(app)/diet/meals/${meal.id}` as Href)}
              />
            );
          })}
        </View>
      </Animated.View>
    </AppScreen>
  );
}
