import { CheckCircle, Scales, Swap } from 'phosphor-react-native';
import { Pressable, View } from 'react-native';

import { AppText } from '@/src/shared/components/ui/AppText';

import { DietFood, FoodLog } from '../types';
import { formatMacro } from '../utils';

type DietFoodRowProps = {
  food: DietFood;
  log?: FoodLog;
  onLog: () => void;
  onSwap?: () => void;
};

export function DietFoodRow({ food, log, onLog, onSwap }: DietFoodRowProps) {
  const hasLog = Boolean(log);
  const displayName = log?.selectedFoodName ?? food.name;
  const grams = log?.actualGrams ?? food.plannedGrams;
  const nutrition = log?.nutrition ?? food.nutrition;

  return (
    <View className="border-b border-border-subtle px-4 py-4 last:border-b-0">
      <View className="flex-row items-start gap-4">
        <View className="mt-1 h-12 w-12 items-center justify-center rounded-2xl bg-bg-base">
          {hasLog ? <CheckCircle color="#22C55E" size={24} weight="fill" /> : <Scales color="#A78BFA" size={23} weight="duotone" />}
        </View>

        <View className="flex-1">
          <AppText className="text-lg font-semibold leading-snug text-text-main">{displayName}</AppText>
          <AppText className="mt-1 text-sm text-text-muted">
            {hasLog ? `${Math.round(grams)}g registrados` : `${food.displayQuantity} prescritos`}
          </AppText>

          <View className="mt-3 flex-row flex-wrap gap-2">
            <View className="rounded-full bg-bg-base px-3 py-1">
              <AppText className="text-xs font-semibold text-text-main">{Math.round(nutrition.calories)} kcal</AppText>
            </View>
            <View className="rounded-full bg-sky-400/10 px-3 py-1">
              <AppText className="text-xs font-semibold text-sky-300">P {formatMacro(nutrition.protein)}</AppText>
            </View>
            <View className="rounded-full bg-amber-300/10 px-3 py-1">
              <AppText className="text-xs font-semibold text-amber-200">C {formatMacro(nutrition.carbs)}</AppText>
            </View>
            <View className="rounded-full bg-rose-400/10 px-3 py-1">
              <AppText className="text-xs font-semibold text-rose-300">G {formatMacro(nutrition.fat)}</AppText>
            </View>
          </View>

          {log?.replacedBy ? (
            <AppText className="mt-3 text-sm text-brand-secondary">Substituicao registrada somente para hoje.</AppText>
          ) : null}

          <View className="mt-4 flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              className="min-h-[42px] flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-brand-primary"
              onPress={onLog}
            >
              <Scales color="#FFFFFF" size={17} weight="bold" />
              <AppText className="text-sm font-semibold text-white">{hasLog ? 'Editar gramas' : 'Pesar'}</AppText>
            </Pressable>

            {food.substitutions?.length ? (
              <Pressable
                accessibilityRole="button"
                className="min-h-[42px] flex-row items-center justify-center gap-2 rounded-2xl border border-border-subtle bg-bg-base px-4"
                onPress={onSwap}
              >
                <Swap color="#A78BFA" size={17} weight="bold" />
                <AppText className="text-sm font-semibold text-text-main">Trocar</AppText>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}
