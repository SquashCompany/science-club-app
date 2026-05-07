import { ArrowLeft, Drop, ForkKnife, TrendUp } from 'phosphor-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppScreen } from '@/src/shared/components/ui/AppScreen';
import { AppText } from '@/src/shared/components/ui/AppText';
import { useDietStore } from '@/src/features/diet/services/diet.store';
import { getStatusLabel } from '@/src/features/diet/utils';

import { formatDateLabel, getMealDayAdherence, getMealDayMacros, toMealHistoryEntry } from '../utils';

export function MealHistoryDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const plan = useDietStore((state) => state.plan);
  const dayLogs = useDietStore((state) => state.dayLogs);
  const dayLog = dayLogs[date] ?? Object.values(dayLogs).sort((a, b) => b.date.localeCompare(a.date))[0];
  const entry = toMealHistoryEntry(plan, dayLog);
  const macros = getMealDayMacros(entry);
  const adherence = getMealDayAdherence(plan, dayLog);

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
          <AppText className="text-center text-base font-semibold text-text-main">{formatDateLabel(entry.date)}</AppText>
          <AppText className="mt-1 text-center text-xs text-text-muted">histórico alimentar</AppText>
        </View>
        <View className="h-14 w-14 items-center justify-center rounded-full border border-border-subtle bg-bg-surface">
          <ForkKnife color="#A78BFA" size={23} weight="duotone" />
        </View>
      </View>

      <Animated.View entering={FadeInDown.duration(420)}>
        <View className="mb-6 rounded-[32px] border border-border-subtle bg-bg-surface p-5">
          <AppText className="text-sm text-text-muted">Resumo do dia</AppText>
          <AppText className="mt-2 text-5xl font-semibold tracking-tight text-text-main">{Math.round(macros.calories)}</AppText>
          <AppText className="mt-1 text-base text-text-muted">de {entry.targets.calories} kcal</AppText>

          <View className="mt-6 flex-row gap-2">
            {[
              { label: 'Proteina', value: `${Math.round(macros.protein)}g`, color: 'text-sky-300' },
              { label: 'Carbo', value: `${Math.round(macros.carbs)}g`, color: 'text-amber-200' },
              { label: 'Gordura', value: `${Math.round(macros.fat)}g`, color: 'text-rose-300' },
            ].map((item) => (
              <View key={item.label} className="flex-1 rounded-2xl bg-bg-base px-3 py-3">
                <AppText className="text-xs text-text-muted">{item.label}</AppText>
                <AppText className={`mt-2 text-base font-semibold ${item.color}`}>{item.value}</AppText>
              </View>
            ))}
          </View>

          <View className="mt-6 flex-row gap-3">
            <View className="flex-1 rounded-2xl bg-brand-primary/10 px-4 py-4">
              <TrendUp color="#A78BFA" size={20} weight="duotone" />
              <AppText className="mt-3 text-2xl font-semibold text-text-main">{adherence}%</AppText>
              <AppText className="text-xs text-text-muted">aderencia</AppText>
            </View>
            <View className="flex-1 rounded-2xl bg-cyan-300/10 px-4 py-4">
              <Drop color="#67E8F9" size={20} weight="duotone" />
              <AppText className="mt-3 text-2xl font-semibold text-text-main">{entry.waterMl}ml</AppText>
              <AppText className="text-xs text-text-muted">agua</AppText>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(420)}>
        <AppText className="mb-4 text-2xl font-semibold text-text-main">Refeições</AppText>
        <View className="gap-4">
          {entry.meals.map((meal) => {
            const mealMacros = meal.foods.reduce(
              (acc, food) => ({
                calories: acc.calories + food.nutrition.calories,
                protein: acc.protein + food.nutrition.protein,
                carbs: acc.carbs + food.nutrition.carbs,
                fat: acc.fat + food.nutrition.fat,
              }),
              { calories: 0, protein: 0, carbs: 0, fat: 0 },
            );

            return (
              <View key={meal.id} className="rounded-[28px] border border-border-subtle bg-bg-surface px-4 py-4">
                <View className="mb-4 flex-row items-start justify-between gap-4">
                  <View className="flex-1">
                    <AppText className="text-xl font-semibold text-text-main">{meal.name}</AppText>
                    <AppText className="mt-1 text-sm text-text-muted">{meal.time} - {getStatusLabel(meal.status)}</AppText>
                  </View>
                  <AppText className="text-base font-semibold text-text-main">{Math.round(mealMacros.calories)} kcal</AppText>
                </View>

                <View className="overflow-hidden rounded-2xl bg-bg-base">
                  {meal.foods.map((food) => (
                    <View key={food.id} className="border-b border-border-subtle px-4 py-3 last:border-b-0">
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1">
                          <AppText className="text-base font-semibold text-text-main">{food.name}</AppText>
                          <AppText className="mt-1 text-sm text-text-muted">
                            {Math.round(food.actualGrams)}g consumidos / {food.plannedGrams}g plano
                          </AppText>
                          {food.replacedBy ? <AppText className="mt-1 text-sm text-brand-secondary">Substituição usada neste dia</AppText> : null}
                        </View>
                        <AppText className="text-sm font-semibold text-text-main">{Math.round(food.nutrition.calories)} kcal</AppText>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </Animated.View>
    </AppScreen>
  );
}
