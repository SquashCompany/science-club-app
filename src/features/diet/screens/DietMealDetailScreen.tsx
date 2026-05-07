import { ArrowCounterClockwise, ArrowLeft, CheckCircle, Prohibit, Scales } from 'phosphor-react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppButton } from '@/src/shared/components/ui/AppButton';
import { AppScreen } from '@/src/shared/components/ui/AppScreen';
import { AppText } from '@/src/shared/components/ui/AppText';

import { DietFoodRow } from '../components/DietFoodRow';
import { MacroProgress } from '../components/MacroProgress';
import { useDietStore, useSelectedDietDay } from '../services/diet.store';
import {
  getFoodLog,
  getMealConsumedMacros,
  getMealLog,
  getMealStatus,
  getMealTotal,
  getStatusLabel,
} from '../utils';

export function DietMealDetailScreen() {
  const { mealId } = useLocalSearchParams<{ mealId: string }>();
  const plan = useDietStore((state) => state.plan);
  const markMealConsumed = useDietStore((state) => state.markMealConsumed);
  const skipMeal = useDietStore((state) => state.skipMeal);
  const resetMeal = useDietStore((state) => state.resetMeal);
  const dayLog = useSelectedDietDay();
  const meal = plan.meals.find((item) => item.id === mealId) ?? plan.meals[0];
  const mealLog = getMealLog(dayLog, meal.id);
  const status = getMealStatus(meal, mealLog);
  const plannedTotal = getMealTotal(meal);
  const consumedTotal = getMealConsumedMacros(mealLog);

  const confirmSkip = () => {
    Alert.alert('Pular refeicao?', 'Ela ficara registrada no historico de hoje como refeicao pulada.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Pular', style: 'destructive', onPress: () => skipMeal(meal.id) },
    ]);
  };

  return (
    <AppScreen contentClassName="px-5 pb-36 pt-8">
      <View className="mb-8 flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          className="h-14 w-14 items-center justify-center rounded-full border border-border-subtle bg-bg-surface"
          onPress={() => router.back()}
        >
          <ArrowLeft color="#FFFFFF" size={26} weight="bold" />
        </Pressable>
        <View className="flex-1 px-4">
          <AppText className="text-center text-base font-semibold text-text-main">{meal.time}</AppText>
          <AppText className="mt-1 text-center text-xs text-text-muted">{getStatusLabel(status)}</AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          className="h-14 w-14 items-center justify-center rounded-full border border-border-subtle bg-bg-surface"
          onPress={() => resetMeal(meal.id)}
        >
          <ArrowCounterClockwise color="#A78BFA" size={22} weight="bold" />
        </Pressable>
      </View>

      <Animated.View entering={FadeInDown.duration(420)}>
        <View className="mb-6 rounded-[32px] border border-border-subtle bg-bg-surface px-5 py-5">
          <View className="mb-5 flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <AppText className="text-sm text-text-muted">{meal.context}</AppText>
              <AppText className="mt-2 text-4xl font-semibold leading-tight text-text-main">{meal.name}</AppText>
              {meal.notes ? <AppText className="mt-3 text-base leading-snug text-text-muted">{meal.notes}</AppText> : null}
            </View>
            <View className="rounded-2xl bg-brand-primary/12 px-3 py-2">
              <AppText className="text-sm font-semibold text-brand-secondary">{Math.round(plannedTotal.calories)} kcal</AppText>
            </View>
          </View>

          <View className="gap-4">
            <MacroProgress label="Consumido" value={consumedTotal.calories} target={plannedTotal.calories} unit=" kcal" tone="calories" />
            <MacroProgress label="Proteina" value={consumedTotal.protein} target={plannedTotal.protein} tone="protein" />
            <MacroProgress label="Carboidratos" value={consumedTotal.carbs} target={plannedTotal.carbs} tone="carbs" />
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(420)} className="mb-6">
        <View className="mb-4 flex-row items-center justify-between">
          <AppText className="text-2xl font-semibold text-text-main">Alimentos</AppText>
          <AppText className="text-sm text-text-muted">{meal.foods.length} itens</AppText>
        </View>

        <View className="overflow-hidden rounded-[28px] border border-border-subtle bg-bg-surface">
          {meal.foods.map((food) => (
            <DietFoodRow
              key={food.id}
              food={food}
              log={getFoodLog(mealLog, food.id)}
              onLog={() => router.push(`/(app)/diet/log?mealId=${meal.id}&foodId=${food.id}` as Href)}
              onSwap={() => {
                const replacement = food.substitutions?.[0];
                router.push(`/(app)/diet/log?mealId=${meal.id}&foodId=${food.id}&replacementId=${replacement?.id ?? ''}` as Href);
              }}
            />
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(420)} className="gap-3">
        <AppButton
          leftIcon={<CheckCircle color="#FFFFFF" size={20} weight="bold" />}
          onPress={() => markMealConsumed(meal.id)}
        >
          Marcar refeicao consumida
        </AppButton>

        <AppButton
          variant="secondary"
          leftIcon={<Scales color="#A78BFA" size={20} weight="bold" />}
          onPress={() => router.push(`/(app)/diet/log?mealId=${meal.id}` as Href)}
        >
          Registrar com balanca
        </AppButton>

        <Pressable
          accessibilityRole="button"
          className="min-h-[58px] flex-row items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10"
          onPress={confirmSkip}
        >
          <Prohibit color="#FCA5A5" size={20} weight="bold" />
          <AppText className="text-base font-semibold text-red-200">Pular refeicao</AppText>
        </Pressable>
      </Animated.View>
    </AppScreen>
  );
}
