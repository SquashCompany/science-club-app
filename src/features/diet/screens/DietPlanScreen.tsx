import { ArrowLeft, CaretRight, Drop, NotePencil, Pill, UserCircle } from 'phosphor-react-native';
import { router, type Href } from 'expo-router';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppScreen } from '@/src/shared/components/ui/AppScreen';
import { AppText } from '@/src/shared/components/ui/AppText';

import { MacroProgress } from '../components/MacroProgress';
import { useDietStore } from '../services/diet.store';
import { getMealTotal, getPlanTotal } from '../utils';

export function DietPlanScreen() {
  const plan = useDietStore((state) => state.plan);
  const planTotal = getPlanTotal(plan);

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
          <AppText className="text-center text-base font-semibold text-text-main">Plano alimentar</AppText>
          <AppText className="mt-1 text-center text-xs text-text-muted">v{plan.version} - {plan.updatedAt}</AppText>
        </View>
        <View className="h-14 w-14 items-center justify-center rounded-full border border-border-subtle bg-bg-surface">
          <UserCircle color="#A78BFA" size={25} weight="duotone" />
        </View>
      </View>

      <Animated.View entering={FadeInDown.duration(420)}>
        <View className="mb-6 rounded-[32px] border border-border-subtle bg-bg-surface px-5 py-5">
          <AppText className="text-sm text-text-muted">{plan.professional}</AppText>
          <AppText className="mt-2 text-4xl font-semibold leading-tight text-text-main">{plan.name}</AppText>
          <AppText className="mt-3 text-base leading-snug text-text-muted">{plan.objective}</AppText>

          <View className="mt-6 gap-4">
            <MacroProgress label="Calorias" value={planTotal.calories} target={plan.targets.calories} unit=" kcal" tone="calories" />
            <MacroProgress label="Proteina" value={planTotal.protein} target={plan.targets.protein} tone="protein" />
            <MacroProgress label="Carboidratos" value={planTotal.carbs} target={plan.targets.carbs} tone="carbs" />
            <MacroProgress label="Gorduras" value={planTotal.fat} target={plan.targets.fat} tone="fat" />
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(420)} className="mb-7 gap-3">
        <View className="rounded-[24px] border border-border-subtle bg-bg-surface px-5 py-4">
          <View className="mb-3 flex-row items-center gap-3">
            <Drop color="#67E8F9" size={22} weight="duotone" />
            <AppText className="text-lg font-semibold text-text-main">Hidratacao</AppText>
          </View>
          <AppText className="text-base leading-relaxed text-text-muted">{plan.waterGuidance}</AppText>
        </View>

        <View className="rounded-[24px] border border-border-subtle bg-bg-surface px-5 py-4">
          <View className="mb-3 flex-row items-center gap-3">
            <Pill color="#A78BFA" size={22} weight="duotone" />
            <AppText className="text-lg font-semibold text-text-main">Suplementacao</AppText>
          </View>
          <AppText className="text-base leading-relaxed text-text-muted">{plan.supplementGuidance}</AppText>
        </View>

        <View className="rounded-[24px] border border-border-subtle bg-bg-surface px-5 py-4">
          <View className="mb-3 flex-row items-center gap-3">
            <NotePencil color="#A78BFA" size={22} weight="duotone" />
            <AppText className="text-lg font-semibold text-text-main">Observacoes</AppText>
          </View>
          <AppText className="text-base leading-relaxed text-text-muted">{plan.generalNotes}</AppText>
          <AppText className="mt-3 text-sm text-amber-200">Restricoes: {plan.restrictions}</AppText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(420)}>
        <AppText className="mb-4 text-2xl font-semibold text-text-main">Refeicoes do plano</AppText>
        <View className="overflow-hidden rounded-[28px] border border-border-subtle bg-bg-surface">
          {plan.meals.map((meal) => {
            const total = getMealTotal(meal);

            return (
              <Pressable
                key={meal.id}
                accessibilityRole="button"
                className="flex-row items-center border-b border-border-subtle px-4 py-4 last:border-b-0"
                onPress={() => router.push(`/(app)/diet/meals/${meal.id}` as Href)}
              >
                <View className="flex-1">
                  <AppText className="text-lg font-semibold text-text-main">{meal.name}</AppText>
                  <AppText className="mt-1 text-sm text-text-muted">
                    {meal.time} - {Math.round(total.calories)} kcal - {meal.foods.length} alimentos
                  </AppText>
                </View>
                <CaretRight color="#71717A" size={20} weight="bold" />
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    </AppScreen>
  );
}
