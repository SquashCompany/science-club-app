import { CaretRight, Drop, ForkKnife, WarningCircle } from 'phosphor-react-native';
import { Pressable, View } from 'react-native';

import { AppText } from '@/src/shared/components/ui/AppText';

import { HistoryMealDayEntry } from '../types';
import { formatDateLabel, getMealDayMacros, getMealDayStatus } from '../utils';

type HistoryMealDayCardProps = {
  entry: HistoryMealDayEntry;
  adherence: number;
  onPress: () => void;
};

export function HistoryMealDayCard({ entry, adherence, onPress }: HistoryMealDayCardProps) {
  const macros = getMealDayMacros(entry);
  const status = getMealDayStatus(entry);
  const doneCount = entry.meals.filter((meal) => meal.status === 'done').length;
  const partialCount = entry.meals.filter((meal) => meal.status === 'partial').length;
  const skippedCount = entry.meals.filter((meal) => meal.status === 'skipped').length;
  const statusColor = status === 'Dentro da meta' ? '#34D399' : status === 'Acima da meta' ? '#FCD34D' : '#A78BFA';

  return (
    <Pressable
      accessibilityRole="button"
      className="rounded-[28px] border border-border-subtle bg-bg-surface px-5 py-5"
      onPress={onPress}
    >
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <AppText className="text-sm text-text-muted">{formatDateLabel(entry.date)}</AppText>
          <AppText className="mt-2 text-2xl font-semibold text-text-main">{Math.round(macros.calories)} kcal</AppText>
          <AppText className="mt-1 text-sm text-text-muted">{status}</AppText>
        </View>
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/12">
          <ForkKnife color="#A78BFA" size={23} weight="duotone" />
        </View>
      </View>

      <View className="mt-5 h-2 overflow-hidden rounded-full bg-bg-base">
        <View className="h-full rounded-full" style={{ width: `${Math.min(100, adherence)}%`, backgroundColor: statusColor }} />
      </View>

      <View className="mt-5 flex-row gap-2">
        <View className="flex-1 rounded-2xl bg-bg-base px-3 py-3">
          <AppText className="text-xs text-text-muted">Proteina</AppText>
          <AppText className="mt-2 text-base font-semibold text-sky-300">{Math.round(macros.protein)}g</AppText>
        </View>
        <View className="flex-1 rounded-2xl bg-bg-base px-3 py-3">
          <Drop color="#67E8F9" size={16} weight="duotone" />
          <AppText className="mt-2 text-base font-semibold text-text-main">{entry.waterMl}ml</AppText>
        </View>
        <View className="flex-1 rounded-2xl bg-bg-base px-3 py-3">
          <WarningCircle color="#FCD34D" size={16} weight="duotone" />
          <AppText className="mt-2 text-base font-semibold text-text-main">{doneCount}/{entry.meals.length}</AppText>
        </View>
      </View>

      <View className="mt-5 flex-row items-center justify-between">
        <AppText className="text-sm text-text-muted">
          {doneCount} concluidas - {partialCount} parciais - {skippedCount} puladas
        </AppText>
        <CaretRight color="#71717A" size={20} weight="bold" />
      </View>
    </Pressable>
  );
}
