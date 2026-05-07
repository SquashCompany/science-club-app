import { ArrowLeft, Check, ForkKnife, Scales, Swap } from 'phosphor-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppButton } from '@/src/shared/components/ui/AppButton';
import { AppScreen } from '@/src/shared/components/ui/AppScreen';
import { AppText } from '@/src/shared/components/ui/AppText';
import { cn } from '@/src/shared/utils/cn';

import { useDietStore } from '../services/diet.store';
import { DietFoodSubstitution } from '../types';
import { formatMacro, scaleNutrition } from '../utils';

export function DietLogScreen() {
  const params = useLocalSearchParams<{ mealId?: string; foodId?: string; replacementId?: string }>();
  const plan = useDietStore((state) => state.plan);
  const logFood = useDietStore((state) => state.logFood);
  const initialMeal = plan.meals.find((meal) => meal.id === params.mealId) ?? plan.meals[0];
  const [mealId, setMealId] = useState(initialMeal.id);
  const selectedMeal = plan.meals.find((meal) => meal.id === mealId) ?? initialMeal;
  const initialFood = selectedMeal.foods.find((food) => food.id === params.foodId) ?? selectedMeal.foods[0];
  const [foodId, setFoodId] = useState(initialFood.id);
  const selectedFood = selectedMeal.foods.find((food) => food.id === foodId) ?? selectedMeal.foods[0];
  const initialReplacement = selectedFood.substitutions?.find((item) => item.id === params.replacementId);
  const [replacement, setReplacement] = useState<DietFoodSubstitution | undefined>(initialReplacement);
  const source = replacement ?? selectedFood;
  const [grams, setGrams] = useState(String(source.plannedGrams));

  const nutrition = useMemo(() => {
    const numericGrams = Number(grams.replace(',', '.'));
    return scaleNutrition(source, Number.isFinite(numericGrams) ? numericGrams : 0);
  }, [grams, source]);

  const save = () => {
    const numericGrams = Number(grams.replace(',', '.'));
    logFood({
      mealId: selectedMeal.id,
      foodId: selectedFood.id,
      actualGrams: Number.isFinite(numericGrams) ? numericGrams : 0,
      replacement,
    });
    router.replace(`/(app)/diet/meals/${selectedMeal.id}`);
  };

  return (
    <AppScreen keyboard contentClassName="px-5 pb-12 pt-8">
        <View className="mb-8 flex-row items-center justify-between">
          <Pressable
            accessibilityRole="button"
            className="h-14 w-14 items-center justify-center rounded-full border border-border-subtle bg-bg-surface"
            onPress={() => router.back()}
          >
            <ArrowLeft color="#FFFFFF" size={26} weight="bold" />
          </Pressable>
          <View className="flex-1 px-4">
            <AppText className="text-center text-base font-semibold text-text-main">Registro com balanca</AppText>
            <AppText className="mt-1 text-center text-xs text-text-muted">manual em gramas</AppText>
          </View>
          <View className="h-14 w-14 items-center justify-center rounded-full border border-border-subtle bg-bg-surface">
            <Scales color="#A78BFA" size={22} weight="duotone" />
          </View>
        </View>

        <Animated.View entering={FadeInDown.duration(420)} className="mb-6">
          <AppText className="mb-3 text-sm font-semibold text-text-muted">Refeicao</AppText>
          <View className="flex-row flex-wrap gap-2">
            {plan.meals.map((meal) => (
              <Pressable
                key={meal.id}
                accessibilityRole="button"
                className={cn(
                  'rounded-full border px-4 py-2',
                  meal.id === selectedMeal.id ? 'border-brand-primary bg-brand-primary' : 'border-border-subtle bg-bg-surface',
                )}
                onPress={() => {
                  setMealId(meal.id);
                  setFoodId(meal.foods[0].id);
                  setReplacement(undefined);
                  setGrams(String(meal.foods[0].plannedGrams));
                }}
              >
                <AppText className={cn('text-sm font-semibold', meal.id === selectedMeal.id ? 'text-white' : 'text-text-main')}>
                  {meal.name}
                </AppText>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(420)} className="mb-6">
          <AppText className="mb-3 text-sm font-semibold text-text-muted">Alimento</AppText>
          <View className="gap-2">
            {selectedMeal.foods.map((food) => (
              <Pressable
                key={food.id}
                accessibilityRole="button"
                className={cn(
                  'flex-row items-center rounded-[22px] border px-4 py-4',
                  food.id === selectedFood.id ? 'border-brand-primary bg-brand-primary/10' : 'border-border-subtle bg-bg-surface',
                )}
                onPress={() => {
                  setFoodId(food.id);
                  setReplacement(undefined);
                  setGrams(String(food.plannedGrams));
                }}
              >
                <ForkKnife color={food.id === selectedFood.id ? '#A78BFA' : '#71717A'} size={20} weight="duotone" />
                <View className="ml-3 flex-1">
                  <AppText className="text-base font-semibold text-text-main">{food.name}</AppText>
                  <AppText className="mt-1 text-sm text-text-muted">{food.displayQuantity}</AppText>
                </View>
                {food.id === selectedFood.id ? <Check color="#A78BFA" size={18} weight="bold" /> : null}
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {selectedFood.substitutions?.length ? (
          <Animated.View entering={FadeInDown.delay(100).duration(420)} className="mb-6">
            <View className="mb-3 flex-row items-center gap-2">
              <Swap color="#A78BFA" size={18} weight="bold" />
              <AppText className="text-sm font-semibold text-text-muted">Substituicao para hoje</AppText>
            </View>
            <View className="gap-2">
              <Pressable
                accessibilityRole="button"
                className={cn(
                  'rounded-[20px] border px-4 py-3',
                  !replacement ? 'border-brand-primary bg-brand-primary/10' : 'border-border-subtle bg-bg-surface',
                )}
                onPress={() => {
                  setReplacement(undefined);
                  setGrams(String(selectedFood.plannedGrams));
                }}
              >
                <AppText className="text-base font-semibold text-text-main">{selectedFood.name}</AppText>
                <AppText className="mt-1 text-sm text-text-muted">Manter alimento do plano</AppText>
              </Pressable>
              {selectedFood.substitutions.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  className={cn(
                    'rounded-[20px] border px-4 py-3',
                    replacement?.id === item.id ? 'border-brand-primary bg-brand-primary/10' : 'border-border-subtle bg-bg-surface',
                  )}
                  onPress={() => {
                    setReplacement(item);
                    setGrams(String(item.plannedGrams));
                  }}
                >
                  <AppText className="text-base font-semibold text-text-main">{item.name}</AppText>
                  <AppText className="mt-1 text-sm text-text-muted">{item.displayQuantity}</AppText>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(140).duration(420)} className="mb-6 rounded-[32px] border border-border-subtle bg-bg-surface p-5">
          <AppText className="text-sm text-text-muted">Peso real consumido</AppText>
          <View className="mt-4 flex-row items-end gap-3">
            <TextInput
              className="flex-1 border-b border-brand-primary pb-3 text-6xl font-semibold tracking-tight text-text-main"
              cursorColor="#8B5CF6"
              keyboardType="decimal-pad"
              onChangeText={setGrams}
              placeholder="0"
              placeholderTextColor="#3F3F46"
              selectionColor="#8B5CF6"
              value={grams}
            />
            <AppText className="pb-4 text-2xl font-semibold text-text-muted">g</AppText>
          </View>

          <View className="mt-6 flex-row gap-2">
            {[
              { label: 'kcal', value: Math.round(nutrition.calories), color: 'text-text-main' },
              { label: 'P', value: formatMacro(nutrition.protein), color: 'text-sky-300' },
              { label: 'C', value: formatMacro(nutrition.carbs), color: 'text-amber-200' },
              { label: 'G', value: formatMacro(nutrition.fat), color: 'text-rose-300' },
            ].map((item) => (
              <View key={item.label} className="flex-1 rounded-2xl bg-bg-base px-3 py-3">
                <AppText className="text-xs text-text-muted">{item.label}</AppText>
                <AppText className={cn('mt-1 text-base font-semibold', item.color)}>{item.value}</AppText>
              </View>
            ))}
          </View>
        </Animated.View>

      <AppButton leftIcon={<Check color="#FFFFFF" size={20} weight="bold" />} onPress={save}>
        Salvar registro
      </AppButton>
    </AppScreen>
  );
}
